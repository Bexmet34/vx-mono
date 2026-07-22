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

// Fetch Player Kills & Deaths from Albion API
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
    description: `Albion Online ${server.toUpperCase()} Oyuncusu ${player.Name} için canlı PvP öldürmeleri, kaybettiği eşyalar, finansal kâr/zarar istatistikleri ve silah analizleri.`,
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
