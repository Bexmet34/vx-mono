import { NextResponse } from 'next/server';
import { supabase } from "@veyronix/database";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Public Bank Accounts GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
