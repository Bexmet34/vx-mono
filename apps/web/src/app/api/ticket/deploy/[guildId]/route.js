import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { supabase } from '@veyronix/database';
import { sendChannelMessage } from '@/lib/discordApi';

export const dynamic = 'force-dynamic';

export async function POST(req, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await Promise.resolve(context?.params || {});
        const guildId = params?.guildId;
        if (!guildId) {
            return NextResponse.json({ error: "Sunucu ID gereklidir." }, { status: 400 });
        }

        const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const ticket_channel_id = body.ticket_channel_id || body.settings?.ticket_channel_id;
        const ticket_message_title = body.ticket_message_title || body.settings?.ticket_message_title;
        const ticket_message_desc = body.ticket_message_desc || body.settings?.ticket_message_desc;
        const ticket_category_id = body.ticket_category_id || body.settings?.ticket_category_id;
        const ticket_staff_roles = body.ticket_staff_roles || body.settings?.ticket_staff_roles;
        const ticket_options = body.ticket_options || body.settings?.ticket_options;

        const ticket_limit = body.ticket_limit || body.settings?.ticket_limit;
        const ticket_name_format = body.ticket_name_format || body.settings?.ticket_name_format;

        if (!ticket_channel_id) {
            return NextResponse.json({ error: "Lütfen önce bir panel kanalı seçin." }, { status: 400 });
        }

        // Fetch guild language setting
        const { data: guildSettings } = await supabase
            .from('guild_settings')
            .select('language')
            .eq('guild_id', guildId)
            .maybeSingle();

        const lang = guildSettings?.language || 'tr';

        const defaultTitle = lang === 'en' ? "Support Ticket" : "Destek Talebi";
        const defaultDesc = lang === 'en' 
            ? "Please click the button below to create a support ticket." 
            : "Lütfen aşağıdaki butona tıklayarak destek talebinizi oluşturun.";
        const buttonLabel = lang === 'en' ? "Open Support Ticket" : "Destek Talebi Aç";

        const botToken = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
        if (!botToken) {
            return NextResponse.json({ error: "Web sunucusunda bot token (DISCORD_BOT_TOKEN) tanımlı değil." }, { status: 400 });
        }

        const payload = {
            embeds: [
                {
                    title: (ticket_message_title && ticket_message_title.trim()) ? ticket_message_title : defaultTitle,
                    description: (ticket_message_desc && ticket_message_desc.trim()) ? ticket_message_desc : defaultDesc,
                    color: 5793266, // Blurple
                    footer: { text: "Veyronix Ticket System" }
                }
            ],
            components: [
                {
                    type: 1, // ActionRow
                    components: [
                        {
                            type: 2, // Button
                            style: 1, // Primary
                            label: buttonLabel,
                            emoji: { name: "🎫" },
                            custom_id: "ticket_open"
                        }
                    ]
                }
            ]
        };

        // Sync ticket settings to DB so interaction works immediately
        try {
            await supabase
                .from('guild_settings')
                .update({
                    ticket_system_enabled: true,
                    ticket_channel_id: ticket_channel_id,
                    ...(ticket_category_id ? { ticket_category_id } : {}),
                    ...(ticket_staff_roles !== undefined ? { ticket_staff_roles } : {}),
                    ...(ticket_message_title !== undefined ? { ticket_message_title } : {}),
                    ...(ticket_message_desc !== undefined ? { ticket_message_desc } : {}),
                    ...(ticket_options !== undefined ? { ticket_options } : {}),
                    ...(ticket_limit !== undefined ? { ticket_limit: parseInt(ticket_limit, 10) || 1 } : {}),
                    ...(ticket_name_format !== undefined ? { ticket_name_format } : {})
                })
                .eq('guild_id', guildId);
        } catch (dbErr) {
            console.error("Guild settings update on deploy warning:", dbErr);
        }

        try {
            await sendChannelMessage(ticket_channel_id, payload);
        } catch (apiError) {
            console.error("Discord API Error during ticket deploy:", apiError.message);
            const msg = apiError.message || "";
            let friendlyError = lang === 'en'
                ? `Failed to send to Discord: ${msg}`
                : `Discord'a gönderilemedi: ${msg}`;
            
            if (msg.includes("403") || msg.includes("50001") || msg.includes("50013") || msg.includes("Missing Permissions") || msg.includes("Missing Access")) {
                friendlyError = lang === 'en'
                    ? "Missing permissions: Bot cannot send messages/embeds in this channel (Check Discord bot permissions: View Channel, Send Messages, Embed Links)."
                    : "İzin yetersiz: Botun bu kanalda mesaj veya embed gönderme yetkisi yok (403 Missing Permissions). Lütfen Discord'da botun kanal izinlerini (Kanalı Görüntüle, Mesaj Gönder, Bağlantı Yerleştir) açın.";
            } else if (msg.includes("404") || msg.includes("10003") || msg.includes("Unknown Channel")) {
                friendlyError = lang === 'en'
                    ? "Selected channel was not found on Discord (Unknown Channel)."
                    : "Seçilen kanal Discord sunucusunda bulunamadı (404 Bilinmeyen Kanal). Lütfen kanalı tekrar seçin.";
            } else if (msg.includes("401") || msg.includes("Unauthorized")) {
                friendlyError = "Bot token yetkisiz (401 Unauthorized). Lütfen DISCORD_BOT_TOKEN ayarını kontrol edin.";
            }

            return NextResponse.json({ error: friendlyError, details: msg }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Ticket Deploy Error:", err);
        return NextResponse.json({ error: err.message || "Beklenmeyen bir hata oluştu." }, { status: 400 });
    }
}
