import { notFound } from "next/navigation";
import styles from "../../../killboard/[server]/[eventId]/killboard.module.css";

// Fetch Player from Albion API
async function getPlayer(server, playerId) {
  const REGIONS = {
    europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
    americas: "https://gameinfo.albiononline.com/api/gameinfo",
    asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
  };

  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  const res = await fetch(`${baseUrl}/players/${playerId}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function PlayerProfilePage({ params }) {
  const { server, playerId } = params;
  
  const player = await getPlayer(server, playerId);
  
  if (!player) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Player Profile</h1>
        <p>Albion Online {server.toUpperCase()}</p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className={`${styles.playerCard} ${styles.killerCard}`} style={{ width: '100%' }}>
          <div className={styles.playerTitle}>{player.Name}</div>
          {player.GuildName && <div className={styles.guildName}>[{player.AllianceName}] {player.GuildName}</div>}
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Kill Fame</div>
              <div className={styles.fame} style={{ color: '#2ecc71', margin: '0.5rem 0' }}>{player.KillFame?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Death Fame</div>
              <div className={styles.fame} style={{ color: '#e74c3c', margin: '0.5rem 0' }}>{player.DeathFame?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: '#aaa', fontSize: '0.9rem' }}>PvE Fame</div>
              <div className={styles.fame} style={{ color: '#fca311', margin: '0.5rem 0' }}>{player.LifetimeStatistics?.PvE?.Total?.toLocaleString() || 0}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Fame Ratio</p>
            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>{player.FameRatio?.toFixed(2) || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { server, playerId } = params;
  const player = await getPlayer(server, playerId);
  
  if (!player) return { title: "Player Not Found" };
  
  return {
    title: `${player.Name} | Veyronix Player Profile`,
    description: `Albion Online Player: ${player.Name}. Kill Fame: ${player.KillFame}, Death Fame: ${player.DeathFame} on ${server}.`
  };
}
