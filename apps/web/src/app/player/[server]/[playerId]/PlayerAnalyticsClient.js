"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Swords, Shield, Trophy, Skull, Flame, Filter, ChevronRight, 
  ExternalLink, Coins, ArrowUpRight, ArrowDownRight, Users, UserCheck, Eye, Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

function formatNumber(num) {
  if (!num || isNaN(num)) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "k";
  }
  return num.toString();
}

function timeAgo(dateString, isTr) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return isTr ? "Az önce" : "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${isTr ? "dk önce" : "m ago"}`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${isTr ? "saat önce" : "hr ago"}`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ${isTr ? "gün önce" : "d ago"}`;
}

function getItemImageUrl(itemType) {
  if (!itemType) return "https://render.albiononline.com/v1/item/T4_MAIN_SWORD.png?size=64";
  return `https://render.albiononline.com/v1/item/${itemType}.png?size=64`;
}

function getWeaponCategory(itemType) {
  if (!itemType) return "Other";
  const t = itemType.toUpperCase();
  if (t.includes("SWORD") || t.includes("DUALSWORDS") || t.includes("CLAYMORE")) return "Swords";
  if (t.includes("BOW") || t.includes("CROSSBOW")) return "Bows";
  if (t.includes("DAGGER") || t.includes("CLAWS")) return "Daggers";
  if (t.includes("AXE") || t.includes("HALBERD")) return "Axes";
  if (t.includes("MACE") || t.includes("HAMMER")) return "Maces/Hammers";
  if (t.includes("SPEAR") || t.includes("PIKE")) return "Spears";
  if (t.includes("STAFF") || t.includes("FIRE") || t.includes("FROST") || t.includes("CURSED") || t.includes("HOLY") || t.includes("NATURE")) return "Staves";
  return "Other";
}

// Calculate realistic Albion Silver loot value from Fame & Victim IP
function calculateEstSilver(event, fame) {
  const victim = event.Victim || {};
  const ip = victim.AverageItemPower || 1000;
  
  // Base realistic market multiplier (~12.8x Fame)
  let est = fame * 12.8;

  // High IP gear multiplier
  if (ip >= 1500) {
    est *= 1.4;
  } else if (ip >= 1350) {
    est *= 1.2;
  }

  return Math.round(est);
}

export default function PlayerAnalyticsClient({ player, initialMatches, server }) {
  const { lang } = useLanguage();
  const isTr = lang === 'tr';

  const [weaponFilter, setWeaponFilter] = useState("Any");
  const [fightTypeFilter, setFightTypeFilter] = useState("Any");
  const [juicyOnly, setJuicyOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Process matches and add computed metadata
  const processedMatches = useMemo(() => {
    if (!initialMatches || !Array.isArray(initialMatches)) return [];

    const pId = player.Id;
    const pName = (player.Name || "").toLowerCase();

    return initialMatches.map((event) => {
      const killer = event.Killer || {};
      const victim = event.Victim || {};
      const participants = event.Participants || event.GroupMembers || [];
      const fame = event.TotalVictimKillFame || 0;
      
      const estSilver = calculateEstSilver(event, fame);

      const isKiller = killer.Id === pId || (killer.Name && killer.Name.toLowerCase() === pName);
      const isVictim = victim.Id === pId || (victim.Name && victim.Name.toLowerCase() === pName);
      
      let matchType = "ASSIST";
      if (isKiller) matchType = "KILL";
      else if (isVictim) matchType = "DEATH";

      const participantCount = participants.length || 1;
      let fightType = "Solo";
      if (participantCount > 1 && participantCount <= 4) fightType = "Small Group";
      else if (participantCount > 4) fightType = "ZvZ / Large";

      const killerWeapon = killer.Equipment?.MainHand?.Type || "";
      const victimWeapon = victim.Equipment?.MainHand?.Type || "";
      const playerWeapon = isKiller ? killerWeapon : isVictim ? victimWeapon : (
        participants.find(p => p.Id === pId || (p.Name && p.Name.toLowerCase() === pName))?.Equipment?.MainHand?.Type || killerWeapon
      );

      return {
        ...event,
        matchType,
        estSilver,
        fame,
        fightType,
        participantCount,
        playerWeapon,
        weaponCategory: getWeaponCategory(playerWeapon),
      };
    });
  }, [initialMatches, player]);

  // Calculate Financial KPIs (Profit Today, Lost Today, Profit Yesterday, Lost Yesterday)
  const financialStats = useMemo(() => {
    const now = new Date().getTime();

    let profitToday = 0;
    let killsTodayCount = 0;
    let lostToday = 0;
    let lossesTodayCount = 0;

    let profitYesterday = 0;
    let killsYesterdayCount = 0;
    let lostYesterday = 0;
    let lossesYesterdayCount = 0;

    processedMatches.forEach((m) => {
      const matchTime = new Date(m.TimeStamp).getTime();
      const ageHours = (now - matchTime) / (1000 * 60 * 60);

      if (ageHours <= 24) {
        if (m.matchType === "KILL" || m.matchType === "ASSIST") {
          profitToday += m.estSilver;
          killsTodayCount++;
        } else if (m.matchType === "DEATH") {
          lostToday += m.estSilver;
          lossesTodayCount++;
        }
      } else if (ageHours > 24 && ageHours <= 48) {
        if (m.matchType === "KILL" || m.matchType === "ASSIST") {
          profitYesterday += m.estSilver;
          killsYesterdayCount++;
        } else if (m.matchType === "DEATH") {
          lostYesterday += m.estSilver;
          lossesYesterdayCount++;
        }
      }
    });

    return {
      profitToday,
      killsTodayCount,
      lostToday,
      lossesTodayCount,
      profitYesterday,
      killsYesterdayCount,
      lostYesterday,
      lossesYesterdayCount,
    };
  }, [processedMatches]);

  // Activity Rankings Calculations
  const activityRankings = useMemo(() => {
    let soloFame = 0;
    let soloFights = 0;
    let smallGroupFame = 0;
    let smallGroupFights = 0;
    let largeFame = 0;
    let largeFights = 0;

    processedMatches.forEach((m) => {
      if (m.participantCount <= 2) {
        soloFame += m.fame;
        soloFights++;
      } else if (m.participantCount <= 5) {
        smallGroupFame += m.fame;
        smallGroupFights++;
      } else {
        largeFame += m.fame;
        largeFights++;
      }
    });

    return {
      soloFame,
      soloFights,
      smallGroupFame,
      smallGroupFights,
      largeFame,
      largeFights,
    };
  }, [processedMatches]);

  // Filter Matches
  const filteredMatches = useMemo(() => {
    return processedMatches.filter((m) => {
      if (weaponFilter !== "Any" && m.weaponCategory !== weaponFilter) return false;
      if (fightTypeFilter !== "Any") {
        if (fightTypeFilter === "Solo" && m.participantCount > 2) return false;
        if (fightTypeFilter === "Small Group" && (m.participantCount <= 2 || m.participantCount > 5)) return false;
        if (fightTypeFilter === "Large ZvZ" && m.participantCount <= 5) return false;
      }
      if (juicyOnly && m.estSilver < 500000 && m.fame < 100000) return false;
      return true;
    });
  }, [processedMatches, weaponFilter, fightTypeFilter, juicyOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage) || 1;
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMatches.slice(start, start + itemsPerPage);
  }, [filteredMatches, currentPage]);

  return (
    <div style={{ maxWidth: "1250px", margin: "0 auto", padding: "2rem 1rem", color: "#fff" }}>
      
      {/* Header & Financial Overview Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem", marginBottom: "2.5rem" }}>
        
        {/* Player Badge Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1 style={{ fontSize: "2.8rem", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "0.5px" }}>
              {player.Name}
            </h1>
            <span style={{ background: "rgba(252, 163, 17, 0.2)", border: "1px solid rgba(252, 163, 17, 0.4)", color: "#fca311", padding: "0.3rem 0.8rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>
              {server.toUpperCase()}
            </span>
          </div>

          {player.GuildName && (
            <div style={{ fontSize: "1.2rem", color: "#aaa", marginTop: "0.5rem" }}>
              <Link href={`/guild/${server}/${player.GuildId}`} style={{ color: "#fca311", textDecoration: "none", fontWeight: "bold" }} className="hover:underline">
                [{player.AllianceTag || player.AllianceName || ""}] {player.GuildName}
              </Link>
            </div>
          )}

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", color: "#888", fontSize: "0.9rem" }}>
            <div>Kill Fame: <strong style={{ color: "#2ecc71" }}>{(player.KillFame || 0).toLocaleString()}</strong></div>
            <div>Death Fame: <strong style={{ color: "#e74c3c" }}>{(player.DeathFame || 0).toLocaleString()}</strong></div>
            <div>Ratio: <strong style={{ color: "#fca311" }}>{(player.FameRatio || 0).toFixed(2)}</strong></div>
          </div>
        </div>

        {/* Financial KPI Summary Cards (EST. PROFIT TODAY, LOST TODAY, etc.) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem", flex: 1, maxWidth: "680px" }}>
          
          {/* EST. PROFIT TODAY */}
          <div style={{
            background: "rgba(18, 22, 32, 0.9)",
            border: "1px solid rgba(46, 204, 113, 0.3)",
            borderRadius: "10px",
            padding: "1rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {isTr ? "Bugün Kazanılan" : "Est. Profit Today"}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#2ecc71", margin: "0.3rem 0" }}>
              {formatNumber(financialStats.profitToday)}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase" }}>
              {financialStats.killsTodayCount} {isTr ? "Kill & Asist" : "Kills & Assists"}
            </div>
          </div>

          {/* LOST TODAY */}
          <div style={{
            background: "rgba(25, 18, 22, 0.9)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderRadius: "10px",
            padding: "1rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#ff6b6b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {isTr ? "Bugün Kaybedilen" : "Lost Today"}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#e74c3c", margin: "0.3rem 0" }}>
              {formatNumber(financialStats.lostToday)}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase" }}>
              {financialStats.lossesTodayCount} {isTr ? "Ölüm" : "Losses"}
            </div>
          </div>

          {/* PROFIT YESTERDAY */}
          <div style={{
            background: "rgba(18, 22, 32, 0.9)",
            border: "1px solid rgba(52, 152, 219, 0.3)",
            borderRadius: "10px",
            padding: "1rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {isTr ? "Dün Kazanılan" : "Profit Yesterday"}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#3498db", margin: "0.3rem 0" }}>
              {formatNumber(financialStats.profitYesterday)}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase" }}>
              {financialStats.killsYesterdayCount} {isTr ? "Kill & Asist" : "Kills & Assists"}
            </div>
          </div>

          {/* LOST YESTERDAY */}
          <div style={{
            background: "rgba(25, 18, 22, 0.9)",
            border: "1px solid rgba(231, 76, 60, 0.3)",
            borderRadius: "10px",
            padding: "1rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#e74c3c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {isTr ? "Dün Kaybedilen" : "Lost Yesterday"}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#e74c3c", margin: "0.3rem 0" }}>
              {formatNumber(financialStats.lostYesterday)}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase" }}>
              {financialStats.lossesYesterdayCount} {isTr ? "Ölüm" : "Losses"}
            </div>
          </div>

        </div>
      </div>

      {/* Activity Ranking Category Pills Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "0.75rem",
        marginBottom: "2.5rem"
      }}>
        {/* Solo Card */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "0.8rem 1rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#aaa" }}>Solo 1v1</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", margin: "0.2rem 0" }}>{formatNumber(activityRankings.soloFame)} Fame</div>
          <div style={{ fontSize: "0.7rem", color: "#666" }}>{activityRankings.soloFights} {isTr ? "Savaş" : "fights"}</div>
        </div>

        {/* Small Group Card */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "0.8rem 1rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#aaa" }}>Small Group (Ganking)</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", margin: "0.2rem 0" }}>{formatNumber(activityRankings.smallGroupFame)} Fame</div>
          <div style={{ fontSize: "0.7rem", color: "#666" }}>{activityRankings.smallGroupFights} {isTr ? "Savaş" : "fights"}</div>
        </div>

        {/* ZvZ / Large Group */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "0.8rem 1rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#aaa" }}>ZvZ / Large Group</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", margin: "0.2rem 0" }}>{formatNumber(activityRankings.largeFame)} Fame</div>
          <div style={{ fontSize: "0.7rem", color: "#666" }}>{activityRankings.largeFights} {isTr ? "Savaş" : "fights"}</div>
        </div>

        {/* Hellgate / Corrupted */}
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "0.8rem 1rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#aaa" }}>2v2 / 5v5 Hellgate</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#888", margin: "0.2rem 0" }}>-</div>
          <div style={{ fontSize: "0.7rem", color: "#666" }}>{isTr ? "Savaş yok" : "no fights"}</div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div style={{
        background: "rgba(20, 22, 32, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        padding: "1rem 1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          
          {/* Weapon Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#aaa", fontWeight: "bold" }}>Weapon:</span>
            <select
              value={weaponFilter}
              onChange={(e) => { setWeaponFilter(e.target.value); setCurrentPage(1); }}
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="Any">Any</option>
              <option value="Swords">Swords</option>
              <option value="Bows">Bows</option>
              <option value="Daggers">Daggers</option>
              <option value="Axes">Axes</option>
              <option value="Maces/Hammers">Maces/Hammers</option>
              <option value="Spears">Spears</option>
              <option value="Staves">Staves</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Fight Type Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#aaa", fontWeight: "bold" }}>Fight Type:</span>
            <select
              value={fightTypeFilter}
              onChange={(e) => { setFightTypeFilter(e.target.value); setCurrentPage(1); }}
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                borderRadius: "6px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="Any">Any</option>
              <option value="Solo">Solo (1v1)</option>
              <option value="Small Group">Small Group (2-5)</option>
              <option value="Large ZvZ">ZvZ / Large Group (5+)</option>
            </select>
          </div>

          {/* Juicy Checkbox */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", color: "#fca311", fontWeight: "bold" }}>
            <input
              type="checkbox"
              checked={juicyOnly}
              onChange={(e) => { setJuicyOnly(e.target.checked); setCurrentPage(1); }}
              style={{ accentColor: "#fca311", cursor: "pointer" }}
            />
            Yüksek Değerli (Juicy) 🔥
          </label>
        </div>

        {/* Pagination Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {Array.from({ length: Math.min(totalPages, 15) }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                background: currentPage === pageNum ? "#fca311" : "rgba(255, 255, 255, 0.05)",
                color: currentPage === pageNum ? "#000" : "#aaa",
                border: "none",
                borderRadius: "4px",
                width: "28px",
                height: "28px",
                fontWeight: "bold",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {pageNum}
            </button>
          ))}
        </div>
      </div>

      {/* Match Rows Table List (Detaylı PvP Savaş Listesi) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {paginatedMatches.length > 0 ? (
          paginatedMatches.map((m) => {
            const killer = m.Killer || {};
            const victim = m.Victim || {};

            const isKill = m.matchType === "KILL";
            const isDeath = m.matchType === "DEATH";
            const isAssist = m.matchType === "ASSIST";

            const badgeBg = isKill ? "#2ecc71" : isDeath ? "#e74c3c" : "#3498db";
            const badgeLabel = isKill ? "KILL" : isDeath ? "DEATH" : "ASSIST";

            const killerItemImg = getItemImageUrl(killer.Equipment?.MainHand?.Type);
            const victimItemImg = getItemImageUrl(victim.Equipment?.MainHand?.Type);

            return (
              <div
                key={m.EventId}
                style={{
                  background: "rgba(18, 20, 28, 0.95)",
                  border: `1px solid ${isKill ? "rgba(46, 204, 113, 0.2)" : isDeath ? "rgba(231, 76, 60, 0.2)" : "rgba(52, 152, 219, 0.2)"}`,
                  borderRadius: "10px",
                  padding: "0.85rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  transition: "all 0.2s"
                }}
                className="hover:bg-white/5"
              >
                {/* Status Badge (Sol Etiket & Zaman) */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "120px" }}>
                  <div style={{
                    background: badgeBg,
                    color: "#000",
                    fontWeight: "900",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {badgeLabel}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888", whiteSpace: "nowrap" }}>
                    {timeAgo(m.TimeStamp, isTr)}
                  </div>
                </div>

                {/* Match Versus Section (Katil vs Kurban) */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1, minWidth: "320px", justifyContent: "center" }}>
                  
                  {/* Killer Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: "140px", justifyContent: "flex-end" }}>
                    <img src={killerItemImg} alt="Weapon" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px", background: "rgba(0,0,0,0.4)" }} />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#fff", fontWeight: "bold", fontSize: "0.95rem" }}>
                        {killer.Name} <span style={{ fontSize: "0.7rem", color: "#aaa", fontWeight: "normal" }}>{Math.round(killer.AverageItemPower || 0)} IP</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>
                        {killer.GuildName ? `[${killer.AllianceTag || killer.AllianceName || ''}] ${killer.GuildName}` : 'Loncasız'}
                      </div>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <span style={{ fontSize: "0.8rem", color: "#555", fontWeight: "bold", fontStyle: "italic" }}>vs.</span>

                  {/* Victim Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: "140px" }}>
                    <img src={victimItemImg} alt="Weapon" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px", background: "rgba(0,0,0,0.4)" }} />
                    <div>
                      <div style={{ color: "#fff", fontWeight: "bold", fontSize: "0.95rem" }}>
                        {victim.Name} <span style={{ fontSize: "0.7rem", color: "#aaa", fontWeight: "normal" }}>{Math.round(victim.AverageItemPower || 0)} IP</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>
                        {victim.GuildName ? `[${victim.AllianceTag || victim.AllianceName || ''}] ${victim.GuildName}` : 'Loncasız'}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Allied Group Badge & Fame/Silver Values (Sağ Taraf) */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  
                  {/* Group Count Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "rgba(0,0,0,0.4)", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", color: "#aaa" }}>
                    <Users size={14} color="#fca311" /> +{m.participantCount}
                  </div>

                  {/* Fame & Est. Silver Values */}
                  <div style={{ textAlign: "right", minWidth: "90px" }}>
                    <div style={{ color: "#2ecc71", fontWeight: "bold", fontSize: "0.9rem" }}>
                      {formatNumber(m.fame)} <span style={{ fontSize: "0.75rem", color: "#888" }}>Fame</span>
                    </div>
                    <div style={{ color: m.estSilver >= 500000 ? "#fca311" : "#aaa", fontWeight: "bold", fontSize: "0.85rem" }}>
                      {formatNumber(m.estSilver)} <span style={{ fontSize: "0.7rem", color: "#666" }}>Silver</span>
                    </div>
                  </div>

                  {/* Inspect Button */}
                  <Link
                    href={`/killboard/${server}/${m.EventId}`}
                    style={{
                      background: "rgba(252, 163, 17, 0.15)",
                      border: "1px solid rgba(252, 163, 17, 0.4)",
                      color: "#fca311",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      transition: "all 0.2s"
                    }}
                    className="hover:bg-amber-500 hover:text-black"
                  >
                    <Eye size={14} /> {isTr ? "İncele" : "Inspect"}
                  </Link>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "10px", color: "#888" }}>
            Filtreleme kriterlerine uygun PvP maçı bulunamadı.
          </div>
        )}
      </div>

    </div>
  );
}
