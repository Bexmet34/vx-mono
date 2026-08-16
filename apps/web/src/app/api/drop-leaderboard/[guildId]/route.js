import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { getDropLeaderboardPaginated } from '@veyronix/database';
import { getGuildMember, getDiscordUser } from '@/lib/discordApi';

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

    // Enrich data with discord user info
    const enrichedData = await Promise.all(data.map(async (row) => {
      let discordUser = null;
      try {
        try {
          const member = await getGuildMember(guildId, row.user_id);
          discordUser = {
            name: member.nick || member.user.global_name || member.user.username,
            avatarUrl: member.avatar
              ? `https://cdn.discordapp.com/guilds/${guildId}/users/${row.user_id}/avatars/${member.avatar}.png`
              : member.user.avatar
                ? `https://cdn.discordapp.com/avatars/${row.user_id}/${member.user.avatar}.png`
                : null,
          };
        } catch (memErr) {
          const user = await getDiscordUser(row.user_id);
          discordUser = {
              name: user.global_name || user.username,
              avatarUrl: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null
          };
        }
      } catch (e) {
        console.error(`Error fetching discord user ${row.user_id}:`, e.message);
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
