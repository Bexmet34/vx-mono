const { supabase } = require('@veyronix/database');
const { sendSubscriptionNotification } = require('../utils/notificationUtils');

let lastKnownSubs = new Map();
let lastKnownPending = new Set();

/**
 * Periodically checks the database for changes (Polling).
 * This works on all Supabase plans (including Free) without requiring Realtime setup.
 * @param {import('discord.js').Client} client 
 */
async function initDbListeners(client) {
    console.log('[DbListenerService] Polling system started (checking every 60 seconds)...');

    // Fetch initial state to avoid spamming notifications on bot restart
    await checkUpdates(client, true);

    // Check for updates every 60 seconds
    setInterval(async () => {
        await checkUpdates(client);
    }, 60000);

    // Fast check for triggers (e.g. TempVoice creation) every 3 seconds
    setInterval(async () => {
        await checkFastUpdates(client);
    }, 3000);
}

/**
 * Checks for differences between current DB state and the last known state.
 */
async function checkUpdates(client, initial = false) {
    try {
        const { data: subs, error } = await supabase
            .from('subscriptions')
            .select('*');

        if (error) throw error;

        for (const sub of subs) {
            const guildId = sub.guild_id;
            const oldSub = lastKnownSubs.get(guildId);

            // If we have an old record, compare for changes
            if (!initial && oldSub) {
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

        // --- NEW: Check Pending Manual Payments ---
        const { data: pendingPayments, error: pendingError } = await supabase
            .from('crypto_payments')
            .select('*')
            .eq('status', 'pending')
            .eq('payment_method', 'havale');

        if (!pendingError && pendingPayments) {
            const { sendPaymentNotificationToNtfy } = require('./ntfyService');
            for (const payment of pendingPayments) {
                // İsim henüz girilmediyse (kullanıcı modalda bekliyorsa) atla
                if (payment.sender_name === 'Belirtilmedi') {
                    continue; 
                }

                if (!initial && !lastKnownPending.has(payment.id)) {
                    console.log(`[DbListener] New manual payment found: ${payment.id}`);
                    await sendPaymentNotificationToNtfy(payment);
                }
                lastKnownPending.add(payment.id);
            }
        }

        // --- NEW: Check KillBoard Manual Triggers ---
        const { data: configs, error: configError } = await supabase
            .from('guild_settings')
            .select('*')
            .eq('trigger_killboard', true);

        if (!configError && configs) {
            const { sendKillBoardSummary } = require('./killboardService');
            const { getGuildConfig } = require('./guildConfig');
            for (const config of configs) {
                console.log(`[DbListener] Manual KillBoard trigger for guild: ${config.guild_id}`);
                const fullConfig = (await getGuildConfig(config.guild_id)) || config;
                
                await sendKillBoardSummary(client, fullConfig);

                // Reset trigger flag + save ISO timestamp for next period
                const nowIso = new Date().toISOString();
                await supabase
                    .from('guild_settings')
                    .update({ trigger_killboard: false, last_killboard_date: nowIso })
                    .eq('guild_id', config.guild_id);
            }
        }


        // --- NEW: Check Role Menu Triggers ---
        const { data: roleMenus, error: rmError } = await supabase
            .from('custom_role_menus')
            .select('id, guild_id, trigger_menu_send')
            .eq('trigger_menu_send', true);

        if (!rmError && roleMenus) {
            const { sendRoleMenu } = require('./roleMenuService');
            for (const menu of roleMenus) {
                if (menu.trigger_menu_send) {
                    sendRoleMenu(client, menu.id, menu.guild_id).catch(console.error);
                }
            }
        }

        // The tempvoice check was moved to checkFastUpdates
    } catch (err) {
        console.error('[DbListenerService] Polling Error:', err.message);
    }
}

async function checkFastUpdates(client) {
    try {
        // --- Check TempVoice Setup Triggers (Fast Path) ---
        const { data: tempVoiceConfigs, error: tvError } = await supabase
            .from('guild_settings')
            .select('guild_id, tempvoice_creators')
            .eq('trigger_tempvoice_setup', true);

        if (!tvError && tempVoiceConfigs && tempVoiceConfigs.length > 0) {
            const { ChannelType } = require('discord.js');
            for (const config of tempVoiceConfigs) {
                const guild = client.guilds.cache.get(config.guild_id);
                if (!guild) continue;
                
                let creatorsUpdated = false;
                let updatedCreators = Array.isArray(config.tempvoice_creators) ? [...config.tempvoice_creators] : [];

                for (let i = 0; i < updatedCreators.length; i++) {
                    const creator = updatedCreators[i];
                    if (!creator.channelId) {
                        try {
                            const newChannel = await guild.channels.create({
                                name: creator.name || '➕・Open-Audio-Channel',
                                type: ChannelType.GuildVoice,
                                parent: creator.categoryId || null,
                                reason: 'TempVoice creator channel auto-setup from dashboard'
                            });
                            
                            updatedCreators[i] = { ...creator, channelId: newChannel.id };
                            creatorsUpdated = true;
                            console.log(`[TempVoice] Created creator channel ${newChannel.id} for guild ${guild.id}`);
                        } catch (err) {
                            console.error(`[TempVoice] Failed to create channel for guild ${guild.id}:`, err.message);
                        }
                    }
                }

                // Update database: save the new channelIds and turn off the trigger
                await supabase
                    .from('guild_settings')
                    .update({ 
                        tempvoice_creators: updatedCreators,
                        trigger_tempvoice_setup: false
                    })
                    .eq('guild_id', config.guild_id);
            }
        }
    } catch (err) {
        console.error('[DbListenerService] Fast Polling Error:', err.message);
    }
}

module.exports = { initDbListeners };
