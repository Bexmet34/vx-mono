import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Lütfen Discord ile giriş yapın." }, { status: 401 });
    }

    const { guildId, productId, productName, productPrice } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Lütfen bir Shopier ürünü seçin." }, { status: 400 });
    }

    const patToken = process.env.SHOPIER_PAT_TOKEN;
    if (!patToken) {
      return NextResponse.json({ error: "SHOPIER_PAT_TOKEN bulunamadı. Lütfen VPS sunucunuzda .env.local tanımlayınız." }, { status: 500 });
    }

    const finalGuildId = guildId || 'USER_PLAN';
    const orderId = `VX_SHOP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // DB Sipariş Kaydı
    const { error: dbError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        guild_id: finalGuildId,
        amount: parseFloat(productPrice) || 0,
        currency: 'TRY',
        duration_days: 30,
        plan_type: guildId ? 'server' : 'user',
        status: 'pending'
      });

    if (dbError) {
      console.error("[Shopier Create] DB Error:", dbError);
    }

    // Shopier REST API ile Checkout/Payment Session veya Ürün Bağlantısı Oluştur
    // Shopier v1 API ile ilgili ürün için doğrudan ödeme URL'si dönüyoruz
    const shopierPaymentUrl = `https://www.shopier.com/ShowProduct/api_pay4.php?id=${productId}&platform_order_id=${orderId}`;

    return NextResponse.json({
      success: true,
      payment_url: shopierPaymentUrl,
      order_id: orderId
    });

  } catch (error) {
    console.error("[Shopier Create Error]:", error);
    return NextResponse.json({ error: "Shopier ödeme oturumu oluşturulamadı." }, { status: 500 });
  }
}
