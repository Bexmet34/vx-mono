import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAutoPremiumRulesOnlyGuilds, upsertCachedGuildMembers, deleteOldCachedGuildMembers } from '@veyronix/database';
import { createClient } from '@supabase/supabase-js';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";
const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

const endpoints = {
    'americas': 'https://gameinfo.albiononline.com/api/gameinfo',
    'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
    'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo'
};

// GET: Fix placeholder guild names by fetching real names from Discord API
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "DISCORD_BOT_TOKEN not set" }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Find all subscriptions with placeholder names
  const { data: placeholders, error: fetchError } = await supabase
    .from('subscriptions')
    .select('guild_id, owner_id, guild_name')
    .or('guild_name.like.Sunucu (%,guild_name.eq.Unknown,guild_name.is.null');

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!placeholders || placeholders.length === 0) {
    return NextResponse.json({ success: true, message: "Tüm isimler zaten düzgün!", fixed: 0 });
  }

  let fixed = 0;
  let failed = 0;
  const results = [];

  for (const entry of placeholders) {
    try {
      const res = await fetch(`https://discord.com/api/v10/guilds/${entry.guild_id}`, {
        headers: { 'Authorization': `Bot ${botToken}` }
      });

      if (!res.ok) {
        failed++;
        results.push({ guild_id: entry.guild_id, status: `discord_error_${res.status}` });
        await new Promise(r => setTimeout(r, 250));
        continue;
      }

      const guild = await res.json();
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          guild_name: guild.name, 
          owner_id: guild.owner_id || entry.owner_id,
          updated_at: new Date().toISOString() 
        })
        .eq('guild_id', entry.guild_id);

      if (updateError) {
        failed++;
        results.push({ guild_id: entry.guild_id, status: 'update_failed' });
      } else {
        fixed++;
        results.push({ guild_id: entry.guild_id, status: 'fixed', name: guild.name });
      }
    } catch (e) {
      failed++;
      results.push({ guild_id: entry.guild_id, status: 'error', error: e.message });
    }

    await new Promise(r => setTimeout(r, 250)); // Discord rate limit
  }

  return NextResponse.json({ success: true, fixed, failed, results });
}



export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Tüm kuralları çek ve lonca isimlerini topla
    const rules = await getAutoPremiumRulesOnlyGuilds();
    if (!rules || rules.length === 0) return NextResponse.json({ success: true, message: "Kural yok." });

    const guildNames = new Set();
    for (const rule of rules) {
        if (rule.albion_guilds) {
            rule.albion_guilds.forEach(g => guildNames.add(g.toLowerCase()));
        }
    }

    if (guildNames.size === 0) return NextResponse.json({ success: true, message: "Senkronize edilecek lonca yok." });

    let membersToUpsert = [];
    let guildsFound = 0;

    // 2. Her lonca için ID bul ve üyelerini çek
    for (const guildName of Array.from(guildNames)) {
        let guildId = null;
        let guildServer = null;

        // Önce loncayı bul (Tüm sunucularda ara)
        const searchPromises = Object.entries(endpoints).map(async ([serverName, baseUrl]) => {
            try {
                const res = await fetch(`${baseUrl}/search?q=${encodeURIComponent(guildName)}`, { signal: AbortSignal.timeout(10000) });
                if (!res.ok) return null;
                const data = await res.json();
                const guild = data.guilds?.find(g => g.Name.toLowerCase() === guildName);
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

        if (!guildId) continue; // Lonca bulunamadıysa atla
        guildsFound++;

        // Üyeleri çek
        try {
            const baseUrl = endpoints[guildServer];
            const membersRes = await fetch(`${baseUrl}/guilds/${guildId}/members`, { signal: AbortSignal.timeout(15000) });
            if (membersRes.ok) {
                const membersData = await membersRes.json();
                // membersData bir array (her biri oyuncu objesi)
                for (const member of membersData) {
                    membersToUpsert.push({
                        ign: member.Name,
                        guild_name: guildName, // Kuraldaki isimle aynı olsun diye orijinalini saklıyoruz
                        last_seen: new Date().toISOString()
                    });
                }
            }
        } catch (e) {
            console.error(`Guild fetch error for ${guildName}:`, e);
        }
    }

    // 3. Veritabanına kaydet (Upsert)
    if (membersToUpsert.length > 0) {
        await upsertCachedGuildMembers(membersToUpsert);
    }

    // 4. Eski verileri sil (Son 2 saat içinde güncellenmeyenler loncadan çıkmış demektir)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    await deleteOldCachedGuildMembers(twoHoursAgo);

    return NextResponse.json({ 
        success: true, 
        message: `${guildsFound} lonca tarandı, ${membersToUpsert.length} üye güncellendi.` 
    });

  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Senkronizasyon hatası." }, { status: 500 });
  }
}
