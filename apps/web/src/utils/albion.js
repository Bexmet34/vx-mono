/**
 * Utility for fetching Albion Online API safely.
 * Includes timeout, User-Agent header, automatic retries, and disables Next.js fetch cache
 * to prevent "Failed to set fetch cache" / SocketError warnings and logs.
 */
export async function fetchAlbion(url, options = {}, retries = 2, timeoutMs = 10000) {
  const finalHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ...(options.headers || {})
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: finalHeaders,
        cache: 'no-store', // Disable Next.js fetch cache to avoid "Failed to set fetch cache" error logs
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }

      const text = await res.text();
      if (!text || text.trim() === '') return null;
      return JSON.parse(text);
    } catch (err) {
      clearTimeout(timeoutId);
      if (attempt === retries) {
        console.error(`[Albion Fetch Error] Failed to fetch ${url} after ${retries + 1} attempts. Error:`, err.message || err);
        return null;
      }
      // Wait before retrying
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}
