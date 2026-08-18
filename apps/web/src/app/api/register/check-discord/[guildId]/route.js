import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3005/api';

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

    // Call the Bot Internal API to check and sync roles using fetch
    const res = await fetch(`${BOT_API_URL}/guild/check-discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guildId })
    });
    
    const data = await res.json();

    if (res.ok && data?.success) {
      return NextResponse.json({
        success: true,
        checkedCount: data.checkedCount,
        leavers: data.leavers,
        unregistered: data.unregistered
      });
    }

    return NextResponse.json({ error: data?.error || "Failed to sync discord roles" }, { status: res.status !== 200 ? res.status : 500 });

  } catch (error) {
    console.error("Discord Sync API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
