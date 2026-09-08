const { getGuildConfig } = require('../services/guildConfig');
const { handleCreatorJoin, handleTempChannelLeave } = require('../services/tempVoiceService');

module.exports = async (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        try {
            const member = newState.member || oldState.member;
            console.log(`[voiceStateUpdate] ${member?.user?.tag || 'User'} moved in ${newState.guild?.name || oldState.guild?.name} (old: ${oldState.channelId}, new: ${newState.channelId})`);

            // Check if user left a temp channel
            if (oldState.channelId && oldState.channelId !== newState.channelId) {
                await handleTempChannelLeave(oldState);
            }

            // Check if user joined a new channel
            if (newState.channelId && oldState.channelId !== newState.channelId) {
                // Fetch guild config to see if it's a creator channel
                const config = await getGuildConfig(newState.guild.id);
                if (config) {
                    let creators = config.tempvoice_creators;
                    if (typeof creators === 'string') {
                        try { creators = JSON.parse(creators); } catch (e) { creators = []; }
                    }
                    if (Array.isArray(creators)) {
                        const creatorConfig = creators.find(c => c.channelId === newState.channelId);
                        if (creatorConfig) {
                            console.log(`[voiceStateUpdate] Triggering handleCreatorJoin for channel ${newState.channelId}`);
                            await handleCreatorJoin(newState, creatorConfig);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[voiceStateUpdate] Error handling VoiceForge logic:', err);
        }
    });
};
