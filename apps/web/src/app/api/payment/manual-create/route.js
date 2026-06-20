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

    const { guildId, guildName, planId, senderName, descriptionCode } = await req.json();

    if (!guildId || !planId || !senderName || !descriptionCode) {
      return NextResponse.json({ error: "Eksik bilgi gönderdiniz. Lütfen tüm alanları doldurun." }, { status: 400 });
    }

    // Paketin güncel verisini veritabanından çek
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Geçersiz veya pasif paket seçimi." }, { status: 400 });
    }

    // Benzersiz order_id üret
    const orderId = `VX_HV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Veritabanına havale/EFT ödemesini kaydet
    const { error: dbError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        guild_id: guildId,
        guild_name: guildName || "Bilinmeyen Sunucu",
        amount: plan.amount,
        currency: 'USDT',
        duration_days: plan.duration_days,
        status: 'pending',
        payment_method: 'havale',
        sender_name: senderName,
        description_code: descriptionCode
      });

    if (dbError) {
      console.error("Supabase Error (Manual Payment):", dbError);
      return NextResponse.json({ error: "Ödeme kaydı oluşturulamadı. Lütfen tekrar deneyin." }, { status: 500 });
    }

    // Başarılı bir şekilde kaydedildi, üretilen kodu Frontend'e döndürüyoruz
    return NextResponse.json({ 
      success: true, 
      description_code: descriptionCode 
    });

  } catch (error) {
    console.error("Manual Payment Create Error:", error);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
