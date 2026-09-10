import { NextResponse } from 'next/server';
import { supabase, getUserProfile, upsertUser, getSubscriptionByGuildId, updateSubscription, createSubscription, getCryptoPaymentByOrderId, updateCryptoPaymentByOrderId } from "@veyronix/database";
import { sendSupportMessage } from '@/lib/discordApi';
import { verifyShopierWebhookToken } from '@/lib/shopierOAuth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const webhookSignature = req.headers.get('x-shopier-signature') ||
                             req.headers.get('x-webhook-token') ||
                             req.headers.get('authorization')?.replace('Bearer ', '');

    const isAppWebhook = webhookSignature && verifyShopierWebhookToken(webhookSignature);
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
        const expectedHash = crypto
          .createHmac('sha256', VALID_OSB_PASS)
          .update(bodyData.res + VALID_OSB_USER)
          .digest('hex');

        if (expectedHash !== bodyData.hash) {
          return new Response("hash mismatch", { status: 200 });
        }
        try {
          const decodedRes = Buffer.from(bodyData.res, 'base64').toString('utf8');
          const parsedRes = JSON.parse(decodedRes);
          status = "success";
          order_id = parsedRes.orderid || parsedRes.customerno || parsedRes.platform_order_id;
          amount = parsedRes.price;
        } catch (e) {
          return new Response("parse error", { status: 200 });
        }
      } else {
        const osbUser = bodyData['username'] || bodyData['osb_user'];
        const osbPass = bodyData['password'] || bodyData['osb_pass'];
        if (osbUser && osbPass && (osbUser !== VALID_OSB_USER || osbPass !== VALID_OSB_PASS)) {
          return new Response("auth error", { status: 200 });
        }
        status   = bodyData['status'] || bodyData['payment_status'];
        order_id = bodyData['platform_order_id'] || bodyData['custom_order_id'];
        amount   = bodyData['total_order_value'] || bodyData['price'];
      }
    }

    console.log(`[Shopier Callback] Tetiklendi:`, { order_id, status, amount });

    if (status === 'success' || status === '1' || status === 1 || !status || status === 'order.created') {
      if (order_id) {
        
        // --- 1. SİPARİŞ NOTU (ORDER NOTE) YÖNTEMİ KONTROLÜ ---
        let shopierOrderNote = "";
        let shopierProductId = "";
        
        // Eğer JWT Token ayarlanmışsa REST API'den sipariş notunu çek
        if (process.env.SHOPIER_JWT_TOKEN) {
          try {
            const apiRes = await fetch(`https://api.shopier.com/v1/orders/${order_id}`, {
              headers: {
                'Authorization': `Bearer ${process.env.SHOPIER_JWT_TOKEN}`,
                'Accept': 'application/json'
              }
            });
            if (apiRes.ok) {
              const orderData = await apiRes.json();
              shopierOrderNote = orderData.note || "";
              if (orderData.lineItems && orderData.lineItems.length > 0) {
                 shopierProductId = orderData.lineItems[0].productId;
              }
              console.log(`[Shopier REST API] Order ${order_id} note: ${shopierOrderNote}, productId: ${shopierProductId}`);
            }
          } catch(e) {
            console.error("[Shopier REST API Fetch Error]:", e);
          }
        }

        let isUserPlan = false;
        let targetId = null; // userId or guildId
        let durationDays = 30; // default
        let isOrderNoteMethod = false;

        // Sipariş notunda kod varsa (örn. S-12345 veya U-12345)
        if (shopierOrderNote && (shopierOrderNote.startsWith('S-') || shopierOrderNote.startsWith('U-'))) {
           isOrderNoteMethod = true;
           isUserPlan = shopierOrderNote.startsWith('U-');
           targetId = shopierOrderNote.substring(2).trim(); // ID'yi ayıkla
           
           // Plan süresini bul
           if (shopierProductId) {
             const { data: planMatch } = await supabase
               .from('pricing_plans')
               .select('*')
               .like('shopier_url', `%${shopierProductId}%`)
               .single();
               
             if (planMatch && planMatch.duration_days) {
                durationDays = planMatch.duration_days;
             }
           }
        } 

        // --- 2. ESKİ YÖNTEM (CRYPTO_PAYMENTS TABLOSU) KONTROLÜ ---
        if (!isOrderNoteMethod) {
          let payment = null;
          try { payment = await getCryptoPaymentByOrderId(order_id); } catch (e) {}

          if (payment && payment.status !== 'paid') {
            await updateCryptoPaymentByOrderId(order_id, { status: 'paid' });
            isUserPlan = payment.plan_type === 'user';
            targetId = isUserPlan ? payment.user_id : payment.guild_id;
            durationDays = payment.duration_days;
          } else {
             // Hem not yok hem de bekleyen ödeme yoksa iptal
             console.log(`[Shopier Callback] Bekleyen ödeme veya sipariş notu bulunamadı. Order: ${order_id}`);
             return new Response("success", { status: 200 }); 
          }
        }

        // --- 3. PREMIUM'U UYGULA ---
        if (isUserPlan) {
          let userProfile = null;
          try { userProfile = await getUserProfile(targetId); } catch (e) {}
          const now = new Date();
          let currentExpiry = now;
          if (userProfile && userProfile.premium_until) {
            const profileExpiry = new Date(userProfile.premium_until);
            if (profileExpiry > now) currentExpiry = profileExpiry;
          }
          currentExpiry.setDate(currentExpiry.getDate() + durationDays);

          await upsertUser({
            discord_id: targetId,
            premium_until: currentExpiry.toISOString(),
            is_unlimited: userProfile?.is_unlimited || false
          });
          console.log(`[Shopier Callback] Bireysel premium güncellendi. User: ${targetId}`);
        } else {
          let subscription = null;
          try { subscription = await getSubscriptionByGuildId(targetId); } catch (e) {}

          if (!subscription) {
            const now = new Date();
            now.setDate(now.getDate() + durationDays);
            await createSubscription({
              guild_id: targetId,
              guild_name: 'Shopier Siparişi',
              owner_id: null,
              expires_at: now.toISOString(),
              is_active: true,
              is_unlimited: false,
              trial_used: false
            });
            console.log(`[Shopier Callback] Sunucu aboneliği oluşturuldu. Guild: ${targetId}`);
          } else {
            const now = new Date();
            let currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : now;
            if (isNaN(currentExpiry.getTime()) || currentExpiry < now) currentExpiry = now;
            currentExpiry.setDate(currentExpiry.getDate() + durationDays);

            await updateSubscription(targetId, {
              expires_at: currentExpiry.toISOString(),
              is_active: true,
              is_unlimited: subscription.is_unlimited || false,
              trial_used: false,
              updated_at: new Date().toISOString()
            });
            console.log(`[Shopier Callback] Sunucu aboneliği uzatıldı. Guild: ${targetId}`);
          }
        }

        // Discord Bildirimi
        try {
          await sendSupportMessage({ content: `🎉 **Shopier Ödemesi Onaylandı!** Sipariş #${order_id} başarıyla otomatik aktif edildi! (Hedef: ${targetId})` });
        } catch(e) {}
        
      }
    }

    return new Response("success", { status: 200 });

  } catch (error) {
    console.error("[Shopier Callback Error]:", error);
    return new Response("error", { status: 200 });
  }
}
