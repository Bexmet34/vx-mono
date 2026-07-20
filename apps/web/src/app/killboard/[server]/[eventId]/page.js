import { notFound } from "next/navigation";
import styles from "@/components/KillMatch.module.css";
import KillMatch from "@/components/KillMatch";

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

export default async function KillboardEventPage({ params }) {
  const { server, eventId } = await params;
  
  const event = await getKillEvent(server, eventId);
  
  if (!event) {
    notFound();
  }

  return (
    <div className={styles.container} style={{ paddingTop: '2rem' }}>
      <KillMatch event={event} server={server} />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { server, eventId } = await params;
  const event = await getKillEvent(server, eventId);
  
  if (!event) return { title: "Kill Not Found" };
  
  return {
    title: `${event.Killer?.Name} killed ${event.Victim?.Name} | Veyronix Killboard`,
    description: `Albion Online Killboard: ${event.Killer?.Name} killed ${event.Victim?.Name} for ${event.TotalVictimKillFame} Fame on ${server}.`
  };
}
