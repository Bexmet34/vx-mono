const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-verify')
    .setDescription('Setup the verification message with a button')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('Veyronix Verification')
      .setDescription('To gain access to the rest of the server and our premium support services, please complete the verification process.\n\n' +
                      '**Requirements:**\n' +
                      '• Ensure you have our bot invited to your Discord server.\n' +
                      '• Your account must be linked with our system for automated role synchronization.\n\n' +
                      'Click the **Verify** button below to start. If you haven\'t added our bot yet, you can do so using the **Top.gg** link below.')
      .setColor('#00ff00')
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify_button')
          .setLabel('Verify Now')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setLabel('Top.gg Link')
          .setStyle(ButtonStyle.Link)
          .setURL('https://top.gg/tr/bot/1082239904169336902')
          .setEmoji('🔗'),
      );

    await interaction.reply({ content: 'Verification message sent below.', flags: [MessageFlags.Ephemeral] });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
