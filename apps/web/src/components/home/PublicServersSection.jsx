"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PublicServersSection({ publicServers = [] }) {
  const { t, lang } = useLanguage();

  if (!publicServers || publicServers.length === 0) {
    return null;
  }

  // Normalize: support both plain string arrays (legacy) and {name, icon} objects
  const normalized = publicServers.map(s =>
    typeof s === "string" ? { name: s, icon: null } : s
  );

  // Create enough duplicates for a smooth infinite scroll
  const extendedServers = [...normalized, ...normalized, ...normalized, ...normalized];
  const row1 = extendedServers;
  const row2 = [...extendedServers].reverse();

  // Consistent color based on server name (used for letter-avatar fallback)
  const getColors = (name) => {
    const colors = [
      { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.35)", text: "#818cf8" },
      { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)", text: "#34d399" },
      { bg: "rgba(244,63,94,0.15)",  border: "rgba(244,63,94,0.35)",  text: "#fb7185" },
      { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" },
      { bg: "rgba(14,165,233,0.15)", border: "rgba(14,165,233,0.35)", text: "#38bdf8" },
      { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.35)", text: "#c084fc" },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const ServerCard = ({ server }) => {
    const colors = getColors(server.name);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "10px 16px",
          flexShrink: 0,
          width: "220px",
          backdropFilter: "blur(6px)",
          transition: "background 0.2s, transform 0.2s",
          cursor: "default",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {/* Avatar: Discord icon or letter fallback */}
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            border: `1.5px solid ${colors.border}`,
            background: server.icon ? "transparent" : colors.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {server.icon ? (
            <Image
              src={server.icon}
              alt={server.name}
              width={40}
              height={40}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              unoptimized
            />
          ) : (
            server.name.substring(0, 1).toUpperCase()
          )}
        </div>

        {/* Name + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "rgba(255,255,255,0.9)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {server.name}
          </span>
          <BadgeCheck size={13} style={{ color: "#4ade80", flexShrink: 0 }} />
        </div>
      </div>
    );
  };

  return (
    <section style={{ padding: "24px 0", overflow: "hidden", position: "relative", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(167,139,250,0.8)", fontWeight: "600" }}>
          {t?.marqueeTitle || (lang === "tr" ? "VEYRONİX'İ TERCİH EDEN TOPLULUKLAR" : "COMMUNITIES POWERED BY VEYRONIX")}
        </h2>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
          {lang === "tr"
            ? "Platformumuzu kullanan binlerce üyeli seçkin topluluklar"
            : "Elite communities with thousands of members using our platform"}
        </p>
      </div>

      {/* Fade mask */}
      <div
        style={{
          position: "relative",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "4px 0",
        }}
      >
        {/* Row 1: scrolls right */}
        <div className="hover-pause" style={{ display: "flex", gap: "12px", minWidth: "100%" }}>
          <div className="animate-scroll-right" style={{ display: "flex", gap: "12px", minWidth: "100%", flexShrink: 0, alignItems: "center", justifyContent: "space-around" }}>
            {row1.map((server, idx) => <ServerCard key={`r1a-${idx}`} server={server} />)}
          </div>
          <div className="animate-scroll-right" style={{ display: "flex", gap: "12px", minWidth: "100%", flexShrink: 0, alignItems: "center", justifyContent: "space-around" }}>
            {row1.map((server, idx) => <ServerCard key={`r1b-${idx}`} server={server} />)}
          </div>
        </div>

        {/* Row 2: scrolls left */}
        <div className="hover-pause" style={{ display: "flex", gap: "12px", minWidth: "100%" }}>
          <div className="animate-scroll-left" style={{ display: "flex", gap: "12px", minWidth: "100%", flexShrink: 0, alignItems: "center", justifyContent: "space-around" }}>
            {row2.map((server, idx) => <ServerCard key={`r2a-${idx}`} server={server} />)}
          </div>
          <div className="animate-scroll-left" style={{ display: "flex", gap: "12px", minWidth: "100%", flexShrink: 0, alignItems: "center", justifyContent: "space-around" }}>
            {row2.map((server, idx) => <ServerCard key={`r2b-${idx}`} server={server} />)}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-scroll-left  { animation: scroll-left  420s linear infinite; }
        .animate-scroll-right { animation: scroll-right 420s linear infinite; }
        @keyframes scroll-left  { 0% { transform: translateX(0);     } 100% { transform: translateX(-100%); } }
        @keyframes scroll-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(0);     } }
        .hover-pause:hover .animate-scroll-left,
        .hover-pause:hover .animate-scroll-right { animation-play-state: paused; }
      `}</style>
    </section>
  );
}

