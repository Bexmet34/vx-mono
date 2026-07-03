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

    const { guildId, guildName, planId, senderName, targetBank } = await req.json();

    // Önce plan ID ve senderName kontrolü
    if (!planId || !senderName) {
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

    // Eğer paket sunucu paketiyse guildId zorunludur
    if (plan.plan_type !== 'user' && !guildId) {
      return NextResponse.json({ error: "Lütfen bir sunucu seçin." }, { status: 400 });
    }

    const finalGuildId = guildId || 'USER_PLAN';
    const finalGuildName = guildName || (plan.plan_type === 'user' ? 'Bireysel Kullanıcı' : 'Bilinmeyen Sunucu');

    // #3 — Çifte pending ödeme koruması (aynı sunucu/kullanıcı için)
    const { data: existingPending } = await supabase
      .from('crypto_payments')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('guild_id', finalGuildId)
      .eq('payment_method', 'havale')
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPending) {
      return NextResponse.json({ 
        error: "Bu işlem için zaten bekleyen bir Havale/EFT başvurunuz var. Lütfen mevcut başvurunuzun onaylanmasını bekleyin veya destek ekibiyle iletişime geçin." 
      }, { status: 409 });
    }

    // #1 — Açıklama kodunu güvenli biçimde SERVER SIDE üret (8 karakter, küçük harf + rakam)
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let descriptionCode = '';
    for (let i = 0; i < 8; i++) {
      descriptionCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }



    // Benzersiz order_id üret
    const orderId = `VX_HV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Veritabanına havale/EFT ödemesini kaydet
    const { error: dbError } = await supabase
      .from('crypto_payments')
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        guild_id: finalGuildId,
        guild_name: finalGuildName,
        amount: plan.amount * (parseFloat(process.env.NEXT_PUBLIC_USDT_TRY_RATE) || 40),
        currency: 'TRY',
        duration_days: plan.duration_days,
        plan_type: plan.plan_type || 'server',
        status: 'pending',
        payment_method: 'havale',
        sender_name: senderName,
        target_bank: targetBank,
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
