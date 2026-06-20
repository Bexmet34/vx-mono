import { NextResponse } from 'next/server';
import { supabase } from "@veyronix/database";
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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

      // 3. İlgili sunucunun süresini uzat
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

      console.log(`[Cryptomus Webhook] Order ${order_id} processed. Guild ${payment.guild_id} extended by ${payment.duration_days} days.`);

      // Send Discord notification to Support Server (1490798764427051088)
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (botToken) {
         try {
            const planName = payment.duration_days >= 365 ? '1 Yıllık Paket' : (payment.duration_days >= 90 ? '3 Aylık Paket' : (payment.duration_days >= 30 ? '1 Aylık Paket' : '7 Günlük Paket'));
            await fetch('https://discord.com/api/v10/channels/1490798764427051088/messages', {
               method: 'POST',
               headers: {
                  'Authorization': `Bot ${botToken}`,
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  content: `🎉 <@${payment.user_id}>, **${subscription.guild_name || 'Sunucu'}** sunucusu için **${planName}** satın aldı! Bizi tercih ettiğiniz için teşekkür ederiz. Destek taleplerinize artık öncelikli olarak bakılacaktır.`
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
