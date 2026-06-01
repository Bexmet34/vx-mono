import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Supabase count error:", error);
      return NextResponse.json({ count: 0 }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
