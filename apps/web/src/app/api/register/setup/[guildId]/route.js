import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
          components: [
            {
              type: 2, // Button
              style: 3, // SUCCESS (Green)
              label: "Kayıt Ol / Register",
              custom_id: "register_btn",
              emoji: { name: "📝" }
            }
          ]
        }
      ]
    };

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: "Discord API Error", details: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error("Setup message error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
