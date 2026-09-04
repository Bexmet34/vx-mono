import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';

function getBotToken() {
    let token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.BOT_TOKEN || '';
    token = token.trim();
    if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1).trim();
    if (token.startsWith("'") && token.endsWith("'")) token = token.slice(1, -1).trim();
    if (token.startsWith('Bot ')) token = token.substring(4).trim();
    return token;
}

// Discord Permission Flags
const PERMISSIONS = {
    VIEW_CHANNEL: BigInt(1 << 10),
    SEND_MESSAGES: BigInt(1 << 11),
    EMBED_LINKS: BigInt(1 << 14),
    ATTACH_FILES: BigInt(1 << 15),
    READ_MESSAGE_HISTORY: BigInt(1 << 16),
};

/**
 * Checks if the bot has required permissions in a specific channel.
 * Uses Discord's /channels/:id endpoint to get channel info + overwrites,
 * and /guilds/:id/members/@me to get the bot's roles.
 * No message is sent — pure permission check only.
 */
export async function GET(req, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await Promise.resolve(context.params);
        const guildId = params?.guildId;
        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID required' }, { status: 400 });
        }

        const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const channelId = searchParams.get('channelId');
        if (!channelId) {
            return NextResponse.json({ error: 'channelId query param required' }, { status: 400 });
        }

        const token = getBotToken();

        // 1. Fetch channel info (includes permission_overwrites)
        const channelRes = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
            headers: { 'Authorization': `Bot ${token}` }
        });

        if (!channelRes.ok) {
            const err = await channelRes.text().catch(() => '');
            if (channelRes.status === 404) {
                return NextResponse.json({ hasAccess: false, reason: 'channel_not_found', channelName: null });
            }
            return NextResponse.json({ hasAccess: false, reason: 'api_error', detail: err });
        }

        const channel = await channelRes.json();

        // 2. Fetch bot's own guild member info (to get role IDs)
        const botMemberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/@me`, {
            headers: { 'Authorization': `Bot ${token}` }
        });

        if (!botMemberRes.ok) {
            // Fallback: try to get bot user id via oauth2/applications/@me
            return NextResponse.json({ hasAccess: false, reason: 'bot_member_fetch_failed' });
        }

        const botMember = await botMemberRes.json();
        const botRoleIds = new Set(botMember.roles || []);

        // 3. Fetch guild info to get @everyone role id (same as guildId) and bot user id
        const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
            headers: { 'Authorization': `Bot ${token}` }
        });

        let everyoneRoleId = guildId; // @everyone role ID always equals guild ID
        let isOwner = false;
        
        if (guildRes.ok) {
            const guild = await guildRes.json();
            if (guild.owner_id && botMember.user?.id === guild.owner_id) {
                isOwner = true;
            }
        }

        // 4. Calculate effective permissions using Discord's algorithm
        // Start with @everyone base permissions (from guild roles)
        const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
            headers: { 'Authorization': `Bot ${token}` }
        });

        let basePermissions = BigInt(0);
        let isAdmin = false;

        if (rolesRes.ok) {
            const roles = await rolesRes.json();
            
            for (const role of roles) {
                // @everyone role
                if (role.id === everyoneRoleId) {
                    basePermissions |= BigInt(role.permissions);
                }
                // Bot's own roles
                if (botRoleIds.has(role.id)) {
                    basePermissions |= BigInt(role.permissions);
                }
            }

            // Check ADMINISTRATOR bit (bit 3)
            const ADMIN_PERM = BigInt(1 << 3);
            if ((basePermissions & ADMIN_PERM) === ADMIN_PERM || isOwner) {
                isAdmin = true;
            }
        }

        // If admin, all permissions granted
        if (isAdmin) {
            return NextResponse.json({
                hasAccess: true,
                isAdmin: true,
                channelName: channel.name,
                channelType: channel.type,
                missingPermissions: [],
            });
        }

        // 5. Apply channel-level permission overwrites
        let allow = BigInt(0);
        let deny = BigInt(0);

        const overwrites = channel.permission_overwrites || [];

        // First apply @everyone overwrite
        const everyoneOverwrite = overwrites.find(o => o.id === everyoneRoleId);
        if (everyoneOverwrite) {
            allow |= BigInt(everyoneOverwrite.allow || 0);
            deny |= BigInt(everyoneOverwrite.deny || 0);
        }

        // Then apply role overwrites for bot's roles
        for (const overwrite of overwrites) {
            if (overwrite.type === 0 && botRoleIds.has(overwrite.id)) {
                allow |= BigInt(overwrite.allow || 0);
                deny |= BigInt(overwrite.deny || 0);
            }
        }

        // Then apply member-specific overwrite
        const botUserId = botMember.user?.id;
        if (botUserId) {
            const memberOverwrite = overwrites.find(o => o.id === botUserId && o.type === 1);
            if (memberOverwrite) {
                allow |= BigInt(memberOverwrite.allow || 0);
                deny |= BigInt(memberOverwrite.deny || 0);
            }
        }

        // Compute final permissions
        let effectivePermissions = (basePermissions & ~deny) | allow;

        // 6. Check required permissions
        const requiredPerms = [
            { flag: PERMISSIONS.VIEW_CHANNEL, name_tr: 'Kanalı Görüntüle', name_en: 'View Channel' },
            { flag: PERMISSIONS.SEND_MESSAGES, name_tr: 'Mesaj Gönder', name_en: 'Send Messages' },
            { flag: PERMISSIONS.EMBED_LINKS, name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links' },
            { flag: PERMISSIONS.ATTACH_FILES, name_tr: 'Dosya Ekle', name_en: 'Attach Files' },
        ];

        const missingPermissions = requiredPerms.filter(p => (effectivePermissions & p.flag) !== p.flag);
        const hasAllPermissions = missingPermissions.length === 0;

        return NextResponse.json({
            hasAccess: hasAllPermissions,
            isAdmin: false,
            channelName: channel.name,
            channelType: channel.type,
            missingPermissions: missingPermissions.map(p => ({ name_tr: p.name_tr, name_en: p.name_en })),
        });

    } catch (error) {
        console.error('[PermCheck] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
