"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Shield, User, Loader2, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function KillboardHubClient() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isTr = lang === 'tr';

  const [selectedServer, setSelectedServer] = useState("europe");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const SERVERS = [
    {
      id: "europe",
      serverParam: "Europe",
      name: isTr ? "Avrupa (Europe)" : "Europe",
      flag: "🌍",
      code: "AMS",
      desc: isTr ? "Amsterdam Veri Merkezi • Türkiye ve Avrupa topluluğunun ana sunucusu." : "Amsterdam Data Center • Main server for Europe region.",
      badgeColor: "#fca311",
    },
    {
      id: "americas",
      serverParam: "Americas",
      name: isTr ? "Amerika (Americas)" : "Americas",
      flag: "🌎",
      code: "WUS",
      desc: isTr ? "Washington DC Veri Merkezi • Batı ve Amerika topluluğu." : "Washington DC Data Center • Americas region server.",
      badgeColor: "#3498db",
    },
    {
      id: "asia",
      serverParam: "Asia",
      name: isTr ? "Asya (Asia)" : "Asia",
      flag: "🌏",
      code: "SGP",
      desc: isTr ? "Singapur Veri Merkezi • Doğu Asya ve Avustralya topluluğu." : "Singapore Data Center • East Asia & Oceania server.",
      badgeColor: "#2ecc71",
    },
  ];

  const currentServerObj = SERVERS.find((s) => s.id === selectedServer) || SERVERS[0];

  // Handle Search Input via Next.js internal API route
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
      setSearchError(isTr ? "Arama yapılırken bir hata oluştu." : "Error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (type, id) => {
    setSearchResults(null);
    setQuery("");
    setSearchError("");
    router.push(`/${type}/${selectedServer}/${id}`);
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
      
      {/* Hero Header Section */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(252, 163, 17, 0.15)",
          border: "1px solid rgba(252, 163, 17, 0.3)",
          padding: "0.35rem 1rem",
          borderRadius: "20px",
          color: "#fca311",
          fontSize: "0.85rem",
          fontWeight: "bold",
          marginBottom: "1rem"
        }}>
          <Sparkles size={16} /> {isTr ? "CANLI ALBION ONLINE PVP KILLBOARD PORTALI" : "LIVE ALBION ONLINE PVP KILLBOARD PORTAL"}
        </div>

        <h1 style={{
          fontSize: "2.8rem",
          fontWeight: "900",
          letterSpacing: "1px",
          background: "linear-gradient(135deg, #ffffff 0%, #fca311 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem"
        }}>
          {isTr ? "Oyuncu veya Lonca Arayın" : "Search Player or Guild"}
        </h1>

        <p style={{ color: "#aaa", fontSize: "1.1rem", maxWidth: "750px", margin: "0 auto", lineHeight: "1.6" }}>
          {isTr 
            ? "Albion Online Avrupa, Amerika ve Asya sunucularındaki oyuncuları arayın, lonca sıralamalarını inceleyin."
            : "Search players and inspect guild rankings across Albion Europe, Americas, and Asia servers."}
        </p>
      </div>

      {/* 1. Interactive Search Section (ÜSTTE) */}
      <div style={{
        background: "rgba(18, 18, 26, 0.9)",
        border: "1px solid rgba(252, 163, 17, 0.3)",
        borderRadius: "14px",
        padding: "2rem",
        marginBottom: "3rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Search size={24} style={{ color: "#fca311" }} />
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
            {isTr ? "Oyuncu veya Lonca Arama" : "Search Player or Guild"} ({currentServerObj.name})
          </h3>
        </div>

        <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          {isTr 
            ? "Seçili sunucudaki herhangi bir oyuncunun veya loncanın ismini girerek istatistiklerine ulaşın."
            : "Enter any player or guild name on the selected server to view stats."}
        </p>

        <form onSubmit={handleFormSubmit} style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder={isTr ? "Oyuncu veya lonca adı yazın..." : "Type player or guild name..."}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: searchError ? "1px solid rgba(231, 76, 60, 0.6)" : "1px solid rgba(252, 163, 17, 0.4)",
                  borderRadius: "10px",
                  padding: "1rem 1.2rem 1rem 3rem",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                }}
              />
              <Search size={20} color="#fca311" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />

              {isSearching && (
                <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#fca311" }}>
                  <Loader2 className="animate-spin" size={20} />
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                background: "#fca311",
                color: "#000",
                fontWeight: "bold",
                padding: "0 1.75rem",
                borderRadius: "10px",
                border: "none",
                fontSize: "1rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s"
              }}
              className="hover:brightness-110"
            >
              <Search size={18} /> {isTr ? "Ara" : "Search"}
            </button>
          </div>

          {/* Inline Error Message when not found */}
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

          {/* Search Dropdown Results */}
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
              {/* Players List */}
              {searchResults.players && searchResults.players.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#2ecc71", textTransform: "uppercase", letterSpacing: "1px" }}>
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
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.2s"
                      }}
                      className="hover:bg-white/10"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <User size={18} color="#2ecc71" />
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

              {/* Guilds List */}
              {searchResults.guilds && searchResults.guilds.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#e74c3c", textTransform: "uppercase", letterSpacing: "1px" }}>
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
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.2s"
                      }}
                      className="hover:bg-white/10"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Shield size={18} color="#e74c3c" />
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

      {/* 2. 3 Server Cards Section (ALTTASINIZ) */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#aaa", marginBottom: "1rem" }}>
          🌐 {isTr ? "Veyronix Sunucu Portalları" : "Veyronix Server Portals"}
        </h3>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3.5rem"
      }}>
        {SERVERS.map((server) => {
          const isSelected = selectedServer === server.id;

          return (
            <div
              key={server.id}
              onClick={() => {
                setSelectedServer(server.id);
                setSearchError("");
              }}
              style={{
                background: isSelected 
                  ? "linear-gradient(145deg, rgba(25, 25, 35, 0.95), rgba(15, 15, 22, 0.98))" 
                  : "rgba(18, 18, 26, 0.7)",
                border: isSelected 
                  ? `2px solid ${server.badgeColor}` 
                  : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                padding: "1.75rem",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.3s ease",
                boxShadow: isSelected ? `0 10px 30px rgba(252, 163, 17, 0.15)` : "0 5px 15px rgba(0,0,0,0.3)"
              }}
              className="hover:scale-[1.02] hover:border-amber-500/50"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "2.5rem" }}>{server.flag}</span>
                <span style={{
                  background: isSelected ? server.badgeColor : "rgba(255,255,255,0.08)",
                  color: isSelected ? "#000" : "#aaa",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "uppercase"
                }}>
                  {server.code} API
                </span>
              </div>

              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff", marginBottom: "0.5rem" }}>
                {server.name}
              </h2>

              <p style={{ color: "#aaa", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                {server.desc}
              </p>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Link
                  href={`/killboard/${server.id}`}
                  style={{
                    flex: 1,
                    background: isSelected ? server.badgeColor : "rgba(255,255,255,0.08)",
                    color: isSelected ? "#000" : "#fff",
                    textAlign: "center",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    transition: "all 0.2s"
                  }}
                >
                  {server.name} {isTr ? "Portalı" : "Portal"} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
