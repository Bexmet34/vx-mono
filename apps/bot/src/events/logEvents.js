const { EmbedBuilder, AuditLogEvent, Events } = require('discord.js');
const { getGuildConfig } = require('../services/guildConfig');

async function sendLog(guild, settings, embed) {
    if (!settings?.log_system_enabled || !settings?.log_channel_id) return;
    try {
        const channel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
        if (channel) {
            await channel.send({ embeds: [embed] }).catch(() => {});
        }
    } catch (e) {
        // Ignore fetch errors
    }
}

module.exports = (client) => {
    // 1. Message Delete
    client.on(Events.MessageDelete, async (message) => {
        if (!message.guild || message.author?.bot) return;
        const settings = await getGuildConfig(message.guild.id);
        if (!settings?.log_events?.message_delete) return;

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Mesaj Silindi')
            .setColor('#EF4444')
            .setDescription(`**${message.author.tag}** adlı kullanıcının mesajı <#${message.channel.id}> kanalında silindi.`)
            .addFields({ name: 'Mesaj İçeriği', value: message.content || '*İçerik yok veya resim*', inline: false })
            .setFooter({ text: `Kullanıcı ID: ${message.author.id}` })
            .setTimestamp();

        await sendLog(message.guild, settings, embed);
    });

    // 2. Message Update
    client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return; // Ignore embed updates

        const settings = await getGuildConfig(oldMessage.guild.id);
        if (!settings?.log_events?.message_edit) return;

        const embed = new EmbedBuilder()
            .setTitle('📝 Mesaj Düzenlendi')
            .setColor('#F59E0B')
            .setDescription(`**${oldMessage.author.tag}** mesajını <#${oldMessage.channel.id}> kanalında düzenledi.`)
            .addFields(
                { name: 'Eski Mesaj', value: oldMessage.content?.substring(0, 1024) || '*İçerik yok*', inline: false },
                { name: 'Yeni Mesaj', value: newMessage.content?.substring(0, 1024) || '*İçerik yok*', inline: false }
            )
            .setFooter({ text: `Kullanıcı ID: ${oldMessage.author.id}` })
            .setTimestamp();

        await sendLog(oldMessage.guild, settings, embed);
    });

    // 3. Channel Create
    client.on(Events.ChannelCreate, async (channel) => {
        if (!channel.guild) return;
        const settings = await getGuildConfig(channel.guild.id);
        if (!settings?.log_events?.channel_create) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelCreate,
            });
            const auditEntry = fetchedLogs.entries.first();
            if (auditEntry && auditEntry.target.id === channel.id) {
                executor = auditEntry.executor.tag;
            }
        } catch (e) { }

        const embed = new EmbedBuilder()
            .setTitle('🛠️ Kanal Oluşturuldu')
            .setColor('#3B82F6')
            .setDescription(`**#${channel.name}** kanalı oluşturuldu.`)
            .addFields({ name: 'Oluşturan', value: executor, inline: true })
            .setTimestamp();

        await sendLog(channel.guild, settings, embed);
    });

    // 4. Channel Delete
    client.on(Events.ChannelDelete, async (channel) => {
        if (!channel.guild) return;
        const settings = await getGuildConfig(channel.guild.id);
        if (!settings?.log_events?.channel_delete) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete,
            });
            const auditEntry = fetchedLogs.entries.first();
            if (auditEntry && auditEntry.target.id === channel.id) {
                executor = auditEntry.executor.tag;
            }
        } catch (e) { }

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Kanal Silindi')
            .setColor('#991B1B')
            .setDescription(`**#${channel.name}** kanalı silindi.`)
            .addFields({ name: 'Silen Kişi', value: executor, inline: true })
            .setTimestamp();

        await sendLog(channel.guild, settings, embed);
    });

    // 5. Bot Add (Guild Member Add)
    client.on(Events.GuildMemberAdd, async (member) => {
        if (!member.user.bot) return; // Sadece botları izle
        
        const settings = await getGuildConfig(member.guild.id);
        if (!settings?.log_events?.bot_add) return;

        let executor = 'Bilinmiyor';
        try {
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.BotAdd,
            });
            const auditEntry = fetchedLogs.entries.first();
            if (auditEntry && auditEntry.target.id === member.user.id) {
                executor = auditEntry.executor.tag;
            }
        } catch (e) { }

        const embed = new EmbedBuilder()
            .setTitle('🤖 Sunucuya Bot Eklendi')
            .setColor('#F97316')
            .setDescription(`**${member.user.tag}** adlı bot sunucuya katıldı.`)
            .addFields({ name: 'Ekleyen Yönetici', value: executor, inline: true })
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        await sendLog(member.guild, settings, embed);
    });

    // 6. Member Ban Add
    client.on(Events.GuildBanAdd, async (ban) => {
        const settings = await getGuildConfig(ban.guild.id);
        if (!settings?.log_events?.member_ban) return;

        let executor = 'Bilinmiyor';
        let reason = ban.reason || 'Belirtilmedi';
        try {
            const fetchedLogs = await ban.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd,
            });
            const auditEntry = fetchedLogs.entries.first();
            if (auditEntry && auditEntry.target.id === ban.user.id) {
                executor = auditEntry.executor.tag;
                if (!ban.reason && auditEntry.reason) reason = auditEntry.reason;
            }
        } catch (e) { }

        const embed = new EmbedBuilder()
            .setTitle('🚫 Üye Banlandı')
            .setColor('#DC2626')
            .setDescription(`**${ban.user.tag}** sunucudan yasaklandı.`)
            .addFields(
                { name: 'Banlayan', value: executor, inline: true },
                { name: 'Sebep', value: reason, inline: true }
            )
            .setThumbnail(ban.user.displayAvatarURL())
            .setTimestamp();

        await sendLog(ban.guild, settings, embed);
    });
};
