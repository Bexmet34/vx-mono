const { supabase } = require('@veyronix/database');
const { getGuildConfig } = require('./guildConfig');
const { EmbedBuilder } = require('discord.js');

let clientInstance = null;
let runningTimers = new Map();

/**
 * Initiates the Temp Role Service.
 * @param {Object} client The discord.js client
 */
function initTempRoleService(client) {
    clientInstance = client;
    console.log('[TempRoleService] Started — hybrid polling every 1 hour...');
    
    // Run immediately on boot
    checkUpcomingExpirations();
    
    // And run every hour (3600000 ms)
    setInterval(checkUpcomingExpirations, 3600000);
}

async function checkUpcomingExpirations() {
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 3600000 + 60000); // 1 hour + 1 minute padding

        // Fetch roles expiring in the next hour
        const { data: tempRoles, error } = await supabase
            .from('temp_roles')
            .select('*')
            .lte('expires_at', oneHourLater.toISOString());

        if (error) {
            console.error('[TempRoleService] Supabase fetch error:', error.message);
            return;
        }

        if (!tempRoles || tempRoles.length === 0) return;

        for (const record of tempRoles) {
            // Avoid duplicate timers for the same record if already running
            if (runningTimers.has(record.id)) continue;

            const expiresAt = new Date(record.expires_at);
            const timeUntilExpiry = expiresAt.getTime() - Date.now();

            if (timeUntilExpiry <= 0) {
                // Already expired, process immediately
                await processRoleExpiration(record);
            } else {
                // Expiring within the hour, set a setTimeout
                const timer = setTimeout(async () => {
                    await processRoleExpiration(record);
                    runningTimers.delete(record.id);
                }, timeUntilExpiry);
                
                runningTimers.set(record.id, timer);
            }
        }
    } catch (e) {
        console.error('[TempRoleService] Error checking expirations:', e);
    }
}

async function processRoleExpiration(record) {
    try {
        const guild = clientInstance.guilds.cache.get(record.guild_id);
        if (!guild) {
            // Guild not found, maybe bot was kicked. Clean up DB anyway.
            await removeRecord(record.id);
            return;
        }

        const member = await guild.members.fetch(record.user_id).catch(() => null);
        if (!member) {
            // User left the server. Clean up DB.
            await removeRecord(record.id);
            return;
        }

        const config = await getGuildConfig(record.guild_id);

        let actionLog = '';

        // Remove temp role
        if (record.temp_role_id && member.roles.cache.has(record.temp_role_id)) {
            await member.roles.remove(record.temp_role_id).catch(console.error);
            actionLog += `🔴 Alınan Rol: <@&${record.temp_role_id}>\n`;
        }

        // Add fallback role
        if (record.fallback_role_id) {
            await member.roles.add(record.fallback_role_id).catch(console.error);
            actionLog += `🟢 Verilen Rol: <@&${record.fallback_role_id}>\n`;
        }

        // Delete from database
        await removeRecord(record.id);

        // Send log
        if (config?.registration_log_channel_id) {
            const logChannel = guild.channels.cache.get(config.registration_log_channel_id);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('⏳ Misafir Süresi Doldu')
                    .setColor('#ff9f43')
                    .setDescription(`**<@${member.id}>** adlı kullanıcının geçici misafir süresi dolduğu için rol güncellemeleri yapıldı.`)
                    .addFields({ name: 'Yapılan İşlemler', value: actionLog || 'İşlem gerekmedi' })
                    .setTimestamp();

                await logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        }

    } catch (e) {
        console.error(`[TempRoleService] Error processing record ${record.id}:`, e);
    }
}

async function removeRecord(id) {
    try {
        const { error } = await supabase.from('temp_roles').delete().eq('id', id);
        if (error) console.error('[TempRoleService] Supabase delete error:', error.message);
    } catch (e) {
        console.error('[TempRoleService] Exception in removeRecord:', e);
    }
}

module.exports = { initTempRoleService };
