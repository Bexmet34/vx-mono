const { supabase } = require('@veyronix/database');
const { publishDrop } = require('./dropEngine');
const { getGuildConfig } = require('./guildConfig');

/**
 * dropScheduler.js — Zaman Tabanlı Drop Tetikleyici (v2)
 *
 * cronService tarafından her dakika çağrılır.
 * Desteklenen modlar:
 *   - exact_minutes  : Her saatin seçili dakikasında kesin olarak düşer
 *   - random_interval: Min~Max dakika arasında rastgele düşer
 *   - hourly_chance  : Her saat başı (xx:00) % ihtimalle düşer
 *
 * NOT: percent_based modu burada DEĞİL, index.js messageCreate içinde işlenir.
 * NOT: activity modu v2'de tamamen kaldırıldı.
 */

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

        // ── hourly_chance ─────────────────────────────────────────────────────
        } else if (schedType === 'hourly_chance') {
          if (currentMinute === 0) {
            const chance = parseFloat(settings.hourly_chance_pct) || 25;
            if (Math.random() * 100 < chance) {
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
