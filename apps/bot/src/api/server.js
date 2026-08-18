const express = require('express');
const cors = require('cors');

/**
 * Starts the internal API server for the bot.
 * @param {import('discord.js').ShardingManager} manager 
 * @param {number} port 
 */
function startApiServer(manager, port = process.env.BOT_API_PORT || 3005) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/api/mutual-guilds/:userId', async (req, res) => {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        try {
            // BroadcastEval to all shards
            // We search for guilds where the members.cache has this user.
            const results = await manager.broadcastEval(async (client, context) => {
                const guilds = [];
                const fetchPromises = client.guilds.cache.map(async guild => {
                    try {
                        let isMember = false;
                        if (guild.members.cache.has(context.userId)) {
                            isMember = true;
                        } else {
                            const member = await guild.members.fetch(context.userId).catch(() => null);
                            if (member) isMember = true;
                        }

                        if (isMember) {
                            let inviteUrl = `https://discord.com/channels/${guild.id}`;
                            try {
                                if (guild.members.me.permissions.has('ManageGuild')) {
                                    const invites = await guild.invites.fetch().catch(() => null);
                                    if (invites && invites.size > 0) {
                                        inviteUrl = invites.first().url;
                                    } else {
                                        const channel = guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('CreateInstantInvite'));
                                        if (channel) {
                                            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
                                            if (invite) inviteUrl = invite.url;
                                        }
                                    }
                                }
                            } catch (e) {
                                // ignore invite fetch errors
                            }

                            guilds.push({
                                id: guild.id,
                                name: guild.name,
                                icon: guild.iconURL({ format: 'png', size: 64 }),
                                invite: inviteUrl
                            });
                        }
                    } catch (e) {
                        // ignore fetching errors for this guild
                    }
                });
                
                await Promise.all(fetchPromises);
                return guilds;
            }, { context: { userId } });

            // Flatten the results array from all shards
            const mutualGuilds = results.flat();
            
            res.json({ success: true, guilds: mutualGuilds });
        } catch (error) {
            console.error('[API] Error fetching mutual guilds:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/api/giveaway/publish', async (req, res) => {
        const { giveawayId } = req.body;
        if (!giveawayId) return res.status(400).json({ error: 'Missing giveawayId' });

        try {
            const { getGiveawayById } = require('@veyronix/database');
            const giveaway = await getGiveawayById(giveawayId);
            if (!giveaway) return res.status(404).json({ error: 'Giveaway not found' });

            const path = require('path');
            const enginePath = path.join(process.cwd(), 'src/services/giveawayEngine');

            await manager.broadcastEval(async (client, context) => {
                const { publishGiveawayMessage } = require(context.enginePath);
                await publishGiveawayMessage(client, context.giveaway);
            }, { context: { giveaway, enginePath } });

            res.json({ success: true });
        } catch (error) {
            console.error('[API] Error publishing giveaway:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/api/guild/check-discord', async (req, res) => {
        const { guildId } = req.body;
        if (!guildId) return res.status(400).json({ error: 'Missing guildId' });

        try {
            const { supabase } = require('@veyronix/database');
            if (!supabase) return res.status(500).json({ error: 'Supabase client not initialized in bot API' });

            // Fetch Guild Settings
            const { data: settings } = await supabase
                .from('guild_settings')
                .select('*')
                .eq('guild_id', guildId)
                .single();

            if (!settings || !settings.registration_enabled) return res.status(400).json({ error: 'Registration not enabled' });

            // Fetch Albion Members from DB
            const { data: albionMembers } = await supabase
                .from('albion_guild_members')
                .select('player_name')
                .eq('discord_guild_id', guildId);

            if (!albionMembers) return res.status(400).json({ error: 'No Albion members synced' });
            const albionMemberNames = albionMembers.map(m => m.player_name.toLowerCase());

            // Identify Roles
            const guildRoleId = settings.registration_given_role_id;
            if (!guildRoleId) return res.status(400).json({ error: 'Guild role not set' });
            const unregisteredRoleId = settings.registration_unregistered_role_id;

            const results = await manager.broadcastEval(async (client, context) => {
                const guild = client.guilds.cache.get(context.guildId);
                if (!guild) return null;

                // Fetch all discord members
                await guild.members.fetch();
                
                let checkedCount = 0;
                let removedCount = 0;

                for (const [memberId, member] of guild.members.cache) {
                    if (member.user.bot) continue;
                    
                    // Only check people who actually have the guild role
                    if (member.roles.cache.has(context.guildRoleId)) {
                        checkedCount++;
                        
                        // Extract IGN from Nickname
                        let ign = member.displayName;
                        const tagMatch = ign.match(/^\[.*?\]\s*(.*)$/);
                        if (tagMatch) ign = tagMatch[1];
                        
                        ign = ign.trim().toLowerCase();

                        // If not in Albion DB
                        if (!context.albionMemberNames.includes(ign)) {
                            try {
                                // Remove Guild Roles
                                const rolesToRemove = [
                                    context.settings.registration_given_role_id,
                                    context.settings.registration_given_role_id_2,
                                    context.settings.registration_given_role_id_3,
                                    context.settings.registration_given_role_id_4,
                                    context.settings.registration_given_role_id_5
                                ].filter(Boolean);

                                await member.roles.remove(rolesToRemove, 'Albion Guild Sync: Left the guild');
                                
                                // Removed Unregistered Role assignment here because it kicks community members out of channels

                                // Update Nickname
                                const newNickname = `[NaN] ${ign}`.substring(0, 32);
                                if (guild.members.me.permissions.has('ManageNicknames') && member.manageable) {
                                    await member.setNickname(newNickname, 'Albion Guild Sync: Left the guild');
                                }
                                
                                removedCount++;
                            } catch (err) {
                                console.error(`[API Sync] Failed to update member ${member.user.tag}:`, err);
                            }
                        }
                    }
                }

                return { success: true, checkedCount, removedCount };
            }, { context: { guildId, settings, albionMemberNames, guildRoleId, unregisteredRoleId } });

            const validResult = results.find(r => r !== null);
            if (!validResult) return res.status(404).json({ error: 'Guild not found on any bot shard' });
            if (validResult.error) return res.status(400).json({ error: validResult.error });

            res.json(validResult);
        } catch (error) {
            console.error('[API] Error checking discord:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    });

    return app.listen(port, () => {
        console.log(`[API Server] Listening on port ${port}`);
    });
}

module.exports = { startApiServer };
