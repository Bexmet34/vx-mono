import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const server = searchParams.get('server') || 'europe';
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return new Response('Missing eventId parameter', { status: 400 });
    }

    const REGIONS = {
      europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
      americas: "https://gameinfo.albiononline.com/api/gameinfo",
      asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
    };
    const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
    
    // Fetch event data safely
    const res = await fetch(`${baseUrl}/events/${eventId}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return new Response('Event not found from Albion API', { status: 404 });
    }
    
    const event = await res.json();
    const killer = event.Killer || {};
    const victim = event.Victim || {};

    const fameFormatted = (event.TotalVictimKillFame || 0).toLocaleString();
    const dateFormatted = event.TimeStamp ? new Date(event.TimeStamp).toLocaleDateString('tr-TR') : '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f1117',
            color: '#ffffff',
            fontFamily: 'sans-serif',
            padding: '40px 60px',
          }}
        >
          {/* Top Brand Header */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid rgba(255, 215, 0, 0.2)',
              paddingBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: 'bold',
                  color: '#fca311',
                  letterSpacing: '1px',
                  marginRight: '15px',
                }}
              >
                VEYRONIX KILLBOARD
              </div>
              <div
                style={{
                  background: 'rgba(252, 163, 17, 0.2)',
                  color: '#fca311',
                  padding: '4px 14px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                {server.toUpperCase()}
              </div>
            </div>

            <div style={{ fontSize: '22px', color: '#888888', fontWeight: '600' }}>
              {dateFormatted}
            </div>
          </div>

          {/* Center Battle Fame Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: '10px 0',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: '#aaaaaa',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              TOPLAM ÖLDÜRME FAME
            </div>
            <div
              style={{
                fontSize: '46px',
                fontWeight: '900',
                color: '#fca311',
                marginTop: '5px',
              }}
            >
              ⚡ {fameFormatted} FAME
            </div>
          </div>

          {/* Versus Player Breakdown Cards */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Killer Side (Green) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '450px',
                background: 'rgba(46, 204, 113, 0.12)',
                border: '2px solid rgba(46, 204, 113, 0.5)',
                borderRadius: '20px',
                padding: '25px',
              }}
            >
              <div style={{ fontSize: '18px', color: '#2ecc71', fontWeight: 'bold', letterSpacing: '1px' }}>
                ⚔️ KATİL (KILLER)
              </div>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: '900',
                  color: '#ffffff',
                  margin: '10px 0 5px 0',
                }}
              >
                {killer.Name || 'Bilinmeyen'}
              </div>
              <div style={{ fontSize: '18px', color: '#2ecc71', fontWeight: '600', margin: '0 0 15px 0' }}>
                {killer.GuildName ? `[${killer.AllianceName || ''}] ${killer.GuildName}` : 'Loncasız'}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px 20px',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>
                  IP: {Math.round(killer.AverageItemPower || 0)}
                </span>
              </div>
            </div>

            {/* VS Badge */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#ffffff',
                fontStyle: 'italic',
                opacity: 0.6,
              }}
            >
              VS
            </div>

            {/* Victim Side (Red) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '450px',
                background: 'rgba(231, 76, 60, 0.12)',
                border: '2px solid rgba(231, 76, 60, 0.5)',
                borderRadius: '20px',
                padding: '25px',
              }}
            >
              <div style={{ fontSize: '18px', color: '#e74c3c', fontWeight: 'bold', letterSpacing: '1px' }}>
                💀 KURBAN (VICTIM)
              </div>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: '900',
                  color: '#ffffff',
                  margin: '10px 0 5px 0',
                }}
              >
                {victim.Name || 'Bilinmeyen'}
              </div>
              <div style={{ fontSize: '18px', color: '#e74c3c', fontWeight: '600', margin: '0 0 15px 0' }}>
                {victim.GuildName ? `[${victim.AllianceName || ''}] ${victim.GuildName}` : 'Loncasız'}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px 20px',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>
                  IP: {Math.round(victim.AverageItemPower || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div style={{ fontSize: '16px', color: '#666666', fontWeight: '500' }}>
            veyronix.com.tr • Albion Online Tactical Command
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('[OG Killboard Error]:', e);
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
