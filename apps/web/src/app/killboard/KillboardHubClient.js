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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-32 text-white">
      
      {/* Hero Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container text-xs font-label-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
          <Sparkles size={14} /> 
          <span>{isTr ? "CANLI ALBION ONLINE PVP KILLBOARD PORTALI" : "LIVE ALBION ONLINE PVP KILLBOARD PORTAL"}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-yellow-200 to-primary-container bg-clip-text text-transparent mb-3">
          {isTr ? "Oyuncu veya Lonca Arayın" : "Search Player or Guild"}
        </h1>

        <p className="text-on-surface-variant text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
          {isTr 
            ? "Albion Online Avrupa, Amerika ve Asya sunucularındaki oyuncuları arayın, lonca sıralamalarını inceleyin."
            : "Search players and inspect guild rankings across Albion Europe, Americas, and Asia servers."}
        </p>
      </div>

      {/* 1. Interactive Search Section */}
      <div className="bg-[#12121a]/90 border border-primary-container/30 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-2">
          <Search size={18} className="text-primary-container" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {isTr ? "Oyuncu veya Lonca Arama" : "Search Player or Guild"} <span className="text-primary-container">({currentServerObj.name})</span>
          </h3>
        </div>

        <p className="text-on-surface-variant text-xs sm:text-sm mb-4 sm:mb-6 font-light">
          {isTr 
            ? "Seçili sunucudaki herhangi bir oyuncunun veya loncanın ismini girerek istatistiklerine ulaşın."
            : "Enter any player or guild name on the selected server to view stats."}
        </p>

        <form onSubmit={handleFormSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder={isTr ? "Oyuncu veya lonca adı yazın..." : "Type player or guild name..."}
                className={`w-full bg-black/60 border ${searchError ? 'border-error/60' : 'border-primary-container/40 focus:border-primary-container'} rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder:text-on-surface-variant/50 outline-none transition-all shadow-inner`}
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-container" />

              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-container">
                  <Loader2 className="animate-spin" size={16} />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-primary-container text-on-primary font-bold px-6 py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 tactical-glow touch-manipulation"
            >
              <Search size={15} /> 
              <span>{isTr ? "Ara" : "Search"}</span>
            </button>
          </div>

          {/* Inline Error Message when not found */}
          {searchError && !isSearching && (
            <div className="mt-3 p-3 bg-error/15 border border-error/40 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Search Dropdown Results */}
          {searchResults && (searchResults.players?.length > 0 || searchResults.guilds?.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#151720] border border-outline-variant/40 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-white/5">
              {/* Players List */}
              {searchResults.players && searchResults.players.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-black/40 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    👤 {isTr ? "Oyuncular" : "Players"} ({searchResults.players.length})
                  </div>
                  {searchResults.players.slice(0, 6).map((p) => (
                    <div
                      key={p.Id}
                      onClick={() => handleSelectResult("player", p.Id)}
                      className="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <User size={16} className="text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-white font-bold text-xs sm:text-sm truncate">{p.Name}</div>
                          {p.GuildName && <div className="text-on-surface-variant text-[11px] truncate">[{p.AllianceName || ''}] {p.GuildName}</div>}
                        </div>
                      </div>
                      <span className="text-xs text-primary-container font-bold shrink-0 ml-2">{isTr ? "İncele" : "Inspect"} →</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Guilds List */}
              {searchResults.guilds && searchResults.guilds.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-black/40 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    🛡️ {isTr ? "Loncaya (Guild) Göre" : "Guilds"} ({searchResults.guilds.length})
                  </div>
                  {searchResults.guilds.slice(0, 6).map((g) => (
                    <div
                      key={g.Id}
                      onClick={() => handleSelectResult("guild", g.Id)}
                      className="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Shield size={16} className="text-red-400 shrink-0" />
                        <div className="truncate">
                          <div className="text-white font-bold text-xs sm:text-sm truncate">{g.Name}</div>
                          {g.AllianceName && <div className="text-on-surface-variant text-[11px] truncate">[{g.AllianceName}]</div>}
                        </div>
                      </div>
                      <span className="text-xs text-primary-container font-bold shrink-0 ml-2">{isTr ? "İncele" : "Inspect"} →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* 2. 3 Server Cards Section */}
      <div className="mb-4">
        <h3 className="text-sm sm:text-base font-bold text-on-surface-variant uppercase tracking-wider">
          🌐 {isTr ? "Veyronix Sunucu Portalları" : "Veyronix Server Portals"}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {SERVERS.map((server) => {
          const isSelected = selectedServer === server.id;

          return (
            <div
              key={server.id}
              onClick={() => {
                setSelectedServer(server.id);
                setSearchError("");
              }}
              className={`rounded-2xl p-5 sm:p-6 cursor-pointer relative transition-all duration-300 flex flex-col justify-between ${
                isSelected 
                  ? 'bg-gradient-to-b from-[#191923] to-[#0f0f16] border-2 border-primary-container shadow-[0_0_30px_rgba(255,215,0,0.15)] scale-[1.02]' 
                  : 'bg-[#12121a]/70 border border-outline-variant/30 hover:border-primary-container/40 hover:bg-[#12121a]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl sm:text-4xl">{server.flag}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'bg-primary-container text-on-primary font-extrabold' : 'bg-white/10 text-on-surface-variant'
                  }`}>
                    {server.code} API
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {server.name}
                </h2>

                <p className="text-on-surface-variant text-xs leading-relaxed mb-6 font-light">
                  {server.desc}
                </p>
              </div>

              <div className="mt-auto">
                <Link
                  href={`/killboard/${server.id}`}
                  className={`w-full py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-95 ${
                    isSelected ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-white/10 text-white hover:bg-primary-container hover:text-on-primary'
                  }`}
                >
                  <span>{server.name} {isTr ? "Portalı" : "Portal"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
