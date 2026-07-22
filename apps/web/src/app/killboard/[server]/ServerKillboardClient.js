"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Shield, Loader2, ArrowLeft, Swords, Globe } from "lucide-react";
import KillMatch from "@/components/KillMatch";
import CtaBanner from "@/components/CtaBanner";

export default function ServerKillboardClient({ serverKey, serverInfo, initialKills }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const ALL_SERVERS = [
    { id: "europe", name: "Avrupa (Europe)", flag: "🌍" },
    { id: "americas", name: "Amerika (Americas)", flag: "🌎" },
    { id: "asia", name: "Asya (Asia)", flag: "🌏" },
  ];

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 3) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`${serverInfo.baseUrl}/search?q=${encodeURIComponent(value)}`);
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
    router.push(`/${type}/${serverKey}/${id}`);
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
          <ArrowLeft size={16} /> Sunucu Seçimine Dön
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
              Canlı PvP Savaşları, Oyuncu Arama ve Güncel Lonca Sıralaması
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(0,0,0,0.4)", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase" }}>Son Yüklenen Savaşlar</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2ecc71" }}>{initialKills.length} Canlı Maç</div>
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
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder={`${serverInfo.name} sunucusunda Oyuncu veya Lonca ara...`}
            style={{
              width: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(252, 163, 17, 0.4)",
              borderRadius: "10px",
              padding: "0.9rem 1.2rem 0.9rem 3rem",
              color: "#fff",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
          <Search size={18} color="#fca311" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />

          {isSearching && (
            <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#fca311" }}>
              <Loader2 className="animate-spin" size={18} />
            </div>
          )}

          {/* Search Dropdown */}
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
              {searchResults.players && searchResults.players.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#2ecc71", textTransform: "uppercase" }}>
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
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
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

              {searchResults.guilds && searchResults.guilds.length > 0 && (
                <div>
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.4)", fontSize: "0.75rem", fontWeight: "bold", color: "#e74c3c", textTransform: "uppercase" }}>
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
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
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
            </div>
          )}
        </div>
      </div>

      {/* Kills List */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Swords size={22} style={{ color: "#e74c3c" }} />
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>
            {serverInfo.name} Canlı Son Savaşlar
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
            Bu sunucu için henüz canlı veri bulunamadı.
          </div>
        )}
      </div>

      <CtaBanner />
    </div>
  );
}
