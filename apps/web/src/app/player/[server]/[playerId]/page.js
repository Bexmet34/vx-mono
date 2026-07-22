import { notFound } from "next/navigation";
import styles from "@/components/KillMatch.module.css";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const REGIONS = {
  europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
  americas: "https://gameinfo.albiononline.com/api/gameinfo",
  asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
};

// Fetch Player Info from Albion API
async function getPlayer(server, playerId) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const res = await fetch(`${baseUrl}/players/${playerId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching player:", err);
    return null;
  }
}

// Fetch Player Kills & Deaths from Albion API (Combined for complete recent history)
async function getPlayerMatches(server, playerId) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const [killsRes, deathsRes] = await Promise.all([
      fetch(`${baseUrl}/players/${playerId}/kills`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/players/${playerId}/deaths`, { cache: "no-store" }).catch(() => null),
    ]);

    const kills = killsRes && killsRes.ok ? await killsRes.json().catch(() => []) : [];
    const deaths = deathsRes && deathsRes.ok ? await deathsRes.json().catch(() => []) : [];

    const killsArr = Array.isArray(kills) ? kills : [];
    const deathsArr = Array.isArray(deaths) ? deaths : [];

    // Merge and deduplicate by EventId
    const eventsMap = new Map();
    [...killsArr, ...deathsArr].forEach(event => {
      if (event && event.EventId) {
        eventsMap.set(event.EventId, event);
      }
    });

    const combined = Array.from(eventsMap.values());
    // Sort descending by TimeStamp (newest events first)
    combined.sort((a, b) => new Date(b.TimeStamp).getTime() - new Date(a.TimeStamp).getTime());

    return combined;
  } catch (err) {
    console.error("Error fetching player matches:", err);
    return [];
  }
}

export default async function PlayerProfilePage({ params }) {
  const { server, playerId } = await params;
  
  const [player, matches] = await Promise.all([
    getPlayer(server, playerId),
    getPlayerMatches(server, playerId)
  ]);
  
  if (!player) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{player.Name} Profil & PvP İstatistikleri</h1>
        <p>Albion Online {server.toUpperCase()} Sunucusu</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
        <div className={`${styles.playerCard} ${styles.killerCard}`} style={{ width: '100%', marginBottom: '1.5rem', padding: '2.5rem 1rem' }}>
          <div className={styles.playerTitle} style={{ fontSize: '2.8rem' }}>{player.Name}</div>
          {player.GuildName && (
            <div className={styles.guildName} style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '0.5rem' }}>
              <Link href={`/guild/${server}/${player.GuildId}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">
                [{player.AllianceTag || player.AllianceName || ''}] {player.GuildName}
              </Link>
            </div>
          )}

          {/* Stats Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Kill Fame</div>
              <div style={{ color: '#2ecc71', fontSize: '1.3rem', fontWeight: 'bold' }}>{(player.KillFame || 0).toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Death Fame</div>
              <div style={{ color: '#e74c3c', fontSize: '1.3rem', fontWeight: 'bold' }}>{(player.DeathFame || 0).toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '10px' }}>
              <div style={{ color: '#aaa', fontSize: '0.85rem' }}>Fame Ratio</div>
              <div style={{ color: '#fca311', fontSize: '1.3rem', fontWeight: 'bold' }}>{(player.FameRatio || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(252, 163, 17, 0.05)', borderRadius: '12px', border: '1px solid rgba(252, 163, 17, 0.2)' }}>
          <div>
            <h4 style={{ color: '#fca311', margin: '0 0 0.2rem 0', fontSize: '1rem' }}>Veyronix Discord Bot</h4>
            <p style={{ color: '#aaa', margin: 0, fontSize: '0.85rem' }}>Sunucunuza ücretsiz killboard ve parti sistemi ekleyin.</p>
          </div>
          <Link 
            href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
            target="_blank"
            style={{
              background: '#5865F2',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}
            className="hover:opacity-80 transition-opacity"
          >
            Sunucuya Ekle
          </Link>
        </div>
      </div>

      <div className={styles.header}>
        <h2>Canlı Son Öldürme ve Ölümler (Son Maçlar)</h2>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {matches && matches.length > 0 ? (
          matches.slice(0, 20).map((kill) => (
            <KillMatch key={kill.EventId} event={kill} server={server} />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#aaa' }}>Bu oyuncu için son zamanlara ait canlı maç bulunamadı.</p>
        )}
      </div>
      
      <CtaBanner />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { server, playerId } = await params;
  const player = await getPlayer(server, playerId);
  
  if (!player) return { title: "Oyuncu Bulunamadı" };
  
  return {
    title: `${player.Name} | Albion Online PvP Profil & Killboard | Veyronix`,
    description: `Albion Online ${server.toUpperCase()} Oyuncusu: ${player.Name}. Kill Fame: ${player.KillFame?.toLocaleString()}, Death Fame: ${player.DeathFame?.toLocaleString()}.`,
    openGraph: {
      title: `${player.Name} | Albion Online Oyuncu Profili`,
      description: `Sunucu: ${server.toUpperCase()} | Lonca: ${player.GuildName || 'Yok'}\nKill Fame: ${player.KillFame?.toLocaleString()} | Death Fame: ${player.DeathFame?.toLocaleString()}`,
      siteName: 'Veyronix',
      type: 'website',
    }
  };
}
