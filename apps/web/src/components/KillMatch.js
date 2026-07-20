import Image from "next/image";
import styles from "./KillMatch.module.css";
import Link from "next/link";

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

export default function KillMatch({ event, server }) {
  const killer = event.Killer;
  const victim = event.Victim;
  const date = new Date(event.TimeStamp).toLocaleString();

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div className={styles.header}>
        <Link href={`/killboard/${server}/${event.EventId}`} style={{ textDecoration: 'none' }}>
          <h2>Kill Match</h2>
        </Link>
        <p>{date}</p>
        <div className={styles.fame}>
          {event.TotalVictimKillFame ? event.TotalVictimKillFame.toLocaleString() : 0} Fame
        </div>
      </div>

      <div className={styles.versusContainer}>
        {/* Killer Section */}
        <div className={`${styles.playerCard} ${styles.killerCard}`}>
          <div className={styles.playerTitle}>
            <Link href={`/player/${server}/${killer.Id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {killer.Name}
            </Link>
          </div>
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
          <div className={styles.playerTitle}>
            <Link href={`/player/${server}/${victim.Id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {victim.Name}
            </Link>
          </div>
          {victim.GuildName && <div className={styles.guildName}>[{victim.AllianceName}] {victim.GuildName}</div>}
          <div className={styles.ip}>IP: {Math.round(victim.AverageItemPower || 0)}</div>
          <PlayerEquipment equipment={victim.Equipment} />
        </div>
      </div>
    </div>
  );
}
