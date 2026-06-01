const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { syncMemberRoles } = require('../utils/roleSync');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Synchronize your subscription roles with the database'),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    try {
      await syncMemberRoles(interaction.member, client.supabase);
      await interaction.editReply({ content: 'Your roles have been synchronized with the database.' });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'An error occurred while syncing your roles.' });
    }
  },
};
