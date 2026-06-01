const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Show your account and all your linked server subscriptions.'),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      // 1. Get or auto-register user (Upsert)
      const { data: user, error: userError } = await client.supabase
        .from('users')
        .upsert({ discord_id: interaction.user.id }, { onConflict: 'discord_id' })
        .select()
        .single();

      if (userError) throw userError;

      // 2. Fetch all servers owned by this user
      const { data: subscriptions, error: subError } = await client.supabase
        .from('subscriptions')
        .select('*')
        .eq('owner_id', interaction.user.id);

      const isUserPremium = user.premium_until && new Date(user.premium_until) > new Date();
      const userStatusLabel = user.is_unlimited ? '💎 Unlimited Account' : (isUserPremium ? '🌟 Premium Account' : '⚪ Standard Account');
      
      const embed = new EmbedBuilder()
        .setTitle('🛰️ Veyronix Global Info')
        .setThumbnail(interaction.user.displayAvatarURL())
        .setColor(isUserPremium || user.is_unlimited ? '#ffd700' : '#3498db')
        .addFields(
          { name: '👤 Personal Identity', value: `**${interaction.user.tag}**`, inline: true },
          { name: '🎖️ Account Status', value: `**${userStatusLabel}**`, inline: true },
          { name: '📅 Personal Expiry', value: `${user.premium_until ? new Date(user.premium_until).toLocaleDateString() : 'Lifetime / None'}`, inline: true }
        );

      // Construct server list
      if (subscriptions && subscriptions.length > 0) {
        let serverList = '';
        subscriptions.forEach((sub, index) => {
          // Fixed: Check both is_unlimited and is_active for each individual server
          const status = sub.is_unlimited ? '💎 Unlimited' : (sub.is_active ? '✅ Active' : '❌ Inactive');
          const expiry = sub.is_unlimited ? 'Lifetime' : (sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A');
          
          serverList += `**${index + 1}. ${sub.guild_name}** (${sub.guild_id})\n` +
                        `└ Status: ${status} | Expiry: ${expiry}\n\n`;
        });
        
        // Ensure the string doesn't exceed Discord's field limit (1024 chars)
        embed.addFields({ name: `🏰 Your Linked Servers (${subscriptions.length})`, value: serverList.length > 1024 ? serverList.substring(0, 1021) + '...' : serverList });
      } else {
        embed.addFields({ name: '🏰 Your Linked Servers', value: 'You don\'t have any servers registered in our system yet.' });
      }

      embed.setFooter({ text: 'Information is synchronized with the central database.' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Info command global error:', error);
      await interaction.editReply({ content: 'An unexpected error occurred while fetching your global data.' });
    }
  },
};
