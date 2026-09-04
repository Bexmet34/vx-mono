import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";
const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export async function POST(req, props) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = await props.params;
  const { guildId } = params;
  if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });

  try {
    // 1. Fetch channels for this guild
    const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${botToken}` }
    });

    if (!channelsRes.ok) {
      const errorText = await channelsRes.text();
      throw new Error(`Failed to fetch channels: ${channelsRes.status} ${errorText}`);
    }

    const channels = await channelsRes.json();
    
    // Find text channels (type 0)
    const textChannels = channels.filter(c => c.type === 0);
    if (textChannels.length === 0) {
      throw new Error("No text channels found in this guild.");
    }

    // Try to create an invite in the first text channel, if it fails, try the next one
    let inviteData = null;
    let inviteError = null;

    for (const channel of textChannels) {
      const inviteRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_age: 86400, // 24 hours
          max_uses: 1,
          unique: true
        })
      });

      if (inviteRes.ok) {
        inviteData = await inviteRes.json();
        break; // Successfully created an invite
      } else {
        inviteError = await inviteRes.text();
      }
    }

    if (!inviteData) {
      throw new Error(`Failed to create invite in any channel. Last error: ${inviteError}`);
    }

    return NextResponse.json({ 
      success: true, 
      url: `https://discord.gg/${inviteData.code}` 
    });

  } catch (err) {
    console.error("[AdminAPI] Generate Invite Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
