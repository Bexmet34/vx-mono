import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@veyronix/database';
import { checkDashboardAccess } from '@/utils/authUtils';
import { sendChannelMessage, deleteChannelMessage } from '@/lib/discordApi';

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

    const descriptionText = `🇹🇷 **Parti ve İçerik Oluşturma Merkezi**
Aşağıdaki butonları kullanarak sunucumuzdaki parti (content) sistemini hızlıca kullanabilirsiniz:
🟢 **/createparty** : Sıfırdan, kendi kurallarınıza ve rollerinize göre yepyeni bir parti oluşturun.
🔵 **/temp** : Önceden kaydedilmiş hazır şablonları kullanarak (sunucu veya kişisel) tek tıkla parti kurun.
🟡 **/mytemps** : Kendi oluşturduğunuz bireysel parti şablonlarınızı web üzerinden görüntüleyin, düzenleyin veya silin.
🔴 **/closeparty** : Şu anda aktif olan partinizi sonlandırın ve açılan kanalı temizleyin.
*Not: Butonlara tıkladığınızda sizin için özel bir metin kanalı açılacaktır. Lütfen içerik oluştururken sunucu kurallarına dikkat ediniz.*

🇬🇧 **Party and Content Creation Center**
You can quickly use the party (content) system on our server using the buttons below:
🟢 **/createparty** : Create a brand new party from scratch according to your own rules and roles.
🔵 **/temp** : Create a party with one click using pre-saved templates.
🟡 **/mytemps** : View, edit or delete your personal party templates via web.
🔴 **/closeparty** : End your currently active party and clean up the created channel.
*Note: A private text channel will be opened for you when you click the buttons. Please follow server rules.*`;

    const messagePayload = {
      embeds: [
        {
          title: "⚔️ Content / Parti Sistemi",
          description: settings.fixed_message_content ? `${settings.fixed_message_content}\n\n${descriptionText}` : descriptionText,
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
        },
        {
          type: 1, // ActionRow
          components: [
            { type: 2, style: 5, label: "Kişisel Şablonları Yönet (Web)", url: "https://veyronix.com.tr/dashboard/user" }
          ]
        }
      ]
    };

    if (settings.fixed_message_id) {
      try {
        await deleteChannelMessage(channelId, settings.fixed_message_id);
      } catch (e) {
        console.error("Old fixed message delete error", e);
      }
    }

    let responseData;
    try {
      responseData = await sendChannelMessage(channelId, messagePayload);
    } catch (e) {
      return NextResponse.json({ error: "Discord API Error", details: e.message }, { status: 500 });
    }

    await supabase
      .from('guild_settings')
      .update({ fixed_message_id: responseData.id })
      .eq('guild_id', guildId);

    return NextResponse.json({ success: true, messageId: responseData.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
