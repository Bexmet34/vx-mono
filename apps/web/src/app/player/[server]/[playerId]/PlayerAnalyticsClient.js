"use client";

import { useState, useMemo, useEffect } from "react";
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

function parseAlbionDate(dateString) {
  if (!dateString) return new Date();
  try {
    const cleaned = dateString.replace(/\.(\d{3})\d+Z$/, '.$1Z');
    return new Date(cleaned);
  } catch (e) {
    return new Date(dateString);
  }
}

function timeAgo(dateString, isTr) {
  if (!dateString) return "";
  const now = new Date();
  const date = parseAlbionDate(dateString);
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
  
  let est = fame * 12.8;

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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [weaponFilter, setWeaponFilter] = useState("Any");
  const [fightTypeFilter, setFightTypeFilter] = useState("Any");
  const [juicyOnly, setJuicyOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Calculate Financial KPIs strictly for UTC Today & UTC Yesterday
  const financialStats = useMemo(() => {
    const now = new Date();
    const todayYear = now.getUTCFullYear();
    const todayMonth = now.getUTCMonth();
    const todayDate = now.getUTCDate();

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yestYear = yesterday.getUTCFullYear();
    const yestMonth = yesterday.getUTCMonth();
    const yestDate = yesterday.getUTCDate();

    let profitToday = 0;
    let killsTodayCount = 0;
    let lostToday = 0;
    let lossesTodayCount = 0;

    let profitYesterday = 0;
    let killsYesterdayCount = 0;
    let lostYesterday = 0;
    let lossesYesterdayCount = 0;

    processedMatches.forEach((m) => {
      const matchDate = parseAlbionDate(m.TimeStamp);
      const mYear = matchDate.getUTCFullYear();
      const mMonth = matchDate.getUTCMonth();
      const mDate = matchDate.getUTCDate();

      const isToday = mYear === todayYear && mMonth === todayMonth && mDate === todayDate;
      const isYesterday = mYear === yestYear && mMonth === yestMonth && mDate === yestDate;

      if (isToday) {
        if (m.matchType === "KILL" || m.matchType === "ASSIST") {
          profitToday += m.estSilver;
          killsTodayCount++;
        } else if (m.matchType === "DEATH") {
          lostToday += m.estSilver;
          lossesTodayCount++;
        }
      } else if (isYesterday) {
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
  }, [filteredMatches, currentPage, itemsPerPage]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-32 text-white">
      
      {/* Header & Financial Overview Row */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-8">
        
        {/* Player Badge Info */}
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-all">
              {player.Name}
            </h1>
            <span className="bg-primary-container/20 border border-primary-container/40 text-primary-container px-2.5 py-0.5 rounded-xl text-xs font-bold uppercase tracking-wider">
              {server.toUpperCase()}
            </span>
          </div>

          {player.GuildName && (
            <div className="text-sm sm:text-base text-on-surface-variant mt-1.5 font-medium">
              <Link href={`/guild/${server}/${player.GuildId}`} className="text-primary-container hover:underline font-bold">
                [{player.AllianceTag || player.AllianceName || ""}] {player.GuildName}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant flex-wrap">
            <div>Kill Fame: <strong className="text-emerald-400">{(player.KillFame || 0).toLocaleString()}</strong></div>
            <div>Death Fame: <strong className="text-red-400">{(player.DeathFame || 0).toLocaleString()}</strong></div>
            <div>Ratio: <strong className="text-primary-container">{(player.FameRatio || 0).toFixed(2)}</strong></div>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto lg:max-w-2xl">
          
          {/* EST. PROFIT TODAY */}
          <div className="bg-[#121620]/90 border border-emerald-500/30 rounded-xl p-3 text-center shadow-md">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              {isTr ? "Bugün Kazanılan" : "Profit Today"}
            </div>
            <div className="text-base sm:text-xl font-extrabold text-emerald-400 my-1">
              {formatNumber(financialStats.profitToday)}
            </div>
            <div className="text-[9px] text-on-surface-variant uppercase">
              {financialStats.killsTodayCount} {isTr ? "Kill / Asist" : "Kills"}
            </div>
          </div>

          {/* LOST TODAY */}
          <div className="bg-[#191216]/90 border border-red-500/30 rounded-xl p-3 text-center shadow-md">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              {isTr ? "Bugün Kaybedilen" : "Lost Today"}
            </div>
            <div className="text-base sm:text-xl font-extrabold text-red-400 my-1">
              {formatNumber(financialStats.lostToday)}
            </div>
            <div className="text-[9px] text-on-surface-variant uppercase">
              {financialStats.lossesTodayCount} {isTr ? "Ölüm" : "Losses"}
            </div>
          </div>

          {/* PROFIT YESTERDAY */}
          <div className="bg-[#121620]/90 border border-blue-500/30 rounded-xl p-3 text-center shadow-md">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              {isTr ? "Dün Kazanılan" : "Profit Yesterday"}
            </div>
            <div className="text-base sm:text-xl font-extrabold text-blue-400 my-1">
              {formatNumber(financialStats.profitYesterday)}
            </div>
            <div className="text-[9px] text-on-surface-variant uppercase">
              {financialStats.killsYesterdayCount} {isTr ? "Kill / Asist" : "Kills"}
            </div>
          </div>

          {/* LOST YESTERDAY */}
          <div className="bg-[#191216]/90 border border-red-500/30 rounded-xl p-3 text-center shadow-md">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              {isTr ? "Dün Kaybedilen" : "Lost Yesterday"}
            </div>
            <div className="text-base sm:text-xl font-extrabold text-red-400 my-1">
              {formatNumber(financialStats.lostYesterday)}
            </div>
            <div className="text-[9px] text-on-surface-variant uppercase">
              {financialStats.lossesYesterdayCount} {isTr ? "Ölüm" : "Losses"}
            </div>
          </div>

        </div>
      </div>

      {/* Activity Ranking Category Pills Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        <div className="bg-white/[0.03] border border-outline-variant/30 rounded-xl p-3 text-center">
          <div className="text-xs font-bold text-on-surface-variant">Solo 1v1</div>
          <div className="text-sm sm:text-base font-bold text-white my-1">{formatNumber(activityRankings.soloFame)} Fame</div>
          <div className="text-[10px] text-on-surface-variant/70">{activityRankings.soloFights} {isTr ? "Savaş" : "fights"}</div>
        </div>

        <div className="bg-white/[0.03] border border-outline-variant/30 rounded-xl p-3 text-center">
          <div className="text-xs font-bold text-on-surface-variant">Small Group</div>
          <div className="text-sm sm:text-base font-bold text-white my-1">{formatNumber(activityRankings.smallGroupFame)} Fame</div>
          <div className="text-[10px] text-on-surface-variant/70">{activityRankings.smallGroupFights} {isTr ? "Savaş" : "fights"}</div>
        </div>

        <div className="bg-white/[0.03] border border-outline-variant/30 rounded-xl p-3 text-center">
          <div className="text-xs font-bold text-on-surface-variant">ZvZ / Large</div>
          <div className="text-sm sm:text-base font-bold text-white my-1">{formatNumber(activityRankings.largeFame)} Fame</div>
          <div className="text-[10px] text-on-surface-variant/70">{activityRankings.largeFights} {isTr ? "Savaş" : "fights"}</div>
        </div>

        <div className="bg-white/[0.03] border border-outline-variant/30 rounded-xl p-3 text-center">
          <div className="text-xs font-bold text-on-surface-variant">Hellgate</div>
          <div className="text-sm sm:text-base font-bold text-on-surface-variant/50 my-1">-</div>
          <div className="text-[10px] text-on-surface-variant/70">{isTr ? "Savaş yok" : "no fights"}</div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-[#141620]/90 border border-outline-variant/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          {/* Weapon Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-bold">Silah:</span>
            <select
              value={weaponFilter}
              onChange={(e) => { setWeaponFilter(e.target.value); setCurrentPage(1); }}
              className="bg-black/60 border border-outline-variant/40 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-container"
            >
              <option value="Any">Tümü (Any)</option>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-bold">Tür:</span>
            <select
              value={fightTypeFilter}
              onChange={(e) => { setFightTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-black/60 border border-outline-variant/40 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-container"
            >
              <option value="Any">Tümü (Any)</option>
              <option value="Solo">Solo (1v1)</option>
              <option value="Small Group">Small Group (2-5)</option>
              <option value="Large ZvZ">ZvZ / Large (5+)</option>
            </select>
          </div>

          {/* Juicy Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-primary-container font-bold select-none">
            <input
              type="checkbox"
              checked={juicyOnly}
              onChange={(e) => { setJuicyOnly(e.target.checked); setCurrentPage(1); }}
              className="accent-amber-400 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Juicy 🔥</span>
          </label>
        </div>

        {/* Pagination Navigation */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition-all ${
                currentPage === pageNum 
                  ? 'bg-primary-container text-on-primary' 
                  : 'bg-white/5 text-on-surface-variant hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      </div>

      {/* Match Rows Table List */}
      <div className="space-y-3">
        {paginatedMatches.length > 0 ? (
          paginatedMatches.map((m) => {
            const killer = m.Killer || {};
            const victim = m.Victim || {};

            const isKill = m.matchType === "KILL";
            const isDeath = m.matchType === "DEATH";
            const isAssist = m.matchType === "ASSIST";

            const badgeBg = isKill ? "bg-emerald-500 text-black" : isDeath ? "bg-red-500 text-white" : "bg-blue-500 text-black";
            const badgeLabel = isKill ? "KILL" : isDeath ? "DEATH" : "ASSIST";

            const killerItemImg = getItemImageUrl(killer.Equipment?.MainHand?.Type);
            const victimItemImg = getItemImageUrl(victim.Equipment?.MainHand?.Type);

            return (
              <div
                key={m.EventId}
                className={`bg-[#12141c]/95 border rounded-2xl p-3.5 sm:p-4 transition-all hover:bg-white/5 ${
                  isKill ? "border-emerald-500/25" : isDeath ? "border-red-500/25" : "border-blue-500/25"
                }`}
              >
                {/* Mobile / Tablet Responsive Layout */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  
                  {/* Top Bar on Mobile: Badge + Time + Values */}
                  <div className="flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`${badgeBg} font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0`}>
                        {badgeLabel}
                      </span>
                      <span className="text-xs text-on-surface-variant/80 whitespace-nowrap" suppressHydrationWarning>
                        {isMounted ? timeAgo(m.TimeStamp, isTr) : ""}
                      </span>
                    </div>

                    {/* Mobile-only Values */}
                    <div className="flex md:hidden items-center gap-2 text-right">
                      <div className="text-xs font-bold text-emerald-400">{formatNumber(m.fame)} F</div>
                      <span className="text-outline-variant/40">•</span>
                      <div className="text-xs font-bold text-primary-container">{formatNumber(m.estSilver)} S</div>
                    </div>
                  </div>

                  {/* Versus Section (Killer vs Victim) */}
                  <div className="flex items-center justify-between md:justify-center gap-3 py-1 md:py-0 flex-1 min-w-0">
                    {/* Killer */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 md:justify-end">
                      <img src={killerItemImg} alt="Weapon" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg bg-black/40 border border-outline-variant/30 shrink-0" />
                      <div className="truncate md:text-right">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {killer.Name} <span className="text-[10px] text-on-surface-variant font-normal">{Math.round(killer.AverageItemPower || 0)} IP</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {killer.GuildName ? `[${killer.AllianceTag || killer.AllianceName || ''}] ${killer.GuildName}` : 'Loncasız'}
                        </div>
                      </div>
                    </div>

                    {/* VS Divider */}
                    <span className="text-[10px] font-bold text-on-surface-variant/50 italic px-1 shrink-0">vs</span>

                    {/* Victim */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img src={victimItemImg} alt="Weapon" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg bg-black/40 border border-outline-variant/30 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {victim.Name} <span className="text-[10px] text-on-surface-variant font-normal">{Math.round(victim.AverageItemPower || 0)} IP</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {victim.GuildName ? `[${victim.AllianceTag || victim.AllianceName || ''}] ${victim.GuildName}` : 'Loncasız'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Right Side: Participant Count + Fame/Silver + Inspect CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg text-[10px] text-on-surface-variant">
                      <Users size={12} className="text-primary-container" /> 
                      <span>+{m.participantCount}</span>
                    </div>

                    {/* Desktop Values */}
                    <div className="hidden md:block text-right min-w-[85px]">
                      <div className="text-xs font-bold text-emerald-400">
                        {formatNumber(m.fame)} <span className="text-[10px] text-on-surface-variant font-normal">Fame</span>
                      </div>
                      <div className="text-[11px] font-bold text-primary-container">
                        {formatNumber(m.estSilver)} <span className="text-[9px] text-on-surface-variant font-normal">Silver</span>
                      </div>
                    </div>

                    {/* Inspect Link */}
                    <Link
                      href={`/killboard/${server}/${m.EventId}`}
                      className="inline-flex items-center gap-1.5 bg-primary-container/15 hover:bg-primary-container text-primary-container hover:text-on-primary border border-primary-container/40 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all active:scale-95 touch-manipulation shrink-0"
                    >
                      <Eye size={13} />
                      <span>{isTr ? "İncele" : "Inspect"}</span>
                    </Link>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-surface-container-high/40 rounded-2xl border border-outline-variant/30 text-on-surface-variant text-xs">
            {isTr ? "Filtreleme kriterlerine uygun PvP maçı bulunamadı." : "No matches found matching criteria."}
          </div>
        )}
      </div>

    </div>
  );
}
