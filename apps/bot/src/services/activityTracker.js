/**
 * activityTracker.js — In-Memory Channel Activity Tracker
 * 
 * Kanal bazlı mesaj trafiğini RAM'de (Map) takip eder.
 * Veritabanına her mesajda I/O yapmaz — sadece drop tetiklendiğinde DB'ye yazar.
 * 
 * Her kanal için tutulan veri:
 *   messages     : Son N saniyedeki mesaj timestamp'leri (Array)
 *   lastDropAt   : Son drop'un Unix timestamp'i (cooldown kontrolü için)
 */

// ─── In-Memory Store ──────────────────────────────────────────────────────────
// Structure: Map<`${guildId}:${channelId}`, { messages: number[], lastDropAt: number }>
const activityMap = new Map();

// ─── Cleanup: 5 dakikada bir 10 dakikadan eski verileri temizle ───────────────
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000; // 10 dakika
  for (const [key, val] of activityMap.entries()) {
    val.messages = val.messages.filter(ts => ts > cutoff);
    if (val.messages.length === 0 && val.lastDropAt < cutoff) {
      activityMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Bir mesaj kaydeder ve drop tetiklenip tetiklenmeyeceğini döner.
 * 
 * @param {string} guildId
 * @param {string} channelId
 * @param {object} dropSettings — getDropSettings() sonucu
 * @returns {{ shouldDrop: boolean, triggerType: 'silence_break'|'burst'|null }}
 */
function trackMessage(guildId, channelId, dropSettings) {
  if (!dropSettings || !dropSettings.is_enabled) {
    return { shouldDrop: false, triggerType: null };
  }

  const key     = `${guildId}:${channelId}`;
  const now     = Date.now();
  const entry   = activityMap.get(key) || { messages: [], lastDropAt: 0 };

  // Mesajı kaydet
  entry.messages.push(now);

  // Cooldown kontrolü — son drop'tan yeterli süre geçmedi mi?
  const cooldownMs = (dropSettings.cooldown_minutes || 15) * 60 * 1000;
  if (now - entry.lastDropAt < cooldownMs) {
    activityMap.set(key, entry);
    return { shouldDrop: false, triggerType: null };
  }

  // ── Algoritma 1: Sessizlikten Çıkış (Silence Break) ─────────────────────
  const silenceMs      = (dropSettings.silence_threshold_min || 15) * 60 * 1000;
  const recentMessages = entry.messages.filter(ts => ts > now - 60_000); // Son 1 dakika
  const prevMessages   = entry.messages.filter(ts => ts > now - silenceMs && ts < now - 60_000);

  if (prevMessages.length === 0 && recentMessages.length === 1) {
    // Uzun süredir sessiz → ilk mesaj → yüksek şans
    const roll = getRollChance(dropSettings, 'silence_break');
    if (Math.random() * 100 < roll) {
      entry.lastDropAt = now;
      activityMap.set(key, entry);
      return { shouldDrop: true, triggerType: 'silence_break' };
    }
  }

  // ── Algoritma 2: Burst Modu (Yüksek Aktivite) ────────────────────────────
  const burstWindowMs  = (dropSettings.burst_window_sec || 180) * 1000;
  const burstThreshold = dropSettings.burst_threshold_msg || 30;
  const burstMessages  = entry.messages.filter(ts => ts > now - burstWindowMs);

  if (burstMessages.length >= burstThreshold) {
    const roll = getRollChance(dropSettings, 'burst');
    if (Math.random() * 100 < roll) {
      entry.lastDropAt = now;
      activityMap.set(key, entry);
      return { shouldDrop: true, triggerType: 'burst' };
    }
  }

  activityMap.set(key, entry);
  return { shouldDrop: false, triggerType: null };
}

/**
 * Drop şansını hesaplar (drop_chance ayarına göre)
 */
function getRollChance(dropSettings, triggerType) {
  if (dropSettings.drop_chance === 'custom') {
    return dropSettings.custom_chance_pct || 15;
  }

  const baseChances = {
    silence_break: { low: 20, medium: 40, high: 70 },
    burst:         { low: 10, medium: 25, high: 50 },
  };

  return baseChances[triggerType]?.[dropSettings.drop_chance] ?? 25;
}

/**
 * Bir kanalın son drop zamanını manuel güncelle (bot yeniden başlatıldıktan sonra senkronize etmek için)
 */
function setLastDropAt(guildId, channelId, timestamp) {
  const key   = `${guildId}:${channelId}`;
  const entry = activityMap.get(key) || { messages: [], lastDropAt: 0 };
  entry.lastDropAt = timestamp;
  activityMap.set(key, entry);
}

/**
 * Debug: Mevcut map durumunu döner
 */
function getActivitySnapshot() {
  const snapshot = {};
  for (const [key, val] of activityMap.entries()) {
    snapshot[key] = {
      messageCount: val.messages.length,
      lastDropAt:   new Date(val.lastDropAt).toISOString(),
    };
  }
  return snapshot;
}

module.exports = {
  trackMessage,
  setLastDropAt,
  getActivitySnapshot,
};
