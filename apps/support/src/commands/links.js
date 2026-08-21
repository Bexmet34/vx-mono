const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { LINKS } = require('@veyronix/config');

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
        .setURL(LINKS.DASHBOARD),
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL(LINKS.SUPPORT_SERVER),
      new ButtonBuilder()
        .setLabel('Premium')
        .setStyle(ButtonStyle.Link)
        .setURL(LINKS.PAGE_PREMIUM),
    );

    await interaction.reply({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
  },
};
