const config = require('../../config/config');
const { MessageFlags, EmbedBuilder } = require('discord.js');

async function handleChangelogPublishCommand(interaction) {
    if (interaction.user.id !== config.OWNER_ID) {
        return await interaction.reply({ content: '❌ Bu komutu sadece bot sahibi kullanabilir.', flags: [MessageFlags.Ephemeral] });
    }

    const title = interaction.options.getString('title');
    // Content'teki \n'leri gerçek satır atlamasına çevirelim (discord komut satırından girileceği için)
    const content = interaction.options.getString('content').replace(/\\n/g, '\n');
    const version = interaction.options.getString('version');
    const type = interaction.options.getString('type');

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
        const { addChangelog } = require('@veyronix/database');
        await addChangelog({ title, content, version, type });

        let emoji = '🚀';
        if (type === 'bugfix') emoji = '🛠️';
        if (type === 'improvement') emoji = '✨';

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} ${title} (v${version})`)
            .setDescription(content)
            .setColor('#FCA311')
            .setFooter({ text: 'Veyronix System Updates' })
            .setTimestamp();
        
        await interaction.channel.send({ embeds: [embed] });
        await interaction.editReply({ content: '✅ Güncelleme başarıyla veritabanına kaydedildi ve kanala gönderildi.' });
    } catch (err) {
        console.error('[Changelog Error]', err);
        await interaction.editReply({ content: '❌ Bir hata oluştu: ' + err.message });
    }
}

module.exports = {
    handleChangelogPublishCommand
};
