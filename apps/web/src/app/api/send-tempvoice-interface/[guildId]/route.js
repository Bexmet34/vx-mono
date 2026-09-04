import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { sendChannelMessage, getApplicationEmojis } from "@/lib/discordApi";
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
    console.log('[VoiceForge] Step 0: Fetching application emojis...');
    const emojiMap = await getApplicationEmojis();
    console.log(`[VoiceForge] Step 0 OK: Loaded ${Object.keys(emojiMap).length} custom application emojis from Discord`);

    // 2. Build Discord interactive ActionRows
    console.log('[VoiceForge] Step 2: Building action rows...');
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
          emoji: emojiPayload,
          label: config.shortLabel ? config.shortLabel[lang] : (config.label ? config.label[lang] : 'Buton')
        };
      }).filter(Boolean);

      if (rowButtons.length > 0) {
        actionRows.push({ type: 1, components: rowButtons });
      }
    }
    console.log(`[VoiceForge] Step 2 OK: Built ${actionRows.length} action rows`);

    // 3. Assemble Discord Embed (Footer is positioned strictly below the image!)
    console.log('[VoiceForge] Step 3: Assembling embed...');
    const embed = {
      title: embedTitle || (lang === 'tr' ? 'VoiceForge Arayüzü' : 'VoiceForge Interface'),
      description: embedDesc || '',
      color: 0xFF3366,
      author: {
        name: 'VoiceForge APP'
      }
    };


    if (embedFooter) {
      embed.footer = { text: embedFooter };
    }

    const messagePayload = {
      embeds: [embed],
      components: actionRows
    };

    console.log(`[VoiceForge] Step 4: Sending to Discord channel ${channelId}...`);
    await sendChannelMessage(channelId, messagePayload);
    console.log('[VoiceForge] Step 4 OK: Message sent to Discord successfully!');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending VoiceForge interface:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
