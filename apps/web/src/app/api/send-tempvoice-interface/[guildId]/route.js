import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { sendChannelMessage } from "@/lib/discordApi";

const BUTTON_CONFIGS = {
  'chat': { label: { tr: 'SOHBET', en: 'CHAT' }, emoji: '💬', style: 2, custom_id: 'tv_chat' },
  'kick': { label: { tr: 'SESTEN AT', en: 'KICK' }, emoji: '📵', style: 4, custom_id: 'tv_kick' },
  'waiting_room': { label: { tr: 'BEKLEME ODASI', en: 'WAITING ROOM' }, emoji: '🕒', style: 2, custom_id: 'tv_waiting_room' },
  'delete': { label: { tr: 'SİL', en: 'DELETE' }, emoji: '🗑️', style: 4, custom_id: 'tv_delete' },
  'invite': { label: { tr: 'DAVET', en: 'INVITE' }, emoji: '📩', style: 2, custom_id: 'tv_invite' },
  'privacy': { label: { tr: 'GİZLİLİK', en: 'PRIVACY' }, emoji: '🛡️', style: 2, custom_id: 'tv_privacy' },
  'limit': { label: { tr: 'ODA LİMİTİ', en: 'LIMIT' }, emoji: '👥', style: 2, custom_id: 'tv_limit' },
  'name': { label: { tr: 'ODA İSMİ', en: 'NAME' }, emoji: '📝', style: 2, custom_id: 'tv_name' },
  'block': { label: { tr: 'ENGELLE', en: 'BLOCK' }, emoji: '🚫', style: 4, custom_id: 'tv_block' },
  'unblock': { label: { tr: 'ENGELİ KALDIR', en: 'UNBLOCK' }, emoji: '✅', style: 3, custom_id: 'tv_unblock' },
  'claim': { label: { tr: 'SAHİPLEN', en: 'CLAIM' }, emoji: '👑', style: 2, custom_id: 'tv_claim' },
  'transfer': { label: { tr: 'ODAYI DEVRET', en: 'TRANSFER' }, emoji: '🔀', style: 2, custom_id: 'tv_transfer' },
  'untrusted': { label: { tr: 'GÜVENSİZ', en: 'UNTRUSTED' }, emoji: '⚠️', style: 4, custom_id: 'tv_untrusted' },
  'trusted': { label: { tr: 'GÜVENİLİR', en: 'TRUSTED' }, emoji: '🤝', style: 3, custom_id: 'tv_trusted' },
  'region': { label: { tr: 'BÖLGE', en: 'REGION' }, emoji: '🌍', style: 2, custom_id: 'tv_region' }
};

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const guildId = params.guildId;
    if (!guildId) return NextResponse.json({ error: "Guild ID required" }, { status: 400 });

    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { channelId, buttons, lang = 'en' } = body;

    if (!channelId || !buttons || !Array.isArray(buttons) || buttons.length === 0) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Chunk buttons into rows of max 5
    const actionRows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      const rowButtons = buttons.slice(i, i + 5).map(btnId => {
        const config = BUTTON_CONFIGS[btnId];
        if (!config) return null;
        return {
          type: 2,
          style: config.style,
          custom_id: config.custom_id,
          label: config.label[lang] || config.label.en,
          emoji: { name: config.emoji }
        };
      }).filter(Boolean);

      if (rowButtons.length > 0) {
        actionRows.push({
          type: 1,
          components: rowButtons
        });
      }
    }

    // Discord message payload
    const embed = {
      title: 'TempVoice Interface',
      description: lang === 'tr' 
        ? 'Bu arayüz, geçici ses kanallarını yönetmek için kullanılabilir. Daha fazla seçenek `/voice` komutlarıyla mevcuttur.\n\n👇 **Arayüzü kullanmak için aşağıdaki butonlara basın.**'
        : 'This interface can be used to manage temporary voice channels. More options are available with `/voice` commands.\n\n👇 **Press the buttons below to use the interface.**',
      color: 0xFF3366,
      author: {
        name: 'TempVoice APP',
      }
    };

    const messagePayload = {
      embeds: [embed],
      components: actionRows
    };

    await sendChannelMessage(channelId, messagePayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending tempvoice interface:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
