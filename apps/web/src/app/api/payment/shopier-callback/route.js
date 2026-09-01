import { LINKS } from '@veyronix/config';
import { NextResponse } from 'next/server';
import { getCryptoPaymentByOrderId, updateCryptoPaymentByOrderId, getUserProfile, upsertUser, getSubscriptionByGuildId, updateSubscription, createSubscription } from "@veyronix/database";
import { sendSupportMessage } from '@/lib/discordApi';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // Shopier OSB Bilgileri
    const osbUser = formData.get('username') || formData.get('osb_user');
    const osbPass = formData.get('password') || formData.get('osb_pass');
    const status = formData.get('status') || formData.get('payment_status');
    const order_id = formData.get('platform_order_id') || formData.get('custom_order_id');
    const amount = formData.get('total_order_value') || formData.get('price');

    // OSB Kimlik Doğrulaması (Shopier Paneli Tarafından Gönderilen)
    const VALID_OSB_USER = "3bee3d95dfbc9b0afc27b6c01bf44e35";
    const VALID_OSB_PASS = "340bfa456ab52ab2efb5130926143255";

    if (osbUser && osbPass && (osbUser !== VALID_OSB_USER || osbPass !== VALID_OSB_PASS)) {
      console.error("[Shopier OSB Callback] Geçersiz OSB kullanıcı bilgileri!");
      return new Response("OK", { status: 200 }); // Shopier her zaman 200 OK bekler
    }

    console.log("[Shopier OSB Callback Tetiklendi]:", { order_id, status, amount });

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

    // Shopier OSB sisteminin testinin başarılı sayılması için "OK" cevabı dönülmelidir
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("[Shopier OSB Callback Error]:", error);
    return new Response("OK", { status: 200 });
  }
}

