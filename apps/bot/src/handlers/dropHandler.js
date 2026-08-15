const { claimDropByCode, addDropPoints } = require('@veyronix/database');
const { getGuildConfig } = require('../services/guildConfig');
const { getActiveDrops, markDropClaimed } = require('../services/dropEngine');

/**
 * dropHandler.js — Drop v2: Kod Mesajı Handler
 *
 * messageCreate event'inden çağrılır.
 * Kullanıcının yazdığı mesaj aktif bir drop koduyla eşleşiyorsa
 * atomik olarak claim eder, puan verir ve embed'i günceller.
 *
 * @param {import('discord.js').Message} message
 */
async function handleDropCodeMessage(message) {
  try {
    if (message.author?.bot || !message.guild) return;

    const content = message.content?.trim().toUpperCase();
    if (!content || content.length !== 8) return;

    // Sadece harf ve rakamdan oluşan 8 karakter mi?
    if (!/^[A-Z0-9]{8}$/.test(content)) return;

    const mapKey    = `${message.guild.id}:${message.channel.id}`;
    const activeDrops = getActiveDrops();
    const drop      = activeDrops.get(mapKey);

    if (!drop) return;                       // Bu kanalda aktif drop yok
    if (drop.code !== content) return;       // Kod eşleşmedi
    if (new Date() > drop.expiresAt) return; // Süresi geçmiş (RAM temizlenmemiş olabilir)

    // ── Atomik claim ──────────────────────────────────────────────────────────
    const won = await claimDropByCode(
      drop.code,
      message.guild.id,
      message.channel.id,
      message.author.id
    );

    if (!won) {
      // Başkası nanosaniye fark ile önce yazdı — sessizce yoksay
      return;
    }

    // ── Kazandı! ─────────────────────────────────────────────────────────────
    activeDrops.delete(mapKey); // RAM'den kaldır

    // Puan ekle
    await addDropPoints(message.guild.id, message.author.id, drop.pointsToGive);

    // Embed'i güncelle
    const guildConfig = await getGuildConfig(message.guild.id);
    const lang        = guildConfig?.language || 'tr';
    const isEn        = lang === 'en';

    await markDropClaimed(drop.message, message.author.id, drop, lang);

    // Kazanma mesajı (sadece o kullanıcıya görünür değil, kanala yaz — drop'un karakteri)
    await message.reply({
      content: isEn
        ? `🎉 **Congratulations <@${message.author.id}>!** You claimed the loot!\n🏆 **+${drop.pointsToGive} points** have been added to your account.`
        : `🎉 **Tebrikler <@${message.author.id}>!** Ganimeti sen kaptın!\n🏆 Hesabına **+${drop.pointsToGive} puan** eklendi.`,
    }).catch(() => {});

  } catch (err) {
    console.error('[DropHandler] handleDropCodeMessage error:', err.message);
  }
}

module.exports = {
  handleDropCodeMessage,
};
