const { createPartikurEmbed } = require('../builders/embedBuilder');
const { createCustomPartyComponents } = require('../builders/componentBuilder');
const { safeReply } = require('../utils/interactionUtils');
const { getActivePartyCount, setActiveParty } = require('../services/partyManager');
const { isWhitelisted } = require('../services/whitelistManager');
const { getPlayerInfo, formatFame } = require('../services/albionService');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const db = require('../services/db');
const { getGuildConfig } = require('../services/guildConfig');
const { t } = require('../services/i18n');
const { EMPTY_SLOT } = require('../constants/constants');


const { buildRolesFields, addFooterFields, createObjectiveEmbed, createPlayerCardEmbed } = require('../builders/embedBuilder');
const { createObjectiveButtons } = require('../builders/componentBuilder');
const { parseTimeToMs, getNow } = require('../utils/timeUtils');

async function handlePartiModal(interaction) {
    if (interaction.customId.startsWith('parti_modal:')) {
        const parts = interaction.customId.split(':');
        const type = parts[1] || 'genel';
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';
        const guildName = guildConfig?.guild_name || 'Albion';

        const userId = interaction.user.id;
        const whitelisted = await isWhitelisted(userId, interaction.guildId);
        const partyCount = getActivePartyCount(userId);

        const limit = whitelisted ? 3 : 1;

        if (partyCount >= limit) {
            let errorMsg = whitelisted
                ? `❌ **${t('party.limit_reached', lang)}**\n\n${t('party.limit_desc_whitelisted', lang)}`
                : `❌ **${t('party.already_active', lang)}**\n\n${t('party.limit_desc_normal', lang)}`;

            return await interaction.reply({
                content: errorMsg,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const header = interaction.fields.getTextInputValue('party_header');
        const rolesRaw = interaction.fields.getTextInputValue('party_roles');
        const description = interaction.fields.getTextInputValue('party_description') || '';

        // Split by newline and filter empty lines
        const rolesList = rolesRaw.split('\n')
            .map(r => r.trim())
            .filter(r => r.length > 0);

        // CREATE PAYLOAD
        const embed = createPartikurEmbed(header, rolesList, description, '', 0, interaction.guild, lang, userId, guildConfig?.embed_thumbnail_url);
        const rolesWithMembers = rolesList.map(role => ({ role, userId: null }));
        const components = createCustomPartyComponents(rolesList, userId, lang, rolesWithMembers);
        
        embed.addFields(...buildRolesFields(rolesWithMembers, lang, interaction.guild));


        const actualRoles = rolesList.filter(r => !r.startsWith('#HEADER:') && !r.startsWith('#'));
        addFooterFields(embed, 0, actualRoles.length, lang);

        const msg = await safeReply(interaction, { content: '@everyone', embeds: [embed], components: components });

        const msgId = msg?.id;
        const chanId = msg?.channelId || interaction.channelId;

        if (msgId) {
            setActiveParty(userId, msgId, chanId);

            // Informational vote reminder (Non-blocking)
            interaction.followUp({
                content: t('vote.info_reminder', lang),
                flags: [MessageFlags.Ephemeral]
            }).catch(() => { });

            // SAVE TO DB (Async/Non-blocking for the interaction response)
            (async () => {
                try {
                    const result = await db.run(
                        'INSERT INTO parties (message_id, channel_id, owner_id, type, title, party_time) VALUES (?, ?, ?, ?, ?, ?)',
                        [msgId, chanId, userId, type, header, null]
                    );
                    const partyDbId = result?.lastInsertRowid;

                    await db.run('INSERT INTO party_gear (message_id, gear_json) VALUES (?, ?)', [msgId, JSON.stringify(rolesList)]).catch(e => console.error('[ModalHandler] Gear save err:', e));

                    if (partyDbId) {
                        for (const role of rolesList) {
                            await db.run(
                                'INSERT INTO party_members (party_id, user_id, role, status) VALUES (?, ?, ?, ?)',
                                [partyDbId, null, role, 'joined']
                            );
                        }
                    }
                } catch (err) {
                    console.error('[ModalHandler] DB Error:', err.message);
                }
            })();
        }
    }
}

/**
 * Handles objective creation modal
 */
async function handleObjectiveModal(interaction) {
    if (interaction.customId === 'objective_create_modal') {
        try {
            const guildConfig = await getGuildConfig(interaction.guildId);
            const lang = guildConfig?.language || 'tr';
            const notifyChannelId = guildConfig?.objective_notify_channel_id;

            if (!notifyChannelId) {
                return await interaction.reply({
                    content: `❌ **${lang === 'tr' ? 'Bildirim kanalı ayarlanmamış!' : 'Notification channel is not set!'}**`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const map = interaction.fields.getTextInputValue('obj_map');
            const event = interaction.fields.getTextInputValue('obj_event');
            const sure = interaction.fields.getTextInputValue('obj_time');

            const durationMs = parseTimeToMs(sure);
            if (!durationMs) {
                return await interaction.reply({
                    content: `❌ **${lang === 'tr' ? 'Geçersiz süre formatı! Örn: 15, 15m, 2h, 1h 30m' : 'Invalid time format! E.g.: 15, 15m, 2h, 1h 30m'}**`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const expiresAt = new Date(getNow().getTime() + durationMs);
            const reminderSent = durationMs <= 5 * 60000 ? 1 : 0;
            const channel = await interaction.client.channels.fetch(notifyChannelId).catch(() => null);

            if (!channel) {
                return await interaction.reply({
                    content: `❌ **${lang === 'tr' ? 'Bildirim kanalı bulunamadı veya botun erişimi yok!' : 'Notification channel not found or bot lacks access!'}**`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const embed = createObjectiveEmbed(map, event, expiresAt.getTime());
            
            // Send message
            const message = await channel.send({
                content: '@everyone',
                embeds: [embed]
            }).catch(err => {
                throw new Error(`Kanal mesajı gönderilemedi: ${err.message}`);
            });

            // Save to DB
            try {
                await db.run(
                    'INSERT INTO objectives (guild_id, channel_id, message_id, map_name, event_name, expires_at, reminder_sent) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [interaction.guildId, notifyChannelId, message.id, map, event, expiresAt.toISOString(), reminderSent]
                );
            } catch (dbErr) {
                console.error('[ModalHandler] DB Insert Error:', dbErr);
                // We still sent the message, so we continue but log the error
            }

            // Add reaction
            await message.react('💪').catch(() => { });

            return await interaction.reply({
                content: `✅ **Objektif bildirim kanalına gönderildi!** <#${notifyChannelId}>`,
                flags: [MessageFlags.Ephemeral]
            });
        } catch (error) {
            console.error('[ModalHandler] Objective Modal Error:', error);
            return await interaction.reply({
                content: `❌ **Hata:** ${error.message}`,
                flags: [MessageFlags.Ephemeral]
            }).catch(() => { });
        }
    }
}


/**
 * Handles registration modal submission
 */
async function handleRegisterModal(interaction) {
    if (interaction.customId === 'register_modal') {
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';
        
        let realName = '';
        let ign = '';
        try {
            realName = interaction.fields.getTextInputValue('real_name');
            ign = interaction.fields.getTextInputValue('ingame_name');
        } catch (e) {
            // Fallback for older modal versions if they existed
            ign = interaction.fields.getTextInputValue('register_ign');
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            // 1. Fetch Albion Info
            const playerData = await getPlayerInfo(ign);
            if (!playerData) {
                return await interaction.editReply({
                    content: `❌ **${lang === 'tr' ? 'Oyuncu bulunamadı! Lütfen ismin büyük/küçük harf duyarlı olduğuna dikkat edin.' : 'Player not found! Please ensure the name is case-sensitive.'}**`
                });
            }

            // 2. Create Ticket Channel
            const categoryId = guildConfig?.registration_category_id;
            const staffRoles = guildConfig?.registration_staff_role_ids?.split(',') || [];
            
            const permissionOverwrites = [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
            ];

            staffRoles.forEach(roleId => {
                if (roleId) permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
            });

            // Channel name format: ingamename-realname
            const channelName = realName ? `${ign.toLowerCase()}-${realName.toLowerCase().replace(/\s+/g, '-')}` : `basvuru-${ign.toLowerCase()}`;

            let channel;
            try {
                channel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: categoryId || null,
                    permissionOverwrites
                });
            } catch (chanErr) {
                if (chanErr.code === 50013) {
                    return await interaction.editReply({
                        content: `❌ **${lang === 'tr' ? 'Yetki Hatası: Botun bu sunucuda "Kanalları Yönet" yetkisi bulunmuyor!' : 'Permission Error: Bot lacks "Manage Channels" permission in this server!'}**`
                    });
                }
                throw chanErr;
            }

            // 3. Send Player Card
            const embed = createPlayerCardEmbed(playerData, lang);
            if (realName) {
                embed.addFields({ name: '📝 Gerçek İsim', value: realName, inline: true });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`reg_approve_${interaction.user.id}`).setLabel(lang === 'tr' ? 'Onayla' : 'Approve').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`reg_reject_${interaction.user.id}`).setLabel(lang === 'tr' ? 'Reddet' : 'Reject').setStyle(ButtonStyle.Danger)
            );

            // Ping staff if configured
            const staffPings = staffRoles.filter(r => r).map(r => `<@&${r}>`).join(' ');
            
            await channel.send({
                content: `🔔 **${lang === 'tr' ? 'Yeni Kayıt Başvurusu!' : 'New Registration Application!'}** <@${interaction.user.id}> ${staffPings}`,
                embeds: [embed],
                components: [row]
            });

            return await interaction.editReply({
                content: `✅ **${lang === 'tr' ? 'Başvurunuz alındı! Kanal açıldı:' : 'Application received! Channel created:'}** <#${channel.id}>`
            });

        } catch (error) {
            console.error('[RegistrationModal] Error:', error);
            return await interaction.editReply({
                content: `❌ **${lang === 'tr' ? 'Bir hata oluştu!' : 'An error occurred!'}**`
            });
        }
    }
}

module.exports = {
    handlePartiModal,
    handleObjectiveModal,
    handleRegisterModal
};
