import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveCampaigns, createCampaign, updateCampaign, createCampaignLog, getAllSubscriptions } from "@veyronix/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export async function GET(request) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
    
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const campaigns = await getActiveCampaigns();
    return NextResponse.json(campaigns);
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
    
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const campaignData = await request.json();
        const campaign = await createCampaign(campaignData);

        if (!campaign) return NextResponse.json({ message: "Kampanya oluşturulamadı." }, { status: 400 });

        // If target_type is not 'manual', queue messages for servers
        if (campaign.target_type !== 'manual') {
            const allSubs = await getAllSubscriptions();
            let targetServers = [];
            
            if (campaign.target_type === 'active') {
                targetServers = allSubs.filter(s => s.is_active && new Date(s.expires_at) > new Date());
            } else if (campaign.target_type === 'expired') {
                targetServers = allSubs.filter(s => new Date(s.expires_at) < new Date());
            }

            if (targetServers && targetServers.length > 0) {
                const logs = targetServers.map(s => ({
                    campaign_id: campaign.id,
                    guild_id: s.guild_id,
                    status: 'pending'
                }));
                await createCampaignLog(logs);
            }
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("[AdminCampaignAPI] Error:", error);
        return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
    
    if (!isAdmin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        let data;
        try {
            data = await updateCampaign(id, updates);
        } catch (error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
    }
}
