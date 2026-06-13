const db = require('./db');
const { getSupabaseGuildSettings, updateSupabaseGuildSettings } = require('@veyronix/database');

async function syncRegistrations(client, guildId) {
    console.log(`[SyncService] Starting registration sync for guild ${guildId}`);
    try {
        const settings = await getSupabaseGuildSettings(guildId);
        if (!settings || !settings.albion_guild_id) {
            console.log(`[SyncService] No albion_guild_id found for guild ${guildId}. Aborting sync.`);
            await updateSupabaseGuildSettings(guildId, { is_syncing: false });
            return;
        }

        const albionGuildId = settings.albion_guild_id;
        const guildTag = settings.auto_check_guild_tag || settings.albion_guild_name?.substring(0, 4)?.toUpperCase() || '';

        const discordGuild = client.guilds.cache.get(guildId);
        if (!discordGuild) {
            console.log(`[SyncService] Bot is not in guild ${guildId}.`);
            await updateSupabaseGuildSettings(guildId, { is_syncing: false });
            return;
        }

        await discordGuild.members.fetch(); // Fetch all members

        let registeredCount = 0;
        let processedCount = 0;
        let skippedCount = 0;
        // Find users who have the registered role (given_role_id) or tag in name
        const givenRoleId1 = settings.registration_given_role_id;
        const givenRoleId2 = settings.registration_given_role_id_2;
        const givenRoleId3 = settings.registration_given_role_id_3;

        // Fetch existing users from DB to skip them
        const existingRecords = await db.all(`SELECT user_id FROM guild_registrations WHERE guild_id = ?`, [guildId]);
        const existingUserIds = new Set(existingRecords.map(r => r.user_id));

        const membersToSync = discordGuild.members.cache.filter(m => {
            if (m.user.bot) return false;
            if (existingUserIds.has(m.id)) return false; // Skip already registered members

            const hasRole = (givenRoleId1 && m.roles.cache.has(givenRoleId1)) ||
                            (givenRoleId2 && m.roles.cache.has(givenRoleId2)) ||
                            (givenRoleId3 && m.roles.cache.has(givenRoleId3));
            const hasTag = guildTag && m.nickname && m.nickname.includes(`[${guildTag}]`);
            return hasRole || hasTag;
        });

        console.log(`[SyncService] Found ${membersToSync.size} potential members to sync for ${guildId}. Rate limiting...`);

        const membersArray = Array.from(membersToSync.values());

        // Process slowly (1 member every 1.5 seconds) to avoid rate limits
        for (let i = 0; i < membersArray.length; i++) {
            const member = membersArray[i];
            
            // Wait 1.5 seconds between each processing
            await new Promise(r => setTimeout(r, 1500));

            try {
                // Extract IGN from Nickname
                let ign = '';
                if (member.nickname) {
                    const match = member.nickname.match(/\[.*?\]\s*([^-]+)/);
                    if (match && match[1]) {
                        ign = match[1].trim();
                    } else {
                        ign = member.nickname.replace(/\[.*?\]/, '').trim();
                    }
                } else {
                    ign = member.user.username; // Fallback
                }

                if (!ign) continue;

                // Call Albion API to search for player
                const { getPlayerInfo } = require('../utils/apiUtils');
                const playerData = await getPlayerInfo(ign);
                
                if (playerData && playerData.Id) {
                    // Strictly check if player belongs to the Ana Guild
                    if (playerData.GuildId === albionGuildId) {
                        await db.run(
                            `INSERT OR IGNORE INTO guild_registrations (guild_id, user_id, albion_ign, albion_id) VALUES (?, ?, ?, ?)`,
                            [guildId, member.id, ign, playerData.Id]
                        );
                        registeredCount++;
                        console.log(`[SyncService] Synced ${ign} (${playerData.Id}) for guild ${guildId}`);
                    } else {
                         skippedCount++;
                         console.log(`[SyncService] Player ${ign} is in guild ${playerData.GuildId}, not ${albionGuildId}. Skipped.`);
                    }
                } else {
                     skippedCount++;
                }
            } catch (err) {
                console.error(`[SyncService] Error processing member ${member.id}:`, err);
            }
            processedCount++;
        }

        // Update final count and sync result in Supabase
        const syncResult = {
            scanned: processedCount,
            synced: registeredCount,
            skipped: skippedCount,
            timestamp: new Date().toISOString()
        };

        const totalRegistered = await db.get(`SELECT COUNT(*) as count FROM guild_registrations WHERE guild_id = ?`, [guildId]);
        const totalCount = totalRegistered ? totalRegistered.count : 0;

        await updateSupabaseGuildSettings(guildId, { 
            registered_count: totalCount,
            last_sync_result: syncResult,
            is_syncing: false
        });
        console.log(`[SyncService] Completed sync for guild ${guildId}. Added: ${registeredCount}, Total: ${totalCount}`);
        
        // Notify in log channel
        const logChannelId = settings.registration_log_channel_id;
        if (logChannelId) {
            const logChannel = discordGuild.channels.cache.get(logChannelId);
            if (logChannel) {
                const lang = settings.language || 'tr';
                const msg = lang === 'en' 
                    ? `🔄 **Sync Process Completed!**\nNew members synced: **${registeredCount}**\nTotal synchronized members: **${totalCount}**` 
                    : `🔄 **Senkronizasyon İşlemi Tamamlandı!**\nYeni eşzamanlanan üye: **${registeredCount}**\nToplam kayıtlı üye: **${totalCount}**`;
                await logChannel.send({ content: msg }).catch(()=>{});
            }
        }

    } catch (err) {
        console.error(`[SyncService] Fatal error syncing guild ${guildId}:`, err);
        // Ensure UI unlocks on crash
        await updateSupabaseGuildSettings(guildId, { is_syncing: false });
    }
}

module.exports = { syncRegistrations };
