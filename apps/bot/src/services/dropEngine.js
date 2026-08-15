const { EmbedBuilder } = require('discord.js');
const { createDropLog, updateDropMessageId } = require('@veyronix/database');

/**
 * dropEngine.js — Drop v2: 8 Haneli Kod Sistemi
 *
 * Bot hedef kanala rastgele 8 haneli bir kod atar.
 * O kodu chat'e ilk yazan kullanıcı kazanır.
 * Buton sistemi tamamen kaldırıldı.
 */

// ─── Ödül tiplerine göre renkler ve emojiler ─────────────────────────────────
const REWARD_VISUALS = {
  coin:   { color: '#FFD700', emoji: '🪙', labelTr: 'Coin',     labelEn: 'Coin'   },
  xp:     { color: '#7C83FD', emoji: '⭐', labelTr: 'XP',       labelEn: 'XP'     },
  role:   { color: '#2ed573', emoji: '🎖️', labelTr: 'Özel Rol', labelEn: 'Special Role' },
  ticket: { color: '#ff6b81', emoji: '🎟️', labelTr: 'Bilet',    labelEn: 'Ticket' },
};

// ─── Aktif drop'ları RAM'de sakla: Map<`${guildId}:${channelId}`, dropInfo> ──
// dropInfo: { dropId, code, expiresAt, rewardType, rewardAmount, pointsToGive }
const activeDrops = new Map();

/**
 * 8 karakterli rastgele büyük harf + rakam kodu üretir.
 * Örn: "XK7M2P9Q"
 */
function generateDropCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karıştırıcı karakterler hariç (0,O,1,I)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Drop embed'ini oluşturur (kod ile)
 */
function buildDropEmbed(dropSettings, code, lang = 'tr') {
  const visual = REWARD_VISUALS[dropSettings.reward_type] || REWARD_VISUALS.coin;
  const isEn   = lang === 'en';
  const expSec = dropSettings.code_expire_seconds || 60;

  const rewardLine = dropSettings.reward_type === 'role'
    ? (isEn ? `🎖️ **Special Role**` : `🎖️ **Özel Rol**`)
    : `${visual.emoji} **${dropSettings.reward_amount || 100} ${visual[isEn ? 'labelEn' : 'labelTr']}**`;

  return new EmbedBuilder()
    .setTitle(`🎁 ${isEn ? 'LOOT DROP!' : 'GANİMET DÜŞTÜ!'}`)
    .setDescription(
      (isEn
        ? `## 🔑 Type the code below to claim the reward!\n\n`
        : `## 🔑 Aşağıdaki kodu chat'e yaz ve ödülü kap!\n\n`) +
      `# \`${code}\`\n\n` +
      (isEn
        ? `**Reward:** ${rewardLine}\n**Points:** 🏆 ${dropSettings.drop_points || 10} pts\n\n⏱️ Code expires in **${expSec} seconds**. First one wins!`
        : `**Ödül:** ${rewardLine}\n**Puan:** 🏆 ${dropSettings.drop_points || 10} puan\n\n⏱️ Kod **${expSec} saniye** geçerli. İlk yazan kazanır!`)
    )
    .setColor(visual.color)
    .setFooter({
      text: isEn
        ? 'Veyronix Drop • Type the code exactly as shown!'
        : 'Veyronix Drop • Kodu tam olarak göründüğü gibi yaz!'
    })
    .setTimestamp();
}

/**
 * Drop'u kanala yayınlar:
 * 1. Kod üretir
 * 2. DB'ye log kaydı oluşturur
 * 3. Embed gönderir
 * 4. Aktif drop map'ine ekler (RAM)
 *
 * @param {import('discord.js').Client} client
 * @param {object} dropSettings   drop_settings DB kaydı
 * @param {string} channelId      Hedef kanal ID'si
 * @param {string} triggerType    'scheduled' | 'percent_roll'
 * @param {string} lang           'tr' | 'en'
 * @returns {object|null}
 */
async function publishDrop(client, dropSettings, channelId, triggerType = 'scheduled', lang = 'tr') {
  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return null;

    const code    = generateDropCode();
    const expSec  = dropSettings.code_expire_seconds || 60;
    const expires = new Date(Date.now() + expSec * 1000);

    // 1. DB log oluştur
    const dropLog = await createDropLog({
      guild_id:      dropSettings.guild_id,
      channel_id:    channelId,
      trigger_type:  triggerType,
      reward_type:   dropSettings.reward_type   || 'coin',
      reward_amount: dropSettings.reward_amount || 100,
      drop_code:     code,
      expires_at:    expires.toISOString(),
      points_given:  dropSettings.drop_points   || 10,
    });

    // 2. Embed gönder
    const embed   = buildDropEmbed(dropSettings, code, lang);
    const message = await channel.send({ embeds: [embed] });

    // 3. message_id'yi DB'ye yaz
    if (message?.id) {
      await updateDropMessageId(dropLog.id, message.id);
    }

    // 4. Aktif drop olarak RAM'e kaydet
    const mapKey = `${dropSettings.guild_id}:${channelId}`;
    activeDrops.set(mapKey, {
      dropId:       dropLog.id,
      code,
      expiresAt:    expires,
      message,
      rewardType:   dropSettings.reward_type   || 'coin',
      rewardAmount: dropSettings.reward_amount || 100,
      pointsToGive: dropSettings.drop_points   || 10,
    });

    // Süre dolunca aktif drop'u temizle ve embed'i güncelle
    setTimeout(async () => {
      const current = activeDrops.get(mapKey);
      if (current && current.dropId === dropLog.id) {
        activeDrops.delete(mapKey);
        await markDropExpired(message, lang).catch(() => {});
      }
    }, expSec * 1000);

    return { dropLog, message };
  } catch (err) {
    console.error('[DropEngine] Error publishing drop:', err.message);
    return null;
  }
}

/**
 * Drop mesajını "kazanıldı" olarak günceller
 */
async function markDropClaimed(message, winnerId, dropInfo, lang = 'tr') {
  try {
    const visual = REWARD_VISUALS[dropInfo.rewardType] || REWARD_VISUALS.coin;
    const isEn   = lang === 'en';

    const claimedEmbed = new EmbedBuilder()
      .setTitle(`${visual.emoji} ${isEn ? 'Loot Claimed!' : 'Ganimet Kapıldı!'}`)
      .setDescription(
        isEn
          ? `<@${winnerId}> was the fastest and claimed the loot!\n\n🏆 **+${dropInfo.pointsToGive} points** added!`
          : `<@${winnerId}> en hızlı davrandı ve ganimeti kaptı!\n\n🏆 **+${dropInfo.pointsToGive} puan** eklendi!`
      )
      .setColor('#2ed573')
      .setFooter({ text: 'Veyronix Drop' })
      .setTimestamp();

    await message.edit({ embeds: [claimedEmbed] });
  } catch (err) {
    console.error('[DropEngine] Error marking drop as claimed:', err.message);
  }
}

/**
 * Süresi dolmuş drop embed'ini günceller
 */
async function markDropExpired(message, lang = 'tr') {
  const isEn = lang === 'en';
  const expiredEmbed = new EmbedBuilder()
    .setTitle(`⏱️ ${isEn ? 'Drop Expired' : 'Drop Süresi Doldu'}`)
    .setDescription(isEn ? 'Nobody claimed this drop in time.' : 'Bu drop kimse tarafından zamanında kaptılmadı.')
    .setColor('#555555')
    .setTimestamp();
  await message.edit({ embeds: [expiredEmbed] });
}

/**
 * Aktif drop map'ini döner (message listener için)
 */
function getActiveDrops() {
  return activeDrops;
}

module.exports = {
  generateDropCode,
  publishDrop,
  markDropClaimed,
  markDropExpired,
  getActiveDrops,
};
