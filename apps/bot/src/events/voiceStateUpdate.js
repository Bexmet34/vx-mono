const { getGuildConfig } = require('../services/guildConfig');
const { handleCreatorJoin, handleTempChannelLeave } = require('../services/VoiceForgeService');

module.exports = async (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        try {
            // Check if user left a temp channel
            if (oldState.channelId && oldState.channelId !== newState.channelId) {
                await handleTempChannelLeave(oldState);
            }

            // Check if user joined a new channel
            if (newState.channelId && oldState.channelId !== newState.channelId) {
                // Fetch guild config to see if it's a creator channel
                const config = await getGuildConfig(newState.guild.id);
                if (config && Array.isArray(config.VoiceForge_creators)) {
                    const creatorConfig = config.VoiceForge_creators.find(c => c.channelId === newState.channelId);
                    if (creatorConfig) {
                        await handleCreatorJoin(newState, creatorConfig);
                    }
                }
            }
        } catch (err) {
            console.error('[voiceStateUpdate] Error handling VoiceForge logic:', err);
        }
    });
};
