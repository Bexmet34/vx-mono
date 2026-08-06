import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "@/components/KillMatch.module.css";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";
import { 
  Shield, Swords, Package, Users, MapPin, ArrowLeft, Trophy, 
  HeartPulse, Zap, Flame, ExternalLink, Download, Share2, AlertTriangle, CheckCircle2
} from "lucide-react";

import { fetchAlbion } from "@/utils/albion";

// Fetch Event from Albion API
async function getKillEvent(server, eventId) {
  const REGIONS = {
    europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
    americas: "https://gameinfo.albiononline.com/api/gameinfo",
    asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
  };

  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    return await fetchAlbion(`${baseUrl}/events/${eventId}`);
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

function getZoneName(killArea) {
  if (!killArea) return '🌍 Açık Dünya (Open World)';
  const area = killArea.toUpperCase();
  if (area.includes('MIST')) return '🌫️ Sisler (The Mists)';
  if (area.includes('AVALON') || area.includes('ROAD')) return '🌀 Avalon Yolları (Roads of Avalon)';
  if (area.includes('CORRUPT')) return '💀 Bozulmuş Zindan (Corrupted)';
  if (area.includes('HELLGATE')) return '🔥 Cehennem Kapısı (Hellgate)';
  if (area.includes('DUNGEON')) return '🏰 Zindan (Dungeon)';
  if (area.includes('ARENA')) return '⚔️ Arena / Crystal';
  return '🌍 Açık Dünya (Open World)';
}

export default async function KillboardEventPage({ params }) {
  const { server, eventId } = await params;
  
  const event = await getKillEvent(server, eventId);
  
  if (!event) {
    notFound();
  }

  const victim = event.Victim || {};
  const killer = event.Killer || {};
  
  // IP Difference Calculation
  const killerIp = Math.round(killer.AverageItemPower || 0);
  const victimIp = Math.round(victim.AverageItemPower || 0);
  const ipDiff = killerIp - victimIp;

  // Inventory Separation: Dropped Items vs Destroyed (Trash) Items
  const rawInventory = victim.Inventory || [];
  
  // Include destroyed equipment from equipment slots if present
  const equipmentTrash = [];
  if (victim.Equipment) {
    Object.entries(victim.Equipment).forEach(([slot, item]) => {
      if (item && item.Type && item.Type.includes('TRASH')) {
        equipmentTrash.push({ ...item, slotName: slot });
      }
    });
  }

  const allItems = [...rawInventory, ...equipmentTrash].filter(item => item && item.Type);
  
  const droppedItems = allItems.filter(item => !item.Type.includes('TRASH'));
  const destroyedItems = allItems.filter(item => item.Type.includes('TRASH'));

  // Participants & Damage/Healing Breakdown Calculation
  const participants = event.Participants || event.GroupMembers || [];
  const totalDamage = participants.reduce((sum, p) => sum + (p.DamageDone || 0), 0);
  const totalHealing = participants.reduce((sum, p) => sum + (p.SupportHealingDone || p.HealingDone || 0), 0);

  // Group Players by Side (Killer Allies vs Victim Allies)
  const killerTeam = participants.filter(p => !p.GuildName || p.GuildName === killer.GuildName || p.DamageDone > 0);
  const victimTeam = [victim];

  const dateStr = new Date(event.TimeStamp).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const zoneText = getZoneName(event.KillArea);
  const ogImageUrl = `https://veyronix.com.tr/api/og/killboard?server=${server}&eventId=${eventId}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${killer.Name} killed ${victim.Name} for ${event.TotalVictimKillFame} Fame`,
    description: `Albion Online ${server.toUpperCase()} PvP Killboard: ${killer.Name} killed ${victim.Name} for ${event.TotalVictimKillFame} Fame.`,
    image: [ogImageUrl],
    datePublished: new Date(event.TimeStamp).toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'Veyronix',
      url: 'https://veyronix.com.tr',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://veyronix.com.tr/killboard/${server}/${eventId}`,
    },
  };

  return (
    <div className={styles.container} style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Top Navigation & Share Bar */}
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={ogImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.1))',
              border: '1px solid rgba(46, 204, 113, 0.4)',
              color: '#2ecc71',
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            className="hover:brightness-125"
          >
            <Download size={14} /> Savaş Kartını Görsel Olarak İndir / Paylaş
          </a>
          <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#fca311', fontWeight: 'bold' }}>
            {server.toUpperCase()} SUNUCUSU
          </span>
          <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#888' }}>
            Event #{event.EventId}
          </span>
        </div>
      </div>

      {/* Main Tactical Overview Banner */}
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
        {/* Total Fame */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c' }}>
            <Trophy size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Kazanılan Fame</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e74c3c' }}>
              {event.TotalVictimKillFame ? event.TotalVictimKillFame.toLocaleString() : 0}
            </div>
          </div>
        </div>

        {/* IP Difference */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: ipDiff >= 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(155, 89, 182, 0.15)', border: `1px solid ${ipDiff >= 0 ? 'rgba(46, 204, 113, 0.3)' : 'rgba(155, 89, 182, 0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ipDiff >= 0 ? '#2ecc71' : '#9b59b6' }}>
            <Shield size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>IP Farkı (Üstünlük)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: ipDiff >= 0 ? '#2ecc71' : '#9b59b6' }}>
              {ipDiff >= 0 ? `+${ipDiff} IP Üstünlük` : `${ipDiff} IP (Kahramanca)`}
            </div>
          </div>
        </div>

        {/* Zone & Map Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(252, 163, 17, 0.15)', border: '1px solid rgba(252, 163, 17, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca311' }}>
            <MapPin size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Savaş Alanı / Bölge</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fca311' }}>
              {zoneText}
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(52, 152, 219, 0.15)', border: '1px solid rgba(52, 152, 219, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3498db' }}>
            <Users size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Tarih & Katılım</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ddd' }}>
              {dateStr} ({participants.length} Kişi)
            </div>
          </div>
        </div>
      </div>

      {/* Main Match Versus Card */}
      <KillMatch event={event} server={server} />

      {/* Item 1: Dropped vs Destroyed Trash Loot Breakdown */}
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
              Kurbanın Envanteri (Düşen vs. Kırılan Loot Ayrımı)
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ background: 'rgba(46, 204, 113, 0.15)', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', color: '#2ecc71', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> {droppedItems.length} Sağlam Düşen
            </span>
            <span style={{ background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', color: '#e74c3c', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={14} /> {destroyedItems.length} Kırılan (Trash)
            </span>
          </div>
        </div>

        {/* Section 1: Dropped Items (Sağlam Düşen Eşyalar) */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#2ecc71', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🟢 Yere Sağlam Düşen Eşyalar (Dropped Loot) ({droppedItems.length})
          </h4>
          {droppedItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px'
            }}>
              {droppedItems.map((item, idx) => {
                const quality = item.Quality ? `?quality=${item.Quality}` : '';
                const imageUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
                const nameClean = formatItemName(item.Type);

                return (
                  <div key={idx} style={{
                    background: 'rgba(46, 204, 113, 0.04)',
                    border: '1px solid rgba(46, 204, 113, 0.25)',
                    borderRadius: '8px',
                    padding: '0.75rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:border-emerald-500/60 hover:bg-emerald-500/10"
                  >
                    <div style={{ width: '60px', height: '60px', position: 'relative', marginBottom: '0.5rem' }}>
                      <Image src={imageUrl} alt={item.Type} fill unoptimized style={{ objectFit: 'contain' }} />
                      {item.Count > 1 && (
                        <span style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          background: '#2ecc71',
                          color: '#000',
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
                    <span style={{ fontSize: '0.75rem', color: '#e0e0e0', textAlign: 'center', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {nameClean || item.Type}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: 0 }}>Sağlam düşen ek eşya bulunamadı.</p>
          )}
        </div>

        {/* Section 2: Destroyed/Trash Items (Kırılan / Çöp Olmuş Eşyalar) */}
        <div>
          <h4 style={{ color: '#e74c3c', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔴 Ölüm Anında Kırılan / Çöp Olan Eşyalar (Destroyed / Trash) ({destroyedItems.length})
          </h4>
          {destroyedItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px'
            }}>
              {destroyedItems.map((item, idx) => {
                const quality = item.Quality ? `?quality=${item.Quality}` : '';
                const imageUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
                const nameClean = formatItemName(item.Type);

                return (
                  <div key={idx} style={{
                    background: 'rgba(231, 76, 60, 0.04)',
                    border: '1px solid rgba(231, 76, 60, 0.25)',
                    borderRadius: '8px',
                    padding: '0.75rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    opacity: 0.85
                  }}
                  className="hover:opacity-100 hover:border-red-500/60"
                  >
                    <div style={{ width: '60px', height: '60px', position: 'relative', marginBottom: '0.5rem' }}>
                      <Image src={imageUrl} alt={item.Type} fill unoptimized style={{ objectFit: 'contain', filter: 'grayscale(30%)' }} />
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
                          borderRadius: '4px'
                        }}>
                          x{item.Count}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#ff9999', textAlign: 'center', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {nameClean || item.Type}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', margin: 0 }}>Bu savaşta kırılan çöp eşya yok.</p>
          )}
        </div>
      </div>

      {/* Item 2 & 5: Damage & Healing Breakdown & Team Comparison */}
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
            <Swords size={22} style={{ color: '#e74c3c' }} />
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
              Hasar & Destek Grafiği (Damage & Healing Breakdown)
            </h3>
          </div>
          <span style={{ background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', color: '#e74c3c', fontWeight: 'bold' }}>
            Toplam Hasar: {Math.round(totalDamage).toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {participants.map((p, idx) => {
            const isMainKiller = p.Name === killer.Name;
            const dmgDone = p.DamageDone || 0;
            const healDone = p.SupportHealingDone || p.HealingDone || 0;
            const dmgPct = totalDamage > 0 ? Math.min(100, Math.round((dmgDone / totalDamage) * 100)) : 0;
            const healPct = totalHealing > 0 ? Math.min(100, Math.round((healDone / totalHealing) * 100)) : 0;

            return (
              <div key={idx} style={{
                background: isMainKiller ? 'rgba(231, 76, 60, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: isMainKiller ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link 
                    href={`/player/${server}/${p.Id || ''}`}
                    style={{ color: isMainKiller ? '#e74c3c' : '#fff', fontWeight: 'bold', fontSize: '1.05rem', textDecoration: 'none' }}
                    className="hover:underline"
                  >
                    {p.Name} {isMainKiller && '👑 (Katil)'}
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

                {/* Damage Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ff7675', marginBottom: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Zap size={12} /> Hasar Katkısı</span>
                    <span style={{ fontWeight: 'bold' }}>{Math.round(dmgDone).toLocaleString()} (%{dmgPct})</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${dmgPct}%`, height: '100%', background: 'linear-gradient(90deg, #e74c3c, #ff7675)', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Healing Progress Bar if present */}
                {healDone > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#55efc4', marginBottom: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HeartPulse size={12} /> İyileştirme Katkısı</span>
                      <span style={{ fontWeight: 'bold' }}>{Math.round(healDone).toLocaleString()} (%{healPct})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${healPct}%`, height: '100%', background: 'linear-gradient(90deg, #2ecc71, #55efc4)', borderRadius: '4px' }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
