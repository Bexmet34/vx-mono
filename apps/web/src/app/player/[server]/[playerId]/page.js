import { notFound } from "next/navigation";
import CtaBanner from "@/components/CtaBanner";
import PlayerAnalyticsClient from "./PlayerAnalyticsClient";

export const revalidate = 300; // Cache page for 5 minutes (ISR)

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
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Error fetching player:", err);
    return null;
  }
}

// Fetch Comprehensive Player Kills, Deaths & Guild/Server Assists (Optimized offsets)
async function getPlayerMatches(server, playerId, guildId, playerName) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const urls = [
      `${baseUrl}/players/${playerId}/kills`,
      `${baseUrl}/players/${playerId}/deaths`,
    ];

    // Fetch 3 pages of Guild Events (Offsets 0 to 100)
    if (guildId) {
      for (let offset = 0; offset <= 100; offset += 50) {
        urls.push(`${baseUrl}/events?offset=${offset}&limit=50&guildId=${guildId}`);
      }
    }

    // Fetch 2 pages of Global Server Events (Offsets 0 to 50)
    for (let offset = 0; offset <= 50; offset += 50) {
      urls.push(`${baseUrl}/events?offset=${offset}&limit=50`);
    }

    const responses = await Promise.all(
      urls.map((url) => fetch(url, { next: { revalidate: 300 } }).catch(() => null))
    );


    const eventsMap = new Map();
    const targetName = (playerName || "").toLowerCase();

    for (let i = 0; i < responses.length; i++) {
      const res = responses[i];
      if (!res || !res.ok) continue;

      const data = await res.json().catch(() => []);
      if (!Array.isArray(data)) continue;

      data.forEach((e) => {
        if (!e || !e.EventId) return;

        const isKiller = e.Killer?.Id === playerId || (e.Killer?.Name && e.Killer.Name.toLowerCase() === targetName);
        const isVictim = e.Victim?.Id === playerId || (e.Victim?.Name && e.Victim.Name.toLowerCase() === targetName);
        const isParticipant = e.Participants?.some((p) => p.Id === playerId || (p.Name && p.Name.toLowerCase() === targetName));
        const isGroupMember = e.GroupMembers?.some((p) => p.Id === playerId || (p.Name && p.Name.toLowerCase() === targetName));

        if (isKiller || isVictim || isParticipant || isGroupMember) {
          eventsMap.set(e.EventId, e);
        }
      });
    }

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
