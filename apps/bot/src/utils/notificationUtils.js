const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const { LINKS, LOGO_NAME, LOGO_PATH } = require('../constants/constants');
const { t } = require('../services/i18n');

/**
 * Sends a notification to the server owner about subscription changes.
 * Hem Türkçe hem İngilizce mesajı tek embed içinde gönderir.
 * @param {import('discord.js').Client} client 
 * @param {string} guildId 
 * @param {string} type 'extended' | 'unlimited' | 'disabled'
 * @param {number} [days] 
 * @param {string|Date} [expiryDate]
 */
async function sendSubscriptionNotification(client, guildId, type, days = 0, expiryDate = null) {
    try {
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) return;

        const owner = await guild.fetchOwner().catch(() => null);
        if (!owner) return;

        // Format Date
        let formattedDate = 'Belirtilmedi';
        if (expiryDate) {
            const dateObj = new Date(expiryDate);
            // TR Timezone adjustment (UTC+3)
            const trDate = new Date(dateObj.getTime() + (3 * 60 * 60 * 1000));
            const dd = String(trDate.getUTCDate()).padStart(2, '0');
            const mm = String(trDate.getUTCMonth() + 1).padStart(2, '0');
            const yyyy = trDate.getUTCFullYear();
            formattedDate = `${dd}.${mm}.${yyyy}`;
        } else {
            formattedDate = new Date().toLocaleDateString('tr-TR');
        }

        const { getNotification } = require('../services/notificationService');
        const notification = await getNotification(type === 'disabled' ? 'sub_expired' : 'sub_extended', 'tr', {
            sunucu: guild.name,
            tarih: formattedDate
        });

        if (notification) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL(LINKS.WEBSITE),
                new ButtonBuilder()
                    .setLabel('Destek / Support')
                    .setStyle(ButtonStyle.Link)
                    .setURL(LINKS.SUPPORT_SERVER)
            );

            await owner.send({
                embeds: notification.embeds,
                content: notification.content,
                components: [row]
            }).catch(err => console.error(`[NotificationUtils] Could not send DM to owner of ${guild.name}: ${err.message}`));
        }

    } catch (err) {
        console.error('[NotificationUtils] Notification Error:', err.message);
    }
}

/**
 * Logs a transaction to the public support channel
 */
async function logPublicTransaction(client, userId, guildId, guildName, type, details = '') {
    try {
        const config = require('../config/config');
        if (!config.LOG_TRANSACTION_CHANNEL_ID) return;

        const channel = await client.channels.fetch(config.LOG_TRANSACTION_CHANNEL_ID).catch(() => null);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle('📜 İşlem Kaydı | Transaction Log')
            .setColor(type === 'reward' ? '#2ECC71' : '#3498DB')
            .addFields(
                { name: 'Kullanıcı | User', value: `<@${userId}> (\`${userId}\`)`, inline: true },
                { name: 'Sunucu | Server', value: `**${guildName}** (\`${guildId}\`)`, inline: true },
                { name: 'İşlem | Action', value: details || type, inline: false }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => { });
    } catch (err) {
        console.error('[NotificationUtils] Log Error:', err.message);
    }
}

module.exports = {
    sendSubscriptionNotification,
    logPublicTransaction
};
