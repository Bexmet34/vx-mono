/**
 * applicationService.js
 * Başvuru Anketi Sistemi — Cevap Yönetimi
 * 
 * Soru tipleri:
 *   text        → Kısa metin (Discord Modal TextInput.Short)
 *   paragraph   → Uzun metin (Discord Modal TextInput.Paragraph)
 *   yesno       → Evet / Hayır butonları
 *   select      → Tek seçim (StringSelectMenu)
 *   multiselect → Çoklu seçim (StringSelectMenu)
 *   rules_accept → Özel kural onay adımı (Modal değil, buton)
 */

const { supabase } = require('@veyronix/database');
const {
    ChannelType, PermissionFlagsBits,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js');

// RAM'de geçici cevap deposu (Modal zincirleme için)
// Key: `${userId}_${guildId}`, Value: { channelId, answers, questionList, currentPage }
const pendingAnswers = new Map();

/**
 * Kullanıcının anket oturumunu başlatır
 */
function startSession(userId, guildId, channelId, questionList, registrationData = null) {
    const key = `${userId}_${guildId}`;
    pendingAnswers.set(key, {
        channelId,
        answers: {},
        questionList, // Tüm sorular (rules_accept hariç)
        currentPage: 0,
        registrationData
    });
}

/**
 * Geçici cevapları günceller (her modal submit'inde çağrılır)
 */
function addAnswers(userId, guildId, newAnswers) {
    const key = `${userId}_${guildId}`;
    const session = pendingAnswers.get(key);
    if (!session) return false;
    session.answers = { ...session.answers, ...newAnswers };
    session.currentPage++;
    pendingAnswers.set(key, session);
    return true;
}

/**
 * Bir yesno/select cevabı ekler (buton/menu interactionlarından)
 */
function addSingleAnswer(userId, guildId, questionId, value) {
    const key = `${userId}_${guildId}`;
    const session = pendingAnswers.get(key);
    if (!session) return false;
    session.answers[questionId] = value;
    pendingAnswers.set(key, session);
    return true;
}

/**
 * Mevcut oturumu döndürür
 */
function getSession(userId, guildId) {
    return pendingAnswers.get(`${userId}_${guildId}`) || null;
}

/**
 * Oturumu temizler
 */
function clearSession(userId, guildId) {
    pendingAnswers.delete(`${userId}_${guildId}`);
}

/**
 * Bir "sayfadaki" modal sorularını döndürür (text ve paragraph tipleri)
 * Sayfa başına max 5 soru — Discord modal limiti
 */
function getModalQuestionsForPage(questions, pageIndex) {
    const modalTypes = ['text', 'paragraph'];
    const modalQuestions = questions.filter(q => modalTypes.includes(q.type));
    const start = pageIndex * 5;
    return modalQuestions.slice(start, start + 5);
}

/**
 * Tüm modal sayfası sayısını döndürür
 */
function getTotalModalPages(questions) {
    const modalTypes = ['text', 'paragraph'];
    const modalQuestions = questions.filter(q => modalTypes.includes(q.type));
    return Math.ceil(modalQuestions.length / 5);
}

/**
 * Tüm cevaplar tamamlandığında Supabase'e kaydeder ve ticket embed'ini günceller
 */
async function finalizeAnswers(userId, guildId, client) {
    const key = `${userId}_${guildId}`;
    const session = pendingAnswers.get(key);
    if (!session) return { success: false };

    try {
        const { getGuildConfig } = require('./guildConfig');
        const guildConfig = await getGuildConfig(guildId);
        const lang = (guildConfig?.language || '').toString().toLowerCase().trim() === 'en' ? 'en' : 'tr';
        const guild = await client.guilds.fetch(guildId).catch(() => null);

        let channelId = session.channelId;

        // If channel does not exist yet (delayed channel creation), create it now
        if (!channelId && session.registrationData && guild) {
            const { createPlayerCardEmbed } = require('../builders/embedBuilder');
            
            const { realName, ign, age, playerData } = session.registrationData;
            const categoryId = guildConfig?.registration_category_id;
            
            const staffRoles = guildConfig?.registration_staff_role_ids?.split(',') || [];
            
            const permissionOverwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: userId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
            ];

            staffRoles.forEach(roleId => {
                if (roleId) permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
            });

            const channelName = realName ? `${ign.toLowerCase()}-${realName.toLowerCase().replace(/\s+/g, '-')}` : `basvuru-${ign.toLowerCase()}`;

            let channel;
            try {
                channel = await guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: categoryId || null,
                    permissionOverwrites
                });
                channelId = channel.id;
                session.channelId = channelId;
            } catch (chanErr) {
                console.error('[ApplicationService] Failed to create channel in finalizeAnswers:', chanErr.message);
                return { success: false };
            }

            // Create embed and add questionnaire answers directly
            const embed = createPlayerCardEmbed(playerData, lang);
            if (realName) embed.addFields({ name: '📝 Gerçek İsim', value: realName, inline: true });
            if (ign) embed.addFields({ name: '🎮 Oyun İçi Nick', value: ign, inline: true });
            if (age) embed.addFields({ name: '📅 Yaş', value: age, inline: true });
            if (playerData && playerData.Id) embed.addFields({ name: '🔑 Albion ID', value: playerData.Id, inline: true });

            if (guildConfig?.embed_thumbnail_url) {
                embed.setThumbnail(guildConfig.embed_thumbnail_url);
            }

            embed.addFields({ name: '─────────────────────────', value: '📋 **BAŞVURU CEVAPLARI**', inline: false });
            const questions = guildConfig?.application_questions || [];
            for (const q of questions) {
                if (q.type === 'rules_accept') continue;
                const answer = session.answers[q.id];
                if (!answer) continue;

                const questionText = getQuestionText(q, lang);
                const displayLabel = questionText.length > 80
                    ? questionText.substring(0, 77) + '...'
                    : questionText;

                const displayAnswer = String(answer).length > 1024
                    ? String(answer).substring(0, 1021) + '...'
                    : String(answer);

                embed.addFields({
                    name: `❓ ${displayLabel}`,
                    value: `> ${displayAnswer}`,
                    inline: false
                });
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
                const role = guild.roles.cache.get(roleId);
                const roleName = role ? role.name : `Rol ${index}`;
                const labelText = lang === 'tr' ? `Onayla (${roleName})` : `Approve (${roleName})`;
                
                addButtonToRow(
                    new ButtonBuilder()
                        .setCustomId(`reg_approve_${index}_${userId}`)
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
                const tr = guild.roles.cache.get(tempRole);
                const trName = tr ? tr.name : 'Misafir';
                addButtonToRow(
                    new ButtonBuilder()
                        .setCustomId(`reg_temp_${userId}`)
                        .setLabel(lang === 'tr' ? `Süreli (${trName})` : `Temp (${trName})`)
                        .setStyle(ButtonStyle.Primary)
                );
            }

            if (buttonCountInRow === 0 && rows.length === 0) {
                addButtonToRow(
                    new ButtonBuilder()
                        .setCustomId(`reg_approve_1_${userId}`)
                        .setLabel(lang === 'tr' ? 'Onayla' : 'Approve')
                        .setStyle(ButtonStyle.Success)
                );
            }

            addButtonToRow(
                new ButtonBuilder()
                    .setCustomId(`reg_reject_${userId}`)
                    .setLabel(lang === 'tr' ? 'Reddet' : 'Reject')
                    .setStyle(ButtonStyle.Danger)
            );

            rows.push(currentRow);

            const staffPings = staffRoles.filter(r => r).map(r => `<@&${r}>`).join(' ');

            await channel.send({
                content: `🔔 **${lang === 'tr' ? 'Yeni Kayıt Başvurusu!' : 'New Registration Application!'}** <@${userId}> ${staffPings}`,
                embeds: [embed],
                components: rows
            });

            // Send custom ticket welcome message if configured
            const ticketWelcomeMsg = lang === 'en' ? guildConfig?.registration_ticket_welcome_message_en : guildConfig?.registration_ticket_welcome_message_tr;
            if (ticketWelcomeMsg) {
                let parsedMsg = ticketWelcomeMsg
                    .replace(/{user}/g, `<@${userId}>`)
                    .replace(/{gamenickname}/g, ign || '')
                    .replace(/{realname}/g, realName || '')
                    .replace(/{age}/g, age || '');
                await channel.send({ content: parsedMsg }).catch(() => {});
            }
        }

        // 1. Supabase'e kaydet
        const { error } = await supabase
            .from('application_answers')
            .insert({
                guild_id: guildId,
                user_id: userId,
                ticket_channel_id: channelId,
                answers: session.answers,
                status: 'pending'
            });

        if (error) {
            console.error('[ApplicationService] Supabase insert error:', error.message);
        }

        // 2. Ticket kanalındaki embed'i güncelle
        if (session.channelId && client && !session.registrationData) {
            try {
                const channel = await client.channels.fetch(session.channelId).catch(() => null);
                if (channel) {
                    const messages = await channel.messages.fetch({ limit: 10 });
                    const botMessage = messages.find(m => m.author.bot && m.embeds.length > 0);

                    if (botMessage) {

                        const oldEmbed = botMessage.embeds[0];
                        const updatedEmbed = EmbedBuilder.from(oldEmbed);

                        // Cevapları embed field'larına ekle
                        updatedEmbed.addFields({ name: '─────────────────────────', value: '📋 **BAŞVURU CEVAPLARI**', inline: false });

                        const { getGuildConfig } = require('./guildConfig');
                        const guildConfig = await getGuildConfig(guildId);
                        const questions = guildConfig?.application_questions || [];

                        for (const q of questions) {
                            if (q.type === 'rules_accept') continue;
                            const answer = session.answers[q.id];
                            if (!answer) continue;

                            const questionText = q.question_tr || q.question_en || `Soru ${q.order}`;
                            const displayLabel = questionText.length > 80
                                ? questionText.substring(0, 77) + '...'
                                : questionText;

                            const displayAnswer = String(answer).length > 1024
                                ? String(answer).substring(0, 1021) + '...'
                                : String(answer);

                            updatedEmbed.addFields({
                                name: `❓ ${displayLabel}`,
                                value: `> ${displayAnswer}`,
                                inline: false
                            });
                        }

                        await botMessage.edit({ embeds: [updatedEmbed] }).catch(() => {});
                    }
                }
            } catch (embedErr) {
                console.error('[ApplicationService] Embed update error:', embedErr.message);
            }
        }

        // 3. Oturumu temizle
        clearSession(userId, guildId);
        return { success: true, channelId };

    } catch (err) {
        console.error('[ApplicationService] finalizeAnswers error:', err.message);
        return { success: false };
    }
}

/**
 * Onay/Red sonrası cevap durumunu günceller
 */
async function updateAnswerStatus(userId, guildId, status) {
    try {
        await supabase
            .from('application_answers')
            .update({ status })
            .eq('user_id', userId)
            .eq('guild_id', guildId)
            .eq('status', 'pending');
    } catch (err) {
        console.error('[ApplicationService] updateAnswerStatus error:', err.message);
    }
}

/**
 * Modal builder: Verilen sayfa indeksindeki soruları modal olarak oluşturur
 */
function getQuestionText(q, lang = 'tr') {
    if (!q) return 'Soru';
    if (lang === 'en') {
        return q.question_en || q.question_tr || `Question ${q.order || 1}`;
    }
    return q.question_tr || q.question_en || `Soru ${q.order || 1}`;
}

function buildAnswerModal(questions, pageIndex, channelId, lang) {

    const modalQuestions = getModalQuestionsForPage(questions, pageIndex);
    const totalPages = getTotalModalPages(questions);

    if (modalQuestions.length === 0) return null;

    const modal = new ModalBuilder()
        .setCustomId(`app_answer_modal:${pageIndex}:${channelId}`)
        .setTitle(lang === 'tr'
            ? `📋 Başvuru Soruları (${pageIndex + 1}/${totalPages})`
            : `📋 Application Questions (${pageIndex + 1}/${totalPages})`);

    for (const q of modalQuestions) {
        const questionText = getQuestionText(q, lang);
        const label = questionText.length > 45 ? questionText.substring(0, 42) + '...' : questionText;

        const input = new TextInputBuilder()
            .setCustomId(q.id)
            .setLabel(label)
            .setStyle(q.type === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(q.required !== false)
            .setMaxLength(q.max_length || (q.type === 'paragraph' ? 1000 : 500));

        if (q.placeholder_tr || q.placeholder_en) {
            const placeholder = lang === 'en' ? (q.placeholder_en || q.placeholder_tr) : (q.placeholder_tr || q.placeholder_en);
            if (placeholder) input.setPlaceholder(placeholder.substring(0, 100));
        } else {
            input.setPlaceholder(questionText.substring(0, 100));
        }

        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }

    return modal;
}

/**
 * Evet/Hayır sorusu için Discord butonu mesajı oluşturur
 */
function buildYesNoMessage(question, channelId, lang) {

    const questionText = getQuestionText(question, lang);

    const embed = new EmbedBuilder()
        .setTitle(lang === 'tr' ? '📋 Başvuru Sorusu' : '📋 Application Question')
        .setDescription(`**${questionText}**`)
        .setColor('#5865F2');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`app_yesno:${question.id}:yes:${channelId}`)
            .setLabel(lang === 'tr' ? '✅ Evet' : '✅ Yes')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`app_yesno:${question.id}:no:${channelId}`)
            .setLabel(lang === 'tr' ? '❌ Hayır' : '❌ No')
            .setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row] };
}

/**
 * Seçim sorusu için Discord SelectMenu mesajı oluşturur
 */
function buildSelectMessage(question, channelId, lang, isMulti = false) {

    const questionText = getQuestionText(question, lang);
    let rawOptions = Array.isArray(question.options) ? question.options : [];

    if (rawOptions.length === 0) {
        rawOptions = [lang === 'tr' ? 'Seçenek 1' : 'Option 1'];
    }

    const safeOptions = rawOptions.slice(0, 25).map((opt, i) => {
        const rawLabel = typeof opt === 'string' ? opt : (opt.label || opt.value || `Option ${i + 1}`);
        const rawVal = typeof opt === 'string' ? opt : (opt.value || opt.label || `opt_${i + 1}`);
        const label = String(rawLabel).trim().substring(0, 100) || `Option ${i + 1}`;
        const value = String(rawVal).trim().substring(0, 100) || `val_${i + 1}`;
        return new StringSelectMenuOptionBuilder()
            .setLabel(label)
            .setValue(value);
    });

    const embed = new EmbedBuilder()
        .setTitle(lang === 'tr' ? '📋 Başvuru Sorusu' : '📋 Application Question')
        .setDescription(`**${questionText}**`)
        .setColor('#5865F2');

    const menu = new StringSelectMenuBuilder()
        .setCustomId(`app_select:${question.id}:${isMulti ? 'multi' : 'single'}:${channelId}`)
        .setPlaceholder(lang === 'tr' ? 'Bir seçenek seçin...' : 'Select an option...')
        .setMinValues(1)
        .setMaxValues(isMulti ? Math.min(safeOptions.length, 5) : 1)
        .addOptions(safeOptions);

    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

/**
 * Bir sonraki adımı belirler ve uygun interaction yanıtını döndürür
 * Returns: { type: 'modal'|'yesno'|'select'|'multiselect'|'done', ... }
 */
function getNextStep(session, allQuestions) {
    if (!session) return { type: 'done' };

    const answered = session.answers;
    const unanswered = allQuestions.filter(q => {
        if (q.type === 'rules_accept') return false;
        return !answered.hasOwnProperty(q.id);
    });

    if (unanswered.length === 0) return { type: 'done' };

    const next = unanswered[0];

    if (next.type === 'text' || next.type === 'paragraph') {
        // Modal sayfasını hesapla
        const modalTypes = ['text', 'paragraph'];
        const allModalQ = allQuestions.filter(q => modalTypes.includes(q.type));
        const answeredModalIds = allModalQ.filter(q => answered.hasOwnProperty(q.id)).map(q => q.id);
        const nextModalIndex = allModalQ.findIndex(q => !answered.hasOwnProperty(q.id));
        const pageIndex = Math.floor(nextModalIndex / 5);
        return { type: 'modal', pageIndex };
    }

    if (next.type === 'yesno') return { type: 'yesno', question: next };
    if (next.type === 'select') return { type: 'select', question: next };
    if (next.type === 'multiselect') return { type: 'multiselect', question: next };

    return { type: 'done' };
}

/**
 * Creates an embed listing the full questions for a specific modal page index
 */
function buildModalQuestionsEmbed(questions, pageIndex, lang) {
    const { EmbedBuilder } = require('discord.js');
    
    const embed = new EmbedBuilder()
        .setTitle(lang === 'tr' 
            ? `📋 Başvuru Soruları` 
            : `📋 Application Questions`)
        .setColor('#5865F2');

    let desc = '';
    questions.forEach((q, index) => {
        const questionText = getQuestionText(q, lang);
        desc += `**${index + 1}.** ${questionText}\n\n`;
    });

    embed.setDescription(desc.substring(0, 4000) || '...');
    return embed;
}

module.exports = {
    startSession,
    addAnswers,
    addSingleAnswer,
    getSession,
    clearSession,
    finalizeAnswers,
    updateAnswerStatus,
    buildAnswerModal,
    buildYesNoMessage,
    buildSelectMessage,
    getNextStep,
    getModalQuestionsForPage,
    getTotalModalPages,
    buildModalQuestionsEmbed
};
