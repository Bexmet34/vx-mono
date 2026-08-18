import { NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/auth";
import axios from 'axios';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3005/api';

export async function POST(req, { params }) {
  try {
    const { guildId } = params;
    const subscription = await getUserSubscription(req);

    if (!subscription || subscription.error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call the Bot Internal API to check and sync roles
    const response = await axios.post(`${BOT_API_URL}/guild/check-discord`, { guildId });
    
    if (response.data?.success) {
      return NextResponse.json({
        success: true,
        checkedCount: response.data.checkedCount,
        removedCount: response.data.removedCount
      });
    }

    return NextResponse.json({ error: response.data?.error || "Failed to sync discord roles" }, { status: 500 });

  } catch (error) {
    console.error("Discord Sync API Error:", error?.response?.data || error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
