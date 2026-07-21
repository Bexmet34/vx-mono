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
            const results = await manager.broadcastEval((client, context) => {
                const guilds = [];
                client.guilds.cache.forEach(guild => {
                    if (guild.members.cache.has(context.userId)) {
                        guilds.push({
                            id: guild.id,
                            name: guild.name,
                            icon: guild.iconURL({ format: 'png', size: 64 })
                        });
                    }
                });
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

    app.listen(port, () => {
        console.log(`[API Server] Listening on port ${port}`);
    });
}

module.exports = { startApiServer };
