import { LINKS } from '@veyronix/config';
import { NextResponse } from 'next/server';
import { getCryptoPaymentByOrderId, updateCryptoPaymentByOrderId, getUserProfile, upsertUser, getSubscriptionByGuildId, updateSubscription, createSubscription } from "@veyronix/database";
import { sendSupportMessage } from '@/lib/discordApi';
import { verifyShopierWebhookToken } from '@/lib/shopierOAuth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // App Webhook token kontrolü (X-Shopier-Signature header'ı)
    const webhookSignature = req.headers.get('x-shopier-signature') ||
                             req.headers.get('x-webhook-token') ||
                             req.headers.get('authorization')?.replace('Bearer ', '');

    const isAppWebhook = webhookSignature && verifyShopierWebhookToken(webhookSignature);

    // JSON body mu yoksa form-data mı? (App webhook JSON, OSB form-data gönderir)
    const contentType = req.headers.get('content-type') || '';
    let bodyData = {};
    let isJson = false;

    if (contentType.includes('application/json')) {
      bodyData = await req.json();
      isJson = true;
    } else {
      const formData = await req.formData();
      for (const [k, v] of formData.entries()) bodyData[k] = v;
    }

    let status, order_id, amount;

    if (isAppWebhook || isJson) {
      status   = bodyData['status'] || bodyData['payment_status'] || bodyData['event'];
      order_id = bodyData['platform_order_id'] || bodyData['custom_order_id'] ||
                       bodyData['id'] || bodyData['orderId'];
      amount   = bodyData['total_order_value'] || bodyData['price'] ||
                       bodyData['totalPrice'] || bodyData['amount'];
    } else {
      // OSB Kimlik Doğrulaması (Yeni Sistem: res ve hash)
      const VALID_OSB_USER = "3bee3d95dfbc9b0afc27b6c01bf44e35";
      const VALID_OSB_PASS = "340bfa456ab52ab2efb5130926143255";

      if (bodyData.res && bodyData.hash) {
        // Hash kontrolü: hash_hmac('sha256', res + username, password)
        const expectedHash = crypto
          .createHmac('sha256', VALID_OSB_PASS)
          .update(bodyData.res + VALID_OSB_USER)
          .digest('hex');

        if (expectedHash !== bodyData.hash) {
          console.error("[Shopier OSB] Hash uyuşmazlığı!");
          return new Response("hash mismatch", { status: 200 });
        }

        // Verileri çöz
        try {
          const decodedRes = Buffer.from(bodyData.res, 'base64').toString('utf8');
          const parsedRes = JSON.parse(decodedRes);
          
          status = "success"; // OSB geliyorsa başarılıdır
          order_id = parsedRes.orderid || parsedRes.customerno || parsedRes.platform_order_id;
          amount = parsedRes.price;
        } catch (e) {
          console.error("[Shopier OSB] JSON Parse Hatası:", e);
          return new Response("parse error", { status: 200 });
        }
      } else {
        // Eski OSB formatı fallback
        const osbUser = bodyData['username'] || bodyData['osb_user'];
        const osbPass = bodyData['password'] || bodyData['osb_pass'];

        if (osbUser && osbPass && (osbUser !== VALID_OSB_USER || osbPass !== VALID_OSB_PASS)) {
          console.error("[Shopier Callback] Geçersiz OSB kimlik bilgileri!");
          return new Response("auth error", { status: 200 });
        }

        status   = bodyData['status'] || bodyData['payment_status'];
        order_id = bodyData['platform_order_id'] || bodyData['custom_order_id'];
        amount   = bodyData['total_order_value'] || bodyData['price'];
      }
    }

    console.log(`[Shopier Callback] ${isAppWebhook ? 'App Webhook' : 'OSB'} tetiklendi:`, { order_id, status, amount });
    // Shopier OSB Bildirimi Başarılıysa
    if (status === 'success' || status === '1' || status === 1 || !status) {
      if (order_id) {
        let payment = null;
        try { payment = await getCryptoPaymentByOrderId(order_id); } catch (e) {}

        if (payment && payment.status !== 'paid') {
          await updateCryptoPaymentByOrderId(order_id, { status: 'paid' });

          const isUserPlan = payment.plan_type === 'user';
          if (isUserPlan) {
            let userProfile = null;
            try { userProfile = await getUserProfile(payment.user_id); } catch (e) {}
            const now = new Date();
            let currentExpiry = now;
            if (userProfile && userProfile.premium_until) {
              const profileExpiry = new Date(userProfile.premium_until);
              if (profileExpiry > now) currentExpiry = profileExpiry;
            }
            currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

            await upsertUser({
              discord_id: payment.user_id,
              premium_until: currentExpiry.toISOString(),
              is_unlimited: userProfile?.is_unlimited || false
            });
          } else {
            let subscription = null;
            try { subscription = await getSubscriptionByGuildId(payment.guild_id); } catch (e) {}

            if (!subscription) {
              const now = new Date();
              now.setDate(now.getDate() + payment.duration_days);
              await createSubscription({
                guild_id: payment.guild_id,
                guild_name: payment.guild_name || 'Bilinmeyen Sunucu',
                owner_id: payment.user_id || null,
                expires_at: now.toISOString(),
                is_active: true,
                is_unlimited: false,
                trial_used: false
              });
            } else {
              const now = new Date();
              let currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : now;
              if (isNaN(currentExpiry.getTime()) || currentExpiry < now) currentExpiry = now;
              currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

              await updateSubscription(subscription.guild_id, {
                expires_at: currentExpiry.toISOString(),
                is_active: true,
                is_unlimited: subscription.is_unlimited || false,
                trial_used: false,
                owner_id: subscription.owner_id || payment.user_id || null,
                updated_at: new Date().toISOString()
              });
            }
          }

          // Discord Bildirimi
          try {
            await sendSupportMessage({ content: `🎉 **Shopier OSB Bildirimi Alındı!** Sipariş #${order_id} başarıyla onaylandı ve otomatik aktif edildi!` });
          } catch(e) {}
        }
      }
    }

    // Shopier OSB sisteminin testinin başarılı sayılması için "success" cevabı dönülmelidir
    return new Response("success", { status: 200 });

  } catch (error) {
    console.error("[Shopier Callback Error]:", error);
    return new Response("error", { status: 200 });
  }
}

