const { 
    EmbedBuilder, 
    MessageFlags, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');
const { getGuildConfig } = require('../services/guildConfig');
const { activeTempChannels } = require('../services/tempVoiceService');

/**
 * Helper to resolve active temporary voice channel info with auto-recovery across bot reboots
 */
async function resolveChannelInfo(guild, userVoiceChannelId, member, creators) {
    if (!userVoiceChannelId) return null;
    
    let channelInfo = activeTempChannels.get(userVoiceChannelId);
    if (channelInfo) return channelInfo;

    // Auto-recovery if bot restarted
    try {
        const voiceChannel = guild.channels.cache.get(userVoiceChannelId) || await guild.channels.fetch(userVoiceChannelId).catch(() => null);
        if (voiceChannel) {
            // Check if it belongs to one of the creator categories
            const matchedCreator = creators.find(c => 
                (c.categoryId && voiceChannel.parentId === c.categoryId) ||
                (c.channelId && voiceChannel.parentId && voiceChannel.parentId === guild.channels.cache.get(c.channelId)?.parentId)
            );

            if (matchedCreator || (creators.length > 0 && voiceChannel.parentId)) {
                // Find member-specific permission overwrite (the room owner)
                const memberOverwrite = voiceChannel.permissionOverwrites.cache.find(ow => ow.type === 1);
                const ownerId = memberOverwrite ? memberOverwrite.id : member.id;
                
                channelInfo = {
                    ownerId: ownerId,
                    creatorId: matchedCreator ? matchedCreator.id : creators[0]?.id,
                    count: 1
                };
                activeTempChannels.set(userVoiceChannelId, channelInfo);
                return channelInfo;
            }
        }
    } catch (e) {
        console.error('[VoiceForge] Error during channel auto-recovery:', e);
    }
    return null;
}

/**
 * Handles clicks on all VoiceForge interface buttons (tv_name, tv_limit, tv_privacy, etc.)
 */
async function handleTempVoiceButtons(interaction) {
    try {
        const guildId = interaction.guildId;
        
        // 1. Reliably resolve guild member with voice state
        let member = interaction.member;
        if (!member || !member.voice || !member.voice.channelId) {
            member = await interaction.guild.members.fetch(interaction.user.id).catch(() => interaction.member);
        }
        const userVoiceChannelId = member?.voice?.channelId;

        // 2. Fetch server language & creator settings
        const config = await getGuildConfig(guildId);
        const lang = config?.language || 'tr';
        const creators = Array.isArray(config?.tempvoice_creators) ? config.tempvoice_creators : [];

        // 3. Resolve temporary channel info
        const channelInfo = await resolveChannelInfo(interaction.guild, userVoiceChannelId, member, creators);
        const isInsideTempChannel = !!channelInfo;

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

        // 4. User IS in an active temp channel: Check if they are the owner
        const isOwner = channelInfo && channelInfo.ownerId === member.id;
        const action = interaction.customId
            .replace('tv_', '')
            .replace('tempvoice_', '')
            .replace('voice_', '');

        // ===== BUTTON 1: ODA İSMİ DEĞİŞTİRME (tv_name) =====
        if (action === 'name') {
            if (!isOwner) {
                return await interaction.reply({
                    content: lang === 'tr'
                        ? '❌ Bu ses kanalının sahibi değilsiniz. Kanal ismini sadece kanal sahibi değiştirebilir.'
                        : '❌ You are not the owner of this voice channel. Only the channel owner can change the channel name.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const voiceChannel = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);

            const modal = new ModalBuilder()
                .setCustomId(`tv_modal_name:${userVoiceChannelId}`)
                .setTitle(lang === 'tr' ? 'Oda İsmini Değiştir' : 'Change Channel Name');

            const nameInput = new TextInputBuilder()
                .setCustomId('tv_input_name')
                .setLabel(lang === 'tr' ? 'Yeni Oda İsmi' : 'New Channel Name')
                .setPlaceholder(lang === 'tr' ? 'Örn: 🎮 Oyun Odası' : 'e.g. 🎮 Gaming Room')
                .setValue(voiceChannel?.name || '')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
            return await interaction.showModal(modal);
        }

        // ===== BUTTON 2: ODA LİMİTİ AYARLAMA (tv_limit) =====
        if (action === 'limit') {
            if (!isOwner) {
                return await interaction.reply({
                    content: lang === 'tr'
                        ? '❌ Bu ses kanalının sahibi değilsiniz. Oda limitini sadece kanal sahibi değiştirebilir.'
                        : '❌ You are not the owner of this voice channel. Only the channel owner can change the user limit.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const voiceChannel = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);
            const currentLimit = voiceChannel?.userLimit ? String(voiceChannel.userLimit) : '0';

            const modal = new ModalBuilder()
                .setCustomId(`tv_modal_limit:${userVoiceChannelId}`)
                .setTitle(lang === 'tr' ? 'Oda Limitini Ayarla' : 'Set User Limit');

            const limitInput = new TextInputBuilder()
                .setCustomId('tv_input_limit')
                .setLabel(lang === 'tr' ? 'Kullanıcı Limiti (0 - 99)' : 'User Limit (0 - 99)')
                .setPlaceholder('0 = Sınırsız / Unlimited (0 - 99)')
                .setValue(currentLimit)
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(2)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(limitInput));
            return await interaction.showModal(modal);
        }

        // Placeholder for other buttons as they get implemented step-by-step
        return await interaction.reply({
            content: lang === 'tr'
                ? `⚙️ **${action}** butonu özelliği hazırlanıyor...`
                : `⚙️ **${action}** button feature is being prepared...`,
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

/**
 * Handles modal submissions for VoiceForge temporary channels (renaming, user limit, etc.)
 */
async function handleTempVoiceModal(interaction) {
    try {
        const guildId = interaction.guildId;
        const member = interaction.member;
        const config = await getGuildConfig(guildId);
        const lang = config?.language || 'tr';
        const creators = Array.isArray(config?.tempvoice_creators) ? config.tempvoice_creators : [];

        // 1. ODA İSMİ MODAL
        if (interaction.customId.startsWith('tv_modal_name:')) {
            const channelId = interaction.customId.split(':')[1];
            let channelInfo = await resolveChannelInfo(interaction.guild, channelId, member, creators);

            if (!channelInfo) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Bu geçici ses kanalı artık aktif değil.' : '❌ This temporary voice channel is no longer active.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (channelInfo.ownerId !== member.id) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Bu ses kanalının sahibi değilsiniz.' : '❌ You are not the owner of this voice channel.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const newName = interaction.fields.getTextInputValue('tv_input_name')?.trim();
            if (!newName) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Lütfen geçerli bir kanal ismi girin.' : '❌ Please enter a valid channel name.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const voiceChannel = interaction.guild.channels.cache.get(channelId) || await interaction.guild.channels.fetch(channelId).catch(() => null);
            if (!voiceChannel) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Ses kanalı bulunamadı.' : '❌ Voice channel not found.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            try {
                await voiceChannel.setName(newName, `VoiceForge: ${member.user.tag} changed channel name`);

                const successEmbed = new EmbedBuilder()
                    .setColor(0x22C55E)
                    .setDescription(
                        lang === 'tr'
                            ? `✅ Ses kanalınızın ismi başarıyla **${newName}** olarak değiştirildi.`
                            : `✅ Voice channel name has been successfully changed to **${newName}**.`
                    );

                return await interaction.reply({
                    embeds: [successEmbed],
                    flags: [MessageFlags.Ephemeral]
                });
            } catch (editErr) {
                console.error('[VoiceForge] Failed to rename voice channel:', editErr);
                return await interaction.reply({
                    content: lang === 'tr'
                        ? '⚠️ Discord sınırlandırması nedeniyle kanal ismi 10 dakika içinde en fazla 2 kez değiştirilebilir. Lütfen biraz bekleyip tekrar deneyin.'
                        : '⚠️ Due to Discord rate limits, channel names can only be renamed twice every 10 minutes. Please wait and try again later.',
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }

        // 2. ODA LİMİTİ MODAL
        if (interaction.customId.startsWith('tv_modal_limit:')) {
            const channelId = interaction.customId.split(':')[1];
            let channelInfo = await resolveChannelInfo(interaction.guild, channelId, member, creators);

            if (!channelInfo) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Bu geçici ses kanalı artık aktif değil.' : '❌ This temporary voice channel is no longer active.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (channelInfo.ownerId !== member.id) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Bu ses kanalının sahibi değilsiniz.' : '❌ You are not the owner of this voice channel.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const rawLimit = interaction.fields.getTextInputValue('tv_input_limit')?.trim();
            if (!rawLimit || !/^\d+$/.test(rawLimit)) {
                return await interaction.reply({
                    content: lang === 'tr'
                        ? '❌ Lütfen sadece 0 ile 99 arasında bir rakam girin.'
                        : '❌ Please enter a valid number between 0 and 99 only.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const limit = parseInt(rawLimit, 10);
            if (isNaN(limit) || limit < 0 || limit > 99) {
                return await interaction.reply({
                    content: lang === 'tr'
                        ? '❌ Limit 0 (Sınırsız) ile 99 arasında olmalıdır.'
                        : '❌ Limit must be between 0 (Unlimited) and 99.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const voiceChannel = interaction.guild.channels.cache.get(channelId) || await interaction.guild.channels.fetch(channelId).catch(() => null);
            if (!voiceChannel) {
                return await interaction.reply({
                    content: lang === 'tr' ? '❌ Ses kanalı bulunamadı.' : '❌ Voice channel not found.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            try {
                await voiceChannel.setUserLimit(limit, `VoiceForge: ${member.user.tag} changed user limit`);

                const successEmbed = new EmbedBuilder()
                    .setColor(0x22C55E)
                    .setDescription(
                        limit === 0
                            ? (lang === 'tr' ? '✅ Ses kanalınızın kişi limiti kaldırıldı (**Sınırsız** yapıldı).' : '✅ Voice channel user limit has been removed (**Unlimited**).')
                            : (lang === 'tr' ? `✅ Ses kanalınızın kişi limiti **${limit}** kişi olarak ayarlandı.` : `✅ Voice channel user limit has been set to **${limit}** users.`)
                    );

                return await interaction.reply({
                    embeds: [successEmbed],
                    flags: [MessageFlags.Ephemeral]
                });
            } catch (editErr) {
                console.error('[VoiceForge] Failed to update user limit:', editErr);
                return await interaction.reply({
                    content: lang === 'tr'
                        ? '❌ Limit ayarlanırken bir hata oluştu.'
                        : '❌ An error occurred while setting user limit.',
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }

    } catch (err) {
        console.error('[VoiceForge] Error handling temp voice modal submit:', err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'İşlem sırasında bir hata oluştu.',
                flags: [MessageFlags.Ephemeral]
            }).catch(() => {});
        }
    }
}

module.exports = {
    handleTempVoiceButtons,
    handleTempVoiceModal
};
