"use client";

import { Server, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PublicServersSection({ publicServers = [] }) {
  const { t } = useLanguage();

  if (!publicServers || publicServers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-y border-on-surface/10 bg-surface-container-low overflow-hidden">
      <h2 className="text-center font-label-bold text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-8">
        {t.marqueeTitle}
      </h2>
      <div className="relative flex overflow-x-hidden w-full group">
        <div className="animate-marquee flex whitespace-nowrap items-center gap-12 px-6">
          {[...publicServers, ...publicServers, ...publicServers].map((server, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-surface-container-high px-4 py-2 border border-on-surface/10">
              <Server size={18} className="text-primary-container" />
              <span className="font-label-bold text-on-surface">{server.length > 20 ? server.substring(0, 17) + '...' : server}</span>
              <BadgeCheck size={18} className="text-[#e9c400]" />
            </div>
          ))}
        </div>
        <div className="absolute top-0 animate-marquee2 flex whitespace-nowrap items-center gap-12 px-6">
          {[...publicServers, ...publicServers, ...publicServers].map((server, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-3 bg-surface-container-high px-4 py-2 border border-on-surface/10">
              <Server size={18} className="text-primary-container" />
              <span className="font-label-bold text-on-surface">{server.length > 20 ? server.substring(0, 17) + '...' : server}</span>
              <BadgeCheck size={18} className="text-[#e9c400]" />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 195s linear infinite; }
        .animate-marquee2 { animation: marquee2 195s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
        @keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
      `}</style>
    </section>
  );
}
