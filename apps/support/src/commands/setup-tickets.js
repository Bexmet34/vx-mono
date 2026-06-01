const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-tickets')
    .setDescription('Setup the ticket system embed')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('Veyronix Support System')
      .setDescription('Welcome to the Veyronix Support Portal. If you have any issues or questions regarding our services, please select the most appropriate category below to open a private ticket.\n\n' +
                      'Our dedicated support team will review your inquiry and get back to you as soon as possible. Please provide as much detail as possible once the ticket is opened.')
      .setColor('#0099ff')
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_category_select')
      .setPlaceholder('Select a category')
      .addOptions([
        { label: 'General Support', value: 'genel_destek', emoji: '🛠️' },
        { label: 'Bot Installation Support', value: 'bot_kurulum', emoji: '🤖' },
        { label: 'Premium / Billing', value: 'premium_odeme', emoji: '💳' },
        { label: 'Bug Report', value: 'bug_bildirimi', emoji: '🐛' },
        { label: 'Suggestion / Feedback', value: 'oneri_geribildirim', emoji: '💡' },
        { label: 'Partnership / Business', value: 'partnerlik', emoji: '🤝' },
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({ content: 'Ticket system setup message sent.', flags: [MessageFlags.Ephemeral] });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};
