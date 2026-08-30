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

    // Fetch subscriptions where owner_id = Discord ID OR authorized_users contains Discord ID
    const { data: subs, error: subError } = await supabase
      .from('subscriptions')
      .select('id, guild_id, guild_name, expires_at, is_unlimited, is_active, trial_used, authorized_users')
      .or(`owner_id.eq.${discordId},authorized_users.cs.{${discordId}}`);

    if (subError) throw subError;

    // Fetch guild_settings where owner_id = Discord ID
    const { data: settings, error: setError } = await supabase
      .from('guild_settings')
      .select('id, guild_id')
      .eq('owner_id', discordId);

    if (setError) throw setError;

    const subMap = {};
    for (const sub of (subs || [])) {
      subMap[sub.guild_id] = sub;
    }

    const combinedGuilds = [...(subs || [])];

    // Add settings that aren't in subscriptions (freemium)
    for (const setting of (settings || [])) {
      if (!subMap[setting.guild_id]) {
        combinedGuilds.push({
          id: setting.id,
          guild_id: setting.guild_id,
          guild_name: "Yükleniyor...", // The frontend maps real names
          expires_at: null,
          is_unlimited: false,
          is_active: false,
          trial_used: false,
          authorized_users: []
        });
      }
    }

    return NextResponse.json(combinedGuilds);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
