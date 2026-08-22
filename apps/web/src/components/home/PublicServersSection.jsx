"use client";

import { Server, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useMemo } from "react";

export default function PublicServersSection({ publicServers = [] }) {
  const { t, lang } = useLanguage();

  if (!publicServers || publicServers.length === 0) {
    return null;
  }

  // Create enough duplicates to ensure a smooth infinite scroll across wide screens
  // We need at least 2 full sets for the CSS animation to loop perfectly
  const extendedServers = [...publicServers, ...publicServers, ...publicServers, ...publicServers];
  
  // Split into two halves to add variance between the two rows
  const row1 = extendedServers;
  const row2 = [...extendedServers].reverse();

  // Helper to generate consistent fake member count based on server name
  const getMemberCount = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const count = Math.abs(hash) % 80000 + 1000;
    return count.toLocaleString('tr-TR');
  };

  // Helper to generate a consistent color based on server name
  const getColors = (name) => {
    const colors = [
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "bg-rose-500/20 text-rose-400 border-rose-500/30",
      "bg-amber-500/20 text-amber-400 border-amber-500/30",
      "bg-sky-500/20 text-sky-400 border-sky-500/30",
      "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const ServerCard = ({ server }) => (
    <div className="flex items-center gap-3 bg-surface-container-high hover:bg-surface-container-highest px-4 py-3 rounded-2xl border border-outline-variant/30 shadow-md shrink-0 w-64 transition-colors cursor-default group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border ${getColors(server)} group-hover:scale-105 transition-transform`}>
        {server.substring(0, 1).toUpperCase()}
      </div>
      <div className="flex flex-col overflow-hidden w-full">
        <div className="flex items-center gap-1.5 w-full">
          <span className="font-label-bold text-on-surface text-sm truncate">{server}</span>
          <BadgeCheck size={14} className="text-success shrink-0" />
        </div>
        <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-success/80"></div>
          {getMemberCount(server)} members
        </span>
      </div>
    </div>
  );

  return (
    <section className="py-12 bg-surface overflow-hidden relative border-y border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center relative z-10">
        <h2 className="font-headline-md text-primary-container text-sm md:text-base uppercase tracking-[0.2em]">
          {t.marqueeTitle || (lang === 'tr' ? 'Seçkin Topluluklar' : 'Top Communities')}
        </h2>
        <p className="text-on-surface-variant text-xs md:text-sm mt-2 max-w-xl mx-auto">
          {lang === 'tr' ? 'Platformumuzu kullanan on binlerce üyeli seçkin topluluklar' : 'Elite communities with tens of thousands of members using our platform'}
        </p>
      </div>

      {/* Fade Mask Container */}
      <div className="w-full relative fade-edges flex flex-col gap-4 py-4">
        
        {/* Row 1: Scrolls to the right */}
        <div className="flex gap-4 min-w-full hover-pause">
          <div className="flex shrink-0 animate-scroll-right gap-4 min-w-full items-center justify-around">
            {row1.map((server, idx) => (
              <ServerCard key={`r1-a-${idx}`} server={server} />
            ))}
          </div>
          <div className="flex shrink-0 animate-scroll-right gap-4 min-w-full items-center justify-around">
            {row1.map((server, idx) => (
              <ServerCard key={`r1-b-${idx}`} server={server} />
            ))}
          </div>
        </div>

        {/* Row 2: Scrolls to the left */}
        <div className="flex gap-4 min-w-full hover-pause">
          <div className="flex shrink-0 animate-scroll-left gap-4 min-w-full items-center justify-around">
            {row2.map((server, idx) => (
              <ServerCard key={`r2-a-${idx}`} server={server} />
            ))}
          </div>
          <div className="flex shrink-0 animate-scroll-left gap-4 min-w-full items-center justify-around">
            {row2.map((server, idx) => (
              <ServerCard key={`r2-b-${idx}`} server={server} />
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        .fade-edges {
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        
        .animate-scroll-left {
          animation: scroll-left 420s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scroll-right 420s linear infinite;
        }
        
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes scroll-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        
        /* Pause on hover for better UX - applied to the track container */
        .hover-pause:hover .animate-scroll-left,
        .hover-pause:hover .animate-scroll-right {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
