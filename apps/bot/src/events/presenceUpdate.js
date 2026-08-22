const { Events } = require('discord.js');
const { activeTempChannels, parseChannelName } = require('../services/tempVoiceService');
const { getGuildConfig } = require('../services/guildConfig');

// We need a rate limiter map to avoid Discord API 429
const renameCooldowns = new Map(); // channelId -> timestamp
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

module.exports = (client) => {
    client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
        if (!newPresence || !newPresence.member) return;
        const member = newPresence.member;

        // Check if member is the owner of any temp channel
        const channelIdsToRename = [];
        for (const [channelId, data] of activeTempChannels.entries()) {
            if (data.ownerId === member.id) {
                channelIdsToRename.push({ channelId, creatorId: data.creatorId, count: data.count || 1 });
            }
        }

        if (channelIdsToRename.length === 0) return;

        const guildSettings = await getGuildConfig(member.guild.id);
        const creators = guildSettings?.tempvoice_creators || [];

        for (const info of channelIdsToRename) {
            const creatorConfig = creators.find(c => c.id === info.creatorId);
            // Only proceed if the channel name format actually uses an activity variable
            if (!creatorConfig || !creatorConfig.channelNameFormat.includes('{ACTIVITY_')) continue;

            const channel = member.guild.channels.cache.get(info.channelId);
            if (!channel) continue;

            // Calculate the new name
            const newName = parseChannelName(creatorConfig.channelNameFormat, member, info.count);
            if (channel.name === newName) continue; // No change needed

            // Enforce rate limit (max 1 rename every 5 minutes)
            const now = Date.now();
            const lastRename = renameCooldowns.get(info.channelId) || 0;
            if (now - lastRename < COOLDOWN_MS) continue;

            // Execute the rename
            try {
                await channel.setName(newName, "Activity changed");
                renameCooldowns.set(info.channelId, now);
            } catch (err) {
                console.error(`[TempVoice] Failed to rename channel for activity update (Rate limited?):`, err.message);
                // Even if failed, set cooldown to avoid spamming the API
                renameCooldowns.set(info.channelId, now);
            }
        }
    });
};
