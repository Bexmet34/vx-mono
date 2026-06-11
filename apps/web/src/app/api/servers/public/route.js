import { NextResponse } from 'next/server';
import { supabase } from "@veyronix/database";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
       return NextResponse.json({ error: "Supabase credentials missing" }, { status: 500 });
    }

    // Fetch up to 50 active subscriptions to display their names (excluding specific test owner)
    const { data: guilds, error } = await supabase
      .from('subscriptions')
      .select('guild_name')
      .neq('owner_id', '407234961582587916')
      .limit(50);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract names and filter out empty ones
    const serverNames = guilds
      .map(g => g.guild_name)
      .filter(name => name && name.trim() !== '' && name.toLowerCase() !== 'unknown');

    return NextResponse.json(serverNames);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
