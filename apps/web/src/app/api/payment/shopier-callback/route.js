import { LINKS } from '@veyronix/config';
import { NextResponse } from 'next/server';
import { getCryptoPaymentByOrderId, updateCryptoPaymentByOrderId, getUserProfile, upsertUser, getSubscriptionByGuildId, updateSubscription, createSubscription, queueMessage } from "@veyronix/database";
import crypto from 'crypto';
import { sendSupportMessage } from '@/lib/discordApi';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const status = formData.get('status');
    const order_id = formData.get('platform_order_id');
    const random_nr = formData.get('random_nr');
    const signature = formData.get('signature');

    const API_SECRET = process.env.SHOPIER_API_SECRET || "dummy_secret";

    // Signature Doğrulaması
    if (signature && random_nr && order_id) {
      const expectedSignature = crypto
        .createHmac('sha256', API_SECRET)
        .update(random_nr + order_id)
        .digest('base64');

      if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
        console.error("[Shopier Callback] Geçersiz imza!");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    if (status === 'success' || status === '1' || status === 1) {
      // 1. Ödemeyi veritabanında bul
      let payment;
      try {
        payment = await getCryptoPaymentByOrderId(order_id);
      } catch (e) {
        console.error(`[Shopier Callback] Order ${order_id} not found in DB`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (!payment) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (payment.status === 'paid') {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 2. Ödemeyi 'paid' yap
      await updateCryptoPaymentByOrderId(order_id, { status: 'paid' });

      // 3. Süre uzatma veya VIP ataması
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

      // Discord Bildirimi Gönder
      try {
        const planName = payment.duration_days >= 365 ? '1 Yıllık' : (payment.duration_days >= 30 ? '1 Aylık' : '7 Günlük');
        let messageContent = payment.plan_type === 'user'
          ? `🎉 <@${payment.user_id}>, **Shopier Kredi Kartı** ile **Bireysel Premium (${planName})** satın aldı!`
          : `🎉 <@${payment.user_id}>, **Shopier Kredi Kartı** ile **Sunucu Premium (${planName})** satın aldı!`;

        await sendSupportMessage({ content: messageContent });
      } catch (e) {}

      // Müşteriyi Başarılı Sayfasına Yönlendir
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/test-premium-page?payment=success`, 302);
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/test-premium-page?payment=failed`, 302);

  } catch (error) {
    console.error("[Shopier Callback Error]:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
