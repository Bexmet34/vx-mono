import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { sendChannelMessage } from "@/lib/discordApi";

// All buttons use style: 2 (gray/secondary) for a clean, uniform look
const BUTTON_CONFIGS = {
  'name':         { label: { tr: 'ODA İSMİ',      en: 'NAME'         }, emoji: '✏️',  style: 2, custom_id: 'tv_name' },
  'limit':        { label: { tr: 'ODA LİMİTİ',    en: 'LIMIT'        }, emoji: '👤',  style: 2, custom_id: 'tv_limit' },
  'privacy':      { label: { tr: 'GİZLİLİK',      en: 'PRIVACY'      }, emoji: '🔒',  style: 2, custom_id: 'tv_privacy' },
  'waiting_room': { label: { tr: 'BEKLEME ODASI', en: 'WAITING ROOM' }, emoji: '⏳',  style: 2, custom_id: 'tv_waiting_room' },
  'chat':         { label: { tr: 'SOHBET',         en: 'CHAT'         }, emoji: '💬',  style: 2, custom_id: 'tv_chat' },
  'trusted':      { label: { tr: 'GÜVENİLİR',     en: 'TRUSTED'      }, emoji: '✅',  style: 2, custom_id: 'tv_trusted' },
  'untrusted':    { label: { tr: 'GÜVENSİZ',      en: 'UNTRUSTED'    }, emoji: '❌',  style: 2, custom_id: 'tv_untrusted' },
  'invite':       { label: { tr: 'DAVET',          en: 'INVITE'       }, emoji: '📨',  style: 2, custom_id: 'tv_invite' },
  'kick':         { label: { tr: 'SESTEN AT',      en: 'KICK'         }, emoji: '🔇',  style: 2, custom_id: 'tv_kick' },
  'region':       { label: { tr: 'BÖLGE',          en: 'REGION'       }, emoji: '🌐',  style: 2, custom_id: 'tv_region' },
  'block':        { label: { tr: 'ENGELLE',        en: 'BLOCK'        }, emoji: '🚫',  style: 2, custom_id: 'tv_block' },
  'unblock':      { label: { tr: 'ENGELİ KALDIR', en: 'UNBLOCK'      }, emoji: '🔓',  style: 2, custom_id: 'tv_unblock' },
  'claim':        { label: { tr: 'SAHİPLİK',       en: 'CLAIM'        }, emoji: '👑',  style: 2, custom_id: 'tv_claim' },
  'transfer':     { label: { tr: 'ODAYI DEVRET',   en: 'TRANSFER'     }, emoji: '🔁',  style: 2, custom_id: 'tv_transfer' },
  'delete':       { label: { tr: 'SİL',            en: 'DELETE'       }, emoji: '🗑️', style: 2, custom_id: 'tv_delete' },
};

/**
 * Builds a text-based legend grid (like the reference bot's embed image)
 * Shows 5 buttons per row: "emoji LABEL"
 */
function buildButtonLegend(buttons, lang) {
  if (!buttons || buttons.length === 0) return '';

  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    const rowIds = buttons.slice(i, i + 5);
    const rowText = rowIds
      .map(id => {
        const config = BUTTON_CONFIGS[id];
        if (!config) return null;
        const label = config.label[lang] || config.label.en;
        return `${config.emoji} **${label}**`;
      })
      .filter(Boolean)
      .join('   ');
    rows.push(rowText);
  }

  return rows.join('\n');
}

export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[VoiceForge] No session - Unauthorized');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: params may be a Promise
    const params = await Promise.resolve(context.params);
    const guildId = params?.guildId;
    if (!guildId) {
      console.log('[VoiceForge] No guildId in params');
      return NextResponse.json({ error: "Guild ID required" }, { status: 400 });
    }

    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      console.log(`[VoiceForge] No dashboard access for guild ${guildId}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { channelId, buttons, lang = 'en', embedTitle, embedDesc, embedFooter } = body;

    console.log(`[VoiceForge] Send request: guild=${guildId} channel=${channelId} buttons=${buttons?.length}`);

    if (!channelId || !buttons || !Array.isArray(buttons) || buttons.length === 0) {
      console.log(`[VoiceForge] Invalid params: channelId=${channelId} buttons=${JSON.stringify(buttons)}`);
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Build the text legend (inside the embed, like the reference bot)
    const legend = buildButtonLegend(buttons, lang);

    // Assemble embed description: user text + separator + button legend + footer
    let description = '';
    if (embedDesc) description += embedDesc + '\n';
    description += '\n' + legend;
    if (embedFooter) description += '\n\n-# ' + embedFooter;

    // Chunk active buttons into Discord action rows (max 5 per row, max 5 rows)
    const actionRows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      const rowButtons = buttons.slice(i, i + 5).map(btnId => {
        const config = BUTTON_CONFIGS[btnId];
        if (!config) return null;
        return {
          type: 2,
          style: 2, // All gray for uniform look
          custom_id: config.custom_id,
          emoji: { name: config.emoji }
        };
      }).filter(Boolean);

      if (rowButtons.length > 0) {
        actionRows.push({ type: 1, components: rowButtons });
      }
    }

    // Discord message payload
    const embed = {
      title: embedTitle || 'VoiceForge Interface',
      description: description.trim(),
      color: 0xFF3366,
      author: { name: 'VoiceForge APP' }
    };

    await sendChannelMessage(channelId, { embeds: [embed], components: actionRows });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending VoiceForge interface:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
