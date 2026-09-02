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

    const { guildId, guildName, productId, productName, productPrice, productUrl, durationDays } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Lütfen bir Shopier ürünü seçin." }, { status: 400 });
    }

    const patToken = process.env.SHOPIER_PAT_TOKEN;
    if (!patToken) {
      return NextResponse.json({ error: "SHOPIER_PAT_TOKEN bulunamadı. Lütfen VPS sunucunuzda .env.local tanımlayınız." }, { status: 500 });
    }

    const finalGuildId = guildId || 'USER_PLAN';
    const durationDaysInt = parseInt(durationDays) || 30;
    const orderId = `VX_SHOP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // DB Sipariş Kaydı
    const { error: dbError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        guild_id: finalGuildId,
        guild_name: guildName || null,
        amount: parseFloat(productPrice) || 0,
        currency: 'TRY',
        duration_days: durationDaysInt,
        plan_type: guildId ? 'server' : 'user',
        status: 'pending'
      });

    if (dbError) {
      console.error("[Shopier Create] DB Error:", dbError);
    }

    // Shopier ürün sayfasını iFrame'de aç
    // productUrl front-end'den geliyorsa onu kullan, yoksa productId'den oluştur
    const shopStore = process.env.SHOPIER_STORE_URL || 'https://www.shopier.com/veyronixbot';
    const shopierPaymentUrl = productUrl || `${shopStore}/${productId}`;

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
