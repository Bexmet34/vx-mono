import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';
import { LINKS } from '@veyronix/config';

// Bu endpoint kimlik doğrulama gerektirmez - public config değerleri sunar
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['discord_invite_url']);

        const settings = {};
        if (!error && data) {
            data.forEach(s => { settings[s.key] = s.value; });
        }

        return NextResponse.json({
            supportServer: settings['discord_invite_url'] || LINKS.SUPPORT_SERVER,
        }, {
            headers: {
                // 60 saniye tarayıcı cache'i — çok fazla istek gelmez ama hâlâ "canlı"
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });
    } catch (err) {
        // Hata olursa config dosyasındaki varsayılan değeri döndür
        return NextResponse.json({
            supportServer: LINKS.SUPPORT_SERVER,
        });
    }
}
