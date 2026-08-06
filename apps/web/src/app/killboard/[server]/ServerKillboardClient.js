"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Shield, Loader2, ArrowLeft, Swords, AlertCircle } from "lucide-react";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";
import { useLanguage } from "@/context/LanguageContext";

export default function ServerKillboardClient({ serverKey, serverInfo, initialKills }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const isTr = lang === 'tr';

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const ALL_SERVERS = [
    { id: "europe", serverParam: "Europe", name: isTr ? "Avrupa (Europe)" : "Europe", flag: "🌍" },
    { id: "americas", serverParam: "Americas", name: isTr ? "Amerika (Americas)" : "Americas", flag: "🌎" },
    { id: "asia", serverParam: "Asia", name: isTr ? "Asya (Asia)" : "Asia", flag: "🌏" },
  ];

  const currentServerObj = ALL_SERVERS.find(s => s.id === serverKey) || ALL_SERVERS[0];

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchError("");

    if (value.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/albion/search?q=${encodeURIComponent(value)}&server=${currentServerObj.serverParam}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if ((!data.players || data.players.length === 0) && (!data.guilds || data.guilds.length === 0)) {
          setSearchError(isTr ? `Aradığınız "${value}" ismi bulunamadı.` : `No match found for "${value}".`);
        } else {
          setSearchError("");
        }
      }
    } catch (err) {
      console.error("Search API Error:", err);
      setSearchError(isTr ? "Arama hatası oluştu." : "Search error occurred.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (type, id) => {
    setSearchResults(null);
    setQuery("");
    setSearchError("");
    router.push(`/${type}/${serverKey}/${id}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!query || query.length < 2) return;

    if (searchResults) {
      if (searchResults.players && searchResults.players.length > 0) {
        handleSelectResult("player", searchResults.players[0].Id);
        return;
      }
      if (searchResults.guilds && searchResults.guilds.length > 0) {
        const g = searchResults.guilds[0];
        handleSelectResult("guild", g.Id);
        return;
      }
    }

    setSearchError(isTr ? `"${query}" adında oyuncu veya lonca bulunamadı.` : `No player or guild found with name "${query}".`);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", color: "#fff" }}>
      
      {/* Top Navigation & Server Switcher Bar */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <Link 
          href="/killboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#aaa",
            textDecoration: "none",
            fontSize: "0.9rem",
            transition: "color 0.2s"
          }}
          className="hover:text-white"
        >
          <ArrowLeft size={16} /> {isTr ? "Sunucu Seçimine Dön" : "Back to Server Selection"}
        </Link>

        {/* Server Switcher Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {ALL_SERVERS.map((s) => {
            const isActive = s.id === serverKey;
            return (
              <Link
                key={s.id}
                href={`/killboard/${s.id}`}
                style={{
                  background: isActive ? "rgba(252, 163, 17, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${isActive ? "rgba(252, 163, 17, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
                  color: isActive ? "#fca311" : "#aaa",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  transition: "all 0.2s"
                }}
              >
                <span>{s.flag}</span> {s.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Server Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(25, 25, 35, 0.9), rgba(15, 15, 22, 0.95))",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "14px",
        padding: "2rem",
        marginBottom: "2.5rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <span style={{ fontSize: "3rem" }}>{serverInfo.flag}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#fff", margin: 0 }}>
                {serverInfo.name}
              </h1>
              <span style={{ background: "#fca311", color: "#000", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "bold" }}>
                {serverInfo.code}
              </span>
            </div>
            <p style={{ color: "#aaa", fontSize: "0.95rem", margin: "0.3rem 0 0 0" }}>
              {isTr 
                ? "Canlı PvP Savaşları, Oyuncu Arama ve Güncel Lonca Sıralaması"
                : "Live PvP Battles, Player Search & Guild Rankings"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(0,0,0,0.4)", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase" }}>{isTr ? "Son Savaşlar" : "Recent Battles"}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2ecc71" }}>{initialKills.length} {isTr ? "Canlı Maç" : "Live Matches"}</div>
          </div>
        </div>
      </div>

      {/* Interactive Search Field */}
      <div style={{
        background: "rgba(18, 18, 26, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "1.5rem 2rem",
        marginBottom: "3rem"
      }}>
        <form onSubmit={handleFormSubmit} style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder={isTr ? `Oyuncu veya lonca adı yazın... (${serverInfo.name})` : `Type player or guild name... (${serverInfo.name})`}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: searchError ? "1px solid rgba(231, 76, 60, 0.6)" : "1px solid rgba(252, 163, 17, 0.4)",
                  borderRadius: "10px",
                  padding: "0.9rem 1.2rem 0.9rem 3rem",
                  color: "#fff",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
              <Search size={14} color="#fca311" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />

              {isSearching && (
                <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#fca311" }}>
                  <Loader2 className="animate-spin" size={14} />
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                background: "#fca311",
                color: "#000",
                fontWeight: "bold",
                padding: "0 1.5rem",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              className="hover:brightness-110"
            >
              <Search size={16} /> {isTr ? "Ara" : "Search"}
            </button>
          </div>

          {searchError && !isSearching && (
            <div style={{
              marginTop: "0.75rem",
              background: "rgba(231, 76, 60, 0.15)",
              border: "1px solid rgba(231, 76, 60, 0.4)",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              color: "#ff6b6b",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <AlertCircle size={16} />
              <span>{searchError}</span>
            </div>
          )}

          {/* Search Dropdown */}
          {searchResults && (searchResults.players?.length > 0 || searchResults.guilds?.length > 0) && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "0.5rem",
              background: "#151720",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.9)",
              zIndex: 100,
              maxHeight: "350px",
              overflowY: "auto"
            }}>
              {searchResults.players && searchResults.players.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#2ecc71", textTransform: "uppercase" }}>
                    👤 {isTr ? "Oyuncular" : "Players"} ({searchResults.players.length})
                  </div>
                  {searchResults.players.slice(0, 6).map((p) => (
                    <div
                      key={p.Id}
                      onClick={() => handleSelectResult("player", p.Id)}
                      style={{
                        padding: "0.8rem 1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                      }}
                      className="hover:bg-white/10"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <User size={14} color="#2ecc71" />
                        <div>
                          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "0.95rem" }}>{p.Name}</div>
                          {p.GuildName && <div style={{ color: "#aaa", fontSize: "0.8rem" }}>[{p.AllianceName || ''}] {p.GuildName}</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#fca311", fontWeight: "bold" }}>{isTr ? "İncele" : "Inspect"} →</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.guilds && searchResults.guilds.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#e74c3c", textTransform: "uppercase" }}>
                    🛡️ {isTr ? "Loncaya (Guild) Göre" : "Guilds"} ({searchResults.guilds.length})
                  </div>
                  {searchResults.guilds.slice(0, 6).map((g) => (
                    <div
                      key={g.Id}
                      onClick={() => handleSelectResult("guild", g.Id)}
                      style={{
                        padding: "0.8rem 1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                      }}
                      className="hover:bg-white/10"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Shield size={14} color="#e74c3c" />
                        <div>
                          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "0.95rem" }}>{g.Name}</div>
                          {g.AllianceName && <div style={{ color: "#aaa", fontSize: "0.8rem" }}>[{g.AllianceName}]</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#fca311", fontWeight: "bold" }}>{isTr ? "İncele" : "Inspect"} →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Kills List */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Swords size={22} style={{ color: "#e74c3c" }} />
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>
            {serverInfo.name} {isTr ? "Canlı Son Savaşlar" : "Live Recent Battles"}
          </h2>
        </div>

        {initialKills.length > 0 ? (
          <div>
            {initialKills.map((kill) => (
              <KillMatch key={kill.EventId} event={kill} server={serverKey} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "10px", color: "#888" }}>
            {isTr ? "Bu sunucu için henüz canlı veri bulunamadı." : "No live battle data found for this server."}
          </div>
        )}
      </div>

      <CtaBanner />
    </div>
  );
}
