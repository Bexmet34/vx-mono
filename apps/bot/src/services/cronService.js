const cron = require('node-cron');
const { supabase } = require('@veyronix/database');
const { LINKS } = require('../constants/constants');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const { getGuildConfig } = require('./guildConfig');
const { t } = require('./i18n');
const { getSupportServerLink } = require('../utils/settingsUtils');

/**
 * Starts the cron service for automatic subscription checks
 * @param {import('discord.js').Client} client 
 */
function startCronService(client) {
    // --- Giveaway Expiration Check & Random Drop Scheduler (Every 1 minute) ---
    cron.schedule('* * * * *', async () => {
        const { checkExpiredGiveaways } = require('./giveawayEngine');
        const { processTimeBasedDrops } = require('./dropScheduler');
        
        await checkExpiredGiveaways(client).catch(() => {});
        await processTimeBasedDrops(client).catch(() => {});
    });

    // --- Auto Premium Guild Sync (Every night at 03:00) ---
    cron.schedule('0 3 * * *', async () => {
        console.log('[CronService] Auto Premium Guild Sync running...');
        try {
            const { data: rules } = await supabase.from('auto_premium_rules').select('albion_guilds');
            if (!rules) return;

            const guildNames = new Set();
            for (const rule of rules) {
                if (rule.albion_guilds) {
                    rule.albion_guilds.forEach(g => guildNames.add(g.toLowerCase()));
                }
            }

            if (guildNames.size === 0) return;

            let membersToUpsert = [];
            const endpoints = {
                'americas': 'https://gameinfo.albiononline.com/api/gameinfo',
                'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
                'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo'
            };

            for (const guildName of Array.from(guildNames)) {
                let guildId = null;
                let guildServer = null;

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

                if (!guildId) continue;

                try {
                    const baseUrl = endpoints[guildServer];
                    const membersRes = await fetch(`${baseUrl}/guilds/${guildId}/members`, { signal: AbortSignal.timeout(15000) });
                    if (membersRes.ok) {
                        const membersData = await membersRes.json();
                        for (const member of membersData) {
                            membersToUpsert.push({
                                ign: member.Name,
                                guild_name: guildName,
                                last_seen: new Date().toISOString()
                            });
                        }
                    }
                } catch (e) {
                    console.error(`[CronService] Guild fetch error for ${guildName}:`, e);
                }
            }

            if (membersToUpsert.length > 0) {
                const chunkSize = 500;
                for (let i = 0; i < membersToUpsert.length; i += chunkSize) {
                    const chunk = membersToUpsert.slice(i, i + chunkSize);
                    await supabase.from('cached_guild_members').upsert(chunk, { onConflict: 'ign' });
                }
            }

            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            await supabase.from('cached_guild_members').delete().lt('last_seen', twoHoursAgo);

            console.log(`[CronService] Auto Premium Guild Sync completed. Synced ${membersToUpsert.length} members.`);
        } catch (error) {
            console.error('[CronService] Auto Premium Guild Sync failed:', error);
        }
    });

    // --- Offline DB Queue Processor (Every 2 minutes) ---
    cron.schedule('*/2 * * * *', async () => {
        const { processQueue } = require('./queueService');
        await processQueue().catch(err => {
            // Ignore queue processing errors silently to prevent crashes
        });
    });

    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        console.log('[CronService] 24-hour expiration check running...');
        
        try {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Fetch subs expiring within 24 hours that haven't been notified
            const { data: subs, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('one_day_notified', false)
                .eq('is_unlimited', false) // Unlimited servers don't need warnings
                .lt('expires_at', tomorrow.toISOString())
                .gt('expires_at', now.toISOString());

            if (error) throw error;

            if (subs && subs.length > 0) {
                console.log(`[CronService] Found ${subs.length} subs requiring notification.`);
                
                for (const sub of subs) {
                    try {
                        const user = await client.users.fetch(sub.owner_id);
                        if (!user) continue;

                        const guildSettings = await getGuildConfig(sub.guild_id);
                        const lang = guildSettings?.language || 'tr';

                        const { getNotification } = require('./notificationService');
                        const notification = await getNotification('sub_expired', lang, {
                            sunucu: sub.guild_name,
                            tarih: new Date(sub.expires_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')
                        });

                        if (notification) {
                            const supportLink = await getSupportServerLink();
                            const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setLabel(t('subscription.join_support', lang))
                                    .setURL(supportLink)
                                    .setStyle(ButtonStyle.Link)
                            );

                            await user.send({ 
                                embeds: notification.embeds, 
                                content: notification.content,
                                components: [row] 
                            });
                        }
                        
                        // Mark as notified in DB
                        await supabase
                            .from('subscriptions')
                            .update({ one_day_notified: true })
                            .eq('guild_id', sub.guild_id);

                        console.log(`[CronService] Notification sent to owner of ${sub.guild_name}`);

                    } catch (err) {
                        console.error(`[CronService] Failed to notify owner of ${sub.guild_name}:`, err.message);
                        // Even if DM fails, we mark it so we don't try forever if DMs are closed
                        await supabase
                            .from('subscriptions')
                            .update({ one_day_notified: true })
                            .eq('guild_id', sub.guild_id);
                    }
                }
            }

        } catch (err) {
            console.error('[CronService] Error:', err.message);
        }
    });

    // --- Nightly Server Cleanup (02:00 UTC) ---
    cron.schedule('0 2 * * *', async () => {
        console.log('[CronService] Nightly server cleanup running (02:00 UTC)...');
        await performServerCleanup(client, 'Otomatik Gece Taraması');
    }, { timezone: "UTC" });

    // --- Daily Auto Guild Checks (12:00 UTC) ---
    // cron.schedule('0 12 * * *', async () => {
    //     console.log('[CronService] Daily auto guild checks running (12:00 UTC)...');
    //     const { runAutoCheck } = require('./autoCheckService');
    //     await runAutoCheck(client);
    // }, { timezone: "UTC" });

    // --- Auto Party Cleanup (Every 30 minutes) ---
    cron.schedule('*/30 * * * *', async () => {
        console.log('[CronService] Auto Party Cleanup running...');
        try {
            const db = require('./db');
            // Fetch all active parties
            const parties = await db.all(`SELECT id, channel_id, created_at FROM parties WHERE status = 'active'`);
            if (!parties || parties.length === 0) return;

            const now = new Date();

            for (const party of parties) {
                try {
                    // Find the channel to determine the guild
                    let channel = client.channels.cache.get(party.channel_id);
                    if (!channel) {
                        try {
                            channel = await client.channels.fetch(party.channel_id).catch(() => null);
                        } catch(e) {}
                    }

                    if (!channel) {
                        // Channel is already deleted, just close the party in DB
                        await db.run(`UPDATE parties SET status = 'closed' WHERE id = ?`, [party.id]);
                        continue;
                    }

                    const guildId = channel.guild.id;
                    const guildConfig = await getGuildConfig(guildId);
                    const autoDeleteHours = guildConfig?.auto_delete_party_hours || 0;
                    
                    if (autoDeleteHours > 0) {
                        const partyTime = new Date(party.created_at + 'Z');
                        const hoursPassed = (now - partyTime) / (1000 * 60 * 60);

                        if (hoursPassed >= autoDeleteHours) {
                            // Time to delete
                            try {
                                await channel.delete('Auto Party Cleanup - Inactive').catch(() => null);
                                // Mark as closed
                                await db.run(`UPDATE parties SET status = 'closed' WHERE id = ?`, [party.id]);
                                
                                // Add a small delay to avoid rate limiting
                                await new Promise(r => setTimeout(r, 2000));
                            } catch (e) {
                                console.error(`[CronService] Error cleaning up party ${party.id}:`, e.message);
                            }
                        }
                    }
                } catch (e) {
                    console.error(`[CronService] Error processing party ${party.id} for cleanup:`, e.message);
                }
            }
        } catch (e) {
            console.error('[CronService] Auto Party Cleanup Error:', e.message);
        }
    });

    // --- Killboard Check (Every 2 minutes) ---
    cron.schedule('*/2 * * * *', async () => {
        const { runKillboardCheck } = require('./killboardService');
        await runKillboardCheck(client).catch(err => {
            console.error('[CronService] Killboard Check Error:', err);
        });
    });
}

/**
 * Performs server cleanup by comparing database with active guilds.
 * @param {import('discord.js').Client} client 
 * @param {string} source Reason for cleanup (Auto/Manual)
 */
async function performServerCleanup(client, source = 'Sistem') {
    try {
        const BOT_OWNER_ID = '407234961582587916';
        
        // 1. Fetch all subscriptions
        const { data: subs, error } = await supabase
            .from('subscriptions')
            .select('guild_id, guild_name');

        if (error) throw error;

        const deletedServers = [];

        // Fetch all guilds across all shards if sharding is enabled
        let allGuildIds = new Set();
        if (client.shard) {
            const results = await client.shard.broadcastEval(c => c.guilds.cache.map(g => g.id));
            allGuildIds = new Set(results.flat());
        } else {
            allGuildIds = new Set(client.guilds.cache.map(g => g.id));
        }

        // 2. Check each server in subscriptions
        for (const sub of subs) {
            if (!allGuildIds.has(sub.guild_id)) {
                // Bot is not in this server, delete from subscriptions
                const { error: delError } = await supabase
                    .from('subscriptions')
                    .delete()
                    .eq('guild_id', sub.guild_id);

                // Delete from guild_settings so it doesn't show in admin panel
                await supabase
                    .from('guild_settings')
                    .delete()
                    .eq('guild_id', sub.guild_id);

                if (!delError) {
                    deletedServers.push(`${sub.guild_name} (\`${sub.guild_id}\`)`);
                }
            }
        }

        // 3. Check guild_settings for freemium servers that kicked the bot
        const { data: settingsData } = await supabase.from('guild_settings').select('guild_id');
        if (settingsData) {
            for (const setting of settingsData) {
                if (!allGuildIds.has(setting.guild_id)) {
                    await supabase.from('guild_settings').delete().eq('guild_id', setting.guild_id);
                }
            }
        }

        // 4. Notify Owner
        if (deletedServers.length > 0) {
            try {
                const owner = await client.users.fetch(BOT_OWNER_ID);
                if (owner) {
                    const embed = new EmbedBuilder()
                        .setTitle('🧹 Sunucu Temizliği Tamamlandı')
                        .setDescription(`Botun artık bulunmadığı sunucular veritabanından başarıyla temizlendi.\n\n**Kaynak:** \`${source}\``)
                        .addFields({ 
                            name: `Silinen Sunucular (${deletedServers.length})`, 
                            value: deletedServers.join('\n').substring(0, 1024) 
                        })
                        .setColor('#F1C40F')
                        .setTimestamp();

                    await owner.send({ embeds: [embed] });
                }
            } catch (err) {
                console.error('[Cleanup] Owner notification failed:', err.message);
            }
        } else {
            console.log(`[Cleanup] ${source}: Herhangi bir geçersiz sunucu bulunamadı.`);
        }

    } catch (err) {
        console.error(`[Cleanup] Error during ${source}:`, err.message);
    }
}

module.exports = { startCronService, performServerCleanup };
