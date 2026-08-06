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

    app.listen(port, () => {
        console.log(`[API Server] Listening on port ${port}`);
    });
}

module.exports = { startApiServer };
