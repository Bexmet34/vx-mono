import { LINKS } from '@veyronix/config';
import { NextResponse } from 'next/server';
import { getCryptoPaymentByOrderId, updateCryptoPaymentByOrderId, getUserProfile, upsertUser, getSubscriptionByGuildId, updateSubscription, createSubscription, queueMessage, getParsedTemplate } from "@veyronix/database";
import crypto from 'crypto';
import { sendSupportMessage } from '@/lib/discordApi';

export const dynamic = 'force-dynamic';

// getParsedTemplate is imported from @veyronix/database

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const data = JSON.parse(rawBody);

    const API_KEY = process.env.CRYPTOMUS_API_KEY;

    if (!API_KEY) {
      console.error("[Cryptomus Webhook] API_KEY missing.");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Doğrulama: sign hash = md5(base64(payload) + API_KEY)
    // Cryptomus webhook dökümantasyonuna göre payload içerisindeki 'sign' alanı çıkarılarak hesaplanır
    const sign = data.sign;
    if (!sign) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const dataWithoutSign = { ...data };
    delete dataWithoutSign.sign;

    // Cryptomus require you to JSON.stringify the body *exactly* as it came, but without the sign key
    // Actually, the most reliable way in Cryptomus is parsing the JSON, deleting sign, then JSON.stringify
    const payloadBase64 = Buffer.from(JSON.stringify(dataWithoutSign)).toString('base64');
    const hash = crypto.createHash('md5').update(payloadBase64 + API_KEY).digest('hex');

    if (hash !== sign) {
      console.error("[Cryptomus Webhook] Invalid signature!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { order_id, status } = data;

    // Sadece başarılı ödemeleri işle
    if (status === 'paid' || status === 'paid_over') {
      
      // 1. Ödemeyi veritabanında bul
      let payment;
      try {
        payment = await getCryptoPaymentByOrderId(order_id);
      } catch (e) {
        console.error(`[Cryptomus Webhook] Order ${order_id} not found in DB`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (!payment) {
        console.error(`[Cryptomus Webhook] Order ${order_id} not found in DB`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Eğer daha önce işlenmişse atla
      if (payment.status === 'paid') {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 2. Ödemeyi 'paid' olarak güncelle
      await updateCryptoPaymentByOrderId(order_id, { status: 'paid' });

      // 3. İlgili sunucu veya üye süresini uzat
      const isUserPlan = payment.plan_type === 'user';

      if (isUserPlan) {
        // Bireysel Oylama Muafiyeti (User Premium)
        let userProfile = null;
        try {
          userProfile = await getUserProfile(payment.user_id);
        } catch (e) {}

        const now = new Date();
        let currentExpiry = now;
        if (userProfile && userProfile.premium_until) {
          const profileExpiry = new Date(userProfile.premium_until);
          if (profileExpiry > now) {
            currentExpiry = profileExpiry;
          }
        }

        currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

        await upsertUser({
            discord_id: payment.user_id,
            premium_until: currentExpiry.toISOString(),
            is_unlimited: userProfile?.is_unlimited || false
          });

        // Queue DM notification to User (Stacked EN top / TR bottom format)
        try {
          const isUnlimited = userProfile?.is_unlimited || false;
          const expiryStr = currentExpiry.toLocaleDateString('tr-TR');
          
          let embedTitle = isUnlimited 
            ? "💎 Veyronix Premium Activated / Aktif Edildi!" 
            : "✨ Veyronix Premium Activated / Aktif Edildi!";
          let embedDescription = "";

          if (isUnlimited) {
            embedDescription = 
              `🇬🇧 **Unlimited Premium Activated!**\n` +
              `Your individual premium subscription has been activated.\n` +
              `• **Status:** Active (Unlimited / Lifetime)\n` +
              `• **Expiration Date:** Never (Lifetime Access)\n` +
              `• **Top.gg Vote Requirement:** Permanently Removed\n` +
              `• **Website:** ${LINKS.WEBSITE}/\n` +
              `• **Support Server:** ${LINKS.SUPPORT_SERVER}\n\n` +
              `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +
              `🇹🇷 **Sınırsız Premium Aktif Edildi!**\n` +
              `Bireysel premium aboneliğiniz Ömür Boyu Sınırsız olarak tanımlandı.\n` +
              `• **Durum:** Aktif (Sınırsız / Ömür Boyu)\n` +
              `• **Son Kullanma Tarihi:** Süresiz (Ömür Boyu)\n` +
              `• **Top.gg Oy Verme Zorunluluğu:** Süresiz Kaldırıldı\n` +
              `• **Web Sitesi:** ${LINKS.WEBSITE}/\n` +
              `• **Destek Sunucusu:** ${LINKS.SUPPORT_SERVER}`;
          } else {
            embedDescription = 
              `🇬🇧 **Premium Subscription Activated!**\n` +
              `Your individual premium subscription has been activated.\n` +
              `• **Status:** Active (+${payment.duration_days} Days Extended)\n` +
              `• **Expiration Date:** ${expiryStr}\n` +
              `• **Top.gg Vote Requirement:** Removed\n` +
              `• **Website:** ${LINKS.WEBSITE}/\n` +
              `• **Support Server:** ${LINKS.SUPPORT_SERVER}\n\n` +
              `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +
              `🇹🇷 **Premium Aboneliği Aktif Edildi!**\n` +
              `Bireysel premium aboneliğiniz aktif edildi.\n` +
              `• **Durum:** Aktif (+${payment.duration_days} Gün Uzatıldı)\n` +
              `• **Son Kullanma Tarihi:** ${expiryStr}\n` +
              `• **Top.gg Oy Verme Zorunluluğu:** Kaldırıldı\n` +
              `• **Web Sitesi:** ${LINKS.WEBSITE}/\n` +
              `• **Destek Sunucusu:** ${LINKS.SUPPORT_SERVER}`;
          }

          if (payment.user_id) {
            await queueMessage({
              owner_id: payment.user_id,
              message_content: JSON.stringify({
                embeds: [{
                  title: embedTitle,
                  description: embedDescription,
                  color: isUnlimited ? 0xfca311 : 0x2ecc71,
                  timestamp: new Date().toISOString()
                }]
              })
            });
          }
        } catch (queueErr) {
          console.error("[Cryptomus Webhook] Error queueing bought DM notification:", queueErr.message);
        }

        console.log(`[Cryptomus Webhook] Order ${order_id} processed. User ${payment.user_id} global premium extended by ${payment.duration_days} days.`);
      } else {
        // Sunucu Premium (Server/Guild Premium)
        let subscription = null;
        try {
          subscription = await getSubscriptionByGuildId(payment.guild_id);
        } catch (e) {}

        if (!subscription) {
          // Abonelik hiç yoksa yeni oluştur
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
            
          console.log(`[Cryptomus Webhook] Order ${order_id} processed. Guild ${payment.guild_id} NEW subscription created for ${payment.duration_days} days.`);
        } else {
          const now = new Date();
          let currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : now;

          // Eğer süresi çoktan bitmişse, bugünden itibaren uzat
          if (isNaN(currentExpiry.getTime()) || currentExpiry < now) {
            currentExpiry = now;
          }

          // Gün ekle
          currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

          await updateSubscription(subscription.guild_id, { 
              expires_at: currentExpiry.toISOString(),
              is_active: true,
              is_unlimited: subscription.is_unlimited || false,
              trial_used: false,
              owner_id: subscription.owner_id || payment.user_id || null,
              updated_at: new Date().toISOString()
            });

          console.log(`[Cryptomus Webhook] Order ${order_id} processed. Guild ${payment.guild_id} extended by ${payment.duration_days} days.`);
        }
      }

      // Send Discord notification to Support Server
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (botToken) {
         try {
            const planName = payment.duration_days >= 365 ? '1 Yıllık' : (payment.duration_days >= 90 ? '3 Aylık' : (payment.duration_days >= 30 ? '1 Aylık' : '7 Günlük'));
            
            let messageContent = '';
            if (payment.plan_type === 'user') {
               messageContent = `🎉 <@${payment.user_id}>, **Bireysel Oylama Muafiyeti (${planName})** satın aldı! Artık botun bulunduğu tüm sunucularda Top.gg oylaması yapması gerekmeyecek. Destek taleplerine de öncelikli olarak bakılacaktır.`;
            } else {
               const guildNameSafe = subscription?.guild_name || payment.guild_name || 'Sunucu';
               messageContent = `🎉 <@${payment.user_id}>, **${guildNameSafe}** sunucusu için **Sunucu Premium (${planName})** satın aldı! Bizi tercih ettiğiniz için teşekkür ederiz. Destek taleplerinize artık öncelikli olarak bakılacaktır.`;
            }

            await sendSupportMessage({
               content: messageContent
            });
         } catch(e) {
            console.error("[Cryptomus Webhook] Discord notification error:", e);
         }
      }

      return NextResponse.json({ message: "Success" }, { status: 200 });
    }

    return NextResponse.json({ message: "Ignored status" }, { status: 200 });

  } catch (error) {
    console.error("[Cryptomus Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
