import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

        const body = await req.json();
        const { ticket_channel_id, ticket_message_title, ticket_message_desc } = body;

        if (!ticket_channel_id) {
            return NextResponse.json({ error: "Kanal ayarlanmamış." }, { status: 400 });
        }

        const botToken = process.env.DISCORD_BOT_TOKEN;
        
        const payload = {
            embeds: [
                {
                    title: ticket_message_title || "Destek Talebi",
                    description: ticket_message_desc || "Lütfen aşağıdaki butona tıklayarak destek talebinizi oluşturun.",
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
                            label: "Destek Talebi Aç",
                            emoji: { name: "🎫" },
                            custom_id: "ticket_open"
                        }
                    ]
                }
            ]
        };

        const res = await fetch(`https://discord.com/api/v10/channels/${ticket_channel_id}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const data = await res.json();
            console.error("Discord API Error:", data);
            return NextResponse.json({ error: "Discord'a gönderilemedi. Kanal izinlerini veya ID'sini kontrol edin." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Ticket Deploy Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
