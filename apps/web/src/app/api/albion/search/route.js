import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const url = `https://gameinfo-ams.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Albion API error: ${response.status}`);
    }

    const data = await response.json();
    const guilds = (data.guilds || []).map(g => ({
      Id: g.Id || g.id,
      Name: g.Name || g.name,
      AllianceId: g.AllianceId || g.allianceId,
      AllianceName: g.AllianceName || g.allianceName,
      AllianceTag: g.AllianceTag || g.allianceTag,
      KillFame: g.KillFame || g.killFame || 0,
      MemberCount: g.MemberCount || g.memberCount || 0
    }));

    return NextResponse.json(guilds);
  } catch (error) {
    console.error('[Albion Search API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
