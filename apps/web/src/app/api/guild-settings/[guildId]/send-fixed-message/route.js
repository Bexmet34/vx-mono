import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/utils/supabase';
import { checkDashboardAccess } from '@/utils/authUtils';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;
    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch current settings
    const { data: settings, error } = await supabase
      .from('guild_settings')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error || !settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    if (settings.system_mode !== 'fixed_channel' || !settings.fixed_message_channel_id) {
      return NextResponse.json({ error: "Fixed channel mode is not properly configured" }, { status: 400 });
    }

    const channelId = settings.fixed_message_channel_id;
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const messagePayload = {
      embeds: [
        {
          title: "⚔️ Content / Parti Sistemi",
          description: settings.fixed_message_content || "Lütfen bir parti oluşturmak veya yönetmek için aşağıdaki butonları kullanın.",
          color: 0x2b2d31,
        }
      ],
      components: [
        {
          type: 1, // ActionRow
          components: [
            { type: 2, style: 3, label: "/createparty", custom_id: "fc_createparty", emoji: { name: "🟢" } },
            { type: 2, style: 4, label: "/closeparty", custom_id: "fc_closeparty", emoji: { name: "🔴" } }
          ]
        },
        {
          type: 1, // ActionRow
          components: [
            { type: 2, style: 1, label: "/temp", custom_id: "fc_temp", emoji: { name: "🔵" } },
            { type: 2, style: 2, label: "/mytemps", custom_id: "fc_mytemps", emoji: { name: "🟡" } }
          ]
        }
      ]
    };

    let fetchUrl = `https://discord.com/api/v10/channels/${channelId}/messages`;
    let fetchMethod = 'POST';

    if (settings.fixed_message_id) {
      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${settings.fixed_message_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bot ${token}` }
      });
    }

    const discordRes = await fetch(fetchUrl, {
      method: fetchMethod,
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      return NextResponse.json({ error: "Discord API Error", details: errorText }, { status: discordRes.status });
    }

    const responseData = await discordRes.json();

    await supabase
      .from('guild_settings')
      .update({ fixed_message_id: responseData.id })
      .eq('guild_id', guildId);

    return NextResponse.json({ success: true, messageId: responseData.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
