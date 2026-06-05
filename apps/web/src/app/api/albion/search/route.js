import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const urls = [
      `https://gameinfo.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`,
      `https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`,
      `https://gameinfo-sgp.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`
    ];

    const responses = await Promise.all(
      urls.map(url => fetch(url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }).catch(e => null))
    );

    let allGuilds = [];
    for (const response of responses) {
      if (response && response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.guilds) {
          allGuilds = allGuilds.concat(data.guilds);
        }
      }
    }

    const uniqueGuilds = new Map();
    allGuilds.forEach(g => {
      const id = g.Id || g.id;
      if (!uniqueGuilds.has(id)) {
        uniqueGuilds.set(id, {
          Id: id,
          Name: g.Name || g.name,
          AllianceId: g.AllianceId || g.allianceId,
          AllianceName: g.AllianceName || g.allianceName,
          AllianceTag: g.AllianceTag || g.allianceTag,
          KillFame: g.KillFame || g.killFame || 0,
          DeathFame: g.DeathFame || g.deathFame || 0,
          MemberCount: g.MemberCount || g.memberCount || 0
        });
      }
    });

    return NextResponse.json(Array.from(uniqueGuilds.values()));
  } catch (error) {
    console.error('[Albion Search API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
