const { 
    EmbedBuilder, 
    MessageFlags, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    PermissionFlagsBits
} = require('discord.js');
const { getGuildConfig } = require('../services/guildConfig');
const { activeTempChannels } = require('../services/tempVoiceService');

function sendOwnerError(interaction, lang) {
    return interaction.reply({
        content: lang === 'tr' 
            ? '❌ Bu işlem için kanalın sahibi olmalısınız.' 
            : '❌ You must be the channel owner for this action.',
        flags: [MessageFlags.Ephemeral]
    });
}

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

        // ===== BUTTON 3: GİZLİLİK (tv_privacy) =====
        if (action === 'privacy') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const select = new StringSelectMenuBuilder()
                .setCustomId(`tv_select_privacy:${userVoiceChannelId}`)
                .setPlaceholder(lang === 'tr' ? 'Kanal Gizliliğini Seçin' : 'Select Channel Privacy')
                .addOptions(
                    { label: lang === 'tr' ? 'Herkese Açık' : 'Public', description: lang === 'tr' ? 'Herkes görebilir ve katılabilir.' : 'Everyone can view and connect.', value: 'public', emoji: '🔓' },
                    { label: lang === 'tr' ? 'Kilitli' : 'Locked', description: lang === 'tr' ? 'Herkes görebilir ama katılamaz.' : 'Everyone can view but cannot connect.', value: 'locked', emoji: '🔒' },
                    { label: lang === 'tr' ? 'Gizli' : 'Hidden', description: lang === 'tr' ? 'Sadece izin verilenler görebilir.' : 'Only allowed users can view.', value: 'hidden', emoji: '👻' }
                );
            return await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 4: BEKLEME ODASI (tv_waiting_room) =====
        if (action === 'waiting_room') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const vc = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);
            const currentEveryone = vc.permissionOverwrites.cache.get(interaction.guild.id);
            const isWaiting = currentEveryone?.deny.has(PermissionFlagsBits.Connect) && !currentEveryone?.deny.has(PermissionFlagsBits.ViewChannel);
            
            if (isWaiting) {
                await vc.permissionOverwrites.edit(interaction.guild.id, { Connect: null, ViewChannel: null });
                return await interaction.reply({ content: lang === 'tr' ? '🔓 Bekleme odası kapatıldı, kanal herkese açıldı.' : '🔓 Waiting room disabled, channel is now public.', flags: [MessageFlags.Ephemeral] });
            } else {
                await vc.permissionOverwrites.edit(interaction.guild.id, { Connect: false, ViewChannel: true });
                return await interaction.reply({ content: lang === 'tr' ? '⏳ Bekleme odası aktifleştirildi. Kullanıcılar sizi görebilir ama katılamaz.' : '⏳ Waiting room enabled. Users can view but cannot connect.', flags: [MessageFlags.Ephemeral] });
            }
        }

        // ===== BUTTON 5: SOHBET (tv_chat) =====
        if (action === 'chat') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const vc = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);
            const currentEveryone = vc.permissionOverwrites.cache.get(interaction.guild.id);
            const chatDenied = currentEveryone?.deny.has(PermissionFlagsBits.SendMessages);

            if (chatDenied) {
                await vc.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
                return await interaction.reply({ content: lang === 'tr' ? '💬 Metin sohbeti herkese açıldı.' : '💬 Text chat opened to everyone.', flags: [MessageFlags.Ephemeral] });
            } else {
                await vc.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                return await interaction.reply({ content: lang === 'tr' ? '🔇 Metin sohbeti kapatıldı.' : '🔇 Text chat closed.', flags: [MessageFlags.Ephemeral] });
            }
        }

        // ===== BUTTON 6 & 7: GÜVENİLİR & GÜVENSİZ (tv_trusted / tv_untrusted) =====
        if (action === 'trusted' || action === 'untrusted') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const isTrust = action === 'trusted';
            const select = new UserSelectMenuBuilder()
                .setCustomId(`tv_select_${action}:${userVoiceChannelId}`)
                .setPlaceholder(lang === 'tr' ? (isTrust ? 'Güvenilir eklenecek kişileri seçin' : 'Güvenilir listesinden çıkarılacakları seçin') : (isTrust ? 'Select users to trust' : 'Select users to untrust'))
                .setMinValues(1)
                .setMaxValues(5);
            return await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 8 & 9: ENGELLE & ENGELİ KALDIR (tv_block / tv_unblock) =====
        if (action === 'block' || action === 'unblock') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const isBlock = action === 'block';
            const select = new UserSelectMenuBuilder()
                .setCustomId(`tv_select_${action}:${userVoiceChannelId}`)
                .setPlaceholder(lang === 'tr' ? (isBlock ? 'Engellenecek kişileri seçin' : 'Engeli kaldırılacakları seçin') : (isBlock ? 'Select users to block' : 'Select users to unblock'))
                .setMinValues(1)
                .setMaxValues(5);
            return await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 10: SESTEN AT (tv_kick) =====
        if (action === 'kick') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const select = new UserSelectMenuBuilder()
                .setCustomId(`tv_select_kick:${userVoiceChannelId}`)
                .setPlaceholder(lang === 'tr' ? 'Sesten atılacak kişileri seçin' : 'Select users to kick')
                .setMinValues(1)
                .setMaxValues(5);
            return await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 11: BÖLGE (tv_region) =====
        if (action === 'region') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const select = new StringSelectMenuBuilder()
                .setCustomId(`tv_select_region:${userVoiceChannelId}`)
                .setPlaceholder(lang === 'tr' ? 'Ses Bölgesini Seçin' : 'Select Voice Region')
                .addOptions(
                    { label: 'Automatic', value: 'auto', emoji: '🌐' },
                    { label: 'Rotterdam', value: 'rotterdam', emoji: '🇳🇱' },
                    { label: 'Russia', value: 'russia', emoji: '🇷🇺' },
                    { label: 'Hong Kong', value: 'hongkong', emoji: '🇭🇰' },
                    { label: 'Brazil', value: 'brazil', emoji: '🇧🇷' },
                    { label: 'Sydney', value: 'sydney', emoji: '🇦🇺' },
                    { label: 'Japan', value: 'japan', emoji: '🇯🇵' },
                    { label: 'Singapore', value: 'singapore', emoji: '🇸🇬' },
                    { label: 'US Central', value: 'us-central', emoji: '🇺🇸' },
                    { label: 'US East', value: 'us-east', emoji: '🇺🇸' },
                    { label: 'US South', value: 'us-south', emoji: '🇺🇸' },
                    { label: 'US West', value: 'us-west', emoji: '🇺🇸' }
                );
            return await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 12: DAVET (tv_invite) =====
        if (action === 'invite') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const vc = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);
            const invite = await vc.createInvite({ maxAge: 86400, maxUses: 0 });
            return await interaction.reply({ content: lang === 'tr' ? `🔗 Davet Bağlantınız (24 saat geçerli):\n${invite.url}` : `🔗 Invite Link (Valid for 24h):\n${invite.url}`, flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 13: SAHİPLEN (tv_claim) =====
        if (action === 'claim') {
            const vc = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);
            if (channelInfo.ownerId === member.id) {
                return await interaction.reply({ content: lang === 'tr' ? '❌ Zaten bu kanalın sahibisiniz.' : '❌ You are already the owner.', flags: [MessageFlags.Ephemeral] });
            }
            if (vc.members.has(channelInfo.ownerId)) {
                return await interaction.reply({ content: lang === 'tr' ? '❌ Kanal sahibi hala odada bulunuyor. Sahiplenemezsiniz.' : '❌ The channel owner is still in the room. You cannot claim it.', flags: [MessageFlags.Ephemeral] });
            }
            
            const { updateOwnerPermissions } = require('../services/tempVoiceService');
            await updateOwnerPermissions(vc, member.id, channelInfo.creatorId, interaction.guildId);
            channelInfo.ownerId = member.id;
            
            return await interaction.reply({ content: lang === 'tr' ? '👑 Kanal sahipliğini başarıyla devraldınız!' : '👑 You have successfully claimed ownership of the channel!', flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 14: ODAYI DEVRET (tv_transfer) =====
        if (action === 'transfer') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const select = new UserSelectMenuBuilder()
                .setCustomId(`tv_select_transfer:${userVoiceChannelId}`)
                .setPlaceholder(lang === 'tr' ? 'Devredilecek kişiyi seçin' : 'Select user to transfer to')
                .setMinValues(1)
                .setMaxValues(1);
            return await interaction.reply({ components: [new ActionRowBuilder().addComponents(select)], flags: [MessageFlags.Ephemeral] });
        }

        // ===== BUTTON 15: SİL (tv_delete) =====
        if (action === 'delete') {
            if (!isOwner) return sendOwnerError(interaction, lang);
            const vc = interaction.guild.channels.cache.get(userVoiceChannelId) || await interaction.guild.channels.fetch(userVoiceChannelId).catch(() => null);
            await interaction.reply({ content: lang === 'tr' ? '🗑️ Kanal siliniyor...' : '🗑️ Channel is being deleted...', flags: [MessageFlags.Ephemeral] });
            await vc.delete().catch(() => {});
            return;
        }

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

/**
 * Handles select menu submissions for VoiceForge temporary channels (trust, block, kick, etc.)
 */
async function handleTempVoiceSelectMenu(interaction) {
    try {
        const guildId = interaction.guildId;
        const member = interaction.member;
        const config = await getGuildConfig(guildId);
        const lang = config?.language || 'tr';
        const creators = Array.isArray(config?.tempvoice_creators) ? config.tempvoice_creators : [];

        const [actionRaw, channelId] = interaction.customId.split(':');
        const action = actionRaw.replace('tv_select_', '');
        
        let channelInfo = await resolveChannelInfo(interaction.guild, channelId, member, creators);
        if (!channelInfo) {
            return await interaction.reply({ content: lang === 'tr' ? '❌ Bu geçici ses kanalı artık aktif değil.' : '❌ This temporary voice channel is no longer active.', flags: [MessageFlags.Ephemeral] });
        }
        
        if (channelInfo.ownerId !== member.id && action !== 'claim') {
            return sendOwnerError(interaction, lang);
        }

        const vc = interaction.guild.channels.cache.get(channelId) || await interaction.guild.channels.fetch(channelId).catch(() => null);
        if (!vc) {
            return await interaction.reply({ content: lang === 'tr' ? '❌ Ses kanalı bulunamadı.' : '❌ Voice channel not found.', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'privacy') {
            const mode = interaction.values[0];
            let perms = {};
            if (mode === 'public') perms = { ViewChannel: null, Connect: null };
            else if (mode === 'locked') perms = { ViewChannel: true, Connect: false };
            else if (mode === 'hidden') perms = { ViewChannel: false, Connect: false };
            
            await vc.permissionOverwrites.edit(interaction.guild.id, perms);
            return await interaction.reply({ content: lang === 'tr' ? `🔒 Kanal gizliliği başarıyla ayarlandı.` : `🔒 Channel privacy set successfully.`, flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'region') {
            const region = interaction.values[0];
            await vc.setRTCRegion(region === 'auto' ? null : region);
            return await interaction.reply({ content: lang === 'tr' ? `🌐 Kanal bölgesi başarıyla ayarlandı.` : `🌐 Channel region set successfully.`, flags: [MessageFlags.Ephemeral] });
        }

        const users = interaction.values;
        if (!users || users.length === 0) return;

        if (action === 'trusted') {
            for (const uId of users) {
                await vc.permissionOverwrites.edit(uId, { ViewChannel: true, Connect: true, Speak: true });
            }
            return await interaction.reply({ content: lang === 'tr' ? '✅ Seçilen kullanıcılar güvenilir listesine eklendi.' : '✅ Selected users trusted.', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'untrusted') {
            for (const uId of users) {
                await vc.permissionOverwrites.delete(uId).catch(() => {});
            }
            return await interaction.reply({ content: lang === 'tr' ? '❌ Seçilen kullanıcılar güvenilir listesinden çıkarıldı.' : '❌ Selected users untrusted.', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'block') {
            for (const uId of users) {
                await vc.permissionOverwrites.edit(uId, { ViewChannel: false, Connect: false });
                if (vc.members.has(uId)) {
                    const m = vc.members.get(uId);
                    await m.voice.disconnect().catch(() => {});
                }
            }
            return await interaction.reply({ content: lang === 'tr' ? '🚫 Seçilen kullanıcılar engellendi ve sesten atıldı.' : '🚫 Selected users blocked and kicked.', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'unblock') {
            for (const uId of users) {
                await vc.permissionOverwrites.delete(uId).catch(() => {});
            }
            return await interaction.reply({ content: lang === 'tr' ? '🔓 Seçilen kullanıcıların engeli kaldırıldı.' : '🔓 Selected users unblocked.', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'kick') {
            let kickedCount = 0;
            for (const uId of users) {
                if (vc.members.has(uId)) {
                    const m = vc.members.get(uId);
                    await m.voice.disconnect().catch(() => {});
                    kickedCount++;
                }
            }
            return await interaction.reply({ content: lang === 'tr' ? `📴 **${kickedCount}** kullanıcı sesten atıldı.` : `📴 **${kickedCount}** users kicked from voice.`, flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'transfer') {
            const newOwnerId = users[0];
            if (!vc.members.has(newOwnerId)) {
                return await interaction.reply({ content: lang === 'tr' ? '❌ Odayı devredeceğiniz kişi şu an ses kanalında değil!' : '❌ The user must be in the voice channel to transfer ownership.', flags: [MessageFlags.Ephemeral] });
            }
            const { updateOwnerPermissions } = require('../services/tempVoiceService');
            await vc.permissionOverwrites.delete(channelInfo.ownerId).catch(() => {});
            await updateOwnerPermissions(vc, newOwnerId, channelInfo.creatorId, interaction.guildId);
            channelInfo.ownerId = newOwnerId;
            return await interaction.reply({ content: lang === 'tr' ? '👑 Kanalın sahipliği başarıyla devredildi.' : '👑 Channel ownership successfully transferred.', flags: [MessageFlags.Ephemeral] });
        }

    } catch (err) {
        console.error('[VoiceForge] Error handling temp voice select menu:', err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'İşlem sırasında bir hata oluştu.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        }
    }
}

module.exports = {
    handleTempVoiceButtons,
    handleTempVoiceModal,
    handleTempVoiceSelectMenu
};
