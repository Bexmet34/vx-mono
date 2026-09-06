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

    // 1. Fetch bot guilds to get real names, icons and owner_ids
    let botGuildMap = {};
    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3005';
      const botRes = await fetch(`${botApiUrl}/api/bot-guilds`);
      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData?.success && Array.isArray(botData.guilds)) {
          for (const g of botData.guilds) {
            botGuildMap[g.id] = g;
          }
        }
      }
    } catch (e) {
      console.error("[DashboardAPI] Error fetching bot guilds:", e.message);
    }

    // 2. Fetch subscriptions where owner_id = Discord ID OR authorized_users contains Discord ID
    const { data: subs, error: subError } = await supabase
      .from('subscriptions')
      .select('id, guild_id, guild_name, expires_at, is_unlimited, is_active, trial_used, authorized_users, unlimited_party')
      .or(`owner_id.eq.${discordId},authorized_users.cs.{${discordId}}`);

    if (subError) throw subError;

    // 3. Fetch guild_settings where owner_id = Discord ID
    const { data: settings, error: setError } = await supabase
      .from('guild_settings')
      .select('id, guild_id')
      .eq('owner_id', discordId);

    if (setError) throw setError;

    const subMap = {};
    const resultList = [];

    // Add existing subscriptions and enrich names/icons
    for (const sub of (subs || [])) {
      subMap[sub.guild_id] = sub;
      const bg = botGuildMap[sub.guild_id];
      const realName = bg?.name || (sub.guild_name && sub.guild_name !== 'Yükleniyor...' && sub.guild_name !== 'Unknown' ? sub.guild_name : `Sunucu (${sub.guild_id})`);
      
      resultList.push({
        ...sub,
        guild_name: realName,
        guild_icon: bg?.icon || null
      });
    }

    // Add guild_settings that aren't in subscriptions (freemium)
    for (const setting of (settings || [])) {
      if (!subMap[setting.guild_id]) {
        const bg = botGuildMap[setting.guild_id];
        const realName = bg?.name || `Sunucu (${setting.guild_id})`;
        const freemiumItem = {
          id: setting.id,
          guild_id: setting.guild_id,
          guild_name: realName,
          guild_icon: bg?.icon || null,
          expires_at: new Date().toISOString(),
          is_unlimited: false,
          is_active: true,
          trial_used: true,
          unlimited_party: false,
          authorized_users: []
        };
        subMap[setting.guild_id] = freemiumItem;
        resultList.push(freemiumItem);
      }
    }

    // 3.5. Fetch user's guilds from Discord API to check permissions
    let userDiscordGuilds = [];
    if (session.accessToken) {
      try {
        const discordRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        if (discordRes.ok) {
          userDiscordGuilds = await discordRes.json();
        }
      } catch (e) {
        console.error("[DashboardAPI] Error fetching Discord guilds:", e.message);
      }
    }

    const authorizedDiscordGuildIds = new Set();
    for (const g of userDiscordGuilds) {
      try {
        const perms = BigInt(g.permissions || 0);
        const isAdmin = (perms & (1n << 3n)) === (1n << 3n);
        const isManageServer = (perms & (1n << 5n)) === (1n << 5n);
        if (g.owner || isAdmin || isManageServer) {
          authorizedDiscordGuildIds.add(g.id);
        }
      } catch(e) {}
    }

    // Add bot guilds owned by this user or where they have Admin/Manage Server perms
    for (const guildId of Object.keys(botGuildMap)) {
      const bg = botGuildMap[guildId];
      if (bg && (bg.owner_id === discordId || authorizedDiscordGuildIds.has(guildId)) && !subMap[guildId]) {
        const freemiumItem = {
          id: bg.id,
          guild_id: bg.id,
          guild_name: bg.name || `Sunucu (${bg.id})`,
          guild_icon: bg.icon || null,
          expires_at: new Date().toISOString(),
          is_unlimited: false,
          is_active: true,
          trial_used: true,
          unlimited_party: false,
          authorized_users: []
        };
        subMap[guildId] = freemiumItem;
        resultList.push(freemiumItem);
      }
    }

    return NextResponse.json(resultList);
  } catch (error) {
    console.error("[DashboardAPI] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
