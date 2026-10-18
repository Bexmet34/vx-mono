import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';
import { LINKS } from '@veyronix/config';

// 1 saatlik ISR önbelleği
export const revalidate = 3600;

let cachedSupportServer = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

export async function GET() {
    const now = Date.now();
    if (cachedSupportServer && (now - lastFetchTime < CACHE_TTL_MS)) {
        return NextResponse.json({
            supportServer: cachedSupportServer,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    }

    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['discord_invite_url']);

        const settings = {};
        if (!error && data) {
            data.forEach(s => { settings[s.key] = s.value; });
        }

        const supportUrl = settings['discord_invite_url'] || LINKS.SUPPORT_SERVER;
        cachedSupportServer = supportUrl;
        lastFetchTime = now;

        return NextResponse.json({
            supportServer: supportUrl,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    } catch (err) {
        return NextResponse.json({
            supportServer: cachedSupportServer || LINKS.SUPPORT_SERVER,
        });
    }
}
