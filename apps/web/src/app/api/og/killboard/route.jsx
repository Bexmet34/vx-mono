import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const server = searchParams.get('server');
    const eventId = searchParams.get('eventId');

    if (!server || !eventId) {
      return new Response('Missing server or eventId', { status: 400 });
    }

    const REGIONS = {
      europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
      americas: "https://gameinfo.albiononline.com/api/gameinfo",
      asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
    };
    const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
    
    // Fetch event data
    const res = await fetch(`${baseUrl}/events/${eventId}`);
    if (!res.ok) {
      return new Response('Event not found', { status: 404 });
    }
    
    const event = await res.json();
    const killer = event.Killer;
    const victim = event.Victim;

    const killerImage = killer.Equipment?.MainHand?.Type 
      ? `https://render.albiononline.com/v1/item/${killer.Equipment.MainHand.Type}.png` 
      : 'https://render.albiononline.com/v1/item/T4_MAIN_SWORD.png'; 
      
    const victimImage = victim.Equipment?.MainHand?.Type 
      ? `https://render.albiononline.com/v1/item/${victim.Equipment.MainHand.Type}.png` 
      : 'https://render.albiononline.com/v1/item/T4_MAIN_SWORD.png';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f1117',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', fontSize: 32, color: '#fca311', marginBottom: 10, fontWeight: 'bold' }}>
            Veyronix Killboard
          </div>
          
          <div style={{ display: 'flex', fontSize: 24, color: '#aaa', marginBottom: 40 }}>
            {event.TotalVictimKillFame?.toLocaleString()} Fame
          </div>

          {/* Versus Container */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '900px' }}>
            
            {/* Killer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px', background: 'rgba(46, 204, 113, 0.1)', border: '2px solid rgba(46, 204, 113, 0.3)', borderRadius: '16px', padding: '30px' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold', color: '#2ecc71', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {killer.Name}
              </div>
              <div style={{ fontSize: 20, color: '#aaa', marginBottom: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {killer.GuildName ? `[${killer.AllianceName || ''}] ${killer.GuildName}` : 'No Guild'}
              </div>
              <img src={killerImage} alt="Killer Weapon" width={120} height={120} style={{ objectFit: 'contain' }} />
              <div style={{ marginTop: 20, fontSize: 24, color: '#2ecc71' }}>IP: {Math.round(killer.AverageItemPower || 0)}</div>
            </div>

            {/* VS */}
            <div style={{ fontSize: 60, fontWeight: 'bold', color: '#fff', fontStyle: 'italic', opacity: 0.5 }}>
              VS
            </div>

            {/* Victim */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px', background: 'rgba(231, 76, 60, 0.1)', border: '2px solid rgba(231, 76, 60, 0.3)', borderRadius: '16px', padding: '30px' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold', color: '#e74c3c', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {victim.Name}
              </div>
              <div style={{ fontSize: 20, color: '#aaa', marginBottom: 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                {victim.GuildName ? `[${victim.AllianceName || ''}] ${victim.GuildName}` : 'No Guild'}
              </div>
              <img src={victimImage} alt="Victim Weapon" width={120} height={120} style={{ objectFit: 'contain' }} />
              <div style={{ marginTop: 20, fontSize: 24, color: '#e74c3c' }}>IP: {Math.round(victim.AverageItemPower || 0)}</div>
            </div>

          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
