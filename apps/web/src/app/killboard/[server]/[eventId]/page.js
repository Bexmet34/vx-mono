import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "@/components/KillMatch.module.css";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";
import { Shield, Swords, Package, Users, MapPin, ArrowLeft, Trophy, HeartPulse, Zap } from "lucide-react";

// Fetch Event from Albion API
async function getKillEvent(server, eventId) {
  const REGIONS = {
    europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
    americas: "https://gameinfo.albiononline.com/api/gameinfo",
    asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
  };

  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const res = await fetch(`${baseUrl}/events/${eventId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (err) {
    console.error(`[KillboardEventPage] Error fetching event ${eventId}:`, err);
    return null;
  }
}

function formatItemName(type) {
  if (!type) return '';
  return type
    .replace(/^T\d+_/, '')
    .replace(/_NONTRADABLE/g, '')
    .replace(/@\d+$/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

export default async function KillboardEventPage({ params }) {
  const { server, eventId } = await params;
  
  const event = await getKillEvent(server, eventId);
  
  if (!event) {
    notFound();
  }

  const victim = event.Victim || {};
  const killer = event.Killer || {};
  const inventory = (victim.Inventory || []).filter(item => item && item.Type);
  const participants = event.Participants || event.GroupMembers || [];
  const dateStr = new Date(event.TimeStamp).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={styles.container} style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* Back Link & Navigation */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Link 
          href={`/player/${server}/${killer.Id || victim.Id || ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#aaa',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}
          className="hover:text-white"
        >
          <ArrowLeft size={16} /> Oyuncu Profiline Dön
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#fca311', fontWeight: 'bold' }}>
            {server.toUpperCase()} SUNUCUSU
          </span>
          <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#888' }}>
            Event #{event.EventId}
          </span>
        </div>
      </div>

      {/* Main Stats Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.95), rgba(12, 12, 18, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1.5rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Kazanılan Fame</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e74c3c' }}>
              {event.TotalVictimKillFame ? event.TotalVictimKillFame.toLocaleString() : 0}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(252, 163, 17, 0.15)', border: '1px solid rgba(252, 163, 17, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca311' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Grup / Katılımcı</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
              {event.groupMemberCount || participants.length || 1} Oyuncu
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(46, 204, 113, 0.15)', border: '1px solid rgba(46, 204, 113, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ecc71' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Envanter Lootu</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2ecc71' }}>
              {inventory.length} Eşya
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(155, 89, 182, 0.15)', border: '1px solid rgba(155, 89, 182, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b59b6' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Tarih & Saat</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ddd' }}>
              {dateStr}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Match Card */}
      <KillMatch event={event} server={server} />

      {/* Inventory & Loot Section */}
      <div style={{
        background: 'rgba(15, 15, 22, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '3rem',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={22} style={{ color: '#fca311' }} />
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
              Kurbanın Envanteri & Loot Detayları
            </h3>
          </div>
          <span style={{ background: 'rgba(252, 163, 17, 0.15)', border: '1px solid rgba(252, 163, 17, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', color: '#fca311', fontWeight: 'bold' }}>
            Toplam {inventory.length} Parça Eşya
          </span>
        </div>

        {inventory.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            {inventory.map((item, idx) => {
              const quality = item.Quality ? `?quality=${item.Quality}` : '';
              const imageUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
              const nameClean = formatItemName(item.Type);

              return (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '0.75rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
                className="hover:border-primary-container/40 hover:bg-white/5"
                >
                  <div style={{ width: '64px', height: '64px', position: 'relative', marginBottom: '0.5rem' }}>
                    <Image src={imageUrl} alt={item.Type} fill unoptimized style={{ objectFit: 'contain' }} />
                    {item.Count > 1 && (
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#e74c3c',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        x{item.Count}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#ccc', textAlign: 'center', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {nameClean || item.Type}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '2rem', textStyle: 'center', textAlign: 'center', color: '#777', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Package size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Bu savaş esnasında kurbanın envanterinde ekstra eşya taşınmıyordu.</p>
          </div>
        )}
      </div>

      {/* Participants & Group Members Section */}
      {participants.length > 0 && (
        <div style={{
          background: 'rgba(15, 15, 22, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Swords size={22} style={{ color: '#2ecc71' }} />
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
                Katkıda Bulunan Katiller & Grup Oyuncuları
              </h3>
            </div>
            <span style={{ background: 'rgba(46, 204, 113, 0.15)', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', color: '#2ecc71', fontWeight: 'bold' }}>
              {participants.length} Oyuncu
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {participants.map((p, idx) => {
              const isMainKiller = p.Name === killer.Name;
              return (
                <div key={idx} style={{
                  background: isMainKiller ? 'rgba(46, 204, 113, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: isMainKiller ? '1px solid rgba(46, 204, 113, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link 
                      href={`/player/${server}/${p.Id || ''}`}
                      style={{ color: isMainKiller ? '#2ecc71' : '#fff', fontWeight: 'bold', fontSize: '1.05rem', textDecoration: 'none' }}
                      className="hover:underline"
                    >
                      {p.Name} {isMainKiller && '👑'}
                    </Link>
                    <span style={{ background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', color: '#aaa', border: '1px solid rgba(255,255,255,0.08)' }}>
                      IP: {Math.round(p.AverageItemPower || 0)}
                    </span>
                  </div>

                  {p.GuildName && (
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                      [{p.AllianceName || ''}] {p.GuildName}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: '#bbb' }}>
                    {typeof p.DamageDone !== 'undefined' && p.DamageDone > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#e74c3c' }}>
                        <Zap size={13} /> Hasar: {Math.round(p.DamageDone).toLocaleString()}
                      </span>
                    )}
                    {typeof p.HealingDone !== 'undefined' && p.HealingDone > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2ecc71' }}>
                        <HeartPulse size={13} /> İyileştirme: {Math.round(p.HealingDone).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <CtaBanner />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { server, eventId } = await params;
  const event = await getKillEvent(server, eventId);
  
  if (!event) return { title: "Kill Not Found" };
  
  const ogImageUrl = `https://veyronix.com.tr/api/og/killboard?server=${server}&eventId=${eventId}`;
  
  return {
    title: `${event.Killer?.Name} killed ${event.Victim?.Name} | Veyronix Killboard`,
    description: `Albion Online Killboard: ${event.Killer?.Name} killed ${event.Victim?.Name} for ${event.TotalVictimKillFame} Fame on ${server}.`,
    openGraph: {
      title: `${event.Killer?.Name} ⚔️ ${event.Victim?.Name}`,
      description: `Fame: ${event.TotalVictimKillFame?.toLocaleString()} | Server: ${server.toUpperCase()}\n${event.Killer?.Name} killed ${event.Victim?.Name}.`,
      siteName: 'Veyronix',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${event.Killer?.Name} vs ${event.Victim?.Name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.Killer?.Name} ⚔️ ${event.Victim?.Name}`,
      description: `Albion Online Killboard: ${event.Killer?.Name} killed ${event.Victim?.Name}`,
      images: [ogImageUrl],
    }
  };
}
