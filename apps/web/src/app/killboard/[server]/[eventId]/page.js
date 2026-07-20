import { notFound } from "next/navigation";
import styles from "@/components/KillMatch.module.css";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";

// Fetch Event from Albion API
async function getKillEvent(server, eventId) {
  const REGIONS = {
    europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
    americas: "https://gameinfo.albiononline.com/api/gameinfo",
    asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
  };

  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  const res = await fetch(`${baseUrl}/events/${eventId}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

import GlobalSearch from "@/components/GlobalSearch";

export default async function KillboardEventPage({ params }) {
  const { server, eventId } = await params;
  
  const event = await getKillEvent(server, eventId);
  
  if (!event) {
    notFound();
  }

  return (
    <div className={styles.container} style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <GlobalSearch />
      </div>
      <KillMatch event={event} server={server} />
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
