const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { syncMemberRoles } = require('../utils/roleSync');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Rol ve abonelik durumunuzu veritabanı ile anlık olarak senkronize eder'),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    try {
      const result = await syncMemberRoles(interaction.member, client.supabase);
      
      const embed = new EmbedBuilder()
        .setTitle('🔄 Veyronix Rol Senkronizasyonu')
        .setColor('#4f46e5')
        .setFooter({ text: 'Veyronix Support System • veyronix.com.tr' })
        .setTimestamp();

      const lines = [];
      if (result.added.length > 0) {
        lines.push(`✅ **Yeni Eklenen Roller:**\n${result.added.map(r => `• \`${r}\``).join('\n')}`);
      }
      if (result.removed.length > 0) {
        lines.push(`❌ **Kaldırılan Roller (Süresi Biten):**\n${result.removed.map(r => `• \`${r}\``).join('\n')}`);
      }
      if (result.added.length === 0 && result.removed.length === 0) {
        lines.push('✨ Rolleriniz zaten en güncel durumda.');
      }

      if (result.isPaidGM) {
        lines.push('\n👑 **Durum:** Ücretli Sunucu Premium Sahibi (Guild Master)');
      } else if (result.isPartnerGM) {
        lines.push('\n🛡️ **Durum:** Partner / Anlaşmalı Sunucu Sahibi (Guild Master)');
      }
      if (result.isIndividualSupporter) {
        lines.push('💎 **Bireysel Plan:** Aktif (Oylama Muafiyeti)');
      }

      embed.setDescription(lines.join('\n\n'));

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[SyncCommand] Error:', error);
      await interaction.editReply({ content: '❌ Roller senkronize edilirken bir hata oluştu: ' + error.message });
    }
  },
};
