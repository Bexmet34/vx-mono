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

    const { guildId, planId, shopierPat } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Geçersiz paket seçimi." }, { status: 400 });
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

    if (plan.plan_type !== 'user' && !guildId) {
      return NextResponse.json({ error: "Lütfen bir sunucu seçin." }, { status: 400 });
    }

    const finalGuildId = guildId || 'USER_PLAN';
    const orderId = `VX_SHOP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const tryRate = parseFloat(process.env.NEXT_PUBLIC_USDT_TRY_RATE) || 40;
    const amountTL = (plan.amount * tryRate).toFixed(2);

    // Bekleyen sipariş kaydı ekle
    const { error: dbError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        guild_id: finalGuildId,
        amount: plan.amount,
        currency: 'TRY',
        duration_days: plan.duration_days,
        plan_type: plan.plan_type || 'server',
        status: 'pending'
      });

    if (dbError) {
      console.error("[Shopier Create] DB Error:", dbError);
      return NextResponse.json({ error: "Sipariş veritabanına kaydedilemedi." }, { status: 500 });
    }

    // Shopier Form Parametrelerini Hazırla
    const apiKey = process.env.SHOPIER_API_KEY || "dummy_key";
    const apiSecret = process.env.SHOPIER_API_SECRET || "dummy_secret";
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/shopier-callback`;

    const userEmail = session.user.email || `${session.user.id}@veyronix.com.tr`;
    const userName = session.user.name || "Veyronix Kullanıcısı";

    const shopierFormFields = {
      API_key: apiKey,
      website_index: 1,
      platform_order_id: orderId,
      product_name: `Veyronix ${plan.name_tr || 'Premium'}`,
      product_type: 1, // Dijital Ürün
      buyer_name: userName.split(' ')[0] || "Kullanıcı",
      buyer_surname: userName.split(' ').slice(1).join(' ') || "Veyronix",
      buyer_email: userEmail,
      buyer_account_age: 30,
      buyer_id_nr: session.user.id.substring(0, 10),
      buyer_phone: "05000000000",
      billing_address: "Türkiye",
      billing_city: "İstanbul",
      billing_country: "Turkey",
      billing_postcode: "34000",
      shipping_address: "Türkiye",
      shipping_city: "İstanbul",
      shipping_country: "Turkey",
      shipping_postcode: "34000",
      total_order_value: amountTL,
      currency: 0, // TRY
      platform: 0,
      is_in_frame: 1,
      current_language: 0,
      modul_version: "1.0.4",
      random_nr: Math.floor(Math.random() * 900000) + 100000
    };

    // SHA256 Signature Üretimi
    const signatureData = shopierFormFields.random_nr + shopierFormFields.platform_order_id + shopierFormFields.total_order_value + shopierFormFields.currency;
    const signature = crypto.createHmac('sha256', apiSecret).update(signatureData).digest('base64');
    shopierFormFields['signature'] = signature;

    return NextResponse.json({
      success: true,
      action_url: "https://www.shopier.com/ShowProduct/api_pay4.php",
      fields: shopierFormFields,
      order_id: orderId,
      amount_tl: amountTL
    });

  } catch (error) {
    console.error("[Shopier Create Error]:", error);
    return NextResponse.json({ error: "Shopier sipariş oturumu oluşturulamadı." }, { status: 500 });
  }
}
