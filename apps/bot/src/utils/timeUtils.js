/**
 * Parses a time string like "2h 15m", "30m", "1h" into milliseconds.
 * @param {string} timeStr 
 * @returns {number|null} Milliseconds or null if invalid
 */
function parseTimeToMs(timeStr) {
    if (!timeStr) return null;

    // Check for just a number (default to minutes)
    if (/^\d+$/.test(timeStr.trim())) {
        return parseInt(timeStr.trim()) * 60 * 1000;
    }

    let totalMs = 0;
    const hoursMatch = timeStr.match(/(\d+)\s*h/i);
    const minsMatch = timeStr.match(/(\d+)\s*m/i);

    if (!hoursMatch && !minsMatch) return null;

    if (hoursMatch) totalMs += parseInt(hoursMatch[1]) * 3600 * 1000;
    if (minsMatch) totalMs += parseInt(minsMatch[1]) * 60 * 1000;

    return totalMs;
}

let timeOffsetMs = 0;

// Time APIs tried in order — first success wins
const TIME_APIS = [
    {
        url: 'https://timeapi.io/api/time/current/zone?timeZone=UTC',
        parse: (data) => new Date(data.dateTime).getTime(),
    },
    {
        url: 'http://worldtimeapi.org/api/timezone/Etc/UTC',
        parse: (data) => new Date(data.utc_datetime).getTime(),
    },
];

/**
 * Syncs the system time with an external API to calculate offset.
 * Tries multiple APIs with a short timeout. Fails silently if all unavailable.
 *
 * Büyük sapmalar (≥60 dk) tespit edildiğinde sunucu saatini timedatectl
 * ile düzeltmek için gereken komutu açıkça loglar.
 * Küçük sapmalar (5s–60dk) için yazılımsal telafi (timeOffsetMs) devam eder.
 */
async function syncTimeOffset() {
    for (const api of TIME_APIS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(api.url, { signal: controller.signal });
            clearTimeout(timeout);

            if (res.ok) {
                const data = await res.json();
                const realTime = api.parse(data);
                const systemTime = Date.now();
                timeOffsetMs = realTime - systemTime;

                const offsetMins = (timeOffsetMs / 60000).toFixed(1);
                const absOffsetMs = Math.abs(timeOffsetMs);

                if (absOffsetMs >= 60 * 60 * 1000) {
                    // ≥ 60 dakika: kritik sapma — sunucu saatini düzeltmek gerekiyor
                    const realDateStr = new Date(realTime).toISOString().replace('T', ' ').slice(0, 19);
                    console.error(
                        `[TimeSync] ⚠️  KRİTİK: Sistem saati ${offsetMins} dakika hatalı!\n` +
                        `[TimeSync]    Yazılımsal telafi aktif, ancak kalıcı çözüm için sunucuda şu komutu çalıştırın:\n` +
                        `[TimeSync]    sudo timedatectl set-ntp true\n` +
                        `[TimeSync]    sudo timedatectl set-time "${realDateStr}"\n` +
                        `[TimeSync]    (veya NTP aktifse yalnızca: sudo timedatectl set-ntp true)`
                    );
                } else if (absOffsetMs > 5000) {
                    // 5 saniye – 60 dakika: yazılımsal telafi yeterli
                    console.warn(`[TimeSync] ⚡ Sistem saati ${offsetMins} dakika hatalı. Yazılımsal düzeltme aktif.`);
                } else {
                    console.log(`[TimeSync] ✅ Sistem saati senkronize (Sapma: ${timeOffsetMs}ms).`);
                }
                return; // success — stop trying
            }
        } catch (_) {
            // Try next API silently
        }
    }
    // All APIs failed — VPS has no outbound HTTP, use system clock as-is
    console.log('[TimeSync] Harici saat API\'lerine erişilemiyor, sistem saati kullanılıyor.');
}

/**
 * Mevcut saat ofsetini milisaniye cinsinden döndürür.
 * Tanılama ve izleme amaçlıdır.
 * @returns {number}
 */
function getTimeOffsetMs() {
    return timeOffsetMs;
}

/**
 * Returns the true current date accounting for system clock drift.
 * @returns {Date}
 */
function getNow() {
    return new Date(Date.now() + timeOffsetMs);
}

module.exports = {
    parseTimeToMs,
    syncTimeOffset,
    getTimeOffsetMs,
    getNow
};
