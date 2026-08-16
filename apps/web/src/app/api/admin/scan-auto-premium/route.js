import { NextResponse } from 'next/server';
import { getAutoPremiumUsers, getAutoPremiumRules, revokeAutoPremium } from '@veyronix/database';
import { checkDiscordPresence } from '@/lib/discordApi';

export async function POST(req) {
    try {
        const users = await getAutoPremiumUsers();
        const rules = await getAutoPremiumRules();
        
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
                await revokeAutoPremium(user.discord_id);
                revokedCount++;
            }
        }

        return NextResponse.json({ success: true, revokedCount });
    } catch (error) {
        console.error('Scan Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
