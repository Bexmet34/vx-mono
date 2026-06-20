import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('payment_method', 'havale')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin Manual Payments GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Ödemeyi al
    const { data: payment, error: fetchError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === 'paid' && status === 'paid') {
       return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // 2. Durumu güncelle
    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Eğer onaylandıysa aboneliği uzat
    if (status === 'paid') {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('guild_id', payment.guild_id)
        .single();

      if (!subError && subscription) {
        const now = new Date();
        let currentExpiry = new Date(subscription.expires_at);

        if (currentExpiry < now) {
          currentExpiry = now;
        }

        currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);
        const isUnlimited = payment.duration_days >= 90;

        await supabase
          .from('subscriptions')
          .update({ 
            expires_at: currentExpiry.toISOString(),
            is_active: true,
            is_unlimited: isUnlimited || subscription.is_unlimited
          })
          .eq('id', subscription.id);

        console.log(`[Admin Manual Payment] Order ${payment.order_id} approved. Guild ${payment.guild_id} extended by ${payment.duration_days} days.`);
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Admin Manual Payments PATCH Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
