import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URLS = {
  'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
  'Europe':   'https://gameinfo-ams.albiononline.com/api/gameinfo',
  'Asia':     'https://gameinfo-sgp.albiononline.com/api/gameinfo',
};

async function fetchGuildDetail(baseUrl, guildId) {
  try {
    const [dataRes, membersRes] = await Promise.all([
      fetch(`${baseUrl}/guilds/${guildId}/data`, { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }),
      fetch(`${baseUrl}/guilds/${guildId}/members`, { headers: { 'Accept': 'application/json' }, next: { revalidate: 0 } }),
    ]);

    let killFame = 0;
    let founderName = null;
    let allianceTag = null;
    let allianceName = null;

    if (dataRes.ok) {
      const d = await dataRes.json().catch(() => ({}));
      killFame = d?.guild?.killFame || d?.guild?.KillFame || 0;
      founderName = d?.guild?.FounderName || null;
      allianceTag = d?.guild?.AllianceTag || null;
      allianceName = d?.guild?.AllianceName || null;
    }

    let memberCount = 0;
    if (membersRes.ok) {
      const members = await membersRes.json().catch(() => []);
      memberCount = Array.isArray(members) ? members.length : 0;
    }

    return { killFame, memberCount, founderName, allianceTag, allianceName };
  } catch {
    return { killFame: 0, memberCount: 0, founderName: null, allianceTag: null, allianceName: null };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const serverParam = searchParams.get('server'); // 'Europe', 'Americas', 'Asia', or null

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const serverMapping = {
      'Americas': { name: 'Americas', baseUrl: BASE_URLS['Americas'] },
      'Europe':   { name: 'Europe',   baseUrl: BASE_URLS['Europe']   },
      'Asia':     { name: 'Asia',     baseUrl: BASE_URLS['Asia']     },
    };

    let targets = [];
    if (serverParam && serverMapping[serverParam]) {
      targets.push(serverMapping[serverParam]);
    } else {
      targets = Object.values(serverMapping);
    }

    const responses = await Promise.all(
      targets.map(target =>
        fetch(`${target.baseUrl}/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Accept': 'application/json' },
          next: { revalidate: 0 }
        })
          .then(res => ({ ok: res.ok, server: target.name, baseUrl: target.baseUrl, res }))
          .catch(e => ({ ok: false, server: target.name, baseUrl: target.baseUrl, error: e.message }))
      )
    );

    let allGuilds = [];
    for (const response of responses) {
      if (response && response.ok) {
        const data = await response.res.json().catch(() => ({}));
        if (data.guilds) {
          const guildsWithServer = data.guilds.map(g => ({
            ...g,
            _server: response.server,
            _baseUrl: response.baseUrl,
          }));
          allGuilds = allGuilds.concat(guildsWithServer);
        }
      }
    }

    // Deduplicate by id + server
    const uniqueMap = new Map();
    allGuilds.forEach(g => {
      const id = g.Id || g.id;
      const server = g._server || 'Europe';
      const key = `${id}:${server}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { ...g, _id: id, _server: server });
      }
    });
    const uniqueGuilds = Array.from(uniqueMap.values());

    // Fetch real details for up to 8 guilds in parallel (avoid hammering Albion API)
    const limited = uniqueGuilds.slice(0, 8);
    const details = await Promise.all(
      limited.map(g => fetchGuildDetail(g._baseUrl, g._id))
    );

    const result = limited.map((g, i) => ({
      Id: g._id,
      Name: g.Name || g.name,
      AllianceId: g.AllianceId || g.allianceId || '',
      AllianceName: details[i].allianceName || g.AllianceName || g.allianceName || '',
      AllianceTag: details[i].allianceTag || g.AllianceTag || g.allianceTag || '',
      KillFame: details[i].killFame,
      DeathFame: g.DeathFame || g.deathFame || 0,
      MemberCount: details[i].memberCount,
      FounderName: details[i].founderName || '',
      Server: g._server,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Albion Search API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
