import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

async function fetchAlbion(url) {
    try {
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const text = await res.text();
        if (!text || text.trim() === '') return [];
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error(`[KillBoard Preview] Error fetching ${url}:`, e.message);
        return [];
    }
}

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { albionGuildId } = await params;
        if (!albionGuildId) {
            return NextResponse.json({ error: "Missing albionGuildId" }, { status: 400 });
        }

        const BASE = 'https://gameinfo-ams.albiononline.com/api/gameinfo';

        // Fetch kills (guild members as killers) and deaths (guild members as victims)
        const [killEvents, deathEvents] = await Promise.all([
            fetchAlbion(`${BASE}/guilds/${albionGuildId}/kills?offset=0&limit=51`),
            fetchAlbion(`${BASE}/guilds/${albionGuildId}/deaths?offset=0&limit=51`)
        ]);

        console.log(`[KillBoard Preview] ${albionGuildId}: ${killEvents.length} kills, ${deathEvents.length} deaths`);

        // Top killers: aggregate by killer name
        const killerMap = {};
        for (const ev of killEvents) {
            const name = ev.Killer?.Name;
            if (!name) continue;
            if (!killerMap[name]) killerMap[name] = { name, kills: 0, killFame: 0 };
            killerMap[name].kills++;
            killerMap[name].killFame += ev.TotalVictimKillFame || 0;
        }
        const topKillers = Object.values(killerMap).sort((a, b) => b.killFame - a.killFame).slice(0, 5);

        // Top deaths: aggregate by victim name
        const deathMap = {};
        for (const ev of deathEvents) {
            const name = ev.Victim?.Name;
            if (!name) continue;
            if (!deathMap[name]) deathMap[name] = { name, deaths: 0, deathFame: 0 };
            deathMap[name].deaths++;
            deathMap[name].deathFame += ev.TotalVictimKillFame || 0;
        }
        const topDeaths = Object.values(deathMap).sort((a, b) => b.deaths - a.deaths).slice(0, 5);

        // Highest single kill by fame
        const topFameKill = [...killEvents].sort(
            (a, b) => (b.TotalVictimKillFame || 0) - (a.TotalVictimKillFame || 0)
        )[0] || null;

        return NextResponse.json({
            totalKills: killEvents.length,
            totalDeaths: deathEvents.length,
            topKillers,
            topDeaths,
            topFameKill: topFameKill ? {
                killer: topFameKill.Killer?.Name,
                victim: topFameKill.Victim?.Name,
                fame: topFameKill.TotalVictimKillFame
            } : null
        });

    } catch (err) {
        console.error('[KillBoard Preview API] Crash:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
