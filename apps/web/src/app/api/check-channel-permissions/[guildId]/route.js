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

// Discord permission bit flags (BigInt)
const PERM = {
    ADMINISTRATOR:        1n << 3n,
    MANAGE_CHANNELS:      1n << 4n,
    MANAGE_GUILD:         1n << 5n,
    ADD_REACTIONS:        1n << 6n,
    VIEW_AUDIT_LOG:       1n << 7n,
    VIEW_CHANNEL:         1n << 10n,
    SEND_MESSAGES:        1n << 11n,
    MANAGE_MESSAGES:      1n << 13n,
    EMBED_LINKS:          1n << 14n,
    ATTACH_FILES:         1n << 15n,
    READ_MESSAGE_HISTORY: 1n << 16n,
    MENTION_EVERYONE:     1n << 17n,
    CONNECT:              1n << 20n,
    MOVE_MEMBERS:         1n << 24n,
    MANAGE_ROLES:         1n << 28n,
    MANAGE_WEBHOOKS:      1n << 29n,
    MANAGE_THREADS:       1n << 34n,
    MODERATE_MEMBERS:     1n << 40n,
};

// ─── Feature → Required Permissions Map ─────────────────────────────────────
// Her özellik için botun sunucu genelinde (veya ilgili kanalda) sahip olması
// gereken minimum Discord izinleri.
const FEATURE_PERMS = {
    // Geçici Ses Kanalı (VoiceForge)
    voiceforge: [
        { flag: PERM.MANAGE_CHANNELS, name_tr: 'Kanalları Yönet',   name_en: 'Manage Channels' },
        { flag: PERM.MANAGE_ROLES,    name_tr: 'Rolleri Yönet',     name_en: 'Manage Roles'    },
        { flag: PERM.MOVE_MEMBERS,    name_tr: 'Üyeleri Taşı',      name_en: 'Move Members'    },
    ],
    // Sayaç Kanalları
    counters: [
        { flag: PERM.MANAGE_CHANNELS, name_tr: 'Kanalları Yönet',       name_en: 'Manage Channels' },
        { flag: PERM.VIEW_CHANNEL,    name_tr: 'Kanalı Görüntüle',      name_en: 'View Channel'    },
        { flag: PERM.CONNECT,         name_tr: 'Bağlan (Ses Kanalı)',   name_en: 'Connect (Voice)' },
    ],
    // Ticket Sistemi
    ticket: [
        { flag: PERM.MANAGE_CHANNELS,      name_tr: 'Kanalları Yönet',       name_en: 'Manage Channels'       },
        { flag: PERM.VIEW_CHANNEL,         name_tr: 'Kanalı Görüntüle',      name_en: 'View Channel'          },
        { flag: PERM.SEND_MESSAGES,        name_tr: 'Mesaj Gönder',          name_en: 'Send Messages'         },
        { flag: PERM.EMBED_LINKS,          name_tr: 'Bağlantı Yerleştir',   name_en: 'Embed Links'           },
        { flag: PERM.READ_MESSAGE_HISTORY, name_tr: 'Mesaj Geçmişini Oku',  name_en: 'Read Message History'  },
        { flag: PERM.MANAGE_MESSAGES,      name_tr: 'Mesajları Yönet',       name_en: 'Manage Messages'       },
    ],
    // Rol Menüsü
    rolemenu: [
        { flag: PERM.MANAGE_ROLES,  name_tr: 'Rolleri Yönet',   name_en: 'Manage Roles'   },
        { flag: PERM.VIEW_CHANNEL,  name_tr: 'Kanalı Görüntüle', name_en: 'View Channel'  },
        { flag: PERM.SEND_MESSAGES, name_tr: 'Mesaj Gönder',    name_en: 'Send Messages'  },
        { flag: PERM.EMBED_LINKS,   name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links' },
    ],
    // Çekiliş (Giveaway)
    giveaway: [
        { flag: PERM.VIEW_CHANNEL,         name_tr: 'Kanalı Görüntüle',     name_en: 'View Channel'         },
        { flag: PERM.SEND_MESSAGES,        name_tr: 'Mesaj Gönder',         name_en: 'Send Messages'        },
        { flag: PERM.EMBED_LINKS,          name_tr: 'Bağlantı Yerleştir',  name_en: 'Embed Links'          },
        { flag: PERM.ADD_REACTIONS,        name_tr: 'Reaksiyon Ekle',       name_en: 'Add Reactions'        },
        { flag: PERM.READ_MESSAGE_HISTORY, name_tr: 'Mesaj Geçmişini Oku', name_en: 'Read Message History' },
    ],
    // Log Sistemi
    log: [
        { flag: PERM.VIEW_CHANNEL,         name_tr: 'Kanalı Görüntüle',    name_en: 'View Channel'         },
        { flag: PERM.SEND_MESSAGES,        name_tr: 'Mesaj Gönder',        name_en: 'Send Messages'        },
        { flag: PERM.EMBED_LINKS,          name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links'          },
        { flag: PERM.READ_MESSAGE_HISTORY, name_tr: 'Mesaj Geçmişini Oku',name_en: 'Read Message History' },
        { flag: PERM.MANAGE_WEBHOOKS,      name_tr: 'Webhook\'leri Yönet', name_en: 'Manage Webhooks'      },
        { flag: PERM.VIEW_AUDIT_LOG,       name_tr: 'Denetim Günlüğünü Gör', name_en: 'View Audit Log'    },
    ],
    // Başvuru / Form Sistemi
    application: [
        { flag: PERM.MANAGE_CHANNELS, name_tr: 'Kanalları Yönet',     name_en: 'Manage Channels' },
        { flag: PERM.VIEW_CHANNEL,    name_tr: 'Kanalı Görüntüle',    name_en: 'View Channel'    },
        { flag: PERM.SEND_MESSAGES,   name_tr: 'Mesaj Gönder',        name_en: 'Send Messages'   },
        { flag: PERM.EMBED_LINKS,     name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links'     },
    ],
    // Genel mesaj/embed gönderme (içerik kanalları vb.)
    general: [
        { flag: PERM.VIEW_CHANNEL,  name_tr: 'Kanalı Görüntüle',    name_en: 'View Channel'  },
        { flag: PERM.SEND_MESSAGES, name_tr: 'Mesaj Gönder',        name_en: 'Send Messages' },
        { flag: PERM.EMBED_LINKS,   name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links'   },
        { flag: PERM.ATTACH_FILES,  name_tr: 'Dosya Ekle',          name_en: 'Attach Files'  },
    ],
};

/**
 * Checks Discord bot permissions in a channel.
 * Implements Discord's exact permission computation algorithm.
 * Reference: https://discord.com/developers/docs/topics/permissions#permission-overwrites
 * No messages are sent — pure permission check only.
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
        const mode = searchParams.get('mode'); // 'voiceforge' vs
        let channelId = searchParams.get('channelId');

        if (!channelId && mode !== 'voiceforge') {
            return NextResponse.json({ error: 'channelId query param required' }, { status: 400 });
        }

        const token = getBotToken();
        const headers = { 'Authorization': `Bot ${token}` };

        // ── Step 1: Get bot user ID ──────────────────────────────────────────
        const botUserRes = await fetch('https://discord.com/api/v10/users/@me', { headers });
        if (!botUserRes.ok) {
            console.error('[PermCheck] Bot auth failed:', await botUserRes.text());
            return NextResponse.json({ hasAccess: false, reason: 'bot_auth_failed', channelName: null, missingPermissions: [] });
        }
        const botUser = await botUserRes.json();
        const botUserId = botUser.id;

        // ── Step 2: Get channel info & overwrites ────────────────────────────
        let channelName = 'Sunucu Geneli';
        let channelType = null;
        let channelOverwrites = [];

        if (channelId) {
            const channelRes = await fetch(`https://discord.com/api/v10/channels/${channelId}`, { headers });
            if (!channelRes.ok) {
                if (channelRes.status === 403) {
                    return NextResponse.json({
                        hasAccess: false,
                        channelName: null,
                        missingPermissions: mode === 'voiceforge' 
                            ? [
                                { name_tr: 'Kanalları Yönet', name_en: 'Manage Channels' },
                                { name_tr: 'Rolleri Yönet', name_en: 'Manage Roles' },
                                { name_tr: 'Üyeleri Taşı', name_en: 'Move Members' }
                              ]
                            : [
                                { name_tr: 'Kanalı Görüntüle', name_en: 'View Channel' },
                                { name_tr: 'Mesaj Gönder',     name_en: 'Send Messages'  },
                                { name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links' },
                                { name_tr: 'Dosya Ekle',        name_en: 'Attach Files' },
                              ],
                        reason: 'no_view_access',
                    });
                }
                return NextResponse.json({ hasAccess: false, reason: 'channel_fetch_failed', channelName: null, missingPermissions: [] });
            }
            const channel = await channelRes.json();
            channelName = channel.name;
            channelType = channel.type;
            channelOverwrites = channel.permission_overwrites || [];
        }

        // ── Step 3: Get bot's guild member info (role IDs) ───────────────────
        const memberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botUserId}`, { headers });
        if (!memberRes.ok) {
            console.error('[PermCheck] Could not fetch bot member:', await memberRes.text());
            return NextResponse.json({ hasAccess: false, reason: 'bot_not_in_guild', channelName: channel.name, missingPermissions: [] });
        }
        const botMember = await memberRes.json();
        // Include @everyone role (its ID = guildId)
        const botRoleIds = new Set([guildId, ...(botMember.roles || [])]);

        // ── Step 4: Fetch guild info + roles in parallel ──────────────────────
        const [rolesRes, guildRes] = await Promise.all([
            fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers }),
            fetch(`https://discord.com/api/v10/guilds/${guildId}`, { headers }),
        ]);

        let guildOwnerId = null;
        if (guildRes.ok) {
            const guildData = await guildRes.json();
            guildOwnerId = guildData.owner_id;
        }

        // ── Step 5: Compute base permissions from guild-level roles ───────────
        // Sum up @everyone + all of bot's role permissions
        let basePermissions = 0n;

        if (rolesRes.ok) {
            const roles = await rolesRes.json();
            for (const role of roles) {
                if (botRoleIds.has(role.id)) {
                    try {
                        basePermissions |= BigInt(role.permissions);
                    } catch {
                        // skip invalid permissions value
                    }
                }
            }
        }

        // Guild owner or ADMINISTRATOR → all permissions
        if (botUserId === guildOwnerId || (basePermissions & PERM.ADMINISTRATOR) === PERM.ADMINISTRATOR) {
            return NextResponse.json({
                hasAccess: true,
                isAdmin: true,
                channelName: channelName,
                channelType: channelType,
                missingPermissions: [],
            });
        }

        // ── Step 6: Apply channel-level overwrites (Discord exact algorithm) ──
        //
        // Order (per Discord docs):
        //   a) @everyone role overwrite
        //   b) All role-specific overwrites (deny accumulated first, then allow)
        //   c) Member-specific overwrite
        //
        const toBigInt = (v) => { try { return BigInt(v || '0'); } catch { return 0n; } };

        // 6a. @everyone channel overwrite
        const everyoneOW = channelOverwrites.find(o => o.id === guildId && Number(o.type) === 0);
        if (everyoneOW) {
            basePermissions &= ~toBigInt(everyoneOW.deny);
            basePermissions |=  toBigInt(everyoneOW.allow);
        }

        // 6b. Role-specific overwrites (bot's roles, excluding @everyone which was above)
        let roleAllow = 0n;
        let roleDeny  = 0n;
        for (const ow of channelOverwrites) {
            if (Number(ow.type) === 0 && ow.id !== guildId && botRoleIds.has(ow.id)) {
                roleAllow |= toBigInt(ow.allow);
                roleDeny  |= toBigInt(ow.deny);
            }
        }
        basePermissions &= ~roleDeny;
        basePermissions |=  roleAllow;

        // 6c. Member-specific overwrite
        const memberOW = channelOverwrites.find(o => o.id === botUserId && Number(o.type) === 1);
        if (memberOW) {
            basePermissions &= ~toBigInt(memberOW.deny);
            basePermissions |=  toBigInt(memberOW.allow);
        }

        // ── Step 7: Check required permissions ───────────────────────────────
        // FEATURE_PERMS haritasından ilgili mode'un izinlerini al,
        // bilinmeyen mod ise 'general' (genel mesaj gönderme) olarak varsay.
        const requiredPerms = FEATURE_PERMS[mode] ?? FEATURE_PERMS['general'];

        let missingPermissions = requiredPerms.filter(p => (basePermissions & p.flag) !== p.flag);

        // ── Step 8: REAL API TESTING (Ultimate Source of Truth) ───────────────
        // Sadece kanal bazlı kontrol yapan modlarda gerçek API testi yapalım.
        // voiceforge ve counters sunucu geneli izinlerine bakıyor; kanal yoksa atla.
        const GUILD_WIDE_MODES = new Set(['voiceforge', 'counters']);
        const hasSendMessagePerm = requiredPerms.some(p => p.flag === PERM.SEND_MESSAGES);

        if (!GUILD_WIDE_MODES.has(mode) && channelId && hasSendMessagePerm) {
            // KESİN BİLGİ 1: Step 2'de (channel fetch) 403 yemedik ve kanalı okuduk.
            // Bu yüzden VIEW_CHANNEL kesinlikle var! (Local hesaplama ne derse desin)
            missingPermissions = missingPermissions.filter(p => p.flag !== PERM.VIEW_CHANNEL);

            // KESİN BİLGİ 2: SEND_MESSAGES testini Typing endpoint ile yapıyoruz.
            let hasRealSendAccess = false;
            try {
                const typingRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/typing`, {
                    method: 'POST',
                    headers: headers
                });
                if (typingRes.ok || typingRes.status === 204) {
                    hasRealSendAccess = true;
                }
            } catch (e) {
                hasRealSendAccess = false;
            }

            // Eğer typing atamadıysak, SEND_MESSAGES kesinlikle yoktur. (Eksik listesine ekle)
            if (!hasRealSendAccess) {
                if (!missingPermissions.find(p => p.flag === PERM.SEND_MESSAGES)) {
                    const sendPerm = requiredPerms.find(p => p.flag === PERM.SEND_MESSAGES);
                    if (sendPerm) missingPermissions.push(sendPerm);
                }
            } else {
                // Eğer typing atabildiysek, SEND_MESSAGES kesinlikle VARDIR. (Eksik listesinden çıkar)
                missingPermissions = missingPermissions.filter(p => p.flag !== PERM.SEND_MESSAGES);
            }
        }


        const allGood = missingPermissions.length === 0;

        return NextResponse.json({
            hasAccess: allGood,
            isAdmin: botUserId === guildOwnerId || (basePermissions & PERM.ADMINISTRATOR) === PERM.ADMINISTRATOR,
            channelName: channelName,
            channelType: channelType,
            missingPermissions: missingPermissions.map(p => ({ name_tr: p.name_tr, name_en: p.name_en })),
        });

    } catch (error) {
        console.error('[PermCheck] Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
