const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createDropLog, updateDropMessageId } = require('@veyronix/database');

/**
 * dropEngine.js — Random Drop Embed & Publish Service
 * 
 * Drop embed mesajını oluşturur ve kanala gönderir.
 * Race condition koruması dropHandler.js içindeki claimDrop RPC'siyle sağlanır.
 */

// ─── Ödül tiplerine göre renkler ve emojiler ─────────────────────────────────
const REWARD_VISUALS = {
  coin:   { color: '#FFD700', emoji: '🪙', labelTr: 'Coin',   labelEn: 'Coin'   },
  xp:     { color: '#7C83FD', emoji: '⭐', labelTr: 'XP',     labelEn: 'XP'     },
  role:   { color: '#2ed573', emoji: '🎖️', labelTr: 'Özel Rol', labelEn: 'Special Role' },
  ticket: { color: '#ff6b81', emoji: '🎟️', labelTr: 'Bilet',  labelEn: 'Ticket' },
};

// ─── Trigger tiplerine göre başlık mesajları ─────────────────────────────────
const TRIGGER_MESSAGES = {
  silence_break: {
    tr: ['🌊 Sessizliği Sen Bozabilirsin!', '💤 Uyanan Kanalda Ganimet!', '🌙 İlk Mesaja Sürpriz!'],
    en: ['🌊 Break the Silence!',           '💤 Loot Woke Up!',            '🌙 Surprise for First Message!'],
  },
  burst: {
    tr: ['🔥 Ateş Var! Ganimet Düştü!', '🎉 Aktiflik Ödüllendiriliyor!', '⚡ Kalabalık Ödülü!'],
    en: ['🔥 Hot Chat! Loot Dropped!',  '🎉 Activity Rewarded!',          '⚡ Crowd Bonus!'],
  },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Drop embed'ini oluşturur
 */
function buildDropEmbed(dropSettings, triggerType, lang = 'tr') {
  const visual  = REWARD_VISUALS[dropSettings.reward_type] || REWARD_VISUALS.coin;
  const msgs    = TRIGGER_MESSAGES[triggerType] || TRIGGER_MESSAGES.burst;
  const title   = pickRandom(msgs[lang] || msgs.tr);
  const isEn    = lang === 'en';

  const rewardLine = dropSettings.reward_type === 'role'
    ? (isEn ? `🎖️ **Special Role** granted!` : `🎖️ **Özel Rol** verilecek!`)
    : `${visual.emoji} **${dropSettings.reward_amount} ${visual[isEn ? 'labelEn' : 'labelTr']}**`;

  return new EmbedBuilder()
    .setTitle(`${visual.emoji} ${isEn ? 'LOOT DROP!' : 'GANİMET DÜŞTÜ!'}`)
    .setDescription(
      `## ${title}\n\n` +
      (isEn
        ? `A **Random Drop** just landed in this channel!\n\nReward: ${rewardLine}\n\n🏃 **Be the first to claim it!**`
        : `Bu kanala bir **Rastgele Ganimet** düştü!\n\nÖdül: ${rewardLine}\n\n🏃 **İlk kaçıran pişman olur!**`)
    )
    .setColor(visual.color)
    .setFooter({
      text: isEn
        ? 'Veyronix Random Drop • First click wins!'
        : 'Veyronix Random Drop • İlk tıklayan kazanır!'
    })
    .setTimestamp();
}

/**
 * Drop butonunu oluşturur
 */
function buildDropComponents(dropId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`drop_claim:${dropId}`)
        .setLabel('🤑 Kap!')
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled)
    )
  ];
}

/**
 * Drop'u kanala yayınlar
 * 1. DB'ye log kaydı oluşturur (claimed_by = NULL)
 * 2. Embed + buton gönderir
 * 3. message_id'yi log kaydına yazar
 * 
 * @param {Client}  client        Discord.js client
 * @param {object}  dropSettings  drop_settings DB kaydı
 * @param {string}  channelId     Hedef kanal ID'si
 * @param {string}  triggerType   'silence_break' | 'burst'
 * @param {string}  lang          'tr' | 'en'
 * @returns {object|null} Oluşturulan drop log kaydı
 */
async function publishDrop(client, dropSettings, channelId, triggerType, lang = 'tr') {
  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return null;

    // 1. DB log oluştur (message_id henüz yok)
    const dropLog = await createDropLog({
      guild_id:     dropSettings.guild_id,
      channel_id:   channelId,
      trigger_type: triggerType,
      reward_type:  dropSettings.reward_type,
      reward_amount: dropSettings.reward_amount || 0,
    });

    // 2. Embed & buton gönder
    const embed      = buildDropEmbed(dropSettings, triggerType, lang);
    const components = buildDropComponents(dropLog.id);

    const message = await channel.send({ embeds: [embed], components });

    // 3. message_id'yi DB'ye yaz
    if (message?.id) {
      await updateDropMessageId(dropLog.id, message.id);
    }

    return { dropLog, message };
  } catch (err) {
    console.error('[DropEngine] Error publishing drop:', err.message);
    return null;
  }
}

/**
 * Drop mesajını "kapatılmış" haline günceller (kazanan belirlendi)
 */
async function markDropClaimed(message, winnerId, dropSettings, lang = 'tr') {
  try {
    const visual  = REWARD_VISUALS[dropSettings.reward_type] || REWARD_VISUALS.coin;
    const isEn    = lang === 'en';

    const claimedEmbed = new EmbedBuilder()
      .setTitle(`${visual.emoji} ${isEn ? 'Loot Claimed!' : 'Ganimet Kapıldı!'}`)
      .setDescription(
        isEn
          ? `<@${winnerId}> was the fastest and claimed the loot!`
          : `<@${winnerId}> en hızlı davrandı ve ganimeti kaptı!`
      )
      .setColor('#2ed573')
      .setFooter({ text: isEn ? 'Veyronix Random Drop' : 'Veyronix Random Drop' })
      .setTimestamp();

    // Butonu disabled yap
    const dropId   = message.components[0]?.components[0]?.customId?.split(':')?.[1];
    const disabled = dropId ? buildDropComponents(dropId, true) : [];

    await message.edit({ embeds: [claimedEmbed], components: disabled });
  } catch (err) {
    console.error('[DropEngine] Error marking drop as claimed:', err.message);
  }
}

module.exports = {
  buildDropEmbed,
  buildDropComponents,
  publishDrop,
  markDropClaimed,
};
