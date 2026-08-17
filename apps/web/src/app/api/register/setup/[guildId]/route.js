import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendChannelMessage } from '@/lib/discordApi';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;
    const { settings } = await req.json();

    const channelId = settings.registration_channel_id;
    if (!channelId) {
      return NextResponse.json({ error: "No channel selected." }, { status: 400 });
    }

    const messageContent = settings.registration_welcome_message || "Kayıt olmak için aşağıdaki butona tıklayın.";
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured on web server." }, { status: 500 });
    }

    // Embed and Button structure
    const body = {
      content: "",
      embeds: [
        {
          title: "🛡️ Kayıt Sistemi / Registration",
          description: messageContent,
          color: 0x22c55e, // Green
          footer: { text: "Veyronix System" }
        }
      ],
      components: [
        {
          type: 1, // Action Row
          components: []
        }
      ]
    };

    const buttonType = settings.registration_button_type || 'both';

    if (buttonType === 'tr' || buttonType === 'both') {
      body.components[0].components.push({
        type: 2, // Button
        style: 1, // Primary (Blurple)
        label: "🇹🇷 Kayıt Ol",
        custom_id: "register_start_tr",
      });
    }

    if (buttonType === 'en' || buttonType === 'both') {
      body.components[0].components.push({
        type: 2, // Button
        style: 1, // Primary (Blurple)
        label: "🇬🇧 Register",
        custom_id: "register_start_en",
      });
    }

    try {
      const data = await sendChannelMessage(channelId, body);
      return NextResponse.json({ success: true, messageId: data.id });
    } catch (apiError) {
      return NextResponse.json({ error: "Discord API Error", details: apiError.message }, { status: 500 });
    }
  } catch (err) {
    console.error("Setup message error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
