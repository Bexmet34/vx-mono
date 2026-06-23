const TelegramBot = require('node-telegram-bot-api');
const { supabase } = require('@veyronix/database');
const config = require('../config/config');

let bot = null;

function initTelegramBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('[TelegramService] TELEGRAM_BOT_TOKEN is not set. Telegram bot will not start.');
        return;
    }

    try {
        bot = new TelegramBot(token, { polling: true });
        console.log('[TelegramService] Telegram Bot started in polling mode.');

        // Chat ID öğrenme kodu kaldırıldı

        // Buton tıklamalarını dinleyici
        bot.on('callback_query', async (query) => {
            const chatId = query.message.chat.id;
            const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
            
            if (adminChatId && chatId.toString() !== adminChatId) {
                return bot.answerCallbackQuery(query.id, { text: 'Yetkisiz işlem.', show_alert: true });
            }

            const data = query.data; // format: action_paymentId
            if (data.startsWith('approve_') || data.startsWith('reject_')) {
                const parts = data.split('_');
                const action = parts[0]; // approve or reject
                const paymentId = parts.slice(1).join('_');

                await handlePaymentCallback(query, action, paymentId);
            }
        });

        bot.on('polling_error', (error) => {
            console.error(`[TelegramService] Polling Error: ${error.code} - ${error.message}`);
        });

    } catch (error) {
        console.error('[TelegramService] Failed to start Telegram bot:', error);
    }
}

async function getParsedTemplate(templateId, placeholders = {}) {
    const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

    if (!template) return null;

    let title = template.title_tr;
    let content = template.content_tr;

    Object.keys(placeholders).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        title = title?.replace(regex, placeholders[key]);
        content = content?.replace(regex, placeholders[key]);
    });

    return { title, content, color: template.color, is_embed: template.is_embed };
}

async function handlePaymentCallback(query, action, paymentId) {
    try {
        // 1. Ödemeyi al
        const { data: payment, error: fetchError } = await supabase
            .from('crypto_payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (fetchError || !payment) {
            return bot.answerCallbackQuery(query.id, { text: 'Ödeme kaydı bulunamadı.', show_alert: true });
        }

        if (payment.status !== 'pending') {
            return bot.answerCallbackQuery(query.id, { text: `Bu ödeme zaten işlenmiş. (Durum: ${payment.status})`, show_alert: true });
        }

        const dbStatus = action === 'approve' ? 'paid' : 'rejected';

        // 2. Durumu güncelle
        const { error: updateError } = await supabase
            .from('crypto_payments')
            .update({ status: dbStatus })
            .eq('id', paymentId);

        if (updateError) throw updateError;

        if (dbStatus === 'paid') {
            // Approve Logic
            const isUserPlan = payment.plan_type === 'user';
            
            if (isUserPlan) {
                const { data: userProfile, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('discord_id', payment.user_id)
                    .single();

                const now = new Date();
                let currentExpiry = now;
                if (!userError && userProfile && userProfile.premium_until) {
                    const profileExpiry = new Date(userProfile.premium_until);
                    if (profileExpiry > now) {
                        currentExpiry = profileExpiry;
                    }
                }
                currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

                await supabase.from('users').upsert({
                    discord_id: payment.user_id,
                    premium_until: currentExpiry.toISOString(),
                    is_unlimited: userProfile?.is_unlimited || false
                }, { onConflict: 'discord_id' });
            } else {
                const { data: subscription, error: subError } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('guild_id', payment.guild_id)
                    .single();

                if (!subError && subscription) {
                    const now = new Date();
                    let currentExpiry = new Date(subscription.expires_at);
                    if (currentExpiry < now) currentExpiry = now;
                    currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

                    await supabase.from('subscriptions').update({
                        expires_at: currentExpiry.toISOString(),
                        is_active: true,
                        is_unlimited: subscription.is_unlimited || false
                    }).eq('id', subscription.id);
                } else {
                    const now = new Date();
                    now.setDate(now.getDate() + payment.duration_days);
                    await supabase.from('subscriptions').insert({
                        guild_id: payment.guild_id,
                        guild_name: payment.guild_name || 'Bilinmeyen Sunucu',
                        expires_at: now.toISOString(),
                        is_active: true,
                        is_unlimited: false
                    });
                }
            }

            // Notification (Bot DM)
            const parsed = await getParsedTemplate('manual_payment_approved', {
                sunucu: payment.guild_name || 'Sunucu',
                gun: payment.duration_days
            });
            if (parsed && payment.user_id) {
                await supabase.from('message_queue').insert({
                    guild_id: payment.guild_id,
                    owner_id: payment.user_id,
                    message_content: JSON.stringify({
                        embeds: [{
                            title: parsed.title,
                            description: parsed.content,
                            color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : 0x2ecc71,
                            timestamp: new Date().toISOString()
                        }]
                    }),
                    status: 'pending'
                });
            }

            bot.answerCallbackQuery(query.id, { text: 'Ödeme onaylandı ve premium aktif edildi.' });
            bot.editMessageText(`✅ **ONAYLANDI**\n\n` + query.message.text, {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: { inline_keyboard: [] }
            });

        } else if (dbStatus === 'rejected') {
            const parsedRej = await getParsedTemplate('manual_payment_rejected', {
                sunucu: payment.guild_name || 'Sunucu'
            });
            if (parsedRej && payment.user_id) {
                await supabase.from('message_queue').insert({
                    guild_id: payment.guild_id,
                    owner_id: payment.user_id,
                    message_content: JSON.stringify({
                        embeds: [{
                            title: parsedRej.title,
                            description: parsedRej.content,
                            color: parsedRej.color ? parseInt(parsedRej.color.replace('#', ''), 16) : 0xe74c3c,
                            timestamp: new Date().toISOString()
                        }]
                    }),
                    status: 'pending'
                });
            }

            bot.answerCallbackQuery(query.id, { text: 'Ödeme reddedildi.' });
            bot.editMessageText(`❌ **REDDEDİLDİ**\n\n` + query.message.text, {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: { inline_keyboard: [] }
            });
        }
    } catch (e) {
        console.error('[TelegramService] Error handling payment callback:', e);
        bot.answerCallbackQuery(query.id, { text: 'Bir hata oluştu.', show_alert: true });
    }
}

async function sendPaymentNotificationToTelegram(paymentData) {
    if (!bot) return;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!adminChatId) return;

    const message = `🔔 **YENİ HAVALE/EFT BİLDİRİMİ** 🔔\n\n` +
        `👤 **Gönderen:** ${paymentData.sender_name}\n` +
        `🏦 **Banka:** ${paymentData.target_bank || 'Bilinmiyor'}\n` +
        `💰 **Tutar:** ${paymentData.amount} ${paymentData.currency}\n` +
        `📅 **Süre:** ${paymentData.duration_days} Gün\n` +
        `🆔 **Kullanıcı ID:** ${paymentData.user_id}\n` +
        `📋 **Kod:** \`${paymentData.description_code}\`\n` +
        `⚙️ **Plan Tipi:** ${paymentData.plan_type === 'user' ? 'Bireysel' : 'Sunucu'}\n` +
        (paymentData.plan_type === 'server' ? `🏠 **Sunucu:** ${paymentData.guild_name}\n` : '');

    const opts = {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Onayla', callback_data: `approve_${paymentData.id}` },
                    { text: '❌ Reddet', callback_data: `reject_${paymentData.id}` }
                ]
            ]
        }
    };

    try {
        await bot.sendMessage(adminChatId, message, opts);
    } catch (e) {
        console.error('[TelegramService] Error sending notification:', e);
    }
}

module.exports = {
    initTelegramBot,
    sendPaymentNotificationToTelegram
};
