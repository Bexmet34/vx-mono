import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { guildId } = await params;
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: "DISCORD_BOT_TOKEN is missing in .env.local" }, { status: 500 });
    }

    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      let message = "Failed to fetch roles";
      try {
        const errData = await res.json();
        message = errData.message || message;
      } catch (e) {}
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const roles = await res.json();
    
    // Format roles
    const formattedRoles = roles
      .filter(r => r.name !== '@everyone') 
      .sort((a, b) => b.position - a.position);

    // Fetch members gracefully (try-catch block)
    let formattedMembers = [];
    try {
      const memRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
        headers: { Authorization: `Bot ${token}` },
        cache: 'no-store'
      });
      if (memRes.ok) {
        const membersData = await memRes.json();
        formattedMembers = membersData.map(m => ({
          id: m.user.id,
          username: m.user.username,
          global_name: m.user.global_name,
          avatar: m.user.avatar
        }));
      }
    } catch (e) {
      console.warn("Could not fetch members:", e);
    }

    return NextResponse.json({ roles: formattedRoles, members: formattedMembers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
