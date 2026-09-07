const { ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('./db');
const { supabase } = require('@veyronix/database');

// Ensure mapping table exists
try {
    db.run(`CREATE TABLE IF NOT EXISTS server_counter_channels (
        guild_id TEXT,
        counter_type TEXT,
        channel_id TEXT,
        PRIMARY KEY (guild_id, counter_type)
    )`);
} catch (e) {
    console.error('[CounterService] DB Table Init Error:', e.message);
}

// Setup counters immediately (called from dbListenerService)
async function setupCountersNow(client, guildId) {
    try {
        const { data: config, error } = await supabase
            .from('guild_settings')
            .select('server_counters, counters_category_id, counter_ticket_category_id')
            .eq('guild_id', guildId)
            .single();

        if (error || !config) return;

        const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return;

        let activeCounters = [];
        if (Array.isArray(config.server_counters)) {
            activeCounters = config.server_counters;
        } else if (typeof config.server_counters === 'string') {
            try {
                activeCounters = JSON.parse(config.server_counters);
            } catch (e) {
                activeCounters = [];
            }
        }
        if (!Array.isArray(activeCounters) || activeCounters.length === 0) return;

        let categoryId = config.counters_category_id;
        let category = null;

        if (categoryId) {
            category = guild.channels.cache.get(categoryId) || await guild.channels.fetch(categoryId).catch(() => null);
        }

        if (!category) {
            category = await guild.channels.create({
                name: '📊 SUNUCU İSTATİSTİKLERİ',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.Connect],
                    },
                ],
            });
            categoryId = category.id;
            // Update Supabase
            await supabase.from('guild_settings').update({ counters_category_id: categoryId }).eq('guild_id', guildId);
        }

        // Get existing channel mappings
        const existingMappings = await db.all(`SELECT * FROM server_counter_channels WHERE guild_id = ?`, [guildId]);
        const existingMap = new Map(existingMappings.map(m => [m.counter_type, m.channel_id]));

        // Check if existing channels are actually in the server
        for (const [type, channelId] of existingMap.entries()) {
            const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
            if (!ch || ch.parentId !== categoryId) {
                // If it doesn't exist or isn't in the correct category anymore, try to move it or recreate it
                if (ch && ch.parentId !== categoryId && categoryId) {
                     await ch.setParent(categoryId).catch(() => null);
                } else {
                     await db.run(`DELETE FROM server_counter_channels WHERE guild_id = ? AND counter_type = ?`, [guildId, type]);
                     existingMap.delete(type);
                }
            }
        }

        // Create missing channels
        for (const type of activeCounters) {
            if (!existingMap.has(type)) {
                // Determine initial name
                const initialName = await getCounterName(guild, type, config.counter_ticket_category_id);
                
                const channel = await guild.channels.create({
                    name: initialName,
                    type: ChannelType.GuildVoice,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.Connect],
                        },
                    ],
                });

                await db.run(`INSERT OR REPLACE INTO server_counter_channels (guild_id, counter_type, channel_id) VALUES (?, ?, ?)`, [guildId, type, channel.id]);
                existingMap.set(type, channel.id);
            }
        }

        // Delete channels for counters that were removed
        for (const [type, channelId] of existingMap.entries()) {
            if (!activeCounters.includes(type)) {
                const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
                if (ch) await ch.delete().catch(() => null);
                await db.run(`DELETE FROM server_counter_channels WHERE guild_id = ? AND counter_type = ?`, [guildId, type]);
            }
        }
        
        // Final update for existing channels (just in case they need text update)
        await updateCountersForGuild(guild, activeCounters, existingMap, config.counter_ticket_category_id);

    } catch (err) {
        console.error(`[CounterService] Error in setupCountersNow for guild ${guildId}:`, err.message);
    }
}

async function updateCountersForGuild(guild, activeCounters, existingMap, ticketCategoryId) {
    for (const type of activeCounters) {
        const channelId = existingMap.get(type);
        if (!channelId) continue;
        
        const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
        if (!ch) continue;

        const newName = await getCounterName(guild, type, ticketCategoryId);
        if (ch.name !== newName) {
            await ch.setName(newName).catch(err => {
                if (err.code !== 50013) {
                     // 50013 = missing permissions
                     console.error(`[CounterService] Rate limit or error renaming channel ${channelId}:`, err.message);
                }
            });
        }
    }
}

async function getCounterName(guild, type, ticketCategoryId) {
    try {
        await guild.members.fetch().catch(() => null); // Fetch members
        
        switch (type) {
            case 'all':
                return `👥 Toplam Üye: ${guild.memberCount}`;
            case 'members':
                const memberCount = guild.members.cache.filter(m => !m.user.bot).size;
                return `👤 Üyeler: ${memberCount}`;
            case 'bots':
                const botCount = guild.members.cache.filter(m => m.user.bot).size;
                return `🤖 Botlar: ${botCount}`;
            case 'online':
                const onlineCount = guild.members.cache.filter(m => !m.user.bot && (m.presence?.status === 'online' || m.presence?.status === 'dnd' || m.presence?.status === 'idle')).size;
                return `🟢 Aktif: ${onlineCount}`;
            case 'offline':
                const offlineCount = guild.members.cache.filter(m => !m.user.bot && (!m.presence || m.presence.status === 'offline')).size;
                return `⚪ Çevrimdışı: ${offlineCount}`;
            case 'connected':
                const connectedCount = guild.voiceStates.cache.size;
                return `🎧 Seslide: ${connectedCount}`;
            case 'boosts':
                return `🚀 Boost: ${guild.premiumSubscriptionCount || 0}`;
            case 'tier':
                return `👑 Seviye: ${guild.premiumTier}`;
            case 'roles':
                return `🛡️ Roller: ${guild.roles.cache.size}`;
            case 'channels':
                const totalChannels = guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory).size;
                return `💬 Kanallar: ${totalChannels}`;
            case 'ticketopen':
                let openTickets = 0;
                if (ticketCategoryId) {
                    openTickets = guild.channels.cache.filter(c => c.parentId === ticketCategoryId && c.type === ChannelType.GuildText).size;
                }
                return `🎫 Açık Biletler: ${openTickets}`;
            case 'ticketclosed':
                let closedTickets = 0;
                if (ticketCategoryId) {
                    closedTickets = guild.channels.cache.filter(c => c.parentId === ticketCategoryId && c.name.includes('closed') && c.type === ChannelType.GuildText).size;
                }
                return `🔒 Kapalı Biletler: ${closedTickets}`;
            default:
                return `📊 ${type}: 0`;
        }
    } catch (e) {
        return `📊 ${type}: Yükleniyor...`;
    }
}

function initCounterService(client) {
    console.log('[CounterService] Counter update scheduler started (checking every 10 minutes)...');
    
    // 10 minutes interval
    setInterval(async () => {
        try {
            const { data: configs, error } = await supabase
                .from('guild_settings')
                .select('guild_id, server_counters, counters_category_id, counter_ticket_category_id');
                
            if (error || !configs) return;

            for (const config of configs) {
                let activeCounters = [];
                if (Array.isArray(config.server_counters)) {
                    activeCounters = config.server_counters;
                } else if (typeof config.server_counters === 'string') {
                    try { activeCounters = JSON.parse(config.server_counters); } catch (e) { activeCounters = []; }
                }
                if (!Array.isArray(activeCounters) || activeCounters.length === 0) continue;

                const guild = client.guilds.cache.get(config.guild_id);
                if (!guild) continue;

                const existingMappings = await db.all(`SELECT * FROM server_counter_channels WHERE guild_id = ?`, [config.guild_id]);
                if (existingMappings.length === 0) continue;

                const existingMap = new Map(existingMappings.map(m => [m.counter_type, m.channel_id]));
                
                await updateCountersForGuild(guild, activeCounters, existingMap, config.counter_ticket_category_id);
            }
        } catch (err) {
            console.error('[CounterService] Interval Update Error:', err.message);
        }
    }, 10 * 60 * 1000); // 10 minutes
}

module.exports = {
    setupCountersNow,
    initCounterService
};
