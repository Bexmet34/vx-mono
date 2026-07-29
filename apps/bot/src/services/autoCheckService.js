const db = require('./db');
const { getSupabaseGuildSettings, updateSupabaseGuildSettings } = require('@veyronix/database');
const { getGuildMembers } = require('../utils/apiUtils');

async function runAutoCheck(client) {
    console.log('[AutoCheckService] Running scheduled guild roster checks...');

    try {
        // Fetch configs with auto_check_enabled
        const { data: configs, error } = await getConfigsToRun();
        if (error) {
            console.error('[AutoCheckService] Error fetching configs:', error);
            return;
        }

        if (!configs || configs.length === 0) return;

        for (const config of configs) {
            await processGuild(client, config);
        }

    } catch (err) {
        console.error('[AutoCheckService] Fatal Error:', err);
    }
}

async function getConfigsToRun() {
    const { supabase } = require('@veyronix/database');
    const { data, error } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('auto_check_enabled', true)
        .not('albion_guild_id', 'is', null);
    
    if (error) return { data: null, error };

    const now = new Date();
    const readyConfigs = data.filter(config => {
        if (!config.last_auto_check_date) return true;
        const lastCheck = new Date(config.last_auto_check_date);
        const diffInTime = now.getTime() - lastCheck.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);
        return diffInDays >= (config.auto_check_interval || 3);
    });

    return { data: readyConfigs, error: null };
}

async function processGuild(client, config) {
    const guildId = config.guild_id;
    console.log(`[AutoCheckService] Processing guild ${guildId}`);

    const { isSubscriptionActive } = require('@veyronix/database');
    const isPremium = await isSubscriptionActive(guildId);

    if (!isPremium) {
        console.log(`[AutoCheckService] Guild ${guildId} is not Premium. Skipping auto-role roster check (premium feature).`);
        const { supabase } = require('@veyronix/database');
        await supabase
            .from('guild_settings')
            .update({ last_auto_check_date: new Date().toISOString() })
            .eq('guild_id', guildId);
        return;
    }

    try {
        const discordGuild = client.guilds.cache.get(guildId);
        if (!discordGuild) return;

        // 1. Fetch Albion Guild Roster
        const albionMembers = await getGuildMembers(config.albion_guild_id, config.albion_server || 'Europe');
        if (!albionMembers || albionMembers.length === 0) {
            console.log(`[AutoCheckService] Could not fetch albion members for ${config.albion_guild_id}. Skipping.`);
            return;
        }

        // Create a Set of active Albion IDs
        const activeAlbionIds = new Set(albionMembers.map(m => m.Id));

        // 2. Fetch SQLite DB registrations
        const rows = await db.all(`SELECT * FROM guild_registrations WHERE guild_id = ?`, [guildId]);
        if (!rows || rows.length === 0) return;

        let removedCount = 0;
        let removedNames = [];

        await discordGuild.members.fetch();

        const role1 = config.registration_given_role_id;
        const role2 = config.registration_given_role_id_2;
        const role3 = config.registration_given_role_id_3;
        const unregRole = config.auto_check_custom_role_id || config.registration_unregistered_role_id;
        const customTag = config.auto_check_guild_tag; // e.g., "GUEST"

        // 3. Compare and Remove
        for (const row of rows) {
            // Wait 1.5 seconds between each to avoid discord rate limit
            await new Promise(r => setTimeout(r, 1500));

            // If user is NOT in the guild anymore
            if (!activeAlbionIds.has(row.albion_id)) {
                try {
                    const member = await discordGuild.members.fetch(row.user_id).catch(() => null);
                    if (!member) {
                        // User left discord entirely
                        await db.run(`DELETE FROM guild_registrations WHERE id = ?`, [row.id]);
                        continue;
                    }

                    // Bot cannot change owner's nickname or role usually
                    if (member.id === discordGuild.ownerId) continue;

                    // Remove registered roles
                    if (role1 && member.roles.cache.has(role1)) await member.roles.remove(role1).catch(()=>{});
                    if (role2 && member.roles.cache.has(role2)) await member.roles.remove(role2).catch(()=>{});
                    if (role3 && member.roles.cache.has(role3)) await member.roles.remove(role3).catch(()=>{});

                    // Add unregistered role
                    if (unregRole && !member.roles.cache.has(unregRole)) {
                        await member.roles.add(unregRole).catch(()=>{});
                    }

                    // Change Nickname: Replace existing tag with new tag or strip it
                    if (member.nickname) {
                        let newNick = member.nickname.replace(/^\[.*?\]\s*/, '');
                        if (customTag) {
                            newNick = `[${customTag.toUpperCase()}] ${newNick}`;
                        }
                        // Discord max nickname length is 32
                        await member.setNickname(newNick.substring(0, 32)).catch(()=>{});
                    } else if (customTag) {
                        const newNick = `[${customTag.toUpperCase()}] ${member.user.username}`;
                        await member.setNickname(newNick.substring(0, 32)).catch(()=>{});
                    }

                    // Delete from DB
                    await db.run(`DELETE FROM guild_registrations WHERE id = ?`, [row.id]);
                    removedCount++;
                    removedNames.push(`<@${member.id}> (${row.albion_ign})`);

                } catch (memberErr) {
                    console.error(`[AutoCheckService] Error acting on member ${row.user_id}:`, memberErr.message);
                }
            }
        }

        // 4. Update Database
        if (removedCount > 0) {
            const newRegisteredCount = Math.max(0, (config.registered_count || 0) - removedCount);
            
            const { supabase } = require('@veyronix/database');
            await supabase
                .from('guild_settings')
                .update({ 
                    last_auto_check_date: new Date().toISOString(),
                    registered_count: newRegisteredCount
                })
                .eq('guild_id', guildId);

            // Log it
            if (config.auto_check_log_channel_id) {
                const logChannel = discordGuild.channels.cache.get(config.auto_check_log_channel_id);
                if (logChannel) {
                    const lang = config.language || 'tr';
                    const listStr = removedNames.slice(0, 20).join(', ') + (removedNames.length > 20 ? (lang === 'en' ? ` ...and ${removedNames.length - 20} more` : ` ...ve ${removedNames.length - 20} kişi daha`) : '');
                    
                    const msg = lang === 'en'
                        ? `✅ **Automatic check completed!**\nDetected **${removedCount}** members who left the guild and roles/tags were updated.\n\n**Removed Users:**\n${listStr}`
                        : `✅ **Otomatik tarama tamamlandı!**\n**${removedCount}** kişinin guildden ayrıldığı tespit edilip rolleri/tagleri güncellendi.\n\n**İşlem Yapılan Kişiler:**\n${listStr}`;
                    
                    await logChannel.send({ content: msg }).catch(()=>{});

                }
            }
        } else {
             const { supabase } = require('@veyronix/database');
             await supabase
                .from('guild_settings')
                .update({ last_auto_check_date: new Date().toISOString() })
                .eq('guild_id', guildId);
        }

        console.log(`[AutoCheckService] Completed processing guild ${guildId}. Removed: ${removedCount}`);

    } catch (err) {
        console.error(`[AutoCheckService] Error processing guild ${guildId}:`, err);
    }
}

module.exports = { runAutoCheck };
