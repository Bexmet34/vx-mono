import { getActiveCampaigns } from "@veyronix/database";
import { NextResponse } from "next/server";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
    try {
        const campaigns = await getActiveCampaigns();
        return NextResponse.json(campaigns, {
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
