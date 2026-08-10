import { NextResponse } from 'next/server';
import { supabase } from "@veyronix/database";
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function getParsedTemplate(templateId, placeholders = {}) {
  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!template) return null;

  let title = template.title_tr; 
  let content = template.content_tr;

  Object.keys(placeholders).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    title = title?.replace(regex, placeholders[key]);
    content = content?.replace(regex, placeholders[key]);
  });

  return { title, content, color: template.color, is_embed: template.is_embed };
}

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
      const { data: payment, error: fetchError } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('order_id', order_id)
        .single();

      if (fetchError || !payment) {
        console.error(`[Cryptomus Webhook] Order ${order_id} not found in DB`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Eğer daha önce işlenmişse atla
      if (payment.status === 'paid') {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 2. Ödemeyi 'paid' olarak güncelle
      await supabase
        .from('crypto_payments')
        .update({ status: 'paid' })
        .eq('id', payment.id);

      // 3. İlgili sunucu veya üye süresini uzat
      const isUserPlan = payment.plan_type === 'user';

      if (isUserPlan) {
        // Bireysel Oylama Muafiyeti (User Premium)
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('discord_id', payment.user_id)
          .single();

        const now = new Date();
        let currentExpiry = now;
        if (!userError && userProfile && userProfile.premium_until) {
          const profileExpiry = new Date(userProfile.premium_until);
          if (profileExpiry > now) {
            currentExpiry = profileExpiry;
          }
        }

        currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

        await supabase
          .from('users')
          .upsert({
            discord_id: payment.user_id,
            premium_until: currentExpiry.toISOString(),
            is_unlimited: userProfile?.is_unlimited || false
          }, { onConflict: 'discord_id' });

        // Queue DM notification to User
        try {
          const isUnlimited = userProfile?.is_unlimited || false;
          const expiryStr = currentExpiry.toLocaleDateString('tr-TR');
          
          let embedTitle = isUnlimited ? "💎 Veyronix Sınırsız Bireysel Premium Aktif!" : "⚡ Veyronix Bireysel Premium Aktif!";
          let embedDescription = "";

          if (isUnlimited) {
            embedDescription = `Bireysel premium aboneliğiniz aktif edildi!\n\n` +
              `• **Paket Türü:** Sınırsız (Ömür Boyu)\n` +
              `• **Top.gg Oy Verme Zorunluluğu:** Süresiz olarak kaldırıldı.\n` +
              `• **Web Sitesi:** https://veyronix.com.tr/`;
          } else {
            embedDescription = `Bireysel premium aboneliğiniz aktif edildi!\n\n` +
              `• **Paket Türü:** Süreli Bireysel Premium\n` +
              `• **Eklenen Süre:** ${payment.duration_days} Gün\n` +
              `• **Son Kullanma Tarihi:** ${expiryStr}\n` +
              `• **Top.gg Oy Verme Zorunluluğu:** Belirtilen tarihe kadar kaldırıldı.\n` +
              `• **Web Sitesi:** https://veyronix.com.tr/`;
          }

          if (payment.user_id) {
            await supabase.from('message_queue').insert({
              owner_id: payment.user_id,
              message_content: JSON.stringify({
                embeds: [{
                  title: embedTitle,
                  description: embedDescription,
                  color: isUnlimited ? 0xfca311 : 0x2ecc71,
                  timestamp: new Date().toISOString()
                }]
              }),
              status: 'pending'
            });
          }
        } catch (queueErr) {
          console.error("[Cryptomus Webhook] Error queueing bought DM notification:", queueErr.message);
        }

        console.log(`[Cryptomus Webhook] Order ${order_id} processed. User ${payment.user_id} global premium extended by ${payment.duration_days} days.`);
      } else {
        // Sunucu Premium (Server/Guild Premium)
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('guild_id', payment.guild_id)
          .single();

        if (subError || !subscription) {
          // Abonelik hiç yoksa yeni oluştur
          const now = new Date();
          now.setDate(now.getDate() + payment.duration_days);
          await supabase
            .from('subscriptions')
            .insert({
              guild_id: payment.guild_id,
              guild_name: payment.guild_name || 'Bilinmeyen Sunucu',
              expires_at: now.toISOString(),
              is_active: true,
              is_unlimited: false
            });
            
          console.log(`[Cryptomus Webhook] Order ${order_id} processed. Guild ${payment.guild_id} NEW subscription created for ${payment.duration_days} days.`);
        } else {
          const now = new Date();
          let currentExpiry = new Date(subscription.expires_at);

          // Eğer süresi çoktan bitmişse, bugünden itibaren uzat
          if (currentExpiry < now) {
            currentExpiry = now;
          }

          // Gün ekle
          currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

          await supabase
            .from('subscriptions')
            .update({ 
              expires_at: currentExpiry.toISOString(),
              is_active: true,
              is_unlimited: subscription.is_unlimited || false
            })
            .eq('id', subscription.id);

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

            await fetch('https://discord.com/api/v10/channels/1490798764427051088/messages', {
               method: 'POST',
               headers: {
                  'Authorization': `Bot ${botToken}`,
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  content: messageContent
               })
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
