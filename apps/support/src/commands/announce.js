const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Belirlenen bir kanala profesyonel bir duyuru mesajı gönderir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => 
      option.setName('kanal')
        .setDescription('Duyurunun gönderileceği kanal')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option => 
      option.setName('baslik')
        .setDescription('Duyuru başlığı')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('mesaj')
        .setDescription('Duyuru içeriği (Alt satır için \\n kullanabilirsiniz)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('gorsel')
        .setDescription('Duyuruya eklenecek görsel linki (Opsiyonel)')),
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('kanal');
    const title = interaction.options.getString('baslik');
    const description = interaction.options.getString('mesaj').replace(/\\n/g, '\n');
    const image = interaction.options.getString('gorsel');

    const announceEmbed = new EmbedBuilder()
      .setTitle(`📢 ${title}`)
      .setDescription(description)
      .setColor('#ffcc00')
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `${interaction.guild.name} Duyuru Sistemi`, iconURL: interaction.guild.iconURL() });

    if (image) {
      // Basic URL validation
      if (image.startsWith('http')) {
        announceEmbed.setImage(image);
      }
    }

    try {
      await channel.send({ embeds: [announceEmbed] });
      await interaction.reply({ content: `Duyuru başarıyla ${channel} kanalına gönderildi.`, flags: [MessageFlags.Ephemeral] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Duyuru gönderilirken bir hata oluştu. Kanal izinlerini kontrol edin.', flags: [MessageFlags.Ephemeral] });
    }
  },
};
