import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { guildId } = await params;
    const { searchParams } = new URL(req.url);
    const server = searchParams.get('server') || 'Europe';

    const REGIONS = {
      'Europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo',
      'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
      'Asia': 'https://gameinfo-sgp.albiononline.com/api/gameinfo'
    };

    const baseUrl = REGIONS[server] || REGIONS.Europe;

    const res = await fetch(
      `${baseUrl}/guilds/${guildId}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 }
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Albion API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      Id: data.Id,
      Name: data.Name,
      AllianceName: data.Alliance?.AllianceName || null,
      AllianceTag: data.Alliance?.AllianceTag || null,
      FounderName: data.FounderName || null,
      Founded: data.Founded || null,
      MemberCount: data.MemberCount || 0,
      KillFame: data.killFame || data.KillFame || 0,
      DeathFame: data.deathFame || data.DeathFame || 0,
    });
  } catch (err) {
    console.error('[Albion Guild Detail API]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
