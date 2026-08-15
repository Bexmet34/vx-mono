/**
 * activityTracker.js — Mesaj Bazlı Drop Tetikleyici (v2)
 *
 * Sadece schedule_type = 'percent_based' için çalışır.
 * Her gelen mesajda drop_chance_pct/100 olasılıkla drop tetikler.
 * Aynı kanalda ardışık drop'ları önlemek için basit bir cooldown Map tutar.
 *
 * Eski silence_break / burst algoritmaları tamamen kaldırıldı.
 */

// Kanal başına son drop zamanı: Map<`${guildId}:${channelId}`, timestamp>
const lastDropMap = new Map();

// Minimum drop aralığı — aynı kanalda 2 drop arasında en az bu kadar bekle (ms)
const MIN_DROP_INTERVAL_MS = 60_000; // 60 saniye

// Temizlik: 2 saatte bir 4 saatten eski kayıtları sil
setInterval(() => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  for (const [key, ts] of lastDropMap.entries()) {
    if (ts < cutoff) lastDropMap.delete(key);
  }
}, 2 * 60 * 60 * 1000);

/**
 * Mesaj geldiğinde çağrılır; percent_based modunda % şansla drop tetikler.
 *
 * @param {string} guildId
 * @param {string} channelId
 * @param {object} dropSettings  — DB'den gelen drop_settings kaydı
 * @returns {boolean} true = drop tetiklenmeli
 */
function shouldTriggerPercentDrop(guildId, channelId, dropSettings) {
  if (!dropSettings?.is_enabled) return false;
  if (dropSettings.schedule_type !== 'percent_based') return false;

  const key      = `${guildId}:${channelId}`;
  const lastDrop = lastDropMap.get(key) || 0;
  const now      = Date.now();

  // Cooldown kontrolü
  if (now - lastDrop < MIN_DROP_INTERVAL_MS) return false;

  // Yüzdelik şans kontrolü
  const chance = parseFloat(dropSettings.drop_chance_pct) || 5.0;
  const roll   = Math.random() * 100;

  if (roll < chance) {
    lastDropMap.set(key, now);
    return true;
  }

  return false;
}

/**
 * Son drop zamanını manuel set et (bot restart sonrası sync için)
 */
function setLastDropAt(guildId, channelId, timestamp) {
  const key = `${guildId}:${channelId}`;
  lastDropMap.set(key, timestamp);
}

/**
 * Debug: Mevcut map durumunu döner
 */
function getActivitySnapshot() {
  const snapshot = {};
  for (const [key, ts] of lastDropMap.entries()) {
    snapshot[key] = { lastDropAt: new Date(ts).toISOString() };
  }
  return snapshot;
}

module.exports = {
  shouldTriggerPercentDrop,
  setLastDropAt,
  getActivitySnapshot,
};
