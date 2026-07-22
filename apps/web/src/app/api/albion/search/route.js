import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URLS = {
  'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
  'Europe':   'https://gameinfo-ams.albiononline.com/api/gameinfo',
  'Asia':     'https://gameinfo-sgp.albiononline.com/api/gameinfo',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const serverParam = searchParams.get('server'); // 'Europe', 'Americas', 'Asia', or 'europe', 'americas', 'asia'

  if (!query || query.length < 2) {
    return NextResponse.json({ players: [], guilds: [] });
  }

  try {
    const serverKey = serverParam ? serverParam.charAt(0).toUpperCase() + serverParam.slice(1).toLowerCase() : 'Europe';
    const baseUrl = BASE_URLS[serverKey] || BASE_URLS['Europe'];

    const res = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return NextResponse.json({ players: [], guilds: [] });
    }

    const data = await res.json().catch(() => ({ players: [], guilds: [] }));

    const players = Array.isArray(data.players) ? data.players.map(p => ({
      Id: p.Id || p.id,
      Name: p.Name || p.name,
      GuildId: p.GuildId || p.guildId || '',
      GuildName: p.GuildName || p.guildName || '',
      AllianceName: p.AllianceName || p.allianceName || '',
      Fame: p.KillFame || p.Fame || 0,
      Server: serverKey,
    })) : [];

    const guilds = Array.isArray(data.guilds) ? data.guilds.map(g => ({
      Id: g.Id || g.id,
      Name: g.Name || g.name,
      AllianceId: g.AllianceId || g.allianceId || '',
      AllianceName: g.AllianceName || g.allianceName || '',
      AllianceTag: g.AllianceTag || g.allianceTag || '',
      KillFame: g.KillFame || 0,
      DeathFame: g.DeathFame || 0,
      Server: serverKey,
    })) : [];

    return NextResponse.json({ players, guilds });
  } catch (error) {
    console.error('[Albion Search API] Error:', error);
    return NextResponse.json({ players: [], guilds: [], error: error.message }, { status: 500 });
  }
}
