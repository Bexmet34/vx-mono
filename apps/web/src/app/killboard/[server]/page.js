import Link from "next/link";
import { notFound } from "next/navigation";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";
import ServerKillboardClient from "./ServerKillboardClient";

const SERVERS_MAP = {
  europe: {
    name: "Avrupa (Europe)",
    code: "AMS",
    baseUrl: "https://gameinfo-ams.albiononline.com/api/gameinfo",
    flag: "🌍",
  },
  americas: {
    name: "Amerika (Americas)",
    code: "WUS",
    baseUrl: "https://gameinfo.albiononline.com/api/gameinfo",
    flag: "🌎",
  },
  asia: {
    name: "Asya (Asia)",
    code: "SGP",
    baseUrl: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
    flag: "🌏",
  },
};

import { fetchAlbion } from "@/utils/albion";

async function getRecentKills(serverKey) {
  const serverInfo = SERVERS_MAP[serverKey.toLowerCase()];
  if (!serverInfo) return [];

  try {
    const data = await fetchAlbion(`${serverInfo.baseUrl}/events?offset=0&limit=25`);
    return data || [];
  } catch (err) {
    console.error(`[ServerKillboardPage] Error fetching ${serverKey} events:`, err);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { server } = await params;
  const serverInfo = SERVERS_MAP[server.toLowerCase()];
  if (!serverInfo) return { title: "Server Not Found" };

  const serverName = serverInfo.name;
  return {
    title: `Albion Online ${serverName} Canlı Killboard & Savaşlar | Veyronix`,
    description: `Albion Online ${serverName} sunucusundaki son PvP savaşları, en çok kill alan oyuncular, fame sıralaması ve düşen envanter lootlarını inceleyin.`,
    keywords: `Albion ${server} Killboard, Albion Online ${server} PvP, Albion ${server} top kills, Veyronix Killboard`,
    openGraph: {
      title: `Albion Online ${serverName} Canlı Killboard | Veyronix`,
      description: `Albion Online ${serverName} sunucusundaki en son PvP öldürmeleri ve detaylı envanter analizleri.`,
      url: `https://veyronix.com.tr/killboard/${server.toLowerCase()}`,
      siteName: "Veyronix",
      type: "website",
      images: [
        {
          url: "https://veyronix.com.tr/og-banner.png",
          width: 1200,
          height: 630,
          alt: `Albion Online ${serverName} Killboard`,
        },
      ],
    },
    alternates: {
      canonical: `https://veyronix.com.tr/killboard/${server.toLowerCase()}`,
    },
  };
}

export default async function ServerKillboardPage({ params }) {
  const { server } = await params;
  const serverKey = server.toLowerCase();
  const serverInfo = SERVERS_MAP[serverKey];

  if (!serverInfo) {
    notFound();
  }

  const initialKills = await getRecentKills(serverKey);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Albion Online ${serverInfo.name} Live Killboard`,
    description: `Albion Online ${serverInfo.name} live PvP killboard, battle tracking, and item loot history.`,
    url: `https://veyronix.com.tr/killboard/${serverKey}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Ana Sayfa",
          item: "https://veyronix.com.tr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Killboard",
          item: "https://veyronix.com.tr/killboard",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: serverInfo.name,
          item: `https://veyronix.com.tr/killboard/${serverKey}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServerKillboardClient 
        serverKey={serverKey}
        serverInfo={serverInfo}
        initialKills={initialKills}
      />
    </>
  );
}
