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

/**
 * Syncs the system time with an external API to calculate offset.
 * Useful if the VPS clock is desynchronized.
 */
async function syncTimeOffset() {
    try {
        const res = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
        if (res.ok) {
            const data = await res.json();
            const realTime = new Date(data.utc_datetime).getTime();
            const systemTime = Date.now();
            timeOffsetMs = realTime - systemTime;
            
            const offsetMins = (timeOffsetMs / 60000).toFixed(1);
            if (Math.abs(timeOffsetMs) > 5000) {
                console.log(`[TimeSync] Sistem saati ${offsetMins} dakika hatalı. Otomatik düzeltme aktif.`);
            } else {
                console.log(`[TimeSync] Sistem saati senkronize (Sapma: ${timeOffsetMs}ms).`);
            }
        }
    } catch (err) {
        console.error('[TimeSync] Saat eşitleme hatası:', err.message);
    }
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
    getNow
};
