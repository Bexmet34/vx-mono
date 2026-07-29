import { notFound } from "next/navigation";
import styles from "@/components/KillMatch.module.css";
import CtaBanner from "@/components/CtaBanner";
import Link from "next/link";
import { Shield, Users, Sword, Skull } from "lucide-react";

export const revalidate = 600; // Cache guild page for 10 minutes (ISR)

const REGIONS = {
  europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
  americas: "https://gameinfo.albiononline.com/api/gameinfo",
  asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
};

// Fetch Guild from Albion API
async function getGuild(server, guildId) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const res = await fetch(`${baseUrl}/guilds/${guildId}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching guild:", err);
    return null;
  }
}

// Fetch Guild Members from Albion API
async function getGuildMembers(server, guildId) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const res = await fetch(`${baseUrl}/guilds/${guildId}/members`, {
      next: { revalidate: 600 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Error fetching guild members:", err);
    return [];
  }
}

export default async function GuildProfilePage({ params }) {
  const { server, guildId } = await params;
  
  const [guild, members] = await Promise.all([
    getGuild(server, guildId),
    getGuildMembers(server, guildId)
  ]);
  
  if (!guild) {
    notFound();
  }

  // Sort members by Kill Fame descending to get "Top Killers"
  const topMembers = members ? members.sort((a, b) => (b.KillFame || 0) - (a.KillFame || 0)).slice(0, 15) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{guild.Name} Lonca Profili</h1>
        <p>Albion Online {server.toUpperCase()} Sunucusu</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '4rem' }}>
        <div className={`${styles.playerCard} ${styles.killerCard}`} style={{ width: '100%', borderColor: '#fca311' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Shield size={40} color="#fca311" />
            <div className={styles.playerTitle} style={{ margin: 0, color: '#fca311', fontSize: '2rem' }}>
              {guild.Name}
            </div>
          </div>
          {guild.AllianceName && <div className={styles.guildName}>[{guild.AllianceTag}] {guild.AllianceName}</div>}
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '12px' }}>
              <div style={{ color: '#aaa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Sword size={16} /> Kill Fame
              </div>
              <div className={styles.fame} style={{ color: '#2ecc71', margin: '0.5rem 0' }}>{guild.killFame?.toLocaleString()}</div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '12px' }}>
              <div style={{ color: '#aaa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Skull size={16} /> Death Fame
              </div>
              <div className={styles.fame} style={{ color: '#e74c3c', margin: '0.5rem 0' }}>{guild.DeathFame?.toLocaleString()}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem 3rem', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={24} color="#aaa" />
            <div>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.2rem', textAlign: 'left' }}>Üye Sayısı</p>
              <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>{guild.MemberCount || members?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.header}>
        <h2>En Çok Kill Alan Üyeler (Top 15 Killers)</h2>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '4rem' }}>
        {topMembers.length > 0 ? (
          <div style={{ background: 'rgba(15,15,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
            {topMembers.map((member, index) => (
              <Link 
                href={`/player/${server}/${member.Id}`} 
                key={member.Id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderBottom: index !== topMembers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s ease'
                }}
                className="hover:bg-white/5"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(252, 163, 17, 0.2)', color: '#fca311', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1.1rem' }}>{member.Name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Fame Oranı: {member.FameRatio?.toFixed(2) || 0}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#2ecc71', fontWeight: 'bold' }}>{member.KillFame?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Kill Fame</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#aaa' }}>Üye verisi bulunamadı.</p>
        )}
      </div>

      <CtaBanner />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { server, guildId } = await params;
  const guild = await getGuild(server, guildId);
  
  if (!guild) return { title: "Guild Not Found" };
  
  return {
    title: `${guild.Name} | Albion Online Lonca Profili | Veyronix`,
    description: `Albion Online Loncası: ${guild.Name}. Kill Fame: ${guild.killFame?.toLocaleString()}, Üye Sayısı: ${guild.MemberCount} on ${server}.`,
    openGraph: {
      title: `${guild.Name} | Guild Profile`,
      description: `Server: ${server.toUpperCase()} | Members: ${guild.MemberCount}\nKill Fame: ${guild.killFame?.toLocaleString()}`,
      siteName: 'Veyronix',
      type: 'website',
    }
  };
}
