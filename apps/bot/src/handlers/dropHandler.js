const { MessageFlags } = require('discord.js');
const { claimDrop, getDropLog, getDropSettings } = require('@veyronix/database');
const { getGuildConfig } = require('../services/guildConfig');
const { markDropClaimed } = require('../services/dropEngine');

/**
 * dropHandler.js — Handles the "Kap!" button interaction
 * 
 * Race Condition Koruması:
 *   claimDrop() Supabase RPC'sini çağırır → atomik UPDATE.
 *   Sadece claimed_by = NULL olan kayıtlar güncellenir.
 *   İlk çağıran TRUE alır → kazandı.
 *   Sonrakiler FALSE alır → "kapmış" mesajı.
 */
async function handleDropButtons(interaction) {
  const { customId } = interaction;

  if (!customId.startsWith('drop_claim:')) return;

  const dropId = customId.split(':')[1];
  if (!dropId) return;

  // Kullanıcının sunucuya ait yapılandırmayı çek
  const guildConfig = await getGuildConfig(interaction.guildId);
  const lang        = guildConfig?.language || 'tr';
  const isEn        = lang === 'en';

  // Önce drop log'una bak — çoktan kapılmış mı?
  const dropLog = await getDropLog(dropId);
  if (!dropLog) {
    return interaction.reply({
      content: isEn ? '❌ This drop is no longer valid.' : '❌ Bu drop artık geçerli değil.',
      flags:   [MessageFlags.Ephemeral],
    });
  }

  if (dropLog.claimed_by) {
    return interaction.reply({
      content: isEn
        ? `⚡ Too late! <@${dropLog.claimed_by}> already grabbed the loot.`
        : `⚡ Geç kaldın! <@${dropLog.claimed_by}> ganimeti zaten kaptı.`,
      flags: [MessageFlags.Ephemeral],
    });
  }

  // ── Atomik Claim ───────────────────────────────────────────────────────────
  const won = await claimDrop(dropId, interaction.user.id);

  if (!won) {
    // Bir diğer kullanıcı nanosaniye fark ile önce tıkladı
    const freshLog = await getDropLog(dropId);
    return interaction.reply({
      content: freshLog?.claimed_by
        ? (isEn
          ? `⚡ Too late! <@${freshLog.claimed_by}> snagged it first!`
          : `⚡ Geç kaldın! <@${freshLog.claimed_by}> daha hızlıydı!`)
        : (isEn ? '⚡ Someone else got it first!' : '⚡ Başkası daha hızlı davrandı!'),
      flags: [MessageFlags.Ephemeral],
    });
  }

  // ── Kazandı! ───────────────────────────────────────────────────────────────
  // Drop embed mesajını "kapıldı" haline getir
  const dropSettings = await getDropSettings(dropLog.guild_id);
  await markDropClaimed(interaction.message, interaction.user.id, dropSettings || {}, lang);

  // Kazan mesajını ephemerally gönder
  await interaction.reply({
    content: isEn
      ? `🎉 **Congratulations!** You grabbed the loot!\n\n${
          dropLog.reward_type === 'role'
            ? '🎖️ Your reward role will be assigned shortly.'
            : `🪙 **${dropLog.reward_amount} ${dropLog.reward_type.toUpperCase()}** has been added to your account.`
        }`
      : `🎉 **Tebrikler!** Ganimeti kapan sensin!\n\n${
          dropLog.reward_type === 'role'
            ? '🎖️ Ödül rolün kısa süre içinde verilecek.'
            : `🪙 **${dropLog.reward_amount} ${dropLog.reward_type.toUpperCase()}** hesabına eklendi.`
        }`,
    flags: [MessageFlags.Ephemeral],
  });

  // TODO: Burada reward_type'a göre ödül dağıtım mantığı entegre edilecek
  // (coin/xp sistemi ile bağlantı, rol verme vs.)
}

module.exports = {
  handleDropButtons,
};
