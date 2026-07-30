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

// RAM'de geçici cevap deposu (Modal zincirleme için)
// Key: `${userId}_${guildId}`, Value: { channelId, answers, questionList, currentPage }
const pendingAnswers = new Map();

/**
 * Kullanıcının anket oturumunu başlatır
 */
function startSession(userId, guildId, channelId, questionList) {
    const key = `${userId}_${guildId}`;
    pendingAnswers.set(key, {
        channelId,
        answers: {},
        questionList, // Tüm sorular (rules_accept hariç)
        currentPage: 0
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
    if (!session) return false;

    try {
        // 1. Supabase'e kaydet
        const { error } = await supabase
            .from('application_answers')
            .insert({
                guild_id: guildId,
                user_id: userId,
                ticket_channel_id: session.channelId,
                answers: session.answers,
                status: 'pending'
            });

        if (error) {
            console.error('[ApplicationService] Supabase insert error:', error.message);
        }

        // 2. Ticket kanalındaki embed'i güncelle
        if (session.channelId && client) {
            try {
                const channel = await client.channels.fetch(session.channelId).catch(() => null);
                if (channel) {
                    const messages = await channel.messages.fetch({ limit: 10 });
                    const botMessage = messages.find(m => m.author.bot && m.embeds.length > 0);

                    if (botMessage) {
                        const { EmbedBuilder } = require('discord.js');
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
        return true;

    } catch (err) {
        console.error('[ApplicationService] finalizeAnswers error:', err.message);
        return false;
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
function buildAnswerModal(questions, pageIndex, channelId, lang) {
    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
    const modalQuestions = getModalQuestionsForPage(questions, pageIndex);
    const totalPages = getTotalModalPages(questions);

    if (modalQuestions.length === 0) return null;

    const modal = new ModalBuilder()
        .setCustomId(`app_answer_modal:${pageIndex}:${channelId}`)
        .setTitle(lang === 'tr'
            ? `📋 Başvuru Soruları (${pageIndex + 1}/${totalPages})`
            : `📋 Application Questions (${pageIndex + 1}/${totalPages})`);

    for (const q of modalQuestions) {
        const questionText = q.question_tr || q.question_en || `Soru ${q.order}`;
        const label = questionText.length > 45 ? questionText.substring(0, 42) + '...' : questionText;

        const input = new TextInputBuilder()
            .setCustomId(q.id)
            .setLabel(label)
            .setStyle(q.type === 'paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(q.required !== false)
            .setMaxLength(q.max_length || (q.type === 'paragraph' ? 1000 : 500));

        if (q.placeholder_tr || q.placeholder_en) {
            const placeholder = lang === 'tr' ? q.placeholder_tr : q.placeholder_en;
            if (placeholder) input.setPlaceholder(placeholder.substring(0, 100));
        }

        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }

    return modal;
}

/**
 * Evet/Hayır sorusu için Discord butonu mesajı oluşturur
 */
function buildYesNoMessage(question, channelId, lang) {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
    const questionText = question.question_tr || question.question_en || 'Soru';

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
    const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
    const questionText = question.question_tr || question.question_en || 'Soru';
    const options = question.options || [];

    const embed = new EmbedBuilder()
        .setTitle(lang === 'tr' ? '📋 Başvuru Sorusu' : '📋 Application Question')
        .setDescription(`**${questionText}**`)
        .setColor('#5865F2');

    const menu = new StringSelectMenuBuilder()
        .setCustomId(`app_select:${question.id}:${isMulti ? 'multi' : 'single'}:${channelId}`)
        .setPlaceholder(lang === 'tr' ? 'Bir seçenek seçin...' : 'Select an option...')
        .setMinValues(1)
        .setMaxValues(isMulti ? Math.min(options.length, 5) : 1)
        .addOptions(
            options.map(opt => {
                const label = typeof opt === 'string' ? opt : (opt.label || opt);
                const value = typeof opt === 'string' ? opt : (opt.value || opt.label || opt);
                return new StringSelectMenuOptionBuilder()
                    .setLabel(String(label).substring(0, 100))
                    .setValue(String(value).substring(0, 100));
            })
        );

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
    getTotalModalPages
};
