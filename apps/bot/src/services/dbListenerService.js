const { supabase } = require('@veyronix/database');
const { sendSubscriptionNotification } = require('../utils/notificationUtils');

let lastKnownSubs = new Map();
let lastKnownPending = new Set();

/**
 * Initializes Supabase Realtime listeners instead of polling.
 * This drastically reduces Egress/Bandwidth usage.
 * @param {import('discord.js').Client} client 
 */
async function initDbListeners(client) {
    console.log('[DbListenerService] Initializing Realtime listeners...');

    // 1. Fetch initial subscriptions state to track changes locally
    try {
        const { data: subs, error } = await supabase.from('subscriptions').select('*');
        if (!error && subs) {
            for (const sub of subs) {
                lastKnownSubs.set(sub.guild_id, sub);
            }
        }
    } catch (err) {
        console.error('[DbListenerService] Initial fetch error:', err.message);
    }

    // 2. Fetch initial pending payments
    try {
        const { data: pendingPayments, error: pendingError } = await supabase
            .from('crypto_payments')
            .select('id')
            .eq('status', 'pending')
            .eq('payment_method', 'havale');
            
        if (!pendingError && pendingPayments) {
            for (const payment of pendingPayments) {
                lastKnownPending.add(payment.id);
            }
        }
    } catch (err) {
        console.error('[DbListenerService] Initial pending payments fetch error:', err.message);
    }

    // 3. Setup Realtime Channel
    const channel = supabase.channel('public_db_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'subscriptions' },
            (payload) => handleSubscriptionChange(client, payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'crypto_payments' },
            (payload) => handleCryptoPaymentChange(client, payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'guild_settings' },
            (payload) => handleGuildSettingsChange(client, payload)
        )
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'custom_role_menus' },
            (payload) => handleRoleMenuChange(client, payload)
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('[DbListenerService] Realtime subscribed successfully!');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                console.log(`[DbListenerService] Realtime status: ${status}`);
            }
        });
}

// Subscriptions handler
async function handleSubscriptionChange(client, payload) {
    const sub = payload.new;
    // If it's a DELETE event, payload.new might be empty
    if (!sub || !sub.guild_id) return;

    const guildId = sub.guild_id;
    const oldSub = lastKnownSubs.get(guildId);

    if (oldSub) {
        // 1. Unlimited Mode Activation
        if (!oldSub.is_unlimited && sub.is_unlimited) {
            await sendSubscriptionNotification(client, guildId, 'unlimited');
        }
        // 2. Server Disabled (active -> inactive)
        else if (oldSub.is_active && !sub.is_active) {
            await sendSubscriptionNotification(client, guildId, 'disabled');
        }
        // 3. Subscription Extension (expiry date increased)
        else if (sub.expires_at !== oldSub.expires_at) {
            const oldExpiry = new Date(oldSub.expires_at);
            const newExpiry = new Date(sub.expires_at);

            if (newExpiry > oldExpiry) {
                const diffInMs = newExpiry - oldExpiry;
                const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
                
                if (diffInDays > 0) {
                    await sendSubscriptionNotification(client, guildId, 'extended', diffInDays, sub.expires_at);
                }
            }
        }
    }

    // Update the memory map with the latest record
    lastKnownSubs.set(guildId, sub);
}

// Crypto Payments handler
async function handleCryptoPaymentChange(client, payload) {
    const payment = payload.new;
    if (!payment || !payment.id) return;

    if (payment.status === 'pending' && payment.payment_method === 'havale') {
        // İsim henüz girilmediyse atla
        if (payment.sender_name === 'Belirtilmedi') return;

        if (!lastKnownPending.has(payment.id)) {
            console.log(`[DbListener] New manual payment found via realtime: ${payment.id}`);
            const { sendPaymentNotificationToNtfy } = require('./ntfyService');
            await sendPaymentNotificationToNtfy(payment);
            lastKnownPending.add(payment.id);
        }
    }
}

async function handleGuildSettingsChange(client, payload) {
    const config = payload.new;
    if (!config || !config.guild_id) return;

    try {
        // Sync tempvoice_creators to SQLite & memory cache immediately
        if (config.tempvoice_creators !== undefined) {
            const db = require('./db');
            const { configCache } = require('./guildConfig');
            const tvJson = typeof config.tempvoice_creators === 'string' 
                ? config.tempvoice_creators 
                : JSON.stringify(config.tempvoice_creators);
            db.run('UPDATE guild_configs SET tempvoice_creators = ? WHERE guild_id = ?', [tvJson, config.guild_id]).catch(() => {});
            if (configCache && configCache.has(config.guild_id)) {
                const cached = configCache.get(config.guild_id);
                if (cached && cached.data) {
                    cached.data.tempvoice_creators = config.tempvoice_creators;
                    cached.timestamp = Date.now();
                }
            }
        }
        // --- KillBoard Trigger ---
        if (config.trigger_killboard) {
            console.log(`[DbListener] Manual KillBoard trigger via realtime for guild: ${config.guild_id}`);
            const { sendKillBoardSummary } = require('./killboardService');
            const { getGuildConfig } = require('./guildConfig');
            
            const fullConfig = (await getGuildConfig(config.guild_id)) || config;
            await sendKillBoardSummary(client, fullConfig);

            // Reset trigger flag
            const nowIso = new Date().toISOString();
            await supabase
                .from('guild_settings')
                .update({ trigger_killboard: false, last_killboard_date: nowIso })
                .eq('guild_id', config.guild_id);
        }

        // --- TempVoice Setup Trigger ---
        if (config.trigger_tempvoice_setup) {
            const { ChannelType } = require('discord.js');
            const guild = client.guilds.cache.get(config.guild_id);
            
            if (guild) {
                let creatorsUpdated = false;
                let updatedCreators = Array.isArray(config.tempvoice_creators) ? [...config.tempvoice_creators] : [];

                for (let i = 0; i < updatedCreators.length; i++) {
                    const creator = updatedCreators[i];
                    let needsCreation = !creator.channelId;
                    
                    if (creator.channelId) {
                        const existingChannel = guild.channels.cache.get(creator.channelId) || await guild.channels.fetch(creator.channelId).catch(() => null);
                        if (!existingChannel) {
                            needsCreation = true;
                        }
                    }

                    if (needsCreation) {
                        try {
                            const newChannel = await guild.channels.create({
                                name: creator.name || '➕・Open-Audio-Channel',
                                type: ChannelType.GuildVoice,
                                parent: creator.categoryId || null,
                                reason: 'VoiceForge creator channel auto-setup from dashboard'
                            });
                            
                            updatedCreators[i] = { ...creator, channelId: newChannel.id };
                            creatorsUpdated = true;
                            console.log(`[VoiceForge] Created creator channel ${newChannel.id} for guild ${guild.id}`);
                        } catch (err) {
                            console.error(`[VoiceForge] Failed to create channel for guild ${guild.id}:`, err.message);
                        }
                    }
                }

                await supabase
                    .from('guild_settings')
                    .update({ 
                        ...(creatorsUpdated ? { tempvoice_creators: updatedCreators } : {}),
                        trigger_tempvoice_setup: false
                    })
                    .eq('guild_id', config.guild_id);
            } else {
                await supabase.from('guild_settings').update({ trigger_tempvoice_setup: false }).eq('guild_id', config.guild_id);
            }
        }

        // --- Ticket Deploy Trigger ---
        if (config.trigger_ticket_deploy) {
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
            try {
                const guild = client.guilds.cache.get(config.guild_id) || await client.guilds.fetch(config.guild_id).catch(() => null);
                
                if (guild && config.ticket_channel_id) {
                    const channel = guild.channels.cache.get(config.ticket_channel_id) || await guild.channels.fetch(config.ticket_channel_id).catch(() => null);
                    
                    if (channel) {
                        const lang = config.language || 'tr';
                        const defaultTitle = lang === 'en' ? "Support Ticket" : "Destek Talebi";
                        const defaultDesc = lang === 'en' 
                            ? "Please click the button below to create a support ticket." 
                            : "Lütfen aşağıdaki butona tıklayarak destek talebinizi oluşturun.";
                        const buttonLabel = lang === 'en' ? "Open Support Ticket" : "Destek Talebi Aç";

                        const embed = new EmbedBuilder()
                            .setTitle((config.ticket_message_title && config.ticket_message_title.trim()) ? config.ticket_message_title : defaultTitle)
                            .setDescription((config.ticket_message_desc && config.ticket_message_desc.trim()) ? config.ticket_message_desc : defaultDesc)
                            .setColor(5793266)
                            .setFooter({ text: "Veyronix Ticket System" });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("ticket_open")
                                .setLabel(buttonLabel)
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji("🎫")
                        );

                        await channel.send({ embeds: [embed], components: [row] });
                        console.log(`[TicketDeploy] Successfully deployed ticket panel to channel ${channel.id} for guild ${guild.id}`);
                    } else {
                        console.error(`[TicketDeploy] Channel ${config.ticket_channel_id} not found in guild ${guild.id}`);
                    }
                }
            } catch (deployErr) {
                console.error(`[TicketDeploy] Failed to deploy ticket panel for guild ${config.guild_id}:`, deployErr.message);
            } finally {
                await supabase.from('guild_settings').update({ trigger_ticket_deploy: false }).eq('guild_id', config.guild_id);
            }
        }

        // --- Counters Setup Trigger ---
        if (config.trigger_counters_setup) {
            const { setupCountersNow } = require('./counterService');
            try {
                await setupCountersNow(client, config.guild_id);
            } catch (err) {
                console.error(`[DbListener] Failed to setup counters for guild ${config.guild_id}:`, err.message);
            } finally {
                await supabase.from('guild_settings').update({ trigger_counters_setup: false }).eq('guild_id', config.guild_id);
            }
        }

    } catch (err) {
        console.error('[DbListenerService] Guild settings realtime handler error:', err.message);
    }
}

// Role Menu handler
async function handleRoleMenuChange(client, payload) {
    const menu = payload.new;
    if (!menu || !menu.id) return;

    if (menu.trigger_menu_send) {
        const { sendRoleMenu } = require('./roleMenuService');
        sendRoleMenu(client, menu.id, menu.guild_id).catch(console.error);
    }
}

module.exports = { initDbListeners };
