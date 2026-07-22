"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Search, Shield, User, Loader2, Swords, Trophy, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import KillMatch from "@/components/KillMatch";

export default function KillboardHubClient() {
  const router = useRouter();
  const [selectedServer, setSelectedServer] = useState("europe");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [recentKills, setRecentKills] = useState([]);
  const [loadingKills, setLoadingKills] = useState(true);

  const SERVERS = [
    {
      id: "europe",
      name: "Avrupa (Europe)",
      flag: "🌍",
      code: "AMS",
      api: "https://gameinfo-ams.albiononline.com/api/gameinfo",
      desc: "Amsterdam Veri Merkezi • Türkiye ve Avrupa topluluğunun ana sunucusu.",
      gradient: "from-amber-500/20 via-orange-600/10 to-transparent",
      borderColor: "rgba(252, 163, 17, 0.4)",
      badgeColor: "#fca311",
    },
    {
      id: "americas",
      name: "Amerika (Americas)",
      flag: "🌎",
      code: "WUS",
      api: "https://gameinfo.albiononline.com/api/gameinfo",
      desc: "Washington DC Veri Merkezi • Batı ve Kuzey/Güney Amerika topluluğu.",
      gradient: "from-blue-500/20 via-indigo-600/10 to-transparent",
      borderColor: "rgba(52, 152, 219, 0.4)",
      badgeColor: "#3498db",
    },
    {
      id: "asia",
      name: "Asya (Asia)",
      flag: "🌏",
      code: "SGP",
      api: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
      desc: "Singapur Veri Merkezi • Doğu Asya ve Avustralya topluluğu.",
      gradient: "from-emerald-500/20 via-teal-600/10 to-transparent",
      borderColor: "rgba(46, 204, 113, 0.4)",
      badgeColor: "#2ecc71",
    },
  ];

  // Fetch recent kills whenever selected server changes
  useEffect(() => {
    async function loadRecentKills() {
      setLoadingKills(true);
      const sObj = SERVERS.find((s) => s.id === selectedServer) || SERVERS[0];
      try {
        const res = await fetch(`${sObj.api}/events?offset=0&limit=12`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setRecentKills(Array.isArray(data) ? data : []);
        } else {
          setRecentKills([]);
        }
      } catch (err) {
        console.error("Error fetching recent kills:", err);
        setRecentKills([]);
      } finally {
        setLoadingKills(false);
      }
    }

    loadRecentKills();
  }, [selectedServer]);

  // Handle Search Input
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const sObj = SERVERS.find((s) => s.id === selectedServer) || SERVERS[0];

    try {
      const res = await fetch(`${sObj.api}/search?q=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Search API Error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (type, id) => {
    setSearchResults(null);
    setQuery("");
    router.push(`/${type}/${selectedServer}/${id}`);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", color: "#fff" }}>
      
      {/* Hero Header Section */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
          <Sparkles size={16} /> CANLI ALBION ONLINE PVP KILLBOARD & SAVAŞ PORTALI
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
          Sunucu Seçin & PvP Savaşlarını Canlı İnceleyin
        </h1>

        <p style={{ color: "#aaa", fontSize: "1.1rem", maxWidth: "750px", margin: "0 auto", lineHeight: "1.6" }}>
          Albion Online Avrupa, Amerika ve Asya sunucularındaki en güncel PvP savaşlarını, oyuncu özetlerini, düşen envanter lootlarını ve lonca sıralamalarını inceleyin.
        </p>
      </div>

      {/* 3 Server Cards Section (Sunucu Seçim Kartları) */}
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
              onClick={() => setSelectedServer(server.id)}
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
                boxShadow: isSelected ? `0 10px 30px ${server.borderColor}` : "0 5px 15px rgba(0,0,0,0.3)"
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
                  {server.name} Portalı <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Search Section */}
      <div style={{
        background: "rgba(18, 18, 26, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "14px",
        padding: "2rem",
        marginBottom: "4rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <Search size={22} style={{ color: "#fca311" }} />
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
            Oyuncu veya Lonca Arama ({SERVERS.find(s => s.id === selectedServer)?.name})
          </h3>
        </div>

        <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Seçili sunucudaki herhangi bir oyuncunun veya loncanın ismini girerek tüm geçmiş PvP istatistiklerine anında ulaşın.
        </p>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder={`Örn: chaelisa veya REKKA... (${selectedServer.toUpperCase()} sunucusunda ara)`}
            style={{
              width: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(252, 163, 17, 0.4)",
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

          {/* Search Dropdown Results */}
          {searchResults && (
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
                    👤 Oyuncular ({searchResults.players.length})
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
                      <span style={{ fontSize: "0.8rem", color: "#fca311", fontWeight: "bold" }}>İncele →</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Guilds List */}
              {searchResults.guilds && searchResults.guilds.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#e74c3c", textTransform: "uppercase", letterSpacing: "1px" }}>
                    🛡️ Loncaya (Guild) Göre
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
                          {g.AllianceName && <div style={{ color: "#aaa", fontSize: "0.8rem" }}>İttifak: [{g.AllianceName}]</div>}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#fca311", fontWeight: "bold" }}>İncele →</span>
                    </div>
                  ))}
                </div>
              )}

              {!searchResults.players?.length && !searchResults.guilds?.length && (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#888" }}>
                  Aramanızla eşleşen sonuç bulunamadı.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Recent Kills Stream Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Swords size={24} style={{ color: "#e74c3c" }} />
            <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "bold", color: "#fff" }}>
              Canlı Savaş Akışı ({SERVERS.find(s => s.id === selectedServer)?.name})
            </h2>
          </div>
          <Link
            href={`/killboard/${selectedServer}`}
            style={{
              color: "#fca311",
              fontSize: "0.9rem",
              fontWeight: "bold",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
            className="hover:underline"
          >
            Tüm {selectedServer.toUpperCase()} Savaşlarını Gör →
          </Link>
        </div>

        {loadingKills ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#fca311" }}>
            <Loader2 className="animate-spin inline-block" size={32} />
            <p style={{ marginTop: "1rem", color: "#aaa" }}>Canlı PvP savaşları çekiliyor...</p>
          </div>
        ) : recentKills.length > 0 ? (
          <div>
            {recentKills.map((kill) => (
              <KillMatch key={kill.EventId} event={kill} server={selectedServer} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "10px", color: "#888" }}>
            Bu sunucu için canlı veri alınamadı.
          </div>
        )}
      </div>

    </div>
  );
}
