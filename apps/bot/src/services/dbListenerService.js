const { supabase } = require('@veyronix/database');
const { sendSubscriptionNotification } = require('../utils/notificationUtils');

let lastKnownSubs = new Map();

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

        // --- NEW: Check KillBoard Manual Triggers ---
        const { data: configs, error: configError } = await supabase
            .from('guild_settings')
            .select('*')
            .eq('trigger_killboard', true);

        if (!configError && configs) {
            const { sendKillBoardSummary } = require('./killboardService');
            for (const config of configs) {
                console.log(`[DbListener] Manual KillBoard trigger for guild: ${config.guild_id}`);
                
                await sendKillBoardSummary(client, {
                    guild_id: config.guild_id,
                    guild_name: config.guild_id,
                    albion_guild_id: config.albion_guild_id,
                    albion_guild_name: config.albion_guild_name,
                    killboard_channel_id: config.killboard_channel_id,
                    killboard_time: config.killboard_time,
                    last_killboard_date: config.last_killboard_date || null,
                    language: config.language
                });

                // Reset trigger flag + save ISO timestamp for next period
                const nowIso = new Date().toISOString();
                await supabase
                    .from('guild_settings')
                    .update({ trigger_killboard: false, last_killboard_date: nowIso })
                    .eq('guild_id', config.guild_id);
            }
        }

        // --- NEW: Check Registration Sync Manual Triggers ---
        const { data: syncConfigs, error: syncError } = await supabase
            .from('guild_settings')
            .select('guild_id')
            .eq('trigger_sync', true);

        if (!syncError && syncConfigs) {
            const { syncRegistrations } = require('./registrationSyncService');
            for (const config of syncConfigs) {
                console.log(`[DbListener] Manual Registration Sync trigger for guild: ${config.guild_id}`);
                
                // Reset trigger flag immediately
                await supabase
                    .from('guild_settings')
                    .update({ trigger_sync: false })
                    .eq('guild_id', config.guild_id);

                // Run sync without awaiting to not block polling
                syncRegistrations(client, config.guild_id).catch(console.error);
            }
        }

        // --- NEW: Check Role Menu Triggers ---
        const { data: roleMenus, error: rmError } = await supabase
            .from('guild_role_menus')
            .select('guild_id, trigger_roles_setup, trigger_roles_menu_send')
            .or('trigger_roles_setup.eq.true,trigger_roles_menu_send.eq.true');

        if (!rmError && roleMenus) {
            const { setupGuildRoles, sendRoleMenu } = require('./roleMenuService');
            for (const menu of roleMenus) {
                if (menu.trigger_roles_setup) {
                    setupGuildRoles(client, menu.guild_id).catch(console.error);
                }
                if (menu.trigger_roles_menu_send) {
                    sendRoleMenu(client, menu.guild_id).catch(console.error);
                }
            }
        }
    } catch (err) {
        console.error('[DbListenerService] Polling Error:', err.message);
    }
}

module.exports = { initDbListeners };
