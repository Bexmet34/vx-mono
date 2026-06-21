import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Lütfen Discord ile giriş yapın." }, { status: 401 });
    }

    const { guildId, planId } = await req.json();

    if (!guildId || !planId) {
      return NextResponse.json({ error: "Geçersiz sunucu veya paket seçimi." }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Geçersiz veya pasif paket seçimi." }, { status: 400 });
    }
    const orderId = `VX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. Veritabanına bekleyen (pending) ödemeyi kaydet
    const { error: dbError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        guild_id: guildId,
        amount: plan.amount,
        currency: 'USDT',
        duration_days: plan.duration_days,
        plan_type: plan.plan_type || 'server',
        status: 'pending'
      });

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return NextResponse.json({ error: "Ödeme kaydı oluşturulamadı. Lütfen tekrar deneyin." }, { status: 500 });
    }

    // 2. Cryptomus API'ye istek at
    const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
    const API_KEY = process.env.CRYPTOMUS_API_KEY;

    if (!MERCHANT_ID || !API_KEY) {
      return NextResponse.json({ error: "Sistem ödeme ayarları eksik." }, { status: 500 });
    }

    const payload = {
      amount: plan.amount,
      currency: 'USDT',
      order_id: orderId,
      url_return: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      url_callback: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
      is_payment_multiple: false,
      lifetime: 3600 // 1 hour
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const sign = crypto.createHash('md5').update(payloadBase64 + API_KEY).digest('hex');

    const cryptomusRes = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: {
        'merchant': MERCHANT_ID,
        'sign': sign,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const cryptomusData = await cryptomusRes.json();

    if (cryptomusData.state !== 0) {
      console.error("Cryptomus Error:", cryptomusData);
      return NextResponse.json({ error: "Ödeme altyapısıyla iletişim kurulamadı." }, { status: 500 });
    }

    // 3. Kullanıcıya ödeme URL'sini döndür
    return NextResponse.json({ payment_url: cryptomusData.result.url });

  } catch (error) {
    console.error("Payment Create Error:", error);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
