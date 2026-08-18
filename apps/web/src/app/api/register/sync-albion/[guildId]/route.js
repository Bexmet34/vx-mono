import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { supabase } from '@veyronix/database';

const ALBION_API_BASE = "https://gameinfo.albiononline.com/api/gameinfo";
const ALBION_API_BASE_EAST = "https://gameinfo-sg.albiononline.com/api/gameinfo";
const ALBION_API_BASE_EUROPE = "https://gameinfo-ams.albiononline.com/api/gameinfo";

function getBaseUrl(serverName) {
  if (serverName === 'East' || serverName === 'Singapore') return ALBION_API_BASE_EAST;
  if (serverName === 'Europe' || serverName === 'Amsterdam') return ALBION_API_BASE_EUROPE;
  return ALBION_API_BASE; // Americas
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get guild settings
    const { data: settings, error: settingsError } = await supabase
      .from('guild_settings')
      .select('albion_guild_id, albion_server')
      .eq('guild_id', guildId)
      .single();

    if (settingsError || !settings?.albion_guild_id) {
      return NextResponse.json({ error: "Guild not configured for Albion" }, { status: 400 });
    }

    const baseUrl = getBaseUrl(settings.albion_server);
    
    // Fetch Albion members
    const albionRes = await fetch(`${baseUrl}/guilds/${settings.albion_guild_id}/members`);
    
    if (!albionRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from Albion API" }, { status: 500 });
    }

    const members = await albionRes.json(); // array of member objects
    
    // Previous count
    const { count: prevCount } = await supabase
      .from('albion_guild_members')
      .select('*', { count: 'exact', head: true })
      .eq('discord_guild_id', guildId);

    // Delete existing records to sync cleanly
    await supabase
      .from('albion_guild_members')
      .delete()
      .eq('discord_guild_id', guildId);

    // Insert new records in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE).map(m => ({
        discord_guild_id: guildId,
        albion_guild_id: settings.albion_guild_id,
        player_id: m.Id,
        player_name: m.Name
      }));
      await supabase.from('albion_guild_members').insert(batch);
    }

    const newCount = members.length;

    return NextResponse.json({ 
      success: true, 
      previousCount: prevCount || 0,
      newCount: newCount,
      added: Math.max(0, newCount - (prevCount || 0)),
      removed: Math.max(0, (prevCount || 0) - newCount)
    });

  } catch (error) {
    console.error("Albion Sync API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
