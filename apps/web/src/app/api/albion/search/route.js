import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const serverParam = searchParams.get('server'); // 'Europe', 'Americas', 'Asia', or null

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const serverMapping = {
      'Americas': {
        name: 'Americas',
        url: `https://gameinfo.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`
      },
      'Europe': {
        name: 'Europe',
        url: `https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`
      },
      'Asia': {
        name: 'Asia',
        url: `https://gameinfo-sgp.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`
      }
    };

    let targets = [];
    if (serverParam && serverMapping[serverParam]) {
      targets.push(serverMapping[serverParam]);
    } else {
      // Fallback: Query all if no specific server is requested
      targets = Object.values(serverMapping);
    }

    const responses = await Promise.all(
      targets.map(target => 
        fetch(target.url, { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } })
          .then(res => ({ ok: res.ok, status: res.status, server: target.name, res }))
          .catch(e => ({ ok: false, server: target.name, error: e.message }))
      )
    );

    let allGuilds = [];
    for (const response of responses) {
      if (response && response.ok) {
        const data = await response.res.json().catch(() => ({}));
        if (data.guilds) {
          // Tag each guild with its server
          const guildsWithServer = data.guilds.map(g => ({
            ...g,
            server: response.server
          }));
          allGuilds = allGuilds.concat(guildsWithServer);
        }
      }
    }

    const uniqueGuilds = new Map();
    allGuilds.forEach(g => {
      const id = g.Id || g.id;
      const server = g.server || 'Europe';
      // Keyed by id + server to prevent cross-server UUID clashes
      const key = `${id}:${server}`;
      if (!uniqueGuilds.has(key)) {
        uniqueGuilds.set(key, {
          Id: id,
          Name: g.Name || g.name,
          AllianceId: g.AllianceId || g.allianceId,
          AllianceName: g.AllianceName || g.allianceName,
          AllianceTag: g.AllianceTag || g.allianceTag,
          KillFame: g.KillFame || g.killFame || 0,
          DeathFame: g.DeathFame || g.deathFame || 0,
          MemberCount: g.MemberCount || g.memberCount || 0,
          Server: server
        });
      }
    });

    return NextResponse.json(Array.from(uniqueGuilds.values()));
  } catch (error) {
    console.error('[Albion Search API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
