import { notFound } from "next/navigation";
import CtaBanner from "@/components/CtaBanner";
import PlayerAnalyticsClient from "./PlayerAnalyticsClient";

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

// Fetch Player Kills, Deaths & Guild/Server Assists from Albion API
async function getPlayerMatches(server, playerId, guildId, playerName) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const promises = [
      fetch(`${baseUrl}/players/${playerId}/kills`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/players/${playerId}/deaths`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/events?offset=0&limit=51`, { cache: "no-store" }).catch(() => null),
    ];

    if (guildId) {
      promises.push(
        fetch(`${baseUrl}/events?offset=0&limit=51&guildId=${guildId}`, { cache: "no-store" }).catch(() => null),
        fetch(`${baseUrl}/events?offset=51&limit=51&guildId=${guildId}`, { cache: "no-store" }).catch(() => null)
      );
    }

    const responses = await Promise.all(promises);

    const kills = responses[0] && responses[0].ok ? await responses[0].json().catch(() => []) : [];
    const deaths = responses[1] && responses[1].ok ? await responses[1].json().catch(() => []) : [];
    const globalEvents = responses[2] && responses[2].ok ? await responses[2].json().catch(() => []) : [];
    const guildEvents1 = responses[3] && responses[3].ok ? await responses[3].json().catch(() => []) : [];
    const guildEvents2 = responses[4] && responses[4].ok ? await responses[4].json().catch(() => []) : [];

    const killsArr = Array.isArray(kills) ? kills : [];
    const deathsArr = Array.isArray(deaths) ? deaths : [];
    const globalArr = Array.isArray(globalEvents) ? globalEvents : [];
    const guildArr1 = Array.isArray(guildEvents1) ? guildEvents1 : [];
    const guildArr2 = Array.isArray(guildEvents2) ? guildEvents2 : [];

    const eventsMap = new Map();

    // 1. Kills
    killsArr.forEach(e => { if (e && e.EventId) eventsMap.set(e.EventId, e); });
    
    // 2. Deaths
    deathsArr.forEach(e => { if (e && e.EventId) eventsMap.set(e.EventId, e); });

    // 3. Guild & Global Assists / Participations
    const targetName = (playerName || "").toLowerCase();
    [...guildArr1, ...guildArr2, ...globalArr].forEach(e => {
      if (!e || !e.EventId) return;
      const isKiller = e.Killer?.Id === playerId || (e.Killer?.Name && e.Killer.Name.toLowerCase() === targetName);
      const isVictim = e.Victim?.Id === playerId || (e.Victim?.Name && e.Victim.Name.toLowerCase() === targetName);
      const isParticipant = e.Participants?.some(p => p.Id === playerId || (p.Name && p.Name.toLowerCase() === targetName));
      const isGroupMember = e.GroupMembers?.some(p => p.Id === playerId || (p.Name && p.Name.toLowerCase() === targetName));

      if (isKiller || isVictim || isParticipant || isGroupMember) {
        eventsMap.set(e.EventId, e);
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
  
  const player = await getPlayer(server, playerId);
  
  if (!player) {
    notFound();
  }

  const matches = await getPlayerMatches(server, playerId, player.GuildId, player.Name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${player.Name} Albion Online Profile`,
    description: `Albion Online player statistics for ${player.Name} on ${server.toUpperCase()} server.`,
    url: `https://veyronix.com.tr/player/${server}/${playerId}`,
    mainEntity: {
      "@type": "Person",
      name: player.Name,
      identifier: playerId,
      memberOf: player.GuildName ? {
        "@type": "Organization",
        name: player.GuildName
      } : undefined
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlayerAnalyticsClient 
        player={player}
        initialMatches={matches}
        server={server}
      />
      <div style={{ maxWidth: "1250px", margin: "0 auto", padding: "0 1rem 3rem 1rem" }}>
        <CtaBanner />
      </div>
    </>
  );
}

export async function generateMetadata({ params }) {
  const { server, playerId } = await params;
  const player = await getPlayer(server, playerId);
  
  if (!player) return { title: "Oyuncu Bulunamadı" };
  
  return {
    title: `${player.Name} | Albion Online PvP İstatistikleri & Killboard | Veyronix`,
    description: `Albion Online ${server.toUpperCase()} Oyuncusu ${player.Name} için canlı PvP öldürmeleri, asistleme maçları, kaybettiği eşyalar ve finansal kâr/zarar analizleri.`,
    openGraph: {
      title: `${player.Name} | Albion Online Oyuncu Analiz Portalı`,
      description: `Sunucu: ${server.toUpperCase()} | Lonca: ${player.GuildName || 'Yok'}\nKill Fame: ${player.KillFame?.toLocaleString()} | Death Fame: ${player.DeathFame?.toLocaleString()}`,
      siteName: 'Veyronix',
      type: 'website',
      url: `https://veyronix.com.tr/player/${server}/${playerId}`,
    },
    alternates: {
      canonical: `https://veyronix.com.tr/player/${server.toLowerCase()}/${playerId}`,
    }
  };
}
