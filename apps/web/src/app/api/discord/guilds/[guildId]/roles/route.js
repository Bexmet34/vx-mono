import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { getGuildRoles, getGuildMembers, getGuildChannels } from '@/lib/discordApi';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { guildId } = await params;
    
    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[API] Fetching Discord data for Guild: ${guildId}`);

    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      console.error("[API] DISCORD_BOT_TOKEN is missing");
      return NextResponse.json({ error: "DISCORD_BOT_TOKEN is missing" }, { status: 500 });
    }

    // 0. Fetch Real-Time Guild Detail (Name, Icon, Member count)
    let guildInfo = null;
    try {
      const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: { 'Authorization': `Bot ${token}` },
        next: { revalidate: 0 }
      });
      if (guildRes.ok) {
        const gData = await guildRes.json();
        guildInfo = {
          id: gData.id,
          name: gData.name,
          icon: gData.icon ? `https://cdn.discordapp.com/icons/${gData.id}/${gData.icon}.${gData.icon.startsWith('a_') ? 'gif' : 'png'}?size=256` : null,
          approximate_member_count: gData.approximate_member_count || null
        };
      }
    } catch (e) {
      console.error("[API] Guild Detail Fetch Exception:", e);
    }

    // 1. Fetch Roles
    let roles = [];
    try {
      roles = await getGuildRoles(guildId);
    } catch (error) {
      console.error(`[API] Discord Roles Error: ${error.message}`);
      return NextResponse.json({ error: "Failed to fetch roles from Discord" }, { status: 500 });
    }
    const formattedRoles = roles
      .filter(r => r.name !== '@everyone') 
      .sort((a, b) => b.position - a.position);

    // 2. Fetch Members (Guild Specific)
    let formattedMembers = [];
    try {
      const membersData = await getGuildMembers(guildId, 1000);
      
      console.log(`[API] Fetched ${membersData.length} members for Guild: ${guildId}`);
      formattedMembers = membersData.map(m => ({
        id: m.user.id,
        username: m.user.username,
        global_name: m.user.global_name,
        avatar: m.user.avatar,
        bot: m.user.bot || false
      }));
    } catch (e) {
      console.error("[API] Member Fetch Exception:", e);
    }

    // 3. Fetch Channels
    let formattedChannels = [];
    try {
      const channelsData = await getGuildChannels(guildId);
      formattedChannels = channelsData.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }));
    } catch (e) {
      console.error("[API] Channel Fetch Exception:", e);
    }

    return NextResponse.json({ 
      guildId,
      guild: guildInfo,
      roles: formattedRoles, 
      members: formattedMembers,
      channels: formattedChannels
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
