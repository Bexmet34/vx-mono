const { createPartikurEmbed } = require('../builders/embedBuilder');
const { createCustomPartyComponents } = require('../builders/componentBuilder');
const { safeReply } = require('../utils/interactionUtils');
const { getActivePartyCount, setActiveParty } = require('../services/partyManager');

const { getPlayerInfo, formatFame } = require('../services/albionService');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { checkWeeklyVote } = require('./partikurHandler');
const db = require('../services/db');
const { getGuildConfig } = require('../services/guildConfig');
const { t } = require('../services/i18n');
const { EMPTY_SLOT } = require('../constants/constants');
const appSvc = require('../services/applicationService');


const { buildRolesFields, addFooterFields, createObjectiveEmbed, createPlayerCardEmbed } = require('../builders/embedBuilder');
const { createObjectiveButtons } = require('../builders/componentBuilder');
const { parseTimeToMs, getNow } = require('../utils/timeUtils');
const { getSubscription, isUserPremium } = require('@veyronix/database');
const { addUserTemplate, updateUserTemplate, getUserTemplates } = require('@veyronix/database');
const config = require('../config/config');

async function handlePartiModal(interaction) {
    if (interaction.customId.startsWith('parti_modal:')) {
        const parts = interaction.customId.split(':');
        const type = parts[1] || 'genel';
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';
        const guildName = guildConfig?.guild_name || 'Albion';

        const userId = interaction.user.id;
        const isOwner = userId === interaction.guild?.ownerId;
        const isDeveloper = config.WHITELIST_USERS?.includes(userId);

        // 0. Subscription & Vote Check
        const userPremium = await isUserPremium(userId);
        const needsVote = !(isDeveloper || userPremium);

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (needsVote) {
            let hasVoted = await checkWeeklyVote(userId);

            if (!hasVoted) {
                const voteEmbed = new EmbedBuilder()
                    .setTitle(t('subscription.vote_required_title', lang))
                    .setDescription(t('subscription.vote_required_desc', lang))
                    .setColor('#5865F2')
                    .setFooter({ text: 'Veyronix Party Master • Top.gg System' });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel(t('subscription.vote_button', lang))
                        .setURL(config.TOPGG_LINK || 'https://top.gg/bot/1082239904169336902/vote')
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel(lang === 'tr' ? 'Satın Al / Web Sitesi' : 'Buy Premium / Website')
                        .setURL(config.WEBSITE_LINK || 'https://veyronix.com.tr')
                        .setStyle(ButtonStyle.Link)
                );

                return await interaction.editReply({
                    embeds: [voteEmbed],
                    components: [row]
                });
            }
        }

        const partyCount = getActivePartyCount(userId);
        let limit = 1;
        if (isOwner || isDeveloper || userPremium) limit = 999;

        if (partyCount >= limit) {
            let errorMsg = `❌ **${t('party.already_active', lang)}**\n\n${t('party.limit_desc_normal', lang)}`;

            return await interaction.editReply({
                content: errorMsg
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

        let targetChannel = interaction.channel;
        if (guildConfig?.system_mode === 'fixed_channel' && guildConfig?.target_category_id) {
            try {
                let channelName = 'content';
                let rawName = (interaction.member?.nickname || interaction.member?.displayName || interaction.user.globalName || interaction.user.username);
                let extractedName = rawName.replace(/^[\[\(].*?[\]\)]\s*/, '');
                extractedName = extractedName.split(/[-|/]/)[0].trim();
                if (!extractedName) extractedName = rawName;
                
                const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
                extractedName = extractedName.replace(/[çğıöşüÇĞİÖŞÜ]/g, m => trMap[m]);
                const userName = extractedName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() || 'user';
                let safeHeader = header.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ ]/g, '').replace(/\s+/g, '-').toLowerCase() || 'content';
                if (safeHeader.length > 15) {
                    safeHeader = safeHeader.substring(0, 15).replace(/-+$/, '');
                }
                const format = guildConfig.channel_name_format || 'name_title';

                if (format === 'name_title') channelName = `${userName}-${safeHeader}`;
                else if (format === 'title_only') channelName = safeHeader;
                else if (format === 'title_name') channelName = `${safeHeader}-${userName}`;
                else if (format === 'type_title') channelName = `party-${safeHeader}`;

                targetChannel = await interaction.guild.channels.create({
                    name: channelName.substring(0, 100),
                    type: ChannelType.GuildText,
                    parent: guildConfig.target_category_id,
                });
            } catch (err) {
                console.error('[ModalHandler] Error creating fixed channel:', err);
                targetChannel = interaction.channel;
            }
        }

        const msg = await targetChannel.send({ content: '@everyone', embeds: [embed], components: components });
        
        const msgId = msg?.id;
        const chanId = msg?.channelId || targetChannel.id;

        if (msgId) {
            setActiveParty(userId, msgId, chanId);
            await interaction.deleteReply().catch(()=>{});

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
                    
                    // Analytics: Party created
                    db.logAnalyticsEvent('party_created', type, interaction.guildId || 'DM', userId);
                } catch (err) {
                    console.error('[ModalHandler] DB Error:', err.message);
                }
            })();
        }
    }
}

/**
 * Handles save_temp_modal submission
 */
async function handleSaveTempModal(interaction) {
    if (interaction.customId.startsWith('save_temp_modal:')) {
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';
        const userId = interaction.user.id;

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const isDeveloper = config.WHITELIST_USERS?.includes(userId);
        const userPremium = await isUserPremium(userId);
        const limit = (isDeveloper || userPremium) ? 999 : 5;

        const currentTemplates = await getUserTemplates(userId);
        if (currentTemplates.length >= limit) {
            return await interaction.editReply({
                content: `❌ **${lang === 'tr' ? 'Şablon sınırına ulaştınız!' : 'Template limit reached!'}**\n${lang === 'tr' ? 'Premium alarak sınırsız şablon kaydedebilirsiniz.' : 'Get Premium to save unlimited templates.'}`
            });
        }

        const templateName = interaction.fields.getTextInputValue('template_name');
        const header = interaction.fields.getTextInputValue('party_header');
        const description = interaction.fields.getTextInputValue('party_description') || '';
        const roles = interaction.fields.getTextInputValue('party_roles');

        const result = await addUserTemplate(userId, templateName, header, description, roles);
        
        if (result) {
            await interaction.editReply({
                content: `✅ **${lang === 'tr' ? 'Şablon başarıyla kaydedildi!' : 'Template saved successfully!'}**`
            });
        } else {
            await interaction.editReply({
                content: `❌ **${lang === 'tr' ? 'Şablon kaydedilirken bir hata oluştu.' : 'An error occurred while saving the template.'}**`
            });
        }
    } else if (interaction.customId.startsWith('edit_temp_modal:')) {
        const templateId = interaction.customId.split(':')[1];
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';
        const userId = interaction.user.id;

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const templateName = interaction.fields.getTextInputValue('template_name');
        const header = interaction.fields.getTextInputValue('party_header');
        const description = interaction.fields.getTextInputValue('party_description') || '';
        const roles = interaction.fields.getTextInputValue('party_roles');

        const result = await updateUserTemplate(templateId, userId, {
            templateName,
            header,
            description,
            rolesText: roles
        });

        if (result) {
            await interaction.editReply({
                content: `✅ **${lang === 'tr' ? 'Şablon başarıyla güncellendi!' : 'Template updated successfully!'}**`
            });
        } else {
            await interaction.editReply({
                content: `❌ **${lang === 'tr' ? 'Şablon güncellenirken bir hata oluştu.' : 'An error occurred while updating the template.'}**`
            });
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
        const lang = (guildConfig?.language || '').toString().toLowerCase().trim() === 'en' ? 'en' : 'tr';
        
        let realName = '';
        let ign = '';
        let age = '';
        try {
            realName = interaction.fields.getTextInputValue('real_name');
            ign = interaction.fields.getTextInputValue('ingame_name');
            age = interaction.fields.getTextInputValue('age');
        } catch (e) {
            // Fallback for older modal versions if they existed
            ign = interaction.fields.getTextInputValue('register_ign');
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            // 1. Fetch Albion Info
            const playerData = await getPlayerInfo(ign, guildConfig?.albion_server || 'Europe');
            if (!playerData) {
                return await interaction.editReply({
                    content: `❌ **${lang === 'tr' ? 'Oyuncu bulunamadı! Lütfen ismin büyük/küçük harf duyarlı olduğuna dikkat edin.' : 'Player not found! Please ensure the name is case-sensitive.'}**`
                });
            }

            // 2. Create Ticket Channel (or delay if application is enabled)
            const categoryId = guildConfig?.registration_category_id;
            
            // --- ANTI-SPAM CHECK ---
            if (categoryId) {
                const category = interaction.guild.channels.cache.get(categoryId);
                if (category) {
                    const existingChannel = category.children.cache.find(ch => 
                        ch.permissionOverwrites.cache.has(interaction.user.id)
                    );
                    if (existingChannel) {
                        return await interaction.editReply({
                            content: `❌ **${lang === 'tr' ? 'Zaten açık bir kayıt biletiniz bulunuyor:' : 'You already have an open registration ticket:'}** <#${existingChannel.id}>`
                        });
                    }
                }
            }

            const applicationEnabled = guildConfig?.application_enabled === true;
            const questions = (guildConfig?.application_questions || []).filter(q => q.type !== 'rules_accept');

            if (applicationEnabled && questions.length > 0) {
                // Defer channel creation, store registration details in session
                appSvc.startSession(interaction.user.id, interaction.guildId, null, questions, {
                    realName,
                    ign,
                    age,
                    playerData
                });

                const continueRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`app_continue:0:nochan`)
                        .setLabel(lang === 'tr' ? '📋 Soruları Yanıtla' : '📋 Answer Questions')
                        .setStyle(ButtonStyle.Primary)
                );
                await interaction.editReply({
                    content: lang === 'tr'
                        ? '✅ **Kayıt bilgileriniz alındı.**\n\nBaşvuru sorularını yanıtlamak için aşağıdaki butona basın:'
                        : '✅ **Registration info received.**\n\nClick the button below to answer the application questions:',
                    embeds: [],
                    components: [continueRow]
                });
            } else {
                // Survey disabled → Create channel immediately
                const staffRoles = guildConfig?.registration_staff_role_ids?.split(',') || [];
                
                const permissionOverwrites = [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
                ];

                staffRoles.forEach(roleId => {
                    if (roleId) permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
                });

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
                if (ign) {
                    embed.addFields({ name: '🎮 Oyun İçi Nick', value: ign, inline: true });
                }
                if (age) {
                    embed.addFields({ name: '📅 Yaş', value: age, inline: true });
                }
                if (playerData && playerData.Id) {
                    embed.addFields({ name: '🔑 Albion ID', value: playerData.Id, inline: true });
                }

                if (guildConfig?.embed_thumbnail_url) {
                    embed.setThumbnail(guildConfig.embed_thumbnail_url);
                }

                const role1 = guildConfig?.registration_given_role_id;
                const role2 = guildConfig?.registration_given_role_id_2;
                const role3 = guildConfig?.registration_given_role_id_3;
                const role4 = guildConfig?.registration_given_role_id_4;
                const role5 = guildConfig?.registration_given_role_id_5;
                const tempRole = guildConfig?.registration_unregistered_role_id;
                
                const rows = [];
                let currentRow = new ActionRowBuilder();
                let buttonCountInRow = 0;

                const addButtonToRow = (btn) => {
                    if (buttonCountInRow === 5) {
                        rows.push(currentRow);
                        currentRow = new ActionRowBuilder();
                        buttonCountInRow = 0;
                    }
                    currentRow.addComponents(btn);
                    buttonCountInRow++;
                };

                const addApproveButton = (roleId, index) => {
                    if (!roleId) return;
                    const role = interaction.guild.roles.cache.get(roleId);
                    const roleName = role ? role.name : `Rol ${index}`;
                    const labelText = lang === 'tr' ? `Onayla (${roleName})` : `Approve (${roleName})`;
                    
                    addButtonToRow(
                        new ButtonBuilder()
                            .setCustomId(`reg_approve_${index}_${interaction.user.id}`)
                            .setLabel(labelText.substring(0, 80))
                            .setStyle(ButtonStyle.Success)
                    );
                };

                addApproveButton(role1, 1);
                addApproveButton(role2, 2);
                addApproveButton(role3, 3);
                addApproveButton(role4, 4);
                addApproveButton(role5, 5);

                if (tempRole) {
                    const tr = interaction.guild.roles.cache.get(tempRole);
                    const trName = tr ? tr.name : 'Misafir';
                    addButtonToRow(
                        new ButtonBuilder()
                            .setCustomId(`reg_temp_${interaction.user.id}`)
                            .setLabel(lang === 'tr' ? `Süreli (${trName})` : `Temp (${trName})`)
                            .setStyle(ButtonStyle.Primary)
                    );
                }

                if (buttonCountInRow === 0 && rows.length === 0) {
                    addButtonToRow(
                        new ButtonBuilder()
                            .setCustomId(`reg_approve_1_${interaction.user.id}`)
                            .setLabel(lang === 'tr' ? 'Onayla' : 'Approve')
                            .setStyle(ButtonStyle.Success)
                    );
                }

                addButtonToRow(
                    new ButtonBuilder()
                        .setCustomId(`reg_reject_${interaction.user.id}`)
                        .setLabel(lang === 'tr' ? 'Reddet' : 'Reject')
                        .setStyle(ButtonStyle.Danger)
                );

                rows.push(currentRow);

                const staffPings = staffRoles.filter(r => r).map(r => `<@&${r}>`).join(' ');
                
                await channel.send({
                    content: `🔔 **${lang === 'tr' ? 'Yeni Kayıt Başvurusu!' : 'New Registration Application!'}** <@${interaction.user.id}> ${staffPings}`,
                    embeds: [embed],
                    components: rows
                });

                await interaction.editReply({
                    content: `✅ **${lang === 'tr' ? 'Başvurunuz alındı! Kanal açıldı:' : 'Application received! Channel created:'}** <#${channel.id}>`
                });
            }

        } catch (error) {
            console.error('[RegistrationModal] Error:', error);
            return await interaction.editReply({
                content: `❌ **${lang === 'tr' ? 'Bir hata oluştu!' : 'An error occurred!'}**`
            });
        }
    }
}

/**
 * Anket cevap modallarını işler
 * customId format: app_answer_modal:{pageIndex}:{channelId}
 */
async function handleApplicationAnswerModal(interaction) {
    const parts = interaction.customId.split(':');
    const pageIndex = parseInt(parts[1]);
    const channelId = parts[2];
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    const guildConfig = await getGuildConfig(guildId);
    const lang = (guildConfig?.language || '').toString().toLowerCase().trim() === 'en' ? 'en' : 'tr';
    const questions = (guildConfig?.application_questions || []).filter(q => q.type !== 'rules_accept');

    // Modal'daki cevapları oku
    const newAnswers = {};
    const { getModalQuestionsForPage } = appSvc;
    const modalQuestions = getModalQuestionsForPage(questions, pageIndex);

    for (const q of modalQuestions) {
        try {
            const val = interaction.fields.getTextInputValue(q.id);
            if (val) newAnswers[q.id] = val;
        } catch (e) {
            // Alan boş bırakılmış (opsiyonel soru)
        }
    }

    // Cevapları oturuma ekle
    const added = appSvc.addAnswers(userId, guildId, newAnswers);
    if (!added) {
        // Oturum bulunamadı (bot restart vs.) → sessizce bitir
        return await interaction.reply({
            content: lang === 'tr'
                ? '⚠️ Oturum bulunamadı. Lütfen başvuruyu yeniden başlat.'
                : '⚠️ Session not found. Please restart the application.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => {});

    // Sonraki adımı belirle
    const session = appSvc.getSession(userId, guildId);
    const { handleNextStep } = require('./buttonHandler');
    const nextStep = appSvc.getNextStep(session, questions);

    await handleNextStep(interaction, nextStep, session, questions, lang, guildId, channelId);
}

/**
 * Handle Auto Premium Modal
 */
async function handleAutoPremiumModal(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const ign = interaction.fields.getTextInputValue('ign_input');

    // 1. Kuralları Çek
    const { supabase } = require('@veyronix/database');
    const { data: rules } = await supabase.from('auto_premium_rules').select('*');
    if (!rules || rules.length === 0) return interaction.editReply('❌ Aktif premium kuralı yok.');

    // 2. Albion Karakter Bilgisi Çek (Tüm Sunucularda)
    let playerGuild = null;
    let playerFound = false;
    const endpoints = [
        'https://gameinfo.albiononline.com/api/gameinfo/search?q=',
        'https://gameinfo-sg.albiononline.com/api/gameinfo/search?q=',
        'https://gameinfo-ams.albiononline.com/api/gameinfo/search?q='
    ];

    try {
        for (const url of endpoints) {
            const res = await fetch(`${url}${encodeURIComponent(ign)}`);
            if (!res.ok) continue;
            const searchData = await res.json();
            const player = searchData.players?.find(p => p.Name.toLowerCase() === ign.toLowerCase());
            
            if (player) {
                playerFound = true;
                playerGuild = player.GuildName;
                break; // Bulunduysa diğer sunuculara bakma
            }
        }
        
        if (!playerFound) return interaction.editReply(`❌ **${ign}** isminde bir karakter hiçbir sunucuda bulunamadı.`);
    } catch (e) {
        console.error('API Error:', e);
        return interaction.editReply('❌ Albion API bağlanırken bir sorun oluştu.');
    }

    // 3. Şartları Kontrol Et
    let matchedRule = null;
    console.log(`[AutoPremium] Checking rules for user ${interaction.user.tag} (${interaction.user.id}), IGN: ${ign}, Guild: ${playerGuild}`);
    
    for (const rule of rules) {
        const requiredGuilds = rule.albion_guilds || [];
        const requiredServers = rule.discord_servers || [];
        console.log(`[AutoPremium] Evaluating Rule: ${rule.rule_name}`);

        // A) En az 1 Lonca eşleşmesi (Büyük/Küçük harf duyarsız)
        if (requiredGuilds.length > 0) {
            const guildMatch = requiredGuilds.some(g => g.toLowerCase() === (playerGuild || "").toLowerCase());
            if (!guildMatch) {
                console.log(`[AutoPremium] -> Failed: Player guild '${playerGuild}' not in required list [${requiredGuilds.join(', ')}]`);
                continue;
            }
        }

        // B) Tüm Discord sunucularında bulunma şartı
        let inAllServers = true;
        for (const serverId of requiredServers) {
            try {
                const guildObj = await interaction.client.guilds.fetch(serverId);
                await guildObj.members.fetch(interaction.user.id);
            } catch (err) {
                console.log(`[AutoPremium] -> Failed: User ${interaction.user.id} not found in Discord server ${serverId}. Error: ${err.message}`);
                inAllServers = false; break;
            }
        }

        if (inAllServers) { 
            console.log(`[AutoPremium] -> Success: Matched rule '${rule.rule_name}'`);
            matchedRule = rule; break; 
        }
    }

    if (!matchedRule) {
        console.log(`[AutoPremium] User ${interaction.user.tag} failed all rules.`);
        return interaction.editReply('❌ Maalesef Premium şartlarını (Gerekli Lonca ve Discord Sunucusu) sağlamıyorsunuz.');
    }

    // 4. Premium Ver
    const isUnlimited = matchedRule.premium_type === 'unlimited';
    let premiumUntil = null;
    if (!isUnlimited) {
        premiumUntil = new Date(Date.now() + (matchedRule.days_to_give || 30) * 86400000).toISOString();
    }

    await supabase.from('users').upsert({
        discord_id: interaction.user.id,
        is_unlimited: isUnlimited,
        premium_until: premiumUntil,
        is_auto_premium: true
    }, { onConflict: 'discord_id' });

    await interaction.editReply(`✅ **Başarılı!** Şartları sağladığınız için hesabınıza Premium tanımlandı.`);
}

module.exports = {
    handlePartiModal,
    handleObjectiveModal,
    handleRegisterModal,
    handleApplicationAnswerModal,
    handleSaveTempModal,
    handleAutoPremiumModal
};
