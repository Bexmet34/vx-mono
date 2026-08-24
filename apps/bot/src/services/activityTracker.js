/**
 * activityTracker.js — Mesaj Bazlı Drop Tetikleyici (v2.1 Gelişmiş Matematik & Eşik Sistemi)
 *
 * Sadece schedule_type = 'percent_based' için çalışır.
 * Her gelen mesajda drop_chance_pct/100 olasılıkla kriptografik hassasiyette drop tetikler.
 *
 * Güvenlik & Doğallık Mekanizmaları:
 * 1. Global Sunucu & Kanal Cooldown (En az 180 saniye / 3 dakika ara)
 * 2. Minimum Mesaj Sayacı (İki drop arasında sohbette en az 10-15 gerçek mesaj geçmesi gerekir)
 * 3. Kriptografik Rastgelelik (crypto.randomInt ile yüksek entropili float karşılaştırma)
 */

const crypto = require('crypto');

// Sunucu ve kanal bazlı son drop zamanı: Map<`${guildId}`, timestamp> & Map<`${guildId}:${channelId}`, timestamp>
const lastDropMap = new Map();

// İki drop arasında atılan mesaj sayacı: Map<`${guildId}`, number>
const msgCountSinceLastDrop = new Map();

// Minimum sunucu geneli bekleme süresi (ms) — art arda drop spamını kesin engeller
const MIN_GLOBAL_COOLDOWN_MS = 180_000; // 3 dakika

// İki drop arasında geçmesi gereken minimum mesaj sayısı (spam önleyici eşik)
const MIN_MESSAGES_BEFORE_ROLL = 12;

// Temizlik: 2 saatte bir 4 saatten eski kayıtları sil
setInterval(() => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  for (const [key, ts] of lastDropMap.entries()) {
    if (ts < cutoff) lastDropMap.delete(key);
  }
  for (const [key] of msgCountSinceLastDrop.entries()) {
    if (!lastDropMap.has(key)) msgCountSinceLastDrop.delete(key);
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

  const now = Date.now();
  const guildKey = guildId;
  const channelKey = `${guildId}:${channelId}`;

  // 1. Sunucu ve kanal bazlı son drop kontrolü (Global Cooldown)
  const lastGuildDrop = lastDropMap.get(guildKey) || 0;
  const lastChannelDrop = lastDropMap.get(channelKey) || 0;

  if (now - lastGuildDrop < MIN_GLOBAL_COOLDOWN_MS || now - lastChannelDrop < MIN_GLOBAL_COOLDOWN_MS) {
    return false;
  }

  // 2. Mesaj sayacını artır
  const currentMsgCount = (msgCountSinceLastDrop.get(guildKey) || 0) + 1;
  msgCountSinceLastDrop.set(guildKey, currentMsgCount);

  // 3. Minimum mesaj eşiği geçilmediyse henüz zar atma
  if (currentMsgCount < MIN_MESSAGES_BEFORE_ROLL) {
    return false;
  }

  // 4. Kriptografik rastgele zar atımı (0.0000 - 99.9999)
  const chance = parseFloat(dropSettings.drop_chance_pct) || 2.0;
  const roll = crypto.randomInt(0, 1_000_000) / 10_000;

  if (roll < chance) {
    // Drop tetiklendi! Zaman damgalarını ve sayaçları güncelle
    lastDropMap.set(guildKey, now);
    lastDropMap.set(channelKey, now);
    msgCountSinceLastDrop.set(guildKey, 0);

    console.log(`[DropTracker] % Roll HIT for Guild ${guildId} Channel ${channelId} -> Rolled ${roll.toFixed(3)}% < Chance ${chance}% (After ${currentMsgCount} msgs)`);
    return true;
  }

  return false;
}

/**
 * Son drop zamanını manuel set et (bot restart sonrası sync için)
 */
function setLastDropAt(guildId, channelId, timestamp) {
  const guildKey = guildId;
  const channelKey = `${guildId}:${channelId}`;
  lastDropMap.set(guildKey, timestamp);
  lastDropMap.set(channelKey, timestamp);
  msgCountSinceLastDrop.set(guildKey, 0);
}

/**
 * Debug: Mevcut map durumunu döner
 */
function getActivitySnapshot() {
  const snapshot = {};
  for (const [key, ts] of lastDropMap.entries()) {
    snapshot[key] = { 
      lastDropAt: new Date(ts).toISOString(),
      msgCount: msgCountSinceLastDrop.get(key) || 0
    };
  }
  return snapshot;
}

module.exports = {
  shouldTriggerPercentDrop,
  setLastDropAt,
  getActivitySnapshot,
};
