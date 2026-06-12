import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveCampaigns, createCampaign, supabase } from "@veyronix/database";
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
            let query = supabase.from('subscriptions').select('guild_id');
            
            if (campaign.target_type === 'active') {
                query = query.eq('is_active', true).gt('expires_at', new Date().toISOString());
            } else if (campaign.target_type === 'expired') {
                query = query.lt('expires_at', new Date().toISOString());
            }

            const { data: targetServers } = await query;
            
            if (targetServers && targetServers.length > 0) {
                const logs = targetServers.map(s => ({
                    campaign_id: campaign.id,
                    guild_id: s.guild_id,
                    status: 'pending'
                }));
                await supabase.from('campaign_logs').insert(logs);
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
        const { id, ...updates } = await request.json();
        const { data, error } = await supabase
            .from('campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) return NextResponse.json({ message: error.message }, { status: 400 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
    }
}
