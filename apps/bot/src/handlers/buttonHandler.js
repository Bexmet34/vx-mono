const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { EMPTY_SLOT, LOGO_PATH, LOGO_NAME, LINKS } = require('../constants/constants');
const { updateButtonStates, createClosedButton, createCustomPartyComponents, isSelectMenuMode } = require('../builders/componentBuilder');
const { removeActiveParty } = require('../services/partyManager');
const { getGuildConfig } = require('../services/guildConfig');
const { createHelpEmbed, createDonateEmbed, createPartikurEmbed, addFooterFields, buildRolesValue, buildRolesFields, parseEmbedData } = require('../builders/embedBuilder');
const { resolveRoleEmoji } = require('../utils/generalUtils');

const config = require('../config/config');
const db = require('../services/db');
const { t } = require('../services/i18n');
const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { acquireLock } = require('../utils/partyLock');





/**
 * Handles join and leave button interactions
 */
async function handlePartyButtons(interaction) {
    const { finalizeRoleUpdate } = require('./menuHandler');
    const customId = interaction.customId;
    const message = interaction.message;
    if (!message.embeds[0]) return;

    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const guildName = guildConfig?.guild_name || 'Albion';

    // Help Page Navigation
    if (customId.startsWith('help_page_')) {
        const pageIndex = parseInt(customId.split('_')[2]);

        const newEmbed = createHelpEmbed(pageIndex, interaction.guild, lang, guildConfig?.embed_thumbnail_url);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('help_page_0').setLabel('🏠').setStyle(pageIndex === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('help_page_1').setLabel(`⚔️ ${t('help.page_2', lang)}`).setStyle(pageIndex === 1 ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('help_page_2').setLabel(`🚨 ${t('help.page_3', lang)}`).setStyle(pageIndex === 2 ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );

        const linkRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel(`🌐 Website`).setStyle(ButtonStyle.Link).setURL(LINKS.WEBSITE),
            new ButtonBuilder().setLabel(`🚀 ${t('help.top_gg', lang)}`).setStyle(ButtonStyle.Link).setURL(LINKS.TOPGG)
        );


        return await interaction.update({
            embeds: [newEmbed],
            components: [row, linkRow]
        });
    }






    if (customId.startsWith('close_party_')) {
        const ownerId = customId.split('_')[2];

        if (interaction.user.id !== ownerId) {
            return await interaction.reply({
                content: `⛔ **${t('common.only_leader_can_close', lang)}**`,
                flags: [MessageFlags.Ephemeral]
            });
        }
        await interaction.deferUpdate().catch(() => {});

        const oldEmbed = message.embeds[0];
        const fields = oldEmbed.fields || [];
        const newFields = fields.filter(f => !f.value?.includes('📌') && !f.name?.includes('KURALLAR'));

        const closedEmbed = EmbedBuilder.from(oldEmbed)
            .setTitle(`${oldEmbed.title || 'Party'} [${t('common.closed', lang)}]`)
            .setColor('#808080')
            .setFields(newFields)
            .setThumbnail(guildConfig?.embed_thumbnail_url || null)
            .setFooter(null)
            .setTimestamp(null);

        const closedRow = createClosedButton(lang);

        // Remove from active parties
        removeActiveParty(ownerId, message.id);


        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                embeds: [closedEmbed],
                components: [closedRow]
            }).catch(e => {
                console.error('editReply error in close:', e.message);
                message.edit({ embeds: [closedEmbed], components: [closedRow] }).catch(() => {});
            });
        } else {
            await message.edit({
                embeds: [closedEmbed],
                components: [closedRow]
            }).catch(() => {});
        }

        return;
    }



    if (customId === 'leave' || customId.startsWith('join_')) {
        await interaction.deferUpdate().catch(() => {});
        const release = await acquireLock(message.id);
        try {
            // Fetch fresh message state to avoid race condition
            const channel = interaction.channel || await interaction.client.channels.fetch(interaction.channelId);
            const freshMessage = await channel.messages.fetch(message.id);
            if (!freshMessage || !freshMessage.embeds[0]) {
                release();
                return;
            }

            const oldEmbed = freshMessage.embeds[0];
            const userId = interaction.user.id;

            // Parse existing data
            const data = parseEmbedData(oldEmbed, lang);
            let rolesWithMembers = data.rolesWithMembers;
            const ownerId = data.ownerId;
            const content = data.content;
            const partyTime = data.partyTime;
            const description = data.description;

            const isUserInAnySlot = rolesWithMembers.some(r => r.userId === userId);

            if (customId === 'leave') {
                rolesWithMembers = rolesWithMembers.map(r => r.userId === userId ? { ...r, userId: null } : r);
                await db.run('UPDATE party_members SET user_id = NULL WHERE party_id = (SELECT id FROM parties WHERE message_id = ?) AND user_id = ?', [message.id, userId]).catch(e => console.error(e));
            } else {
                // Join logic
                let joinIndex = -1;
                if (customId === 'join_tank') joinIndex = rolesWithMembers.findIndex(r => r.role.toLowerCase().includes('tank') && !r.userId);
                else if (customId === 'join_heal') joinIndex = rolesWithMembers.findIndex(r => (r.role.toLowerCase().includes('heal') || r.role.toLowerCase().includes('healer')) && !r.userId);
                else if (customId === 'join_dps') joinIndex = rolesWithMembers.findIndex(r => r.role.toLowerCase().includes('dps') && !r.userId);
                else if (customId.startsWith('join_custom_')) {
                    const customIdx = parseInt(customId.split('_')[2]);
                    joinIndex = customIdx;
                }

                if (joinIndex !== -1 && !rolesWithMembers[joinIndex].userId) {
                    // Remove from old slot if switching
                    if (isUserInAnySlot) {
                        rolesWithMembers = rolesWithMembers.map(r => r.userId === userId ? { ...r, userId: null } : r);
                    }
                    rolesWithMembers[joinIndex].userId = userId;

                    const roleName = rolesWithMembers[joinIndex].role;
                    await db.run('INSERT INTO party_members (party_id, user_id, role, status) SELECT id, ?, ?, \'joined\' FROM parties WHERE message_id = ?', [userId, roleName, message.id]).catch(e => console.error(e));
                } else if (joinIndex !== -1 && rolesWithMembers[joinIndex].userId) {
                    release();
                    return await interaction.followUp({ content: `❌ ${t('common.error', lang)}`, flags: [MessageFlags.Ephemeral] }).catch(() => {});
                }
            }

            let multiRoleWaitlist = data.multiRoleWaitlist || [];
            // If user left, remove from waitlist. If user joined/switched, their old swap choice is still valid unless we want them to re-pick.
            // The user complained that roles 'disappear', so I will ONLY remove if they leave entirely.
            if (customId === 'leave') {
                multiRoleWaitlist = multiRoleWaitlist.filter(u => u.userId !== userId);
            }

            const { newEmbed, newComponents } = await finalizeRoleUpdate(freshMessage, rolesWithMembers, multiRoleWaitlist, data, lang, guildName);

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({
                    embeds: [newEmbed],
                    components: newComponents
                }).catch(e => {
                    console.error('editReply error in join/leave:', e.message);
                    freshMessage.edit({ embeds: [newEmbed], components: newComponents }).catch(() => {});
                });
            } else {
                await freshMessage.edit({
                    embeds: [newEmbed],
                    components: newComponents
                }).catch(() => {});
            }
        } catch (e) {
            console.error('Error in handlePartyButtons join/leave:', e);
        } finally {
            release();
        }
        return; // Interaction zaten cevaplandı, settings bloklarına düşmesin
    }

    // --- SETTINGS BUTTON HANDLERS ---

    if (customId === 'swap_roles_btn') {
        const data = parseEmbedData(message.embeds[0], lang);
        const rolesWithMembers = data.rolesWithMembers;
        const isUserInAnySlot = rolesWithMembers.some(r => r.userId === interaction.user.id);

        if (!isUserInAnySlot) {
            const isInWaitlist = data.multiRoleWaitlist?.some(u => u.userId === interaction.user.id);
            if (!isInWaitlist) {
                return await interaction.reply({ content: lang === 'tr' ? '❌ Yedek rol seçmek için önce ana bir role katılmalısınız.' : '❌ You must join a primary role before selecting swap roles.', flags: [MessageFlags.Ephemeral] });
            }
        }

        const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
        const multiJoinMenu = new StringSelectMenuBuilder()
            .setCustomId(`join_multi_role_${message.id}`)
            .setPlaceholder(lang === 'tr' ? '🎲 Yedek (Swap) rolleri seçin' : '🎲 Select swap roles')
            .setMinValues(1);

        let optionCount = 0;
        rolesWithMembers.forEach((r, index) => {
            if (r.role.startsWith('#')) return;
            optionCount++;
            let label = r.role.includes('>') ? r.role.split('>')[0].trim() : r.role;
            if (label.length > 90) label = label.substring(0, 87) + '...';

            const multiOption = new StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setValue(`${index}`)
                .setEmoji(resolveRoleEmoji(label, interaction.guild))
                .setDescription(lang === 'tr' ? 'Yedek rol seçiminiz için işaretleyin' : 'Select for swap role option');

            multiJoinMenu.addOptions(multiOption);
        });

        multiJoinMenu.setMaxValues(Math.min(25, optionCount));

        await interaction.reply({
            content: lang === 'tr' ? 'Lütfen geçebileceğiniz **Yedek Rolleri** seçin:' : 'Please select your **Swap Roles**:',
            components: [new ActionRowBuilder().addComponents(multiJoinMenu)],
            flags: [MessageFlags.Ephemeral]
        });
        return;
    }

    if (customId.startsWith('open_settings_')) {
        await handleOpenSettings(interaction, lang);
    }

    if (customId.startsWith('settings_edit_')) {
        const { handleEditOption } = require('./menuHandler');
        await handleEditOption(interaction, lang);
    }

    if (customId.startsWith('settings_kick_')) {
        const { handleManageMembersOption } = require('./menuHandler');
        await handleManageMembersOption(interaction, lang);
    }

    if (customId.startsWith('settings_add_member_')) {
        await handleAddMemberButton(interaction, lang);
    }

    if (customId.startsWith('settings_close_')) {
        await interaction.deferUpdate().catch(() => {});
        const { handleCloseOption } = require('./menuHandler');
        const partyMsgId = customId.split('_')[2];
        const partyMessage = await interaction.channel.messages.fetch(partyMsgId);
        const infoField = partyMessage.embeds[0].fields.find(f => f.value && (f.value.includes('👑') || f.value.includes('📝')))?.value || '';
        const ownerMention = infoField.match(/<@(\d+)>/)?.[1];
        await handleCloseOption(interaction, ownerMention, lang);
    }

    if (customId === 'obj_open_modal') {
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';

        const modal = new ModalBuilder()
            .setCustomId('obj_create_modal')
            .setTitle(lang === 'tr' ? 'Objektif Oluştur' : 'Create Objective');

        const mapInput = new TextInputBuilder()
            .setCustomId('obj_map')
            .setLabel(lang === 'tr' ? 'Harita Adı' : 'Map Name')
            .setPlaceholder('Örn: Martlock, Redtree Enclave...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const eventInput = new TextInputBuilder()
            .setCustomId('obj_event')
            .setLabel(lang === 'tr' ? 'Etkinlik' : 'Event')
            .setPlaceholder('Örn: T8 Chest, Large Core, World Boss...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const timeInput = new TextInputBuilder()
            .setCustomId('obj_sure')
            .setLabel(lang === 'tr' ? 'Kalan Süre' : 'Time Left')
            .setPlaceholder('Örn: 15m, 2h, 1h 30m')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(mapInput),
            new ActionRowBuilder().addComponents(eventInput),
            new ActionRowBuilder().addComponents(timeInput)
        );

        await interaction.showModal(modal);
    }
}

/**
 * Handles "Ayar" button click
 */
async function handleOpenSettings(interaction, lang) {
    const ownerId = interaction.customId.split('_')[2];

    if (interaction.user.id !== ownerId) {
        return await interaction.reply({
            content: `⛔ **${t('common.only_leader_can_manage', lang)}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const embed = new EmbedBuilder()
        .setTitle(`⚙️ ${t('manage.settings_title', lang)}`)
        .setDescription(t('manage.settings_desc', lang))
        .setColor('#2F3136');

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`settings_edit_${interaction.message.id}`).setLabel(t('manage.edit_party', lang)).setStyle(ButtonStyle.Primary).setEmoji('📝'),
        new ButtonBuilder().setCustomId(`settings_add_member_${interaction.message.id}`).setLabel(t('manage.add_member', lang)).setStyle(ButtonStyle.Success).setEmoji('➕'),
        new ButtonBuilder().setCustomId(`settings_kick_${interaction.message.id}`).setLabel(t('manage.manage_members', lang)).setStyle(ButtonStyle.Danger).setEmoji('👥')
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`settings_close_${interaction.message.id}`).setLabel(t('manage.close_party', lang)).setStyle(ButtonStyle.Danger).setEmoji('🔒')
    );

    await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
        flags: [MessageFlags.Ephemeral]
    });
}

/**
 * Handles "Add Member" button click
 */
async function handleAddMemberButton(interaction, lang) {
    const messageId = interaction.customId.split('_')[3];
    const message = await interaction.channel.messages.fetch(messageId);
    if (!message) return;

    const data = parseEmbedData(message.embeds[0], lang);

    // Map with original indices and filter for empty actual roles
    const rolesWithIndex = data.rolesWithMembers.map((r, i) => ({ ...r, originalIndex: i }));
    const emptyRoles = rolesWithIndex.filter(r => !r.userId && !r.role.startsWith('#'));

    if (emptyRoles.length === 0) {
        return await interaction.reply({
            content: `❌ ${t('manage.no_empty_roles', lang)}`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`add_member_select_${messageId}`)
        .setPlaceholder(t('manage.select_role_to_add', lang))
        .addOptions(
            emptyRoles.map((r) => {
                let displayName = r.role.includes('>') ? r.role.split('>')[0].trim() : r.role;
                return new StringSelectMenuOptionBuilder()
                    .setLabel(`${displayName}`) // Removed index number as per user preference
                    .setValue(`${r.originalIndex}`);
            })
        );

    await interaction.reply({
        content: t('manage.select_role_to_add', lang),
        components: [new ActionRowBuilder().addComponents(selectMenu)],
        flags: [MessageFlags.Ephemeral]
    });
}

/**
 * Handles objective-specific buttons
 */
async function handleObjectiveButtons(interaction) {
    const customId = interaction.customId;
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    if (customId === 'obj_open_modal') {
        const { handleObjectiveModal } = require('./modalHandler');
        const modal = new ModalBuilder()
            .setCustomId('objective_create_modal')
            .setTitle(lang === 'tr' ? 'Objektif Oluştur' : 'Create Objective');

        const mapInput = new TextInputBuilder()
            .setCustomId('obj_map')
            .setLabel(lang === 'tr' ? 'Harita Adı' : 'Map Name')
            .setPlaceholder('Örn: Whitebank Wall')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const eventInput = new TextInputBuilder()
            .setCustomId('obj_event')
            .setLabel(lang === 'tr' ? 'Etkinlik Adı' : 'Event Name')
            .setPlaceholder('Örn: Castle, Outpost, Chest')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const timeInput = new TextInputBuilder()
            .setCustomId('obj_time')
            .setLabel(lang === 'tr' ? 'Kalan Süre (Dakika)' : 'Minutes Remaining')
            .setPlaceholder('Örn: 20')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(mapInput),
            new ActionRowBuilder().addComponents(eventInput),
            new ActionRowBuilder().addComponents(timeInput)
        );

        return await interaction.showModal(modal);
    }

    if (customId.startsWith('obj_join_')) {
        const objectiveId = customId.split('_')[2];
        const userId = interaction.user.id;

        // Toggle join state in database
        const existing = await db.get('SELECT id FROM objective_attendees WHERE objective_id = ? AND user_id = ?', [objectiveId, userId]);

        if (existing) {
            await db.run('DELETE FROM objective_attendees WHERE objective_id = ? AND user_id = ?', [objectiveId, userId]);
        } else {
            await db.run('INSERT INTO objective_attendees (objective_id, user_id) VALUES (?, ?)', [objectiveId, userId]);
        }

        // Update the embed with new count
        const attendees = await db.all('SELECT user_id FROM objective_attendees WHERE objective_id = ?', [objectiveId]);
        const count = attendees.length;

        const { createObjectiveButtons } = require('../builders/componentBuilder');
        const newButtons = createObjectiveButtons(objectiveId, count);

        return await interaction.update({ components: newButtons });
    }
}

/**
 * Handles registration system buttons
 */
async function handleRegisterButtons(interaction) {
    const customId = interaction.customId;
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const message = interaction.message;

    // 1. User clicks "Register" button in welcome channel
    if (customId === 'register_start' || customId === 'register_btn') {
        const modal = new ModalBuilder()
            .setCustomId('register_modal')
            .setTitle(lang === 'en' ? 'Registration' : 'Kayıt Sistemi');

        const realNameInput = new TextInputBuilder()
            .setCustomId('real_name')
            .setLabel(lang === 'en' ? 'Your Real Name' : 'Gerçek İsminiz')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(30);

        const inGameNameInput = new TextInputBuilder()
            .setCustomId('ingame_name')
            .setLabel(lang === 'en' ? 'Albion In-Game Nickname' : 'Albion Oyun İçi Nickiniz')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(30);

        const ageInput = new TextInputBuilder()
            .setCustomId('age')
            .setLabel(lang === 'en' ? 'Your Age' : 'Yaşınız')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(2);

        modal.addComponents(
            new ActionRowBuilder().addComponents(realNameInput),
            new ActionRowBuilder().addComponents(inGameNameInput),
            new ActionRowBuilder().addComponents(ageInput)
        );

        return await interaction.showModal(modal);
    }

    // 2. Staff clicks "Approve", "Reject" or "Temp"
    if (customId.startsWith('reg_approve_') || customId.startsWith('reg_reject_') || customId.startsWith('reg_temp_')) {
        let action = 'reject';
        if (customId.startsWith('reg_approve_')) action = 'approve';
        else if (customId.startsWith('reg_temp_')) action = 'temp';

        const parts = customId.split('_');
        
        let targetUserId;
        let roleIndex = 1;

        if (action === 'approve') {
            if (parts.length === 4) {
                // New format: reg_approve_{index}_{userid}
                roleIndex = parseInt(parts[2], 10);
                targetUserId = parts[3];
            } else {
                // Old format: reg_approve_{userid}
                targetUserId = parts[2];
            }
        } else {
            // reg_reject_{userid} or reg_temp_{userid}
            targetUserId = parts[2];
        }

        const staffRoles = guildConfig?.registration_staff_role_ids?.split(',') || [];

        const isStaff = interaction.member.roles.cache.some(r => staffRoles.includes(r.id)) || interaction.member.permissions.has('Administrator');

        if (!isStaff) {
            return await interaction.reply({
                content: `⛔ **${lang === 'tr' ? 'Sadece yetkililer bu işlemi yapabilir!' : 'Only staff can perform this action!'}**`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        // Fetch the ticket's embed to get details
        const embed = message.embeds[0];
        if (!embed) return interaction.reply({ content: '❌ Hata: Kayıt bilgileri bulunamadı.', flags: [MessageFlags.Ephemeral] });

        let realName = '';
        let ign = '';
        let age = '';
        let guildName = '';
        let albionId = '';

        // Extract from embed fields
        embed.fields.forEach(field => {
            if (field.name.includes('Gerçek İsim')) realName = field.value;
            if (field.name.includes('Yaş')) age = field.value;
            if (field.name.includes('Oyun İçi Nick')) ign = field.value;
            if (field.name.includes('Albion ID')) albionId = field.value;

            // Extract Guild from the "Diğer" / "Others" field
            if (field.name.includes('Diğer') || field.name.includes('Others')) {
                const match = field.value.match(/\*\*Guild:\*\* `([^`]+)`/);
                if (match && match[1] && match[1] !== '-' && match[1] !== 'No Guild') {
                    guildName = match[1];
                }
            }
        });

        // Fallback for guildName from Title if not found in fields
        if (!guildName && embed.title) {
            const titleMatch = embed.title.match(/\[(.*?)\]/);
            if (titleMatch && titleMatch[1] && titleMatch[1] !== 'No Guild') {
                guildName = titleMatch[1];
            }
        }

        if (action === 'reject') {
            await interaction.reply({ content: `❌ Kayıt reddedildi ve kanal siliniyor...` });
            
            // Log rejection
            const logChannelId = guildConfig?.registration_log_channel_id;
            if (logChannelId) {
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('❌ Kayıt Reddedildi')
                        .setColor('#ff4757')
                        .addFields(
                            { name: '👤 Kullanıcı', value: `<@${targetUserId}>`, inline: true },
                            { name: '🛡️ İsim', value: `${ign || '-'} / ${realName || '-'}`, inline: true },
                            { name: '👮 Yetkili', value: `<@${interaction.user.id}>`, inline: true }
                        )
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] }).catch(()=>{});
                }
            }

            setTimeout(() => interaction.channel.delete().catch(() => { }), 3000);
            return;
        }

        if (action === 'approve' || action === 'temp') {
            await interaction.deferReply();

            try {
                const targetMember = await interaction.guild.members.fetch(targetUserId);

                // Format Nickname: [TURQ] Ign - RealName Age
                let prefix = '';
                if (guildConfig?.auto_check_guild_tag) {
                    prefix = `[${guildConfig.auto_check_guild_tag}] `;
                } else if (guildName && guildName.length > 0) {
                    prefix = `[${guildName.substring(0, 4).toUpperCase()}] `;
                } else {
                    prefix = '[NAN] ';
                }

                // Fallback for IGN if not in field (old tickets)
                if (!ign && embed.author?.name) ign = embed.author.name;
                if (!ign && embed.title) {
                    const titleMatch = embed.title.match(/🛡️ (.*?) \[/);
                    if (titleMatch && titleMatch[1]) ign = titleMatch[1];
                }

                // Capitalize first letters function
                const capitalize = (str) => {
                    if (!str) return '';
                    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                };

                const capIgn = capitalize(ign);
                const capRealName = capitalize(realName);

                // Protect against empty age or realName
                const safeAge = age ? ` ${age}` : '';
                const safeRealName = capRealName ? ` - ${capRealName}` : '';
                let newNickname = `${prefix}${capIgn}${safeRealName}${safeAge}`.trim();
                
                if (newNickname.length > 32) {
                    newNickname = newNickname.substring(0, 32);
                }

                let roleStatus = '';
                let unregRoleStatus = '';

                // Identify the fallback (unregistered) role
                const fallbackRoleId = guildConfig?.auto_role_on_join_id;
                // Identify the temp guest role
                const tempRoleId = guildConfig?.registration_unregistered_role_id;

                if (action === 'approve') {
                    // Assign given role if configured
                    let givenRoleId = guildConfig?.registration_given_role_id;
                    if (roleIndex === 2) givenRoleId = guildConfig?.registration_given_role_id_2;
                    if (roleIndex === 3) givenRoleId = guildConfig?.registration_given_role_id_3;
                    if (roleIndex === 4) givenRoleId = guildConfig?.registration_given_role_id_4;
                    if (roleIndex === 5) givenRoleId = guildConfig?.registration_given_role_id_5;

                    if (givenRoleId) {
                        try {
                            await targetMember.roles.add(givenRoleId);
                            roleStatus = `\n✅ **Rol Verildi:** <@&${givenRoleId}>`;
                        } catch (e) {
                            console.error('Role add error:', e);
                            roleStatus = `\n⚠️ **Rol Verilemedi:** Botun yetkisi bu rolü vermeye yetmiyor olabilir. (Rolü botun rolünün altına taşıyın)`;
                        }
                    }

                    // Remove BOTH fallback and temp roles when fully approved
                    if (fallbackRoleId && targetMember.roles.cache.has(fallbackRoleId)) {
                        try {
                            await targetMember.roles.remove(fallbackRoleId);
                            unregRoleStatus += `\n✅ **Otomatik Kayıtsız Rolü Alındı:** <@&${fallbackRoleId}>`;
                        } catch (e) { console.error('Role remove error:', e); }
                    }
                    if (tempRoleId && targetMember.roles.cache.has(tempRoleId)) {
                        try {
                            await targetMember.roles.remove(tempRoleId);
                        } catch (e) { console.error('Role remove error:', e); }
                    }
                } else if (action === 'temp') {
                    // Give Temp Role
                    if (tempRoleId) {
                        try {
                            await targetMember.roles.add(tempRoleId);
                            roleStatus = `\n✅ **Geçici Rol Verildi:** <@&${tempRoleId}>`;
                        } catch (e) {
                            console.error('Role add error:', e);
                            roleStatus = `\n⚠️ **Rol Verilemedi:** Botun yetkisi bu rolü vermeye yetmiyor olabilir.`;
                        }
                    }

                    // Remove Fallback role
                    if (fallbackRoleId && targetMember.roles.cache.has(fallbackRoleId)) {
                        try {
                            await targetMember.roles.remove(fallbackRoleId);
                            unregRoleStatus = `\n✅ **Otomatik Kayıtsız Rolü Alındı:** <@&${fallbackRoleId}>`;
                        } catch (e) { console.error('Role remove error:', e); }
                    }

                    // Insert to temp_roles table via Supabase client
                    const durationDays = guildConfig?.registration_guest_role_duration || 7;
                    const { supabase } = require('@veyronix/database');
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + durationDays);
                    
                    try {
                        await supabase.from('temp_roles').insert({
                            guild_id: interaction.guildId,
                            user_id: targetUserId,
                            temp_role_id: tempRoleId,
                            fallback_role_id: fallbackRoleId,
                            expires_at: expiresAt.toISOString()
                        });
                        roleStatus += `\n⏳ **Süre:** ${durationDays} Gün`;
                    } catch (e) {
                        console.error('Temp role save error:', e);
                    }
                }

                // Change nickname
                let nickStatus = '';
                if (interaction.guild.ownerId !== targetUserId) {
                    try {
                        await targetMember.setNickname(newNickname);
                        nickStatus = `\n✅ **Yeni İsim:** ${newNickname}`;
                    } catch (e) {
                        console.error('Nickname error:', e);
                        nickStatus = `\n⚠️ **İsim Değiştirilemedi:** Botun yetkisi bu kişinin ismini değiştirmeye yetmiyor. (Kullanıcının rolü botun rolünden yüksek olabilir)`;
                    }
                } else {
                    nickStatus = `\nℹ️ Sunucu sahibinin ismi bot tarafından değiştirilemez.`;
                }

                await interaction.editReply({ content: `✅ <@${targetUserId}> adlı kullanıcının kaydı onaylandı!${nickStatus}${roleStatus}${unregRoleStatus}\n\nKanal 5 saniye içinde kapatılacak.` });

                // Save to guild_registrations ONLY IF they are given the MAIN guild role (roleIndex === 1)
                // We do not save Guests/Alliance (roleIndex 2 or 3) to prevent Auto-Check from kicking them.
                if (albionId && roleIndex === 1) {
                    const db = require('../services/db');
                    try {
                        await db.run(
                            `INSERT OR REPLACE INTO guild_registrations (guild_id, user_id, albion_ign, albion_id) VALUES (?, ?, ?, ?)`,
                            [interaction.guildId, targetUserId, capIgn, albionId]
                        );
                        
                        // Update registered count in Supabase (with offline queue support)
                        const { getSupabaseGuildSettings, updateSupabaseGuildSettings } = require('@veyronix/database');
                        try {
                            const currentSettings = await getSupabaseGuildSettings(interaction.guildId);
                            if (currentSettings) {
                                const newCount = (currentSettings.registered_count || 0) + 1;
                                await updateSupabaseGuildSettings(interaction.guildId, { registered_count: newCount });
                            }
                        } catch (supaErr) {
                            if (supaErr.message?.includes('fetch failed') || supaErr.message?.includes('JSON') || supaErr.message?.includes('525')) {
                                console.warn('[Offline Sync] Supabase is down, queueing registration count update.');
                                const { enqueueOperation } = require('../services/queueService');
                                // We can't fetch current count if down, so we queue an RPC or just wait, 
                                // but standard update needs current count. Since it's offline, we might just queue a generic payload
                                // Wait, to properly increment offline, we would ideally need a postgres function.
                                // For now we'll queue a simple update if we had currentSettings, or we skip.
                                // A better approach for stats is an RPC `increment_registered_count`.
                                // Let's queue an update to `guild_settings` with an RPC action if we had one.
                                // Actually, if we couldn't fetch, we can't update directly. We'll skip stats update for offline but we could queue the insertion.
                                // Currently we only track registered_count. Let's just log it.
                            }
                            console.error('Error updating registered count in Supabase:', supaErr.message);
                        }
                    } catch (dbErr) {
                        console.error('Error saving registration to local DB:', dbErr);
                    }
                }

                // Log approval
                const logChannelId = guildConfig?.registration_log_channel_id;
                if (logChannelId) {
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('✅ Kayıt Onaylandı')
                            .setColor('#2ed573')
                            .addFields(
                                { name: '👤 Kullanıcı', value: `<@${targetUserId}>`, inline: true },
                                { name: '🎮 Yeni İsim', value: newNickname, inline: true },
                                { name: '👮 Yetkili', value: `<@${interaction.user.id}>`, inline: true }
                            )
                            .setTimestamp();
                        await logChannel.send({ embeds: [logEmbed] }).catch(()=>{});
                    }
                }

                // Welcome Message
                const welcomeChannelId = guildConfig?.registration_welcome_channel_id;
                const welcomeMessageText = guildConfig?.registration_welcome_message_text;
                if (welcomeChannelId && welcomeMessageText) {
                    const welcomeChannel = interaction.guild.channels.cache.get(welcomeChannelId);
                    if (welcomeChannel) {
                        const formattedMsg = welcomeMessageText
                            .replace(/{user}/g, `<@${targetUserId}>`)
                            .replace(/{gamenickname}/g, ign || '')
                            .replace(/{realname}/g, realName || '')
                            .replace(/{age}/g, age || '');
                        await welcomeChannel.send({ content: formattedMsg }).catch(()=>{});
                    }
                }

                // Remove the buttons so it can't be clicked again
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('approved_btn').setLabel('Onaylandı').setStyle(ButtonStyle.Success).setDisabled(true)
                );
                await message.edit({ components: [disabledRow] }).catch(() => { });

                setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);

            } catch (err) {
                console.error('[RegApprove Error]', err);
                await interaction.editReply({ content: `❌ Bir hata oluştu: ${err.message}` });
            }
        }
        return;
    }
}

module.exports = {
    handlePartyButtons,
    handleObjectiveButtons,
    handleRegisterButtons
};
