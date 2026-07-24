import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

function getBaseUrl(server = 'Europe') {
    const s = String(server || 'Europe').trim().toLowerCase();
    if (s.includes('america') || s.includes('west')) {
        return 'https://gameinfo.albiononline.com/api/gameinfo';
    } else if (s.includes('asia') || s.includes('east')) {
        return 'https://gameinfo-sgp.albiononline.com/api/gameinfo';
    }
    return 'https://gameinfo-ams.albiononline.com/api/gameinfo';
}

function parseAlbionTime(ts) {
    if (!ts) return NaN;
    let s = String(ts).trim();
    s = s.replace(/(\.\d{3})\d+/, '$1');
    let t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    s = String(ts).trim().replace(/\.\d+/, '');
    t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    return NaN;
}

async function fetchAlbion(url) {
    try {
        const res = await fetch(url, {
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
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

async function fetchAllGuildEvents(guildId, server, sinceDate) {
    const baseUrl = getBaseUrl(server);
    const allEvents = [];
    const maxPages = 30;

    for (let page = 0; page < maxPages; page++) {
        const offset = page * 50;
        const url = `${baseUrl}/events?offset=${offset}&limit=51&guildId=${guildId}`;
        const events = await fetchAlbion(url);
        if (!events || events.length === 0) break;
        allEvents.push(...events);

        if (sinceDate && events.length > 0) {
            const oldestTs = parseAlbionTime(events[events.length - 1].TimeStamp);
            if (!isNaN(oldestTs) && oldestTs < sinceDate.getTime()) {
                break;
            }
        }
        if (events.length < 51) break;
    }
    return allEvents;
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

        const { searchParams } = new URL(req.url);
        const server = searchParams.get('server') || 'Europe';
        const targetGuildId = String(albionGuildId).trim();

        const now = new Date();
        const sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Fetch recent events for the guild with pagination
        const events = await fetchAllGuildEvents(targetGuildId, server, sinceDate);

        // Separate into kills and deaths in the last 24 hours
        const killEvents = [];
        const deathEvents = [];

        for (const ev of events) {
            const tTime = parseAlbionTime(ev.TimeStamp);
            if (isNaN(tTime) || tTime < sinceDate.getTime()) continue;

            const isKiller = ev.Killer?.GuildId === targetGuildId;
            const isParticipant = ev.Participants?.some(p => p.GuildId === targetGuildId);

            if (isKiller || isParticipant) {
                killEvents.push(ev);
            }
            if (ev.Victim?.GuildId === targetGuildId) {
                deathEvents.push(ev);
            }
        }

        console.log(`[KillBoard Preview] ${targetGuildId} (${server}): ${killEvents.length} kills, ${deathEvents.length} deaths from ${events.length} fetched events in 24h`);

        // Top killers: aggregate by member killer/participant
        const killerMap = {};
        let totalKillFame = 0;
        for (const ev of killEvents) {
            let memberParticipant = ev.Participants?.filter(p => p.GuildId === targetGuildId).sort((a, b) => (b.DamageDone || 0) - (a.DamageDone || 0))[0];
            if (ev.Killer?.GuildId === targetGuildId) {
                memberParticipant = ev.Killer;
            }
            const name = memberParticipant?.Name;
            const id = memberParticipant?.Id;
            if (!name) continue;
            totalKillFame += ev.TotalVictimKillFame || 0;
            if (!killerMap[name]) killerMap[name] = { name, id, kills: 0, killFame: 0 };
            killerMap[name].kills++;
            killerMap[name].killFame += ev.TotalVictimKillFame || 0;
        }
        const topKillers = Object.values(killerMap).sort((a, b) => b.killFame - a.killFame).slice(0, 10);

        // Top deaths: aggregate by victim name
        const deathMap = {};
        for (const ev of deathEvents) {
            const name = ev.Victim?.Name;
            const id = ev.Victim?.Id;
            if (!name) continue;
            if (!deathMap[name]) deathMap[name] = { name, id, deaths: 0, deathFame: 0 };
            deathMap[name].deaths++;
            deathMap[name].deathFame += ev.TotalVictimKillFame || 0;
        }
        const topDeaths = Object.values(deathMap).sort((a, b) => b.deaths - a.deaths).slice(0, 10);

        // Highest single kill by fame
        const topFameKill = [...killEvents].sort(
            (a, b) => (b.TotalVictimKillFame || 0) - (a.TotalVictimKillFame || 0)
        )[0] || null;

        return NextResponse.json({
            totalKills: killEvents.length,
            totalDeaths: deathEvents.length,
            totalKillFame: totalKillFame,
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
