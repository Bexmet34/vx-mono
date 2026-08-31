const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { syncAllGuildMembers } = require('../utils/roleSync');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync-all')
    .setDescription('Tüm sunucu üyelerinin rollerini veritabanı ile baştan sona senkronize eder (Yalnızca Yönetici)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      await interaction.editReply({ content: '⏳ Tüm sunucu taranıyor ve roller senkronize ediliyor, lütfen bekleyin...' });
      
      const result = await syncAllGuildMembers(interaction.guild, client.supabase);

      const embed = new EmbedBuilder()
        .setTitle('✅ Toplu Rol Senkronizasyonu Tamamlandı')
        .setColor('#10b981')
        .addFields(
          { name: '👥 Kontrol Edilen Üye', value: `${result.totalMembers}`, inline: true },
          { name: '➕ Eklenen Rol Sayısı', value: `${result.rolesAdded}`, inline: true },
          { name: '➖ Kaldırılan Rol Sayısı', value: `${result.rolesRemoved}`, inline: true }
        )
        .setFooter({ text: 'Veyronix Support System' })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('[SyncAllCommand] Error:', error);
      await interaction.editReply({ content: '❌ Toplu senkronizasyon sırasında hata oluştu: ' + error.message });
    }
  },
};
