import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { sendChannelMessage, getApplicationEmojis } from "@/lib/discordApi";
import { generateInterfaceImage } from "@/lib/generateInterfaceImage";
import { BUTTON_DATA } from "@/lib/buttonConfigs";

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
    const { channelId, buttons, lang = 'tr', embedTitle, embedDesc, embedFooter } = body;

    console.log(`[VoiceForge] Send request: guild=${guildId} channel=${channelId} buttons=${buttons?.length}`);

    if (!channelId || !buttons || !Array.isArray(buttons) || buttons.length === 0) {
      console.log(`[VoiceForge] Invalid params: channelId=${channelId} buttons=${JSON.stringify(buttons)}`);
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // 0. Fetch dynamic Application Emojis from Discord Developer Portal
    const emojiMap = await getApplicationEmojis();
    console.log(`[VoiceForge] Loaded ${Object.keys(emojiMap).length} custom application emojis from Discord`);

    // 1. Generate the sleek canvas image for embed
    let files = [];
    let imageAttachmentUrl = null;
    try {
      const imageBuffer = await generateInterfaceImage(buttons, lang, emojiMap);
      if (imageBuffer) {
        files.push({
          name: 'interface.png',
          buffer: imageBuffer,
          contentType: 'image/png'
        });
        imageAttachmentUrl = 'attachment://interface.png';
      }
    } catch (imgErr) {
      console.error('[VoiceForge] Failed to generate interface image:', imgErr);
    }

    // 2. Build Discord interactive ActionRows with Custom Application Emojis
    const actionRows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      const rowButtons = buttons.slice(i, i + 5).map(btnId => {
        const config = BUTTON_DATA[btnId];
        if (!config) return null;
        
        // Find custom emoji from bot developer portal
        const appEmoji = config.emojiName ? emojiMap[config.emojiName.toLowerCase()] : null;
        const emojiPayload = appEmoji 
          ? { id: appEmoji.id, name: appEmoji.name }
          : { name: config.fallbackEmoji || '⚙️' };

        return {
          type: 2,
          style: 2, // Secondary / Gray for sleek uniform look
          custom_id: `tv_${btnId}`,
          emoji: emojiPayload
        };
      }).filter(Boolean);

      if (rowButtons.length > 0) {
        actionRows.push({ type: 1, components: rowButtons });
      }
    }

    // 3. Assemble Discord Embed (Footer is positioned strictly below the image!)
    const embed = {
      title: embedTitle || (lang === 'tr' ? 'VoiceForge Arayüzü' : 'VoiceForge Interface'),
      description: embedDesc || '',
      color: 0xFF3366,
      author: {
        name: 'VoiceForge APP'
      }
    };

    if (imageAttachmentUrl) {
      embed.image = { url: imageAttachmentUrl };
    }

    if (embedFooter) {
      embed.footer = { text: embedFooter };
    }

    const messagePayload = {
      embeds: [embed],
      components: actionRows
    };

    await sendChannelMessage(channelId, messagePayload, files);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending VoiceForge interface:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
