import { notFound } from "next/navigation";
import styles from "./killboard.module.css";
import Image from "next/image";

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

function ItemSlot({ item, slotClass }) {
  if (!item || !item.Type) {
    return <div className={`${styles.itemSlot} ${styles.emptySlot} ${styles[slotClass]}`}></div>;
  }

  const quality = item.Quality ? `?quality=${item.Quality}` : "";
  const imageUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;

  return (
    <div className={`${styles.itemSlot} ${styles[slotClass]}`}>
      <Image src={imageUrl} alt={item.Type} width={60} height={60} unoptimized />
      {item.Count > 1 && <span className={styles.itemCount}>{item.Count}</span>}
    </div>
  );
}

function PlayerEquipment({ equipment }) {
  if (!equipment) return null;
  return (
    <div className={styles.equipmentGrid}>
      <ItemSlot item={equipment.Bag} slotClass="slot-bag" />
      <ItemSlot item={equipment.Head} slotClass="slot-head" />
      <ItemSlot item={equipment.Cape} slotClass="slot-cape" />
      
      <ItemSlot item={equipment.MainHand} slotClass="slot-mainhand" />
      <ItemSlot item={equipment.Armor} slotClass="slot-armor" />
      <ItemSlot item={equipment.OffHand} slotClass="slot-offhand" />
      
      <ItemSlot item={equipment.Potion} slotClass="slot-potion" />
      <ItemSlot item={equipment.Shoes} slotClass="slot-shoes" />
      <ItemSlot item={equipment.Food} slotClass="slot-food" />
      
      <ItemSlot item={equipment.Mount} slotClass="slot-mount" />
    </div>
  );
}

export default async function KillboardEventPage({ params }) {
  const { server, eventId } = await params;
  
  const event = await getKillEvent(server, eventId);
  
  if (!event) {
    notFound();
  }

  const killer = event.Killer;
  const victim = event.Victim;
  const date = new Date(event.TimeStamp).toLocaleString();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Kill Match</h1>
        <p>{date}</p>
        <div className={styles.fame}>
          {event.TotalVictimKillFame ? event.TotalVictimKillFame.toLocaleString() : 0} Fame
        </div>
      </div>

      <div className={styles.versusContainer}>
        {/* Killer Section */}
        <div className={`${styles.playerCard} ${styles.killerCard}`}>
          <div className={styles.playerTitle}>{killer.Name}</div>
          {killer.GuildName && <div className={styles.guildName}>[{killer.AllianceName}] {killer.GuildName}</div>}
          <div className={styles.ip}>IP: {Math.round(killer.AverageItemPower || 0)}</div>
          <PlayerEquipment equipment={killer.Equipment} />
        </div>

        {/* VS Badge */}
        <div className={styles.vsBadge}>
          VS
        </div>

        {/* Victim Section */}
        <div className={`${styles.playerCard} ${styles.victimCard}`}>
          <div className={styles.playerTitle}>{victim.Name}</div>
          {victim.GuildName && <div className={styles.guildName}>[{victim.AllianceName}] {victim.GuildName}</div>}
          <div className={styles.ip}>IP: {Math.round(victim.AverageItemPower || 0)}</div>
          <PlayerEquipment equipment={victim.Equipment} />
        </div>
      </div>
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
