const db = require('./db');
const { EmbedBuilder } = require('discord.js');
const https = require('https');
const { t } = require('./i18n');
const { isSubscriptionActive } = require('@veyronix/database');

/**
 * Normalizes server name to Albion Gameinfo API base URL
 */
function getBaseUrl(server = 'Europe') {
    const s = String(server || 'Europe').trim().toLowerCase();
    if (s.includes('america') || s.includes('west')) {
        return 'https://gameinfo.albiononline.com/api/gameinfo';
    } else if (s.includes('asia') || s.includes('east')) {
        return 'https://gameinfo-sgp.albiononline.com/api/gameinfo';
    }
    return 'https://gameinfo-ams.albiononline.com/api/gameinfo';
}

/**
 * Helper to fetch JSON from Albion API with retries
 */
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
                console.error(`[KillBoard Service] Error fetching ${url}:`, e.message);
                return null;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return null;
}

/**
 * Fetches events from Albion API (returns array or [])
 */
async function fetchAlbionEvents(url) {
    const json = await fetchAlbionJson(url);
    return Array.isArray(json) ? json : [];
}

/**
 * Automatically resolves a guild ID or Name to a valid 22-char Albion Guild ID
 */
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

/**
 * Creates a case-insensitive matcher function for GuildId / GuildName
 */
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

/**
 * Helper to safely parse Albion timestamps for Node.js
 */
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

/**
 * Fetches recent events for a guild with pagination up to 24 hours ago
 */
async function fetchAllGuildEvents(guildId, server = 'Europe', sinceDate = null) {
    const baseUrl = getBaseUrl(server);
    const allEvents = [];
    const maxPages = 30; // Increased from 6 to 30 (1500 events) to cover highly active ZvZ guilds over 24h

    for (let page = 0; page < maxPages; page++) {
        const offset = page * 50;
        const url = `${baseUrl}/events?offset=${offset}&limit=51&guildId=${guildId}`;
        const events = await fetchAlbionEvents(url);
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

/**
 * Initializes the KillBoard service — checks every 15 minutes
 */
async function initKillBoardService(client) {
    console.log('[KillBoardService] Started — checking every 15 minutes...');

    setInterval(async () => {
        await processKillBoards(client);
    }, 15 * 60 * 1000);

    // Also check on startup
    await processKillBoards(client);
}

/**
 * Checks all guilds and sends summaries at the configured time
 */
async function processKillBoards(client) {
    const { supabase } = require('@veyronix/database');
    const { getGuildConfig } = require('./guildConfig');

    const { data: activeConfigs } = await supabase
        .from('guild_settings')
        .select('guild_id')
        .not('killboard_channel_id', 'is', null)
        .not('albion_guild_id', 'is', null);

    if (!activeConfigs) return;

    const guilds = [];
    for (const row of activeConfigs) {
        const fullConfig = await getGuildConfig(row.guild_id);
        if (fullConfig) {
            guilds.push(fullConfig);
        }
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // e.g. "2026-05-01"

    for (const guildCfg of guilds) {
        // 0. Subscription Check
        const isPremium = await isSubscriptionActive(guildCfg.guild_id, guildCfg.guild_name);
        if (!isPremium) {
            console.log(`[KillBoard] Guild ${guildCfg.guild_id} is not Premium. Skipping daily summary.`);
            continue;
        }

        // If we already sent today's summary, skip
        let isSentToday = false;
        if (guildCfg.last_killboard_date) {
            isSentToday = guildCfg.last_killboard_date.startsWith(todayStr);
        }
        if (isSentToday) continue;

        const [targetHour, targetMinute] = (guildCfg.killboard_time || '06:00').split(':').map(Number);
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        const isPastTime =
            currentHour > targetHour ||
            (currentHour === targetHour && currentMinute >= targetMinute);

        if (isPastTime) {
            await sendKillBoardSummary(client, guildCfg);
        }
    }
}

/**
 * Fetches data for the past 24 hours and sends the KillBoard embed
 */
async function sendKillBoardSummary(client, guildCfg) {
    try {
        console.log(`[KillBoard] Generating summary | Discord: ${guildCfg.guild_id} | Albion: ${guildCfg.albion_guild_id}`);

        if (!guildCfg.albion_guild_id || !guildCfg.killboard_channel_id) {
            console.warn(`[KillBoard] Missing config — skipping ${guildCfg.guild_id}`);
            return;
        }

        // Daily summary always covers the 24-hour period up to now
        const now = new Date();
        const sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        console.log(`[KillBoard] Period: ${sinceDate.toISOString()} → ${now.toISOString()}`);

        const targetGuildId = String(guildCfg.albion_guild_id || '').trim();
        const targetGuildName = String(guildCfg.albion_guild_name || '').trim();

        // Resolve raw ID/Name to valid 22-char Albion Guild ID
        const resolvedGuildId = await resolveGuildId(targetGuildId, guildCfg.albion_server || 'Europe');
        const matchesGuild = createGuildMatcher(resolvedGuildId || targetGuildId, targetGuildName || targetGuildId);

        // Fetch recent events for the guild with pagination
        const allEvents = await fetchAllGuildEvents(resolvedGuildId || targetGuildId, guildCfg.albion_server || 'Europe', sinceDate);
        
        const allKills = [];
        const allDeaths = [];
        
        for (const ev of allEvents) {
            // Check if our guild is the killer OR a participant (assist)
            const isKiller = matchesGuild(ev.Killer?.GuildId, ev.Killer?.GuildName);
            const isParticipant = ev.Participants?.some(p => matchesGuild(p.GuildId, p.GuildName));
            
            if (isKiller || isParticipant) allKills.push(ev);
            // Check if our guild is the victim
            if (matchesGuild(ev.Victim?.GuildId, ev.Victim?.GuildName)) allDeaths.push(ev);
        }

        // Filter to events within the last 24 hours
        const killEvents = allKills.filter(ev => {
            const tTime = parseAlbionTime(ev.TimeStamp);
            return !isNaN(tTime) && tTime >= sinceDate.getTime();
        });
        const deathEvents = allDeaths.filter(ev => {
            const tTime = parseAlbionTime(ev.TimeStamp);
            return !isNaN(tTime) && tTime >= sinceDate.getTime();
        });

        console.log(`[KillBoard] Filtered: ${killEvents.length}/${allKills.length} kills, ${deathEvents.length}/${allDeaths.length} deaths in 24h window`);

        // --- Build kill stats ---
        const killerMap = {};
        for (const ev of killEvents) {
            // Find the player from our guild who did the most damage, or fallback to the main Killer if they are from our guild
            let memberParticipant = ev.Participants?.filter(p => matchesGuild(p.GuildId, p.GuildName)).sort((a, b) => (b.DamageDone || 0) - (a.DamageDone || 0))[0];
            
            // If the actual killer is from our guild, prioritize them
            if (matchesGuild(ev.Killer?.GuildId, ev.Killer?.GuildName)) {
                memberParticipant = ev.Killer;
            }

            const name = memberParticipant?.Name;
            const id = memberParticipant?.Id;
            if (!name) continue;
            if (!killerMap[name]) killerMap[name] = { Name: name, Id: id, Kills: 0, KillFame: 0 };
            killerMap[name].Kills++;
            // Note: TotalVictimKillFame is the full fame of the victim. We can award it to the contributor.
            killerMap[name].KillFame += ev.TotalVictimKillFame || 0;
        }
        const topKillers = Object.values(killerMap).sort((a, b) => b.KillFame - a.KillFame).slice(0, 10);

        // --- Build death stats ---
        const deathMap = {};
        for (const ev of deathEvents) {
            const name = ev.Victim?.Name;
            const id = ev.Victim?.Id;
            if (!name) continue;
            if (!deathMap[name]) deathMap[name] = { Name: name, Id: id, Deaths: 0, DeathFame: 0 };
            deathMap[name].Deaths++;
            deathMap[name].DeathFame += ev.TotalVictimKillFame || 0;
        }
        const topDeaths = Object.values(deathMap).sort((a, b) => b.Deaths - a.Deaths).slice(0, 10);

        // --- Top single fame kill ---
        const topFameKill = [...killEvents].sort(
            (a, b) => (b.TotalVictimKillFame || 0) - (a.TotalVictimKillFame || 0)
        )[0] || null;

        const lang = guildCfg.language || 'tr';
        const guildDisplayName = guildCfg.albion_guild_name || guildCfg.guild_name || (lang === 'tr' ? 'Lonca' : 'Guild');
        const localeCode = lang === 'tr' ? 'tr-TR' : 'en-US';
        const periodStr = `${sinceDate.toLocaleDateString(localeCode, { day: 'numeric', month: 'long' })} — ${now.toLocaleDateString(localeCode, { day: 'numeric', month: 'long' })}`;

        const embed = new EmbedBuilder()
            .setTitle(t('killboard.title', lang, { guildName: guildDisplayName }))
            .setDescription(t('killboard.description', lang, { period: periodStr, kills: killEvents.length, deaths: deathEvents.length }))
            .setColor('#E74C3C')
            .setTimestamp()
            .setFooter({ text: t('killboard.footer', lang), iconURL: client.user.displayAvatarURL() });

        const serverSlug = (guildCfg.albion_server || 'europe').toLowerCase();
        const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://veyronix.com.tr';

        // Top killers list
        const medals = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅'];
        if (topKillers.length > 0) {
            const firstHalf = topKillers.slice(0, 5);
            const secondHalf = topKillers.slice(5, 10);
            
            const killerText1 = firstHalf.map((k, i) => t('killboard.kill_format', lang, { medal: medals[i], name: k.Name, id: k.Id, kills: k.Kills, fame: (k.KillFame / 1000000).toFixed(2), server: serverSlug, webUrl })).join('\n');
            embed.addFields({ name: t('killboard.top_killers_1', lang), value: killerText1, inline: false });
            
            if (secondHalf.length > 0) {
                const killerText2 = secondHalf.map((k, i) => t('killboard.kill_format', lang, { medal: medals[i+5], name: k.Name, id: k.Id, kills: k.Kills, fame: (k.KillFame / 1000000).toFixed(2), server: serverSlug, webUrl })).join('\n');
                embed.addFields({ name: t('killboard.top_killers_2', lang), value: killerText2, inline: false });
            }
        }

        // Top deaths list
        if (topDeaths.length > 0) {
            const jokes = [
                t('killboard.joke_1', lang),
                t('killboard.joke_2', lang),
                t('killboard.joke_3', lang),
                t('killboard.joke_4', lang),
                t('killboard.joke_5', lang)
            ];
            
            const firstHalf = topDeaths.slice(0, 5);
            const secondHalf = topDeaths.slice(5, 10);
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

            const deathText1 = firstHalf.map((d, i) => t('killboard.death_format', lang, { medal: medals[i], name: d.Name, id: d.Id, deaths: d.Deaths, fame: (d.DeathFame / 1000000).toFixed(2), server: serverSlug, webUrl })).join('\n');
            embed.addFields({ name: t('killboard.top_deaths_1', lang), value: `${deathText1}${secondHalf.length === 0 ? `\n\n*"${randomJoke}"*` : ''}`, inline: false });

            if (secondHalf.length > 0) {
                const deathText2 = secondHalf.map((d, i) => t('killboard.death_format', lang, { medal: medals[i+5], name: d.Name, id: d.Id, deaths: d.Deaths, fame: (d.DeathFame / 1000000).toFixed(2), server: serverSlug, webUrl })).join('\n');
                embed.addFields({ name: t('killboard.top_deaths_2', lang), value: `${deathText2}\n\n*"${randomJoke}"*`, inline: false });
            }
        }

        // Top fame kill
        if (topFameKill) {
            const serverSlug = (guildCfg.albion_server || 'europe').toLowerCase();
            const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://veyronix.com.tr';
            
            embed.addFields({
                name: t('killboard.top_fame_kill', lang),
                value: `[**${topFameKill.Killer?.Name || '?'}**](${webUrl}/killboard/${serverSlug}/${topFameKill.EventId}) 🗡️ [**${topFameKill.Victim?.Name || '?'}**](${webUrl}/killboard/${serverSlug}/${topFameKill.EventId})\n\`${(topFameKill.TotalVictimKillFame || 0).toLocaleString(localeCode)}\` ${t('killboard.fame', lang)}`,
                inline: false
            });
        }

        if (killEvents.length === 0 && deathEvents.length === 0) {
            embed.addFields({
                name: t('killboard.quiet_day_title', lang),
                value: t('killboard.quiet_day_desc', lang),
                inline: false
            });
        }

        // Send to channel
        const channel = await client.channels.fetch(guildCfg.killboard_channel_id).catch(async (err) => {
            console.warn(`[KillBoard] Cannot fetch channel (might be deleted): ${err.message}`);
            try {
                const { supabase } = require('@veyronix/database');
                await db.run(
                    'UPDATE guild_configs SET killboard_channel_id = NULL WHERE guild_id = ?',
                    [guildCfg.guild_id]
                );
                await supabase.from('guild_settings').update({ killboard_channel_id: null }).eq('guild_id', guildCfg.guild_id);
                console.log(`[KillBoard] Removed invalid channel configuration for guild ${guildCfg.guild_id}.`);
            } catch(e) {
                console.error(`[KillBoard] Failed to nullify killboard channel for ${guildCfg.guild_id}:`, e.message);
            }
            return null;
        });

        if (channel) {
            await channel.send({ embeds: [embed] });
            console.log(`[KillBoard] ✅ Summary sent to ${guildCfg.killboard_channel_id}`);

            // Save current timestamp as last_killboard_date for next period filtering
            const nowIso = now.toISOString();
            await db.run(
                'UPDATE guild_configs SET last_killboard_date = ? WHERE guild_id = ?',
                [nowIso, guildCfg.guild_id]
            );
            
            const { supabase } = require('@veyronix/database');
            await supabase.from('guild_settings').update({ last_killboard_date: nowIso }).eq('guild_id', guildCfg.guild_id);
        } else {
            console.warn(`[KillBoard] ⚠️ Channel not found or invalid: ${guildCfg.killboard_channel_id}`);
        }

    } catch (error) {
        console.error(`[KillBoard] ❌ Error for ${guildCfg.guild_id}:`, error.message);
    }
}

module.exports = { initKillBoardService, sendKillBoardSummary };
