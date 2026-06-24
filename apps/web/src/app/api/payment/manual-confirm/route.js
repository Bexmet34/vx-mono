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

    const { descriptionCode, senderName } = await req.json();

    if (!descriptionCode || !senderName) {
      return NextResponse.json({ error: "Eksik bilgi gönderdiniz." }, { status: 400 });
    }

    // İlgili ödemeyi bul (status pending ve isim Belirtilmedi olan)
    const { data: payment, error: fetchError } = await supabase
      .from('crypto_payments')
      .select('id, status, user_id')
      .eq('description_code', descriptionCode)
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Geçerli bir ödeme bulunamadı veya süresi geçmiş." }, { status: 404 });
    }

    // İsmi güncelle (artık Belirtilmedi olmayacak, böylece bot bildirim atacak)
    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update({
        sender_name: senderName
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error("Supabase Error (Manual Confirm):", updateError);
      return NextResponse.json({ error: "Onay işlemi başarısız oldu." }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Manual Payment Confirm Error:", error);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
