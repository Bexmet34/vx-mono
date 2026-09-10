import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing rule ID" }, { status: 400 });

    const { data: rule } = await supabase.from('auto_premium_rules').select('albion_guilds').eq('id', id).single();
    if (!rule || !rule.albion_guilds || rule.albion_guilds.length === 0) {
      return NextResponse.json({ error: "Rule not found or no guilds specified." }, { status: 404 });
    }

    let guildNames = rule.albion_guilds;
    if (typeof guildNames === 'string') {
        try { guildNames = JSON.parse(guildNames); } catch(e) { guildNames = guildNames.split(','); }
    }
    guildNames = guildNames.map(g => String(g).trim()).filter(Boolean);

    let membersToUpsert = [];
    const endpoints = {
      'americas': 'https://gameinfo.albiononline.com/api/gameinfo',
      'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
      'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo'
    };

    for (const guildName of guildNames) {
      let guildId = null;
      let guildServer = null;

      const searchPromises = Object.entries(endpoints).map(async ([serverName, baseUrl]) => {
        try {
          const res = await fetch(`${baseUrl}/search?q=${encodeURIComponent(guildName)}`, { signal: AbortSignal.timeout(10000) });
          if (!res.ok) return null;
          const data = await res.json();
          const guild = data.guilds?.find(g => g.Name.toLowerCase() === guildName.toLowerCase());
          if (guild) return { id: guild.Id, server: serverName };
        } catch (e) {
          return null;
        }
      });

      const searchResults = await Promise.all(searchPromises);
      const validMatch = searchResults.find(r => r != null);

      if (validMatch) {
        guildId = validMatch.id;
        guildServer = validMatch.server;
      }

      if (!guildId) continue;

      try {
        const baseUrl = endpoints[guildServer];
        const membersRes = await fetch(`${baseUrl}/guilds/${guildId}/members`, { signal: AbortSignal.timeout(15000) });
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          for (const member of membersData) {
            membersToUpsert.push({
              ign: member.Name,
              guild_name: guildName, // DB requires exact name Match for rule
              last_seen: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.error(`[AdminSync] Guild fetch error for ${guildName}:`, e);
      }
    }

    if (membersToUpsert.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < membersToUpsert.length; i += chunkSize) {
        const chunk = membersToUpsert.slice(i, i + chunkSize);
        await supabase.from('cached_guild_members').upsert(chunk, { onConflict: 'ign' });
      }
    }

    return NextResponse.json({ success: true, count: membersToUpsert.length });
  } catch (error) {
    console.error('API /admin/auto-premium-rules/sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
