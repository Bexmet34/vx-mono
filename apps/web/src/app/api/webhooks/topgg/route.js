import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';
import { createDMChannel, sendChannelMessage } from '@/lib/discordApi';
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        // 1. Authorization check
        const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
        if (authHeader !== process.env.TOPGG_WEBHOOK_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        // top.gg sends user id in `user` property
        const userId = body.user;
        const type = body.type; // "upvote" or "test"

        if (!userId) {
            return NextResponse.json({ error: 'No user provided' }, { status: 400 });
        }

        // 2. Fetch cooldown hours from Supabase
        let cooldownHours = 168; // default 1 week
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'vote_cooldown_hours')
            .single();

        if (settingData && settingData.value) {
            cooldownHours = parseInt(settingData.value, 10);
            if (isNaN(cooldownHours) || cooldownHours < 0) cooldownHours = 168;
        }

        const addedMs = cooldownHours * 60 * 60 * 1000;
        const now = Date.now();

        // Check existing vote time
        const { data: row } = await supabase
            .from('user_votes')
            .select('expires_at')
            .eq('user_id', userId)
            .single();
        
        let newExpiresAt = now + addedMs;
        if (row && row.expires_at && row.expires_at > now) {
            // Stack the time!
            newExpiresAt = row.expires_at + addedMs;
        }

        // Update Supabase user_votes
        const { error: upsertError } = await supabase
            .from('user_votes')
            .upsert({
                user_id: userId,
                last_vote_time: now,
                expires_at: newExpiresAt
            }, { onConflict: 'user_id' });
            
        if (upsertError) {
            return NextResponse.json({ error: 'Upsert failed', details: upsertError }, { status: 500 });
        }

        // 3. Fetch user's language preference (Fallback to 'tr')
        let lang = 'tr'; // In Supabase context, determining user's exact guild lang is hard from just user_id if they are in multiple.
        // We will default to tr, or we could fetch subscriptions if we really wanted to, but fallback to tr is fine for now.

        // 4. Send DM via Discord API
        if (process.env.DISCORD_BOT_TOKEN) {
            // Fetch template from Supabase
            const { data: template } = await supabase
                .from('notification_templates')
                .select('*')
                .eq('id', 'topgg_vote_thanks')
                .single();

            // Default fallback messages if template doesn't exist
            let title = lang === 'tr' ? 'Destek İçin Teşekkürler!' : 'Thank You For Voting!';
            let desc = lang === 'tr' ? 
                'Veyronix için oy verdiğiniz için teşekkür ederiz!\\nOy süreniz başarıyla uzatıldı.\\n\\nYeni Bitiş Tarihiniz: <t:{bitis_tarihi}:F>' : 
                'Thank you for voting for Veyronix!\\nYour vote duration has been successfully extended.\\n\\nNew Expiration Date: <t:{bitis_tarihi}:F>';
            let color = 0x5865F2;

            if (template) {
                title = lang === 'en' && template.title_en ? template.title_en : (template.title_tr || title);
                desc = lang === 'en' && template.content_en ? template.content_en : (template.content_tr || desc);
                color = template.color ? parseInt(template.color.replace('#', ''), 16) : color;
            }

            // Replace variables
            const discordTimestamp = Math.floor(newExpiresAt / 1000);
            desc = desc.replace(/{bitis_tarihi}/g, discordTimestamp);

            // Create DM Channel and Send Message
            try {
                const dmData = await createDMChannel(userId);
                if (dmData && dmData.id) {
                    await sendChannelMessage(dmData.id, {
                        embeds: [{
                            title: title,
                            description: desc.replace(/\\n/g, '\n'),
                            color: color
                        }]
                    });
                }
            } catch (err) {
                console.error("Webhook Discord DM Channel Error:", err.message);
            }
        }

        return NextResponse.json({ success: true, user: userId, expiresAt: newExpiresAt });
    } catch (error) {
        console.error('Webhook Error [topgg]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
