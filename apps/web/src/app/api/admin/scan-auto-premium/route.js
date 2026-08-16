import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Helper to check user in Discord via Bot API
async function checkDiscordPresence(discordId, serverIds) {
    for (const guildId of serverIds) {
        try {
            const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
                headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
            });
            if (!res.ok) return false;
        } catch (e) {
            return false;
        }
    }
    return true;
}

export async function POST(req) {
    try {
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('discord_id, is_unlimited, premium_until, is_auto_premium')
            .eq('is_auto_premium', true);
            
        if (userError) throw userError;
        
        const { data: rules } = await supabase.from('auto_premium_rules').select('*');
        if (!rules || rules.length === 0) {
            return NextResponse.json({ success: true, message: "No rules found, scan aborted." });
        }

        let revokedCount = 0;

        for (const user of users) {
            // Check Discord presence
            let hasValidRule = false;
            for (const rule of rules) {
                const requiredServers = rule.discord_servers || [];
                const inServers = await checkDiscordPresence(user.discord_id, requiredServers);
                if (inServers) {
                    hasValidRule = true;
                    break;
                }
            }

            if (!hasValidRule) {
                await supabase.from('users').update({
                    premium_until: null,
                    is_unlimited: false,
                    is_auto_premium: false
                }).eq('discord_id', user.discord_id);
                revokedCount++;
            }
        }

        return NextResponse.json({ success: true, revokedCount });
    } catch (error) {
        console.error('Scan Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
