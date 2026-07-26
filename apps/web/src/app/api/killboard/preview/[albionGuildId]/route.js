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
    if (typeof ts === 'number') return ts;
    if (ts instanceof Date) return ts.getTime();
    let s = String(ts).trim();
    let t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    s = s.replace(/(\.\d{3})\d+/, '$1');
    t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    s = String(ts).trim().replace(/\.\d+/, '');
    t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    return NaN;
}

async function fetchAlbionJson(url, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const res = await fetch(url, {
                headers: { 
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!res.ok) {
                if (attempt < retries) continue;
                return null;
            }
            const text = await res.text();
            if (!text || text.trim() === '') return null;
            return JSON.parse(text);
        } catch (e) {
            if (attempt === retries) {
                console.error(`[KillBoard Preview] Error fetching ${url}:`, e.message);
                return null;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return null;
}

async function fetchAlbion(url) {
    const json = await fetchAlbionJson(url);
    return Array.isArray(json) ? json : [];
}

async function resolveGuildId(guildId, server = 'Europe') {
    if (!guildId) return null;
    const clean = String(guildId).trim();
    if (clean.length > 15 && !clean.includes(' ')) {
        return clean;
    }
    try {
        const baseUrl = getBaseUrl(server);
        const json = await fetchAlbionJson(`${baseUrl}/search?q=${encodeURIComponent(clean)}`);
        if (json && json.guilds && json.guilds.length > 0) {
            const found = json.guilds.find(g => g.Name.toLowerCase() === clean.toLowerCase()) || json.guilds[0];
            if (found && found.Id) return found.Id;
        }
    } catch (e) {}
    return clean;
}

function createGuildMatcher(targetGuildId, targetGuildName) {
    const cleanId = targetGuildId ? String(targetGuildId).trim().toLowerCase() : '';
    const cleanName = targetGuildName ? String(targetGuildName).trim().toLowerCase() : '';

    return function matchesGuild(gId, gName) {
        if (!gId && !gName) return false;
        if (cleanId && gId && String(gId).trim().toLowerCase() === cleanId) return true;
        if (cleanName && gName && String(gName).trim().toLowerCase() === cleanName) return true;
        if (cleanId && gName && String(gName).trim().toLowerCase() === cleanId) return true;
        return false;
    };
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

        const resolvedGuildId = await resolveGuildId(targetGuildId, server);
        const matchesGuild = createGuildMatcher(resolvedGuildId || targetGuildId, targetGuildId);

        const now = new Date();
        const sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Fetch recent events for the guild with pagination
        const events = await fetchAllGuildEvents(resolvedGuildId || targetGuildId, server, sinceDate);

        // Separate into kills and deaths in the last 24 hours
        const killEvents = [];
        const deathEvents = [];

        for (const ev of events) {
            const tTime = parseAlbionTime(ev.TimeStamp);
            if (isNaN(tTime) || tTime < sinceDate.getTime()) continue;

            const isKiller = matchesGuild(ev.Killer?.GuildId, ev.Killer?.GuildName);
            const isParticipant = ev.Participants?.some(p => matchesGuild(p.GuildId, p.GuildName));

            if (isKiller || isParticipant) {
                killEvents.push(ev);
            }
            if (matchesGuild(ev.Victim?.GuildId, ev.Victim?.GuildName)) {
                deathEvents.push(ev);
            }
        }

        console.log(`[KillBoard Preview] ${targetGuildId} -> ${resolvedGuildId} (${server}): ${killEvents.length} kills, ${deathEvents.length} deaths from ${events.length} fetched events in 24h`);

        // Top killers: aggregate by member killer/participant
        const killerMap = {};
        let totalKillFame = 0;
        for (const ev of killEvents) {
            let memberParticipant = ev.Participants?.filter(p => matchesGuild(p.GuildId, p.GuildName)).sort((a, b) => (b.DamageDone || 0) - (a.DamageDone || 0))[0];
            if (matchesGuild(ev.Killer?.GuildId, ev.Killer?.GuildName)) {
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

