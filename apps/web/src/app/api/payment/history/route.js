import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('crypto_payments')
      .select('id, order_id, amount, currency, duration_days, status, payment_method, sender_name, description_code, target_bank, guild_name, guild_id, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Payment History GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
