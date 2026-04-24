const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin commands for subscription management')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('userinfo')
        .setDescription('View a user\'s subscription information')
        .addUserOption(option => option.setName('target').setDescription('The user to check').setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setunlimited')
        .setDescription('Set a user to unlimited status')
        .addUserOption(option => option.setName('target').setDescription('The user to set').setRequired(true))
        .addBooleanOption(option => option.setName('status').setDescription('True to set unlimited, False to remove').setRequired(true))
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('target');

    if (subcommand === 'userinfo') {
      try {
        const { data: user, error } = await client.supabase
          .from('users')
          .select('*')
          .eq('discord_id', targetUser.id)
          .single();

        if (error || !user) {
          return await interaction.editReply({ content: `I couldn't find any account linked to **${targetUser.tag}**.` });
        }

        const isPremium = user.premium_until && new Date(user.premium_until) > new Date();
        const status = user.is_unlimited ? 'Unlimited' : (isPremium ? 'Premium' : 'Standard');
        const expiryDate = user.premium_until ? new Date(user.premium_until).toLocaleDateString() : 'N/A';
        const serverId = user.active_server_id || 'None';

        const embed = new EmbedBuilder()
          .setTitle(`Admin: ${targetUser.tag} Info`)
          .setColor('#ff0000')
          .addFields(
            { name: 'Status', value: `${status}`, inline: true },
            { name: 'Expires', value: `${expiryDate}`, inline: true },
            { name: 'Active Server ID', value: `${serverId}`, inline: true },
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'An error occurred while fetching the user information.' });
      }
    } else if (subcommand === 'setunlimited') {
      const status = interaction.options.getBoolean('status');
      try {
        const { data, error } = await client.supabase
          .from('users')
          .update({ is_unlimited: status })
          .eq('discord_id', targetUser.id);

        if (error) throw error;

        await interaction.editReply({ content: `Successfully updated **${targetUser.tag}**'s unlimited status to: **${status}**.` });
      } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'An error occurred while updating the status.' });
      }
    }
  },
};
