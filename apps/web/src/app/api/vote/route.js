import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const session = await getServerSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
        }

        // Get Discord ID from session
        const userId = session.user.id || session.user.sub || session.user.image?.split('/')[4];
        if (!userId) {
            return NextResponse.json({ error: 'Discord Kullanıcı ID alınamadı.' }, { status: 400 });
        }

        // Fetch cooldown hours from system settings
        let cooldownHours = 168; // 7 days
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'vote_cooldown_hours')
            .single();

        if (settingData && settingData.value) {
            cooldownHours = parseInt(settingData.value, 10);
            if (isNaN(cooldownHours) || cooldownHours < 0) cooldownHours = 168;
        }

        const now = Date.now();
        const addedMs = cooldownHours * 60 * 60 * 1000;

        const { data: row } = await supabase
            .from('user_votes')
            .select('expires_at')
            .eq('user_id', userId)
            .single();

        let newExpiresAt = now + addedMs;
        if (row && row.expires_at && row.expires_at > now) {
            newExpiresAt = row.expires_at + addedMs;
        }

        const { error: upsertError } = await supabase
            .from('user_votes')
            .upsert({
                user_id: userId,
                last_vote_time: now,
                expires_at: newExpiresAt
            }, { onConflict: 'user_id' });

        if (upsertError) {
            console.error('[VoteAPI] Supabase error:', upsertError);
            return NextResponse.json({ error: 'Veritabanı güncelleme hatası.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            expires_at: newExpiresAt,
            message: 'Oy başarıyla kaydedildi!'
        });
    } catch (error) {
        console.error('[VoteAPI] Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
