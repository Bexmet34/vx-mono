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

    app.get('/api/bot-guilds', async (req, res) => {
        try {
            const results = await manager.broadcastEval(client => {
                return client.guilds.cache.map(g => ({ id: g.id, name: g.name, icon: g.icon, owner_id: g.ownerId }));
            });
            const guilds = results.flat();
            return res.json({ success: true, guilds });
        } catch (error) {
            console.error('API /bot-guilds Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/guild-data/:guildId', async (req, res) => {
        const { guildId } = req.params;
        if (!guildId) return res.status(400).json({ error: 'Missing guildId' });

        try {
            const results = await manager.broadcastEval(async (client, context) => {
                const guild = client.guilds.cache.get(context.guildId);
                if (!guild) return null;

                const channels = guild.channels.cache.map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    position: c.position,
                    parentId: c.parentId
                }));

                const roles = guild.roles.cache
                    .filter(r => r.name !== '@everyone')
                    .map(r => ({
                        id: r.id,
                        name: r.name,
                        color: r.color,
                        position: r.position
                    }))
                    .sort((a, b) => b.position - a.position);

                const members = guild.members.cache.map(m => ({
                    id: m.user.id,
                    username: m.user.username,
                    global_name: m.user.globalName || m.user.username,
                    avatar: m.user.avatar,
                    bot: m.user.bot || false
                }));

                return {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL({ format: 'png', size: 256 }),
                    owner_id: guild.ownerId,
                    approximate_member_count: guild.memberCount,
                    channels,
                    roles,
                    members
                };
            }, { context: { guildId } });

            const guildData = results.find(r => r !== null);
            if (guildData) {
                return res.json({ success: true, ...guildData });
            }
            return res.status(404).json({ error: 'Guild not found on any bot shard' });
        } catch (error) {
            console.error('[API] /guild-data Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/user/:userId', async (req, res) => {
        try {
            // Pick the first shard to fetch the user
            const results = await manager.broadcastEval(async (client, context) => {
                try {
                    const u = await client.users.fetch(context.userId);
                    if (u) {
                        return {
                            id: u.id,
                            username: u.username,
                            global_name: u.globalName || u.username,
                            avatar: u.avatar
                        };
                    }
                } catch(e) { return null; }
                return null;
            }, { context: { userId: req.params.userId } });

            const user = results.find(r => r !== null);
            if (user) {
                return res.json({ success: true, user });
            } else {
                return res.status(404).json({ error: 'Not found' });
            }
        } catch (error) {
            console.error('API /user Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

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
            const albionMemberNames = albionMembers.map(m => m.player_name.trim().toLowerCase());

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
                let leavers = [];
                let matchedIgnSet = new Set();

                for (const [memberId, member] of guild.members.cache) {
                    if (member.user.bot) continue;
                    
                    // Only check people who actually have the guild role
                    if (member.roles.cache.has(context.guildRoleId)) {
                        checkedCount++;
                        
                        // Extract IGN from Nickname
                        let ign = member.displayName;
                        const tagMatch = ign.match(/^\[.*?\]\s*(.*)$/);
                        if (tagMatch) ign = tagMatch[1];
                        
                        // Strip anything after a hyphen or pipe (e.g. "IGN - Name Age")
                        ign = ign.split(/[-|]/)[0];
                        
                        ign = ign.trim().toLowerCase();

                        // If not in Albion DB
                        if (!context.albionMemberNames.includes(ign)) {
                            leavers.push({
                                id: member.id,
                                tag: member.user.tag,
                                ign: ign
                            });
                        } else {
                            matchedIgnSet.add(ign);
                        }
                    }
                }

                let unregistered = [];
                for (const dbName of context.albionMemberNames) {
                    if (!matchedIgnSet.has(dbName)) {
                        unregistered.push(dbName);
                    }
                }

                return { success: true, checkedCount, leavers, unregistered };
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
