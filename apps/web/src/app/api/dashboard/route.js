import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discordId = session.user.id;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
       return NextResponse.json({ error: "Supabase credentials missing" }, { status: 500 });
    }

    // Fetch subscriptions where owner_id = Discord ID
    const { data: guilds, error } = await supabase
      .from('subscriptions')
      .select('id, guild_id, guild_name, expires_at, is_unlimited, is_active')
      .eq('owner_id', discordId);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(guilds || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
