import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DB_PATH = path.join(process.cwd(), '../../apps/bot/src/data/database.sqlite');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

        // 2. Database update (Stacking logic)
        const db = new Database(DB_PATH, { fileMustExist: true });
        
        // Fetch cooldown hours
        let cooldownHours = 168; // default 1 week
        const setting = db.prepare("SELECT value FROM system_settings WHERE key = 'vote_cooldown_hours'").get();
        if (setting && setting.value) {
            cooldownHours = parseInt(setting.value, 10);
            if (isNaN(cooldownHours) || cooldownHours < 0) cooldownHours = 168;
        }

        const addedMs = cooldownHours * 60 * 60 * 1000;
        const now = Date.now();

        const row = db.prepare("SELECT expires_at FROM user_votes WHERE user_id = ?").get(userId);
        
        let newExpiresAt = now + addedMs;
        if (row && row.expires_at && row.expires_at > now) {
            // Stack the time!
            newExpiresAt = row.expires_at + addedMs;
        }

        db.prepare(`
            INSERT INTO user_votes (user_id, last_vote_time, expires_at) 
            VALUES (?, ?, ?) 
            ON CONFLICT(user_id) 
            DO UPDATE SET last_vote_time=excluded.last_vote_time, expires_at=excluded.expires_at
        `).run(userId, now, newExpiresAt);

        // 3. Fetch user's language preference (Fallback to 'tr')
        let lang = 'tr';
        try {
            const guildRow = db.prepare(`
                SELECT language 
                FROM guild_configs 
                WHERE guild_id IN (SELECT guild_id FROM guild_whitelist WHERE user_id = ?) 
                LIMIT 1
            `).get(userId);
            
            if (guildRow && guildRow.language) {
                lang = guildRow.language;
            }
        } catch (e) {
            console.error("Webhook DB error reading language:", e.message);
        }

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

            // Create DM Channel
            const dmRes = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ recipient_id: userId })
            });

            if (dmRes.ok) {
                const dmData = await dmRes.json();
                // Send Message
                await fetch(`https://discord.com/api/v10/channels/${dmData.id}/messages`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        embeds: [{
                            title: title,
                            description: desc,
                            color: color
                        }]
                    })
                });
            } else {
                console.error("Webhook Discord DM Channel Error:", await dmRes.text());
            }
        }

        return NextResponse.json({ success: true, user: userId, expiresAt: newExpiresAt });
    } catch (error) {
        console.error('Webhook Error [topgg]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
