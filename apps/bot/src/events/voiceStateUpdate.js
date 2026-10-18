const { getGuildConfig } = require('../services/guildConfig');
const { handleCreatorJoin, handleTempChannelLeave } = require('../services/tempVoiceService');

module.exports = async (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        try {
            // Kullanıcı kanal değiştirmediyse (mute, deafen, stream, konuşma vb.) işlem yapma
            if (oldState.channelId === newState.channelId) {
                return;
            }

            const member = newState.member || oldState.member;

            // Check if user left a temp channel (non-blocking so join is instant)
            if (oldState.channelId && oldState.channelId !== newState.channelId) {
                handleTempChannelLeave(oldState).catch(err => {
                    console.error('[VoiceForge] Error in handleTempChannelLeave:', err.message || err);
                });
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
                            await handleCreatorJoin(newState, creatorConfig);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('[voiceStateUpdate] Error handling VoiceForge logic:', err.message || err);
        }
    });
};
