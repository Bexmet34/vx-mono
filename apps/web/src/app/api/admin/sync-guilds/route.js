import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAutoPremiumRulesOnlyGuilds, upsertCachedGuildMembers, deleteOldCachedGuildMembers } from '@veyronix/database';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";
const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

const endpoints = {
    'americas': 'https://gameinfo.albiononline.com/api/gameinfo',
    'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
    'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo'
};

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
