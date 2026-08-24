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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-32 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Top Navigation & Share Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <Link 
          href={`/player/${server}/${killer.Id || victim.Id || ''}`}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> 
          <span>Oyuncu Profiline Dön</span>
        </Link>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <a
            href={ogImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation"
          >
            <Download size={13} /> 
            <span>Savaş Kartını İndir</span>
          </a>
          <span className="bg-surface-container-high border border-outline-variant/30 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs text-primary-container font-bold uppercase tracking-wider">
            {server.toUpperCase()} SUNUCUSU
          </span>
          <span className="bg-surface-container-high border border-outline-variant/30 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs text-on-surface-variant font-mono">
            #{event.EventId}
          </span>
        </div>
      </div>

      {/* Main Tactical Overview Banner */}
      <div className="bg-gradient-to-r from-[#14141c] to-[#0c0c12] border border-outline-variant/30 rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fame */}
        <div className="flex items-center gap-3.5 bg-black/30 p-3.5 rounded-xl border border-outline-variant/20">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Trophy size={18} />
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Kazanılan Fame</div>
            <div className="text-lg sm:text-xl font-bold text-red-400">
              {event.TotalVictimKillFame ? event.TotalVictimKillFame.toLocaleString() : 0}
            </div>
          </div>
        </div>

        {/* IP Difference */}
        <div className="flex items-center gap-3.5 bg-black/30 p-3.5 rounded-xl border border-outline-variant/20">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ipDiff >= 0 ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-purple-500/15 border border-purple-500/30 text-purple-400'}`}>
            <Shield size={18} />
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">IP Farkı</div>
            <div className={`text-base sm:text-lg font-bold ${ipDiff >= 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
              {ipDiff >= 0 ? `+${ipDiff} IP Üstünlük` : `${ipDiff} IP`}
            </div>
          </div>
        </div>

        {/* Zone & Map Location */}
        <div className="flex items-center gap-3.5 bg-black/30 p-3.5 rounded-xl border border-outline-variant/20">
          <div className="w-11 h-11 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container shrink-0">
            <MapPin size={18} />
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Savaş Alanı</div>
            <div className="text-xs sm:text-sm font-bold text-primary-container truncate max-w-[160px]">
              {zoneText}
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-3.5 bg-black/30 p-3.5 rounded-xl border border-outline-variant/20">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Tarih & Katılım</div>
            <div className="text-xs sm:text-sm font-bold text-on-surface">
              {dateStr} <span className="text-on-surface-variant">({participants.length} Kişi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Match Versus Card */}
      <KillMatch event={event} server={server} />

      {/* Item 1: Dropped vs Destroyed Trash Loot Breakdown */}
      <div className="bg-[#0f0f16]/90 border border-outline-variant/30 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <Package size={22} className="text-primary-container" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Kurbanın Envanteri (Düşen vs. Kırılan Loot)
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-400 font-bold inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} /> {droppedItems.length} Sağlam Düşen
            </span>
            <span className="bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full text-xs text-red-400 font-bold inline-flex items-center gap-1.5">
              <AlertTriangle size={13} /> {destroyedItems.length} Kırılan (Trash)
            </span>
          </div>
        </div>

        {/* Section 1: Dropped Items */}
        <div className="mb-6">
          <h4 className="text-emerald-400 text-xs sm:text-sm font-bold mb-3 flex items-center gap-1.5">
            🟢 Yere Sağlam Düşen Eşyalar ({droppedItems.length})
          </h4>
          {droppedItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {droppedItems.map((item, idx) => {
                const quality = item.Quality ? `?quality=${item.Quality}` : '';
                const imageUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
                const nameClean = formatItemName(item.Type);

                return (
                  <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all">
                    <div className="w-12 h-12 relative mb-2">
                      <Image src={imageUrl} alt={item.Type} fill unoptimized className="object-contain" />
                      {item.Count > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded shadow">
                          x{item.Count}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-on-surface line-clamp-2 leading-tight">
                      {nameClean || item.Type}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant/60 italic">Sağlam düşen ek eşya bulunamadı.</p>
          )}
        </div>

        {/* Section 2: Destroyed/Trash Items */}
        <div>
          <h4 className="text-red-400 text-xs sm:text-sm font-bold mb-3 flex items-center gap-1.5">
            🔴 Ölüm Anında Kırılan / Çöp Olan Eşyalar ({destroyedItems.length})
          </h4>
          {destroyedItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {destroyedItems.map((item, idx) => {
                const quality = item.Quality ? `?quality=${item.Quality}` : '';
                const imageUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
                const nameClean = formatItemName(item.Type);

                return (
                  <div key={idx} className="bg-red-500/5 border border-red-500/20 hover:border-red-500/50 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all opacity-80 hover:opacity-100">
                    <div className="w-12 h-12 relative mb-2">
                      <Image src={imageUrl} alt={item.Type} fill unoptimized className="object-contain grayscale-[30%]" />
                      {item.Count > 1 && (
                        <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded shadow">
                          x{item.Count}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-red-300 line-clamp-2 leading-tight">
                      {nameClean || item.Type}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant/60 italic">Bu savaşta kırılan çöp eşya yok.</p>
          )}
        </div>
      </div>

      {/* Item 2 & 5: Damage & Healing Breakdown */}
      <div className="bg-[#0f0f16]/90 border border-outline-variant/30 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <Swords size={22} className="text-red-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Hasar & Destek Katkısı (Damage Breakdown)
            </h3>
          </div>
          <span className="bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full text-xs text-red-400 font-bold">
            Toplam Hasar: {Math.round(totalDamage).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {participants.map((p, idx) => {
            const isMainKiller = p.Name === killer.Name;
            const dmgDone = p.DamageDone || 0;
            const healDone = p.SupportHealingDone || p.HealingDone || 0;
            const dmgPct = totalDamage > 0 ? Math.min(100, Math.round((dmgDone / totalDamage) * 100)) : 0;
            const healPct = totalHealing > 0 ? Math.min(100, Math.round((healDone / totalHealing) * 100)) : 0;

            return (
              <div 
                key={idx} 
                className={`rounded-xl p-4 flex flex-col gap-2.5 ${isMainKiller ? 'bg-red-500/10 border border-red-500/30' : 'bg-surface-container-high/40 border border-outline-variant/20'}`}
              >
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/player/${server}/${p.Id || ''}`}
                    className={`font-bold text-xs sm:text-sm hover:underline truncate mr-2 ${isMainKiller ? 'text-red-400' : 'text-white'}`}
                  >
                    {p.Name} {isMainKiller && '👑'}
                  </Link>
                  <span className="bg-black/40 px-2 py-0.5 rounded-lg text-[10px] text-on-surface-variant border border-outline-variant/20 shrink-0 font-mono">
                    IP: {Math.round(p.AverageItemPower || 0)}
                  </span>
                </div>

                {p.GuildName && (
                  <div className="text-[11px] text-on-surface-variant truncate">
                    [{p.AllianceName || ''}] {p.GuildName}
                  </div>
                )}

                {/* Damage Progress Bar */}
                <div className="mt-1">
                  <div className="flex justify-between text-[10px] text-red-400 mb-1">
                    <span className="flex items-center gap-1"><Zap size={11} /> Hasar</span>
                    <span className="font-bold">{Math.round(dmgDone).toLocaleString()} (%{dmgPct})</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: `${dmgPct}%` }} />
                  </div>
                </div>

                {/* Healing Progress Bar if present */}
                {healDone > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-emerald-400 mb-1">
                      <span className="flex items-center gap-1"><HeartPulse size={11} /> Şifa</span>
                      <span className="font-bold">{Math.round(healDone).toLocaleString()} (%{healPct})</span>
                    </div>
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${healPct}%` }} />
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
