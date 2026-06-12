import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redeemCode } from "@veyronix/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { code, guildId } = await request.json();
        const userId = session.user.id;

        // Note: If guildId is not provided in body, we should get it from context or the user should specify it.
        // In the dashboard, we usually have the guildId in the URL, but here we can pass it from the client.
        
        // Let's refine the client call to pass the guildId.
        
        if (!code || !guildId) {
            return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 });
        }

        const result = await redeemCode(code, guildId, userId);

        if (result.success) {
            return NextResponse.json({ message: result.message }, { status: 200 });
        } else {
            return NextResponse.json({ message: result.message }, { status: 400 });
        }
    } catch (error) {
        console.error("[RedeemAPI] Error:", error);
        return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
    }
}
