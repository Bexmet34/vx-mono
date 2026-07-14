const db = require('./db');
const { EmbedBuilder } = require('discord.js');
const https = require('https');
const { t } = require('./i18n');
const { isSubscriptionActive } = require('@veyronix/database');

/**
 * Fetches events from Albion API (returns array or [])
 */
function fetchAlbionEvents(url) {
    return new Promise((resolve) => {
        https.get(url, { family: 4 }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) { resolve([]); return; }
                    const parsed = JSON.parse(data);
                    resolve(Array.isArray(parsed) ? parsed : []);
                } catch (e) { resolve([]); }
            });
        }).on('error', () => resolve([]));
    });
}

/**
 * Fetches recent events for a guild (both kills and deaths)
 */
function fetchAllGuildEvents(guildId, server = 'Europe') {
    const REGIONS = {
        'Europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo',
        'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
        'Asia': 'https://gameinfo-sgp.albiononline.com/api/gameinfo'
    };
    const baseUrl = REGIONS[server] || REGIONS.Europe;
    return fetchAlbionEvents(
        `${baseUrl}/events?offset=0&limit=51&guildId=${guildId}`
    );
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
        if (fullConfig) guilds.push(fullConfig);
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
 * Fetches data since last summary and sends the KillBoard embed
 */
async function sendKillBoardSummary(client, guildCfg) {
    try {
        console.log(`[KillBoard] Generating summary | Discord: ${guildCfg.guild_id} | Albion: ${guildCfg.albion_guild_id}`);

        if (!guildCfg.albion_guild_id || !guildCfg.killboard_channel_id) {
            console.warn(`[KillBoard] Missing config — skipping ${guildCfg.guild_id}`);
            return;
        }

        // Calculate the period: from last_killboard_date (or 24h ago) to now
        const now = new Date();
        let sinceDate;
        if (guildCfg.last_killboard_date) {
            // last_killboard_date can be "YYYY-MM-DD" (old format) or ISO timestamp
            sinceDate = new Date(guildCfg.last_killboard_date);
            if (isNaN(sinceDate.getTime())) {
                // Fallback: 24 hours ago
                sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            }
        } else {
            // First run: go back 24 hours
            sinceDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        console.log(`[KillBoard] Period: ${sinceDate.toISOString()} → ${now.toISOString()}`);

        // Fetch all recent events
        const allEvents = await fetchAllGuildEvents(guildCfg.albion_guild_id, guildCfg.albion_server || 'Europe');
        
        const allKills = [];
        const allDeaths = [];
        
        for (const ev of allEvents) {
            if (ev.Killer?.GuildId === guildCfg.albion_guild_id) allKills.push(ev);
            if (ev.Victim?.GuildId === guildCfg.albion_guild_id) allDeaths.push(ev);
        }

        // Filter to only events AFTER sinceDate
        const killEvents = allKills.filter(ev => {
            const t = new Date(ev.TimeStamp);
            return !isNaN(t.getTime()) && t > sinceDate;
        });
        const deathEvents = allDeaths.filter(ev => {
            const t = new Date(ev.TimeStamp);
            return !isNaN(t.getTime()) && t > sinceDate;
        });

        console.log(`[KillBoard] Filtered: ${killEvents.length}/${allKills.length} kills, ${deathEvents.length}/${allDeaths.length} deaths since ${sinceDate.toISOString()}`);

        // --- Build kill stats ---
        const killerMap = {};
        for (const ev of killEvents) {
            const name = ev.Killer?.Name;
            const id = ev.Killer?.Id;
            if (!name) continue;
            if (!killerMap[name]) killerMap[name] = { Name: name, Id: id, Kills: 0, KillFame: 0 };
            killerMap[name].Kills++;
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

        // Top killers list
        const medals = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅'];
        if (topKillers.length > 0) {
            const firstHalf = topKillers.slice(0, 5);
            const secondHalf = topKillers.slice(5, 10);
            
            const killerText1 = firstHalf.map((k, i) => t('killboard.kill_format', lang, { medal: medals[i], name: k.Name, id: k.Id, kills: k.Kills, fame: (k.KillFame / 1000000).toFixed(2) })).join('\n');
            embed.addFields({ name: t('killboard.top_killers_1', lang), value: killerText1, inline: false });
            
            if (secondHalf.length > 0) {
                const killerText2 = secondHalf.map((k, i) => t('killboard.kill_format', lang, { medal: medals[i+5], name: k.Name, id: k.Id, kills: k.Kills, fame: (k.KillFame / 1000000).toFixed(2) })).join('\n');
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

            const deathText1 = firstHalf.map((d, i) => t('killboard.death_format', lang, { medal: medals[i], name: d.Name, id: d.Id, deaths: d.Deaths, fame: (d.DeathFame / 1000000).toFixed(2) })).join('\n');
            embed.addFields({ name: t('killboard.top_deaths_1', lang), value: `${deathText1}${secondHalf.length === 0 ? `\n\n*"${randomJoke}"*` : ''}`, inline: false });

            if (secondHalf.length > 0) {
                const deathText2 = secondHalf.map((d, i) => t('killboard.death_format', lang, { medal: medals[i+5], name: d.Name, id: d.Id, deaths: d.Deaths, fame: (d.DeathFame / 1000000).toFixed(2) })).join('\n');
                embed.addFields({ name: t('killboard.top_deaths_2', lang), value: `${deathText2}\n\n*"${randomJoke}"*`, inline: false });
            }
        }

        // Top fame kill
        if (topFameKill) {
            embed.addFields({
                name: t('killboard.top_fame_kill', lang),
                value: `[**${topFameKill.Killer?.Name || '?'}**](https://albiononline.com/en/killboard/player/${topFameKill.Killer?.Id}) 🗡️ [**${topFameKill.Victim?.Name || '?'}**](https://albiononline.com/en/killboard/player/${topFameKill.Victim?.Id})\n\`${(topFameKill.TotalVictimKillFame || 0).toLocaleString(localeCode)}\` ${t('killboard.fame', lang)}`,
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
        const channel = await client.channels.fetch(guildCfg.killboard_channel_id).catch((err) => {
            console.error(`[KillBoard] Cannot fetch channel: ${err.message}`);
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
            console.error(`[KillBoard] ❌ Channel not found: ${guildCfg.killboard_channel_id}`);
        }

    } catch (error) {
        console.error(`[KillBoard] ❌ Error for ${guildCfg.guild_id}:`, error.message);
    }
}

module.exports = { initKillBoardService, sendKillBoardSummary };
