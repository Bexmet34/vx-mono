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
      console.warn(`[API] Forbidden access to guild ${guildId} for user ${session.user.id}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`[API] Fetching Discord data for Guild: ${guildId}`);

    let guildInfo = null;
    let formattedRoles = [];
    let formattedMembers = [];
    let formattedChannels = [];

    // 1. ÖNCELİKLİ KAYNAK: Yerel Bot API'sinden (Sharding/Gateway Cache) Anlık Çek
    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3005';
      const botRes = await fetch(`${botApiUrl}/api/guild-data/${guildId}`, {
        cache: 'no-store'
      });
      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData && botData.success) {
          guildInfo = {
            id: botData.id,
            name: botData.name,
            icon: botData.icon,
            approximate_member_count: botData.approximate_member_count
          };
          if (Array.isArray(botData.channels)) {
            formattedChannels = botData.channels.map(c => ({
              id: c.id,
              name: c.name,
              type: Number(c.type)
            }));
          }
          if (Array.isArray(botData.roles)) {
            formattedRoles = botData.roles;
          }
          if (Array.isArray(botData.members)) {
            formattedMembers = botData.members;
          }
          console.log(`[API] Successfully retrieved ${formattedChannels.length} channels from Bot Gateway Cache for Guild: ${guildId}`);
        }
      }
    } catch (botErr) {
      console.warn('[API] Bot Gateway API not reachable, falling back to Discord REST API:', botErr.message);
    }

    // 2. YEDEK KAYNAK: Eğer Bot API'den kanallar alınamadıysa Discord REST API'ye Sor
    const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;

    if (token) {
      // Guild Info fallback
      if (!guildInfo) {
        try {
          const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
            headers: { 'Authorization': `Bot ${token}` },
            cache: 'no-store'
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
      }

      // Roles fallback
      if (formattedRoles.length === 0) {
        try {
          const roles = await getGuildRoles(guildId);
          if (Array.isArray(roles)) {
            formattedRoles = roles
              .filter(r => r.name !== '@everyone') 
              .sort((a, b) => b.position - a.position);
          }
        } catch (error) {
          console.error(`[API] Discord Roles Error: ${error.message}`);
        }
      }

      // Members fallback
      if (formattedMembers.length === 0) {
        try {
          const membersData = await getGuildMembers(guildId, 1000);
          if (Array.isArray(membersData)) {
            formattedMembers = membersData.map(m => ({
              id: m.user.id,
              username: m.user.username,
              global_name: m.user.global_name,
              avatar: m.user.avatar,
              bot: m.user.bot || false
            }));
          }
        } catch (e) {
          console.error("[API] Member Fetch Exception:", e);
        }
      }

      // Channels fallback
      if (formattedChannels.length === 0) {
        try {
          const channelsData = await getGuildChannels(guildId);
          if (Array.isArray(channelsData)) {
            formattedChannels = channelsData.map(c => ({
              id: c.id,
              name: c.name,
              type: Number(c.type)
            }));
            console.log(`[API] Fetched ${formattedChannels.length} channels from Discord REST API for Guild: ${guildId}`);
          }
        } catch (e) {
          console.error("[API] Channel Fetch Exception:", e);
        }
      }
    }

    return NextResponse.json({ 
      guildId,
      guild: guildInfo,
      roles: formattedRoles, 
      members: formattedMembers,
      channels: formattedChannels
    });
  } catch (err) {
    console.error("[API] GET /roles Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
