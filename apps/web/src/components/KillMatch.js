"use client";

import Image from "next/image";
import styles from "./KillMatch.module.css";
import Link from "next/link";
import { Share2, Check } from "lucide-react";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/killboard/${server}/${event.EventId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginBottom: '3rem', position: 'relative' }}>
      <div className={`${styles.header} ${styles.headerWrapper}`}>
        <div>
          <h2>Kill Match</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>{date}</p>
        </div>
        <div className={styles.headerButtons}>
          <div className={styles.fame}>
            {event.TotalVictimKillFame ? event.TotalVictimKillFame.toLocaleString() : 0} Fame
          </div>
          <button 
            onClick={handleShare}
            style={{
              background: copied ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${copied ? '#2ecc71' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              color: copied ? '#2ecc71' : '#fff',
              transition: 'all 0.2s',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}
            title="Skoru Kopyala"
          >
            {copied ? <><Check size={14} /> Kopyalandı</> : <><Share2 size={14} /> Paylaş</>}
          </button>
        </div>
      </div>

      <div className={styles.versusContainer} style={{ position: 'relative' }}>
        <Link href={`/killboard/${server}/${event.EventId}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
        
        {/* Killer Section */}
        <div className={`${styles.playerCard} ${styles.killerCard}`} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.playerTitle}>
            <Link href={`/player/${server}/${killer.Id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[#2ecc71] transition-colors">
              {killer.Name}
            </Link>
          </div>
          {killer.GuildName && (
            <div className={styles.guildName}>
              <Link href={`/guild/${server}/${killer.GuildId}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">
                [{killer.AllianceName}] {killer.GuildName}
              </Link>
            </div>
          )}
          <div className={styles.ip}>IP: {Math.round(killer.AverageItemPower || 0)}</div>
          <PlayerEquipment equipment={killer.Equipment} />
        </div>

        {/* VS Badge */}
        <div className={styles.vsBadge} style={{ position: 'relative', zIndex: 2 }}>
          VS
        </div>

        {/* Victim Section */}
        <div className={`${styles.playerCard} ${styles.victimCard}`} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.playerTitle}>
            <Link href={`/player/${server}/${victim.Id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-[#e74c3c] transition-colors">
              {victim.Name}
            </Link>
          </div>
          {victim.GuildName && (
            <div className={styles.guildName}>
              <Link href={`/guild/${server}/${victim.GuildId}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">
                [{victim.AllianceName}] {victim.GuildName}
              </Link>
            </div>
          )}
          <div className={styles.ip}>IP: {Math.round(victim.AverageItemPower || 0)}</div>
          <PlayerEquipment equipment={victim.Equipment} />
        </div>
      </div>
    </div>
  );
}
