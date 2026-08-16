import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { getDropLeaderboardPaginated } from '@veyronix/database';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;

    const { data, total } = await getDropLeaderboardPaginated(guildId, page, limit);

    const token = process.env.DISCORD_BOT_TOKEN;
    
    // Enrich data with discord user info
    const enrichedData = await Promise.all(data.map(async (row) => {
      let discordUser = null;
      if (token) {
        try {
          const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${row.user_id}`, {
            headers: { Authorization: `Bot ${token}` }
          });
          if (res.ok) {
            const member = await res.json();
            discordUser = {
              name: member.nick || member.user.global_name || member.user.username,
              avatarUrl: member.avatar
                ? `https://cdn.discordapp.com/guilds/${guildId}/users/${row.user_id}/avatars/${member.avatar}.png`
                : member.user.avatar
                  ? `https://cdn.discordapp.com/avatars/${row.user_id}/${member.user.avatar}.png`
                  : null,
            };
          } else {
            const ures = await fetch(`https://discord.com/api/v10/users/${row.user_id}`, {
               headers: { Authorization: `Bot ${token}` }
            });
            if (ures.ok) {
               const user = await ures.json();
               discordUser = {
                  name: user.global_name || user.username,
                  avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null
               };
            }
          }
        } catch (e) {
          console.error(`Error fetching discord user ${row.user_id}:`, e.message);
        }
      }
      return { ...row, discordUser };
    }));

    return NextResponse.json({ 
      data: enrichedData, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
