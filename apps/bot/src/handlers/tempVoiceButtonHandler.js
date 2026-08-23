const { EmbedBuilder, MessageFlags } = require('discord.js');
const { getGuildConfig } = require('../services/guildConfig');
const { activeTempChannels } = require('../services/tempVoiceService');

/**
 * Handles clicks on all VoiceForge interface buttons (tv_name, tv_limit, tv_privacy, etc.)
 */
async function handleTempVoiceButtons(interaction) {
    try {
        const guildId = interaction.guildId;
        const member = interaction.member;
        const userVoiceChannelId = member?.voice?.channelId;

        // 1. Fetch server language & creator settings
        const config = await getGuildConfig(guildId);
        const lang = config?.language || 'tr';
        const creators = Array.isArray(config?.tempvoice_creators) ? config.tempvoice_creators : [];

        // 2. Check if user is currently inside an active VoiceForge temporary channel
        const isInsideTempChannel = userVoiceChannelId && activeTempChannels.has(userVoiceChannelId);

        if (!isInsideTempChannel) {
            // Build creator voice channel clickable mentions: <#123456789>
            let creatorMentions = '';
            if (creators.length > 0) {
                creatorMentions = creators
                    .map(c => `🔊 <#${c.channelId}>`)
                    .join('\n');
            }

            const title = lang === 'tr' ? 'Dikkat!' : 'Attention!';
            let desc = '';

            if (lang === 'tr') {
                desc = `**VoiceForge** tarafından oluşturulan geçici bir ses kanalında değilsin.\n\nİlk önce aşağıdaki ses kanalı veya kanallarından birine katılarak **geçici bir ses kanalı oluşturun**:\n${creatorMentions || '*(Sunucuda henüz bir ses kanalı oluşturucu ayarlanmamış)*'}`;
            } else {
                desc = `You are not in a temporary voice channel created by **VoiceForge**.\n\nFirst, join one of the voice channels below to **create a temporary voice channel**:\n${creatorMentions || '*(No voice channel creator configured yet)*'}`;
            }

            const warnEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(desc)
                .setColor(0xFF3366);

            return await interaction.reply({
                embeds: [warnEmbed],
                flags: [MessageFlags.Ephemeral]
            });
        }

        // 3. User IS in an active temp channel: Check if they are the owner
        const channelInfo = activeTempChannels.get(userVoiceChannelId);
        const isOwner = channelInfo && channelInfo.ownerId === member.id;
        const action = interaction.customId.replace('tv_', '');

        // Temporary placeholder reply for active channel users (until specific modal/actions are plugged in)
        const okEmbed = new EmbedBuilder()
            .setColor(0x22C55E)
            .setDescription(
                lang === 'tr'
                    ? `🎧 **<#${userVoiceChannelId}>** odasındasınız. (${action}) işlemi işleniyor...`
                    : `🎧 You are inside **<#${userVoiceChannelId}>**. Processing (${action})...`
            );

        return await interaction.reply({
            embeds: [okEmbed],
            flags: [MessageFlags.Ephemeral]
        });

    } catch (err) {
        console.error('[VoiceForge] Error handling temp voice button interaction:', err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'İşlem sırasında bir hata oluştu.',
                flags: [MessageFlags.Ephemeral]
            }).catch(() => {});
        }
    }
}

module.exports = {
    handleTempVoiceButtons
};
