import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // Set a trigger flag and clear the last_killboard_date so the bot sees it as "due"
    const { data, error } = await supabase
      .from('guild_settings')
      .update({ 
        trigger_killboard: true,
        last_killboard_date: null 
      })
      .eq('guild_id', guildId)
      .select();

    if (error) {
      console.error('[KillBoard Trigger API] Supabase Error:', error);
      return NextResponse.json({ error: error.message, detail: error.details }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Guild settings not found in database for this ID." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[KillBoard Trigger API] Crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
