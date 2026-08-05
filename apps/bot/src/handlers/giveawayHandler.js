const { MessageFlags } = require('discord.js');
const { getGiveawayById, toggleGiveawayParticipant, getGiveawayParticipantCount } = require('@veyronix/database');
const { getGuildConfig } = require('../services/guildConfig');
const { buildGiveawayEmbed, buildGiveawayComponents } = require('../services/giveawayEngine');

/**
 * Handles Giveaway Interaction Buttons (e.g. giveaway_join)
 */
async function handleGiveawayButtons(interaction) {
  const customId = interaction.customId;

  if (customId.startsWith('giveaway_join:')) {
    const giveawayId = customId.split(':')[1];
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    const giveaway = await getGiveawayById(giveawayId);
    if (!giveaway || giveaway.status !== 'active') {
      return await interaction.reply({
        content: lang === 'tr' ? '❌ Bu çekiliş sona ermiş veya bulunamadı.' : '❌ This giveaway has ended or was not found.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    // Role Requirements Check
    if (giveaway.required_role_ids && giveaway.required_role_ids.length > 0) {
      const memberRoles = interaction.member?.roles?.cache;
      const hasRequiredRole = giveaway.required_role_ids.some(rid => memberRoles?.has(rid));
      if (!hasRequiredRole) {
        const requiredRolesStr = giveaway.required_role_ids.map(r => `<@&${r}>`).join(', ');
        return await interaction.reply({
          content: lang === 'tr'
            ? `⛔ **Çekilişe katılmak için şu rollere sahip olmalısınız:** ${requiredRolesStr}`
            : `⛔ **You must have the following roles to join:** ${requiredRolesStr}`,
          flags: [MessageFlags.Ephemeral]
        });
      }
    }

    // Toggle Join/Leave
    const result = await toggleGiveawayParticipant(giveawayId, interaction.guildId, interaction.user.id);
    const count = await getGiveawayParticipantCount(giveawayId);

    // Update Message Components with new Participant Count
    const embed = buildGiveawayEmbed(giveaway, count, lang, false);
    const components = buildGiveawayComponents(giveawayId, count, lang, false);

    await interaction.message.edit({ embeds: [embed], components: components }).catch(() => {});

    if (result.joined) {
      return await interaction.reply({
        content: lang === 'tr' ? '🎉 **Çekilişe başarıyla katıldınız!** Bol şans!' : '🎉 **You have joined the giveaway!** Good luck!',
        flags: [MessageFlags.Ephemeral]
      });
    } else {
      return await interaction.reply({
        content: lang === 'tr' ? 'ℹ️ **Çekiliş katılımınız iptal edildi.**' : 'ℹ️ **Your entry was removed.**',
        flags: [MessageFlags.Ephemeral]
      });
    }
  }
}

module.exports = {
  handleGiveawayButtons
};
