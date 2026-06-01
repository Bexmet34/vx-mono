const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Useful links for the bot and panel'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Helpful Links')
      .setDescription('Use the buttons below to access our panel, invite the bot, or renew your subscription.')
      .setColor('#00ffcc')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Web Panel')
        .setStyle(ButtonStyle.Link)
        .setURL('https://example.com/panel'), // Replace with actual URL
      new ButtonBuilder()
        .setLabel('Invite Bot')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/invite/example'), // Replace with actual URL
      new ButtonBuilder()
        .setLabel('Renew Subscription')
        .setStyle(ButtonStyle.Link)
        .setURL('https://example.com/renew'), // Replace with actual URL
    );

    await interaction.reply({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
  },
};
