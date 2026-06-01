const db = require('./db');
const { EmbedBuilder } = require('discord.js');
const https = require('https');

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
function fetchAllGuildEvents(guildId) {
    return fetchAlbionEvents(
        `https://gameinfo-ams.albiononline.com/api/gameinfo/events?offset=0&limit=51&guildId=${guildId}`
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
    const guilds = await db.all(
        'SELECT * FROM guild_configs WHERE killboard_channel_id IS NOT NULL AND albion_guild_id IS NOT NULL'
    );

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // e.g. "2026-05-01"

    for (const guildCfg of guilds) {
        // If we already sent today's summary, skip
        if (guildCfg.last_killboard_date === todayStr) continue;

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
        const allEvents = await fetchAllGuildEvents(guildCfg.albion_guild_id);
        
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
            if (!name) continue;
            if (!killerMap[name]) killerMap[name] = { Name: name, Kills: 0, KillFame: 0 };
            killerMap[name].Kills++;
            killerMap[name].KillFame += ev.TotalVictimKillFame || 0;
        }
        const topKillers = Object.values(killerMap).sort((a, b) => b.KillFame - a.KillFame).slice(0, 3);

        // --- Build death stats ---
        const deathMap = {};
        for (const ev of deathEvents) {
            const name = ev.Victim?.Name;
            if (!name) continue;
            if (!deathMap[name]) deathMap[name] = { Name: name, Deaths: 0, DeathFame: 0 };
            deathMap[name].Deaths++;
            deathMap[name].DeathFame += ev.TotalVictimKillFame || 0;
        }
        const topDeaths = Object.values(deathMap).sort((a, b) => b.Deaths - a.Deaths).slice(0, 3);

        // --- Top single fame kill ---
        const topFameKill = [...killEvents].sort(
            (a, b) => (b.TotalVictimKillFame || 0) - (a.TotalVictimKillFame || 0)
        )[0] || null;

        const guildDisplayName = guildCfg.albion_guild_name || guildCfg.guild_name || 'Lonca';
        const periodStr = `${sinceDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} — ${now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;

        const embed = new EmbedBuilder()
            .setTitle(`🗡️ ${guildDisplayName} — Günlük KillBoard Özeti`)
            .setDescription(
                `📅 **${periodStr}**\n` +
                `⚔️ Toplam Kill: \`${killEvents.length}\`  |  💀 Toplam Ölüm: \`${deathEvents.length}\``
            )
            .setColor('#E74C3C')
            .setTimestamp()
            .setFooter({ text: 'Veyronix KillBoard Sistemi', iconURL: client.user.displayAvatarURL() });

        // Top killers list
        if (topKillers.length > 0) {
            const medals = ['🥇', '🥈', '🥉'];
            const killerText = topKillers
                .map((k, i) => `${medals[i]} **${k.Name}** — \`${k.Kills}\` kill | \`${(k.KillFame / 1000000).toFixed(2)}M\` fame`)
                .join('\n');
            embed.addFields({
                name: '⚔️ En Çok Kill Alanlar',
                value: killerText,
                inline: false
            });
        }

        // Top deaths list
        if (topDeaths.length > 0) {
            const jokes = [
                'Yerde yatmaktan çimen oldu, üzerine basmayın.',
                'Morgun kapısında adı altın harflerle yazıyor.',
                'Set dayanmıyor, tamirci zengin oldu.',
                'Bugün de bedava eşya dağıtarak hayır işledi.',
                'Ekranı gri görmekten gözleri bozuldu.'
            ];
            const medals = ['🥇', '🥈', '🥉'];
            const deathText = topDeaths
                .map((d, i) => `${medals[i]} **${d.Name}** — \`${d.Deaths}\` ölüm | \`${(d.DeathFame / 1000000).toFixed(2)}M\` kayıp fame`)
                .join('\n');
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            embed.addFields({
                name: '💀 Morgun Daimi Müşterileri',
                value: `${deathText}\n\n*"${randomJoke}"*`,
                inline: false
            });
        }

        // Top fame kill
        if (topFameKill) {
            embed.addFields({
                name: '💰 Günün Vurgunu',
                value: `**${topFameKill.Killer?.Name || '?'}** → **${topFameKill.Victim?.Name || '?'}**\n\`${(topFameKill.TotalVictimKillFame || 0).toLocaleString('tr-TR')}\` Fame`,
                inline: false
            });
        }

        if (killEvents.length === 0 && deathEvents.length === 0) {
            embed.addFields({
                name: '😴 Bugün Sessiz Bir Gün',
                value: 'Kayda değer bir PvP aktivitesi bulunamadı. Belki yarın daha kanlı olur!',
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
        } else {
            console.error(`[KillBoard] ❌ Channel not found: ${guildCfg.killboard_channel_id}`);
        }

    } catch (error) {
        console.error(`[KillBoard] ❌ Error for ${guildCfg.guild_id}:`, error.message);
    }
}

module.exports = { initKillBoardService, sendKillBoardSummary };
