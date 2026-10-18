export const revalidate = 7200; // 2 saat önbellek
import { NextResponse } from 'next/server';
import { getChangelogs } from '@veyronix/database';

let cachedChangelogs = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 saat

export async function GET() {
    const now = Date.now();
    if (cachedChangelogs && (now - lastFetchTime < CACHE_TTL_MS)) {
        return NextResponse.json(cachedChangelogs, {
            headers: { 'Cache-Control': 'public, max-age=7200, s-maxage=7200' }
        });
    }

    try {
        const logs = await getChangelogs();
        cachedChangelogs = logs;
        lastFetchTime = now;
        return NextResponse.json(logs, {
            headers: { 'Cache-Control': 'public, max-age=7200, s-maxage=7200' }
        });
    } catch (error) {
        return NextResponse.json(cachedChangelogs || { error: error.message }, { status: cachedChangelogs ? 200 : 500 });
    }
}
