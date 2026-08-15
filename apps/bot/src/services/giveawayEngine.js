const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createGiveaway, updateGiveawayMessageId, getGiveawayParticipantCount, pickGiveawayWinners, supabase } = require('@veyronix/database');
const { getGuildConfig } = require('./guildConfig');
const { t } = require('./i18n');

/**
 * Builds the Giveaway Embed
 */
function buildGiveawayEmbed(giveaway, participantCount = 0, lang = 'tr', isEnded = false) {
  const endsAtUnix = Math.floor(new Date(giveaway.ends_at).getTime() / 1000);
  const color = isEnded ? '#747d8c' : '#ff4757';
  const statusTitle = isEnded 
    ? (lang === 'tr' ? '🎉 ÇEKİLİŞ SONUÇLANDI 🎉' : '🎉 GIVEAWAY ENDED 🎉')
    : (lang === 'tr' ? '🎉 ÇEKİLİŞ BAŞLADI 🎉' : '🎉 GIVEAWAY STARTED 🎉');

  const embed = new EmbedBuilder()
    .setTitle(statusTitle)
    .setDescription(`### 🎁 **${giveaway.title}**\n\n${giveaway.description || ''}`)
    .setColor(color)
    .addFields(
      { name: lang === 'tr' ? '👥 Kazanan Sayısı' : '👥 Winners', value: `\`${giveaway.winner_count}\``, inline: true },
      { name: lang === 'tr' ? '🛡️ Yedek Sayısı' : '🛡️ Backups', value: `\`${giveaway.backup_count}\``, inline: true },
      { name: lang === 'tr' ? '🎟️ Katılımcı Sayısı' : '🎟️ Participants', value: `\`${participantCount}\``, inline: true }
    );

  if (giveaway.image_url) {
    embed.setImage(giveaway.image_url);
  }

  if (giveaway.required_role_ids && giveaway.required_role_ids.length > 0) {
    const rolesStr = giveaway.required_role_ids.map(r => `<@&${r}>`).join(' ');
    const modeStr = giveaway.role_match_mode === 'all' 
      ? (lang === 'tr' ? '(Tüm roller gerekli)' : '(All roles required)') 
      : (lang === 'tr' ? '(Herhangi biri yeterli)' : '(Any role is enough)');
    embed.addFields({ name: lang === 'tr' ? '🔒 Gerekli Rol' : '🔒 Required Roles', value: `${rolesStr} ${modeStr}`, inline: false });
  }

  if (giveaway.excluded_role_ids && giveaway.excluded_role_ids.length > 0) {
    const rolesStr = giveaway.excluded_role_ids.map(r => `<@&${r}>`).join(' ');
    embed.addFields({ name: lang === 'tr' ? '🚫 Muaf / Yasaklı Roller' : '🚫 Excluded Roles', value: rolesStr, inline: false });
  }

  if (giveaway.role_multipliers && giveaway.role_multipliers.length > 0) {
    const multStr = giveaway.role_multipliers.map(m => `<@&${m.role_id}>: **${m.multiplier}x**`).join(' | ');
    embed.addFields({ name: lang === 'tr' ? '⚡ Rol Çarpanları' : '⚡ Role Multipliers', value: multStr, inline: false });
  }

  if (giveaway.reward_role_id) {
    embed.addFields({ name: lang === 'tr' ? '🎁 Otomatik Ödül Rolü' : '🎁 Reward Role', value: `<@&${giveaway.reward_role_id}>`, inline: false });
  }

  if (isEnded) {
    const winnersStr = (giveaway.winners && giveaway.winners.length > 0)
      ? giveaway.winners.map(w => `<@${w}>`).join(', ')
      : (lang === 'tr' ? 'Katılımcı bulunamadı.' : 'No participants.');

    const backupsStr = (giveaway.backups && giveaway.backups.length > 0)
      ? giveaway.backups.map(b => `<@${b}>`).join(', ')
      : '-';

    embed.addFields(
      { name: lang === 'tr' ? '🏆 KAZANANLAR' : '🏆 WINNERS', value: winnersStr, inline: false },
      { name: lang === 'tr' ? '🎗️ YEDEKLER' : '🎗️ BACKUPS', value: backupsStr, inline: false }
    );
    embed.setFooter({ text: lang === 'tr' ? 'Çekiliş Sona Erdi' : 'Giveaway Ended' });
  } else {
    embed.addFields({
      name: lang === 'tr' ? '⏳ Bitiş Zamanı' : '⏳ Ends In',
      value: `<t:${endsAtUnix}:R> (<t:${endsAtUnix}:f>)`,
      inline: false
    });
    embed.setFooter({ text: 'Veyronix Giveaway Engine • Bot System' });
  }

  embed.setTimestamp();
  return embed;
}

/**
 * Builds Giveaway Action Buttons
 */
function buildGiveawayComponents(giveawayId, participantCount = 0, lang = 'tr', isEnded = false) {
  if (isEnded) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway_ended:${giveawayId}`)
        .setLabel(lang === 'tr' ? 'Sona Erdi' : 'Ended')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    return [row];
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`giveaway_join:${giveawayId}`)
      .setLabel(lang === 'tr' ? `🎉 Katıl (${participantCount})` : `🎉 Join (${participantCount})`)
      .setStyle(ButtonStyle.Primary)
  );

  return [row];
}

/**
 * Publishes new giveaway to Discord channel
 */
async function publishGiveawayMessage(client, giveaway) {
  const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
  if (!channel) return null;

  const guildConfig = await getGuildConfig(giveaway.guild_id);
  const lang = guildConfig?.language || 'tr';

  const embed = buildGiveawayEmbed(giveaway, 0, lang, false);
  const components = buildGiveawayComponents(giveaway.id, 0, lang, false);

  const message = await channel.send({
    content: '🎉 **YENİ ÇEKİLİŞ!** @everyone',
    embeds: [embed],
    components: components
  });

  if (message?.id) {
    await updateGiveawayMessageId(giveaway.id, message.id);
  }

  return message;
}

/**
 * Checks and finalizes expired giveaways (Cron task)
 */
async function checkExpiredGiveaways(client) {
  try {
    const now = new Date().toISOString();
    const { data: expiredGiveaways } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active')
      .lte('ends_at', now);

    if (!expiredGiveaways || expiredGiveaways.length === 0) return;

    for (const giveaway of expiredGiveaways) {
      await finalizeGiveaway(client, giveaway);
    }
  } catch (err) {
    console.error('[GiveawayEngine] Error in checkExpiredGiveaways:', err.message);
  }
}

/**
 * Finalizes a giveaway by selecting winners
 */
async function finalizeGiveaway(client, giveaway) {
  const guildConfig = await getGuildConfig(giveaway.guild_id);
  const lang = guildConfig?.language || 'tr';

  const { winners, backups } = await pickGiveawayWinners(
    giveaway.id,
    giveaway.winner_count,
    giveaway.backup_count,
    giveaway.secret_fairness
  );

  giveaway.winners = winners;
  giveaway.backups = backups;
  giveaway.status = 'ended';

  // Automatically grant reward role if configured
  if (giveaway.reward_role_id && winners.length > 0) {
    try {
      const guild = await client.guilds.fetch(giveaway.guild_id).catch(() => null);
      if (guild) {
        for (const winnerId of winners) {
          const member = await guild.members.fetch(winnerId).catch(() => null);
          if (member) {
            await member.roles.add(giveaway.reward_role_id).catch(e => console.error(`[GiveawayEngine] Error assigning reward role ${giveaway.reward_role_id} to ${winnerId}:`, e.message));
          }
        }
      }
    } catch (err) {
      console.error('[GiveawayEngine] Reward role assignment failed:', err.message);
    }
  }

  const participantCount = await getGiveawayParticipantCount(giveaway.id);
  const embed = buildGiveawayEmbed(giveaway, participantCount, lang, true);
  const components = buildGiveawayComponents(giveaway.id, participantCount, lang, true);

  const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
  if (channel && giveaway.message_id) {
    const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
    if (message) {
      await message.edit({ embeds: [embed], components: components }).catch(() => {});
    }

    // Announcement message
    const winnersMentions = winners.length > 0 ? winners.map(w => `<@${w}>`).join(' ') : '';
    const announceMsg = winners.length > 0
      ? (lang === 'tr'
        ? `🎉 **Tebrikler!** Çekilişi kazanan(lar): ${winnersMentions}\n Ödülünüzü teslim almak için yetkililer ile iletişime geçin!`
        : `🎉 **Congratulations!** Winners: ${winnersMentions}\n Contact staff to claim your prize!`)
      : (lang === 'tr' ? '⚠️ Çekilişe katılım olmadığı için kazanan seçilemedi.' : '⚠️ No winners could be selected as there were no participants.');

    await channel.send({ content: announceMsg }).catch(() => {});
  }

  // Handle Auto Repeat if enabled
  if (giveaway.auto_repeat) {
    try {
      const startTime = new Date();
      const durationMs = new Date(giveaway.ends_at).getTime() - new Date(giveaway.starts_at || giveaway.created_at).getTime();
      const endsTime = new Date(startTime.getTime() + (durationMs > 0 ? durationMs : 24 * 60 * 60 * 1000));

      const newGiveawayData = {
        guild_id: giveaway.guild_id,
        channel_id: giveaway.channel_id,
        title: giveaway.title,
        description: giveaway.description,
        winner_count: giveaway.winner_count,
        backup_count: giveaway.backup_count,
        required_role_ids: giveaway.required_role_ids,
        excluded_role_ids: giveaway.excluded_role_ids,
        role_match_mode: giveaway.role_match_mode,
        role_multipliers: giveaway.role_multipliers,
        reward_role_id: giveaway.reward_role_id,
        reward_role_duration: giveaway.reward_role_duration,
        image_url: giveaway.image_url,
        auto_repeat: true,
        secret_fairness: giveaway.secret_fairness,
        starts_at: startTime.toISOString(),
        ends_at: endsTime.toISOString(),
        created_by: giveaway.created_by
      };

      const newGiveaway = await createGiveaway(newGiveawayData);
      await publishGiveawayMessage(client, newGiveaway);
    } catch (e) {
      console.error('[GiveawayEngine] Error auto-repeating giveaway:', e.message);
    }
  }
}

module.exports = {
  buildGiveawayEmbed,
  buildGiveawayComponents,
  publishGiveawayMessage,
  checkExpiredGiveaways,
  finalizeGiveaway
};
