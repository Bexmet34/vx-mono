import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { guildId } = await params;
    console.log(`[API] Fetching Discord data for Guild: ${guildId}`);

    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      console.error("[API] DISCORD_BOT_TOKEN is missing");
      return NextResponse.json({ error: "DISCORD_BOT_TOKEN is missing" }, { status: 500 });
    }

    // 1. Fetch Roles
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${token}` },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[API] Discord Roles Error: ${res.status} - ${errText}`);
      return NextResponse.json({ error: "Failed to fetch roles from Discord" }, { status: res.status });
    }

    const roles = await res.json();
    const formattedRoles = roles
      .filter(r => r.name !== '@everyone') 
      .sort((a, b) => b.position - a.position);

    // 2. Fetch Members (Guild Specific)
    let formattedMembers = [];
    try {
      const memRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
        headers: { Authorization: `Bot ${token}` },
        cache: 'no-store'
      });
      
      if (memRes.ok) {
        const membersData = await memRes.json();
        console.log(`[API] Fetched ${membersData.length} members for Guild: ${guildId}`);
        formattedMembers = membersData.map(m => ({
          id: m.user.id,
          username: m.user.username,
          global_name: m.user.global_name,
          avatar: m.user.avatar
        }));
      } else {
        console.warn(`[API] Could not fetch members for ${guildId}: ${memRes.status}`);
      }
    } catch (e) {
      console.error("[API] Member Fetch Exception:", e);
    }

    return NextResponse.json({ 
      guildId, // Returning guildId for verification
      roles: formattedRoles, 
      members: formattedMembers 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
