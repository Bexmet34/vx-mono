const crypto = require('crypto');
const { supabase } = require('@veyronix/database');
const { publishDrop } = require('./dropEngine');
const { getGuildConfig } = require('./guildConfig');

/**
 * dropScheduler.js — Zaman Tabanlı Drop Tetikleyici (v2.1)
 *
 * cronService tarafından her dakika çağrılır.
 * Desteklenen modlar:
 *   - exact_minutes  : Her saatin seçili dakikasında kesin olarak düşer
 *   - random_interval: Min~Max dakika arasında rastgele düşer
 *   - hourly_chance  : Her saat başı (xx:00) kesinlikle 1 kez % ihtimalle düşer
 *
 * NOT: percent_based modu burada DEĞİL, index.js messageCreate içinde işlenir.
 */

// Her sunucu için son saatlik zar atılan saat anahtarı: Map<`${guild_id}`, 'YYYY-MM-DD-HH'>
const lastHourlyRollMap = new Map();

/**
 * channel_ids alanını güvenli biçimde diziye çevirir
 */
function getChannelIds(settings) {
  let ids = settings.channel_ids;
  if (typeof ids === 'string') {
    try { ids = JSON.parse(ids); } catch (e) { ids = []; }
  }
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
}

/**
 * channel_drop_mode'a göre hedef kanalı belirler
 *   'all'        → tüm kanallar dizisi döner
 *   'random_one' → rastgele tek eleman döner
 */
function resolveTargetChannels(channelIds, mode) {
  if (!channelIds || channelIds.length === 0) return [];
  if (mode === 'all') return channelIds;
  // random_one (varsayılan)
  const picked = channelIds[Math.floor(Math.random() * channelIds.length)];
  return [picked];
}

/**
 * Her dakika cron tarafından çağrılır
 */
async function processTimeBasedDrops(client) {
  try {
    const { data: allSettings, error } = await supabase
      .from('drop_settings')
      .select('*')
      .eq('is_enabled', true)
      .in('schedule_type', ['exact_minutes', 'random_interval', 'hourly_chance']);

    if (error) {
      console.error('[DropScheduler] DB Error:', error);
      return;
    }

    if (!allSettings || allSettings.length === 0) return;

    const now           = new Date();
    const currentMinute = now.getMinutes();

    for (const settings of allSettings) {
      try {
        if (!client.guilds.cache.has(settings.guild_id)) continue;

        let shouldDrop   = false;
        const schedType  = settings.schedule_type || 'exact_minutes';

        // ── exact_minutes ─────────────────────────────────────────────────────
        if (schedType === 'exact_minutes') {
          let exactMins = settings.exact_minutes;
          if (typeof exactMins === 'string') {
            try { exactMins = JSON.parse(exactMins); } catch (e) { exactMins = []; }
          }
          if (Array.isArray(exactMins) && exactMins.includes(currentMinute)) {
            shouldDrop = true;
          }

        // ── hourly_chance (Kesinlikle Saatte 1 Kez Kriptografik Zar) ─────────
        } else if (schedType === 'hourly_chance') {
          const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
          if (currentMinute === 0 && lastHourlyRollMap.get(settings.guild_id) !== hourKey) {
            lastHourlyRollMap.set(settings.guild_id, hourKey);
            const chance = parseFloat(settings.hourly_chance_pct) || 25;
            const roll   = crypto.randomInt(0, 1_000_000) / 10_000;
            
            console.log(`[DropScheduler] Guild ${settings.guild_id} hourly roll: ${roll.toFixed(3)}% vs chance: ${chance}%`);
            if (roll < chance) {
              shouldDrop = true;
            }
          }

        // ── random_interval ───────────────────────────────────────────────────
        } else if (schedType === 'random_interval') {
          const nextDropAt = settings.next_random_drop_at
            ? new Date(settings.next_random_drop_at)
            : null;

          if (!nextDropAt || now >= nextDropAt) {
            shouldDrop = true;

            const min    = parseInt(settings.random_interval_min) || 30;
            const max    = parseInt(settings.random_interval_max) || 120;
            const range  = Math.max(0, max - min);
            const randMs = (min + Math.floor(Math.random() * (range + 1))) * 60_000;
            const nextAt = new Date(now.getTime() + randMs);

            supabase.from('drop_settings')
              .update({ next_random_drop_at: nextAt.toISOString() })
              .eq('guild_id', settings.guild_id)
              .then(({ error: e }) => {
                if (e) console.error('[DropScheduler] next_random_drop_at update error:', e);
              });
          }
        }

        if (!shouldDrop) continue;

        // ── Hedef kanalları belirle ───────────────────────────────────────────
        const channelIds = getChannelIds(settings);
        if (channelIds.length === 0) continue;

        const targets = resolveTargetChannels(channelIds, settings.channel_drop_mode || 'random_one');
        if (targets.length === 0) continue;

        const guildConfig = await getGuildConfig(settings.guild_id);
        const lang        = guildConfig?.language || 'tr';

        for (const channelId of targets) {
          await publishDrop(client, settings, channelId, 'scheduled', lang);
        }

      } catch (innerErr) {
        console.error(`[DropScheduler] Error processing guild ${settings.guild_id}:`, innerErr);
      }
    }
  } catch (err) {
    console.error('[DropScheduler] Fatal error:', err);
  }
}

module.exports = {
  processTimeBasedDrops,
};
