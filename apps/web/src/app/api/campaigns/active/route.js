import { getActiveCampaigns } from "@veyronix/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const campaigns = await getActiveCampaigns();
        return NextResponse.json(campaigns);
    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}
