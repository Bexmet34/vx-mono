const { ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('./db');
const { supabase, isSubscriptionActive } = require('@veyronix/database');

// Premium counter IDs (only available for servers with active premium)
const PREMIUM_COUNTER_IDS = new Set([
    'bans',
    'onlinerole',
    'offlinerole',
    'online',
    'offline',
    'dnd',
    'idle',
    'streaming',
    'playing',
    'onlinebot',
    'status',
    'connected'
]);

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
            .select('server_counters, counters_category_id, counter_ticket_category_id, counter_role_id')
            .eq('guild_id', guildId)
            .single();

        if (error || !config) return;

        const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) {
            console.warn(`[CounterService] Guild ${guildId} not found or inaccessible by bot.`);
            return;
        }

        // Check guild premium status
        const isPremium = await isSubscriptionActive(guildId).catch(() => false);

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

        // Enforce premium: Non-premium servers cannot use starred (premium) counters
        activeCounters = activeCounters.filter(item => {
            const [baseType] = item.includes(':') ? item.split(':') : [item];
            return isPremium || !PREMIUM_COUNTER_IDS.has(baseType);
        });

        let categoryId = config.counters_category_id;
        let category = null;

        if (categoryId) {
            category = guild.channels.cache.get(categoryId) || await guild.channels.fetch(categoryId).catch(() => null);
        }

        if (!category) {
            try {
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
            } catch (createErr) {
                if (createErr.code === 50013 || createErr.message?.includes('Missing Permissions')) {
                    console.error(`[CounterService] Missing Permissions to create category in guild ${guildId} (${guild.name}). Bot needs 'Manage Channels' (Kanalları Yönet) permission.`);
                }
                throw createErr;
            }
        }

        // Get existing channel mappings
        const existingMappings = await db.all(`SELECT * FROM server_counter_channels WHERE guild_id = ?`, [guildId]);
        const existingMap = new Map(existingMappings.map(m => [m.counter_type, m.channel_id]));

        // Check if existing channels are actually in the server
        for (const [counterItem, channelId] of existingMap.entries()) {
            const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
            if (!ch || ch.parentId !== categoryId) {
                if (ch && ch.parentId !== categoryId && categoryId) {
                     await ch.setParent(categoryId).catch(() => null);
                } else {
                     await db.run(`DELETE FROM server_counter_channels WHERE guild_id = ? AND counter_type = ?`, [guildId, counterItem]);
                     existingMap.delete(counterItem);
                }
            }
        }

        // Fetch guild members with presences to warm cache
        await guild.members.fetch({ withPresences: true }).catch(async () => {
            await guild.members.fetch().catch(() => null);
        });

        // Create missing channels
        for (const counterItem of activeCounters) {
            if (!existingMap.has(counterItem)) {
                const [type, roleId] = counterItem.includes(':') ? counterItem.split(':') : [counterItem, null];
                const initialName = await getCounterName(guild, type, config.counter_ticket_category_id, roleId || config.counter_role_id);
                
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
                }).catch(err => {
                    if (err.code === 50013 || err.message?.includes('Missing Permissions')) {
                        console.error(`[CounterService] Missing Permissions to create voice channel in guild ${guildId} (${guild.name}). Bot needs 'Manage Channels' permission.`);
                    }
                    throw err;
                });

                await db.run(`INSERT OR REPLACE INTO server_counter_channels (guild_id, counter_type, channel_id) VALUES (?, ?, ?)`, [guildId, counterItem, channel.id]);
                existingMap.set(counterItem, channel.id);
            }
        }

        // Delete channels for counters that were removed (or premium counters on expired guilds)
        for (const [counterItem, channelId] of existingMap.entries()) {
            if (!activeCounters.includes(counterItem)) {
                const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
                if (ch) await ch.delete().catch(() => null);
                await db.run(`DELETE FROM server_counter_channels WHERE guild_id = ? AND counter_type = ?`, [guildId, counterItem]);
            }
        }
        
        // Final update for existing channels
        await updateCountersForGuild(guild, activeCounters, existingMap, config.counter_ticket_category_id, config.counter_role_id);

    } catch (err) {
        console.error(`[CounterService] Error in setupCountersNow for guild ${guildId}:`, err.message);
    }
}

async function updateCountersForGuild(guild, activeCounters, existingMap, ticketCategoryId, roleId) {
    try {
        await guild.members.fetch({ withPresences: true }).catch(async () => {
            await guild.members.fetch().catch(() => null);
        });
    } catch (e) {}

    for (const counterItem of activeCounters) {
        const channelId = existingMap.get(counterItem);
        if (!channelId) continue;
        
        const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
        if (!ch) continue;

        const [type, itemRoleId] = counterItem.includes(':') ? counterItem.split(':') : [counterItem, null];
        const newName = await getCounterName(guild, type, ticketCategoryId, itemRoleId || roleId);
        if (ch.name !== newName) {
            await ch.setName(newName).catch(err => {
                if (err.code !== 50013) {
                     console.error(`[CounterService] Rate limit or error renaming channel ${channelId}:`, err.message);
                }
            });
        }
    }
}

async function getCounterName(guild, type, ticketCategoryId, roleId) {
    try {
        switch (type) {
            // Member counters
            case 'all':
                return `👥 Toplam: ${guild.memberCount}`;
            case 'members':
                return `👤 Üyeler: ${guild.members.cache.filter(m => !m.user.bot).size}`;
            case 'bots':
                return `🤖 Botlar: ${guild.members.cache.filter(m => m.user.bot).size}`;
            case 'bans': {
                const banCount = await guild.bans.fetch().then(b => b.size).catch(() => 0);
                return `⛔ Yasaklılar: ${banCount}`;
            }
            case 'pending': {
                const pendingCount = guild.members.cache.filter(m => m.pending).size;
                return `⏳ Bekleyenler: ${pendingCount}`;
            }

            // Role counters
            case 'role': {
                if (roleId) {
                    const targetRole = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
                    if (targetRole) {
                        return `🏷️ ${targetRole.name}: ${targetRole.members.size}`;
                    }
                }
                const roleCount = guild.members.cache.filter(m => !m.user.bot && m.roles.cache.filter(r => r.id !== guild.id).size > 0).size;
                return `🏷️ Rollü Üyeler: ${roleCount}`;
            }
            case 'roles':
                return `🛡️ Roller: ${guild.roles.cache.size}`;
            case 'norole': {
                const noRoleCount = guild.members.cache.filter(m => !m.user.bot && m.roles.cache.filter(r => r.id !== guild.id).size === 0).size;
                return `⚪ Rolsüzler: ${noRoleCount}`;
            }
            case 'onlinerole': {
                let targetMembers = guild.members.cache.filter(m => !m.user.bot);
                let roleName = 'Rollü';
                if (roleId) {
                    const targetRole = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
                    if (targetRole) {
                        targetMembers = targetRole.members.filter(m => !m.user.bot);
                        roleName = targetRole.name;
                    }
                } else {
                    targetMembers = targetMembers.filter(m => m.roles.cache.filter(r => r.id !== guild.id).size > 0);
                }
                const onlineRoleCount = targetMembers.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p && p.status && p.status !== 'offline';
                }).size;
                return `🟢 ${roleName}: ${onlineRoleCount}`;
            }
            case 'offlinerole': {
                let targetMembers = guild.members.cache.filter(m => !m.user.bot);
                let roleName = 'Rollü';
                if (roleId) {
                    const targetRole = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
                    if (targetRole) {
                        targetMembers = targetRole.members.filter(m => !m.user.bot);
                        roleName = targetRole.name;
                    }
                } else {
                    targetMembers = targetMembers.filter(m => m.roles.cache.filter(r => r.id !== guild.id).size > 0);
                }
                const offlineRoleCount = targetMembers.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return !p || p.status === 'offline';
                }).size;
                return `⚪ ${roleName}: ${offlineRoleCount}`;
            }

            // Status counters
            case 'online': {
                const pCount = guild.presences.cache.filter(p => p.status !== 'offline').size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p && p.status !== 'offline';
                }).size;
                return `🟢 Aktif: ${Math.max(pCount, mCount)}`;
            }
            case 'offline': {
                const pCount = guild.presences.cache.filter(p => p.status !== 'offline').size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p && p.status !== 'offline';
                }).size;
                const active = Math.max(pCount, mCount);
                const offlineCount = Math.max(0, guild.memberCount - active);
                return `⚪ Çevrimdışı: ${offlineCount}`;
            }
            case 'dnd': {
                const pCount = guild.presences.cache.filter(p => p.status === 'dnd').size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p?.status === 'dnd';
                }).size;
                return `🔴 Rahatsız Etmeyin: ${Math.max(pCount, mCount)}`;
            }
            case 'idle': {
                const pCount = guild.presences.cache.filter(p => p.status === 'idle').size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p?.status === 'idle';
                }).size;
                return `🟡 Boşta: ${Math.max(pCount, mCount)}`;
            }
            case 'streaming': {
                const pCount = guild.presences.cache.filter(p => p.activities?.some(a => a.type === 1 || a.name?.toLowerCase().includes('stream') || a.name?.toLowerCase().includes('twitch'))).size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p?.activities?.some(a => a.type === 1 || a.name?.toLowerCase().includes('stream') || a.name?.toLowerCase().includes('twitch'));
                }).size;
                return `💜 Yayında: ${Math.max(pCount, mCount)}`;
            }
            case 'playing': {
                const pCount = guild.presences.cache.filter(p => p.activities?.some(a => a.type === 0)).size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p?.activities?.some(a => a.type === 0);
                }).size;
                return `🎮 Oyunda: ${Math.max(pCount, mCount)}`;
            }
            case 'onlinebot': {
                const onlineBotCount = guild.members.cache.filter(m => {
                    if (!m.user?.bot) return false;
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p && p.status !== 'offline';
                }).size;
                return `🤖 Aktif Botlar: ${onlineBotCount}`;
            }
            case 'status': {
                const pCount = guild.presences.cache.filter(p => p.activities?.some(a => a.type === 4 || a.state)).size;
                const mCount = guild.members.cache.filter(m => {
                    const p = m.presence || guild.presences.cache.get(m.id);
                    return p?.activities?.some(a => a.type === 4 || a.state);
                }).size;
                return `💬 Özel Durum: ${Math.max(pCount, mCount)}`;
            }

            // Ticket counters
            case 'ticketopen': {
                let openTickets = 0;
                if (ticketCategoryId) {
                    openTickets = guild.channels.cache.filter(c => c.parentId === ticketCategoryId && c.type === ChannelType.GuildText && !c.name.includes('closed') && !c.name.includes('kapali')).size;
                } else {
                    const row = await db.get(`SELECT COUNT(*) as count FROM tickets WHERE guild_id = ?`, [guild.id]).catch(() => null);
                    openTickets = row?.count || 0;
                }
                return `🎫 Açık Biletler: ${openTickets}`;
            }
            case 'ticketcreated': {
                let createdTickets = 0;
                const { count: sbTicketCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('guild_id', guild.id).catch(() => ({ count: 0 }));
                const openCountRow = await db.get(`SELECT COUNT(*) as count FROM tickets WHERE guild_id = ?`, [guild.id]).catch(() => null);
                createdTickets = (sbTicketCount || 0) + (openCountRow?.count || 0);
                return `📋 Toplam Biletler: ${createdTickets}`;
            }
            case 'ticketclosed': {
                let closedTickets = 0;
                if (ticketCategoryId) {
                    closedTickets = guild.channels.cache.filter(c => c.parentId === ticketCategoryId && (c.name.includes('closed') || c.name.includes('kapali')) && c.type === ChannelType.GuildText).size;
                }
                if (closedTickets === 0) {
                    const { count: sbClosedCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('guild_id', guild.id).eq('status', 'closed').catch(() => ({ count: 0 }));
                    closedTickets = sbClosedCount || 0;
                }
                return `🔒 Kapalı Biletler: ${closedTickets}`;
            }
            case 'ticketrenamed': {
                let renamedCount = 0;
                if (ticketCategoryId) {
                    renamedCount = guild.channels.cache.filter(c => c.parentId === ticketCategoryId && c.type === ChannelType.GuildText && !c.name.startsWith('ticket-') && !c.name.startsWith('bilet-') && !c.name.startsWith('talep-')).size;
                }
                return `✏️ Adı Değişen: ${renamedCount}`;
            }

            // Channel & Category counters
            case 'connected': {
                const connectedCount = guild.voiceStates.cache.filter(vs => vs.channelId).size;
                return `🎧 Seslide: ${connectedCount}`;
            }
            case 'channels': {
                const totalChannels = guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory).size;
                return `💬 Kanallar: ${totalChannels}`;
            }
            case 'parent': {
                const channelsInCategories = guild.channels.cache.filter(c => c.parentId && c.type !== ChannelType.GuildCategory).size;
                return `📁 Alt Kanallar: ${channelsInCategories}`;
            }
            case 'text': {
                const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
                return `📝 Metin Kanalları: ${textChannels}`;
            }
            case 'voice': {
                const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
                return `🔊 Ses Kanalları: ${voiceChannels}`;
            }
            case 'categories': {
                const categoriesCount = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
                return `🗂️ Kategoriler: ${categoriesCount}`;
            }
            case 'announcement': {
                const annChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size;
                return `📢 Duyuru Kanalları: ${annChannels}`;
            }
            case 'staging': {
                const stageChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice).size;
                return `🎭 Sahne Kanalları: ${stageChannels}`;
            }

            // Boost counters
            case 'boosts':
                return `🚀 Boost: ${guild.premiumSubscriptionCount || 0}`;
            case 'tier':
                return `👑 Seviye: ${guild.premiumTier || 0}`;

            // Emoji & Sticker counters
            case 'emojis':
                return `😀 Emojiler: ${guild.emojis.cache.size}`;
            case 'static': {
                const staticEmojis = guild.emojis.cache.filter(e => !e.animated).size;
                return `🙂 Statik Emojiler: ${staticEmojis}`;
            }
            case 'animated': {
                const animEmojis = guild.emojis.cache.filter(e => e.animated).size;
                return `✨ Hareketli: ${animEmojis}`;
            }
            case 'stickers':
                return `🎨 Çıkartmalar: ${guild.stickers.cache.size}`;

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
                .select('guild_id, server_counters, counters_category_id, counter_ticket_category_id, counter_role_id');
                
            if (error || !configs) return;

            for (const config of configs) {
                const guildId = config.guild_id;
                const isPremium = await isSubscriptionActive(guildId).catch(() => false);

                let activeCounters = [];
                if (Array.isArray(config.server_counters)) {
                    activeCounters = config.server_counters;
                } else if (typeof config.server_counters === 'string') {
                    try { activeCounters = JSON.parse(config.server_counters); } catch (e) { activeCounters = []; }
                }
                if (!Array.isArray(activeCounters) || activeCounters.length === 0) continue;

                // Enforce premium
                activeCounters = activeCounters.filter(item => {
                    const [baseType] = item.includes(':') ? item.split(':') : [item];
                    return isPremium || !PREMIUM_COUNTER_IDS.has(baseType);
                });

                const guild = client.guilds.cache.get(guildId);
                if (!guild) continue;

                const existingMappings = await db.all(`SELECT * FROM server_counter_channels WHERE guild_id = ?`, [guildId]);
                if (existingMappings.length === 0) continue;

                const existingMap = new Map(existingMappings.map(m => [m.counter_type, m.channel_id]));
                
                await updateCountersForGuild(guild, activeCounters, existingMap, config.counter_ticket_category_id, config.counter_role_id);
            }
        } catch (err) {
            console.error('[CounterService] Interval Update Error:', err.message);
        }
    }, 10 * 60 * 1000); // 10 minutes
}

module.exports = {
    setupCountersNow,
    initCounterService,
    PREMIUM_COUNTER_IDS
};
