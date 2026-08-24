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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-32 text-white">
      
      {/* Top Navigation & Server Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <Link 
          href="/killboard"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> 
          <span>{isTr ? "Sunucu Seçimine Dön" : "Back to Server Selection"}</span>
        </Link>

        {/* Server Switcher Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {ALL_SERVERS.map((s) => {
            const isActive = s.id === serverKey;
            return (
              <Link
                key={s.id}
                href={`/killboard/${s.id}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap inline-flex items-center gap-1.5 touch-manipulation ${
                  isActive 
                    ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.25)]' 
                    : 'bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{s.flag}</span> 
                <span>{s.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Server Header */}
      <div className="bg-gradient-to-r from-[#191923] to-[#0f0f16] border border-outline-variant/30 rounded-2xl p-5 sm:p-7 mb-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl">{serverInfo.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {serverInfo.name}
              </h1>
              <span className="bg-primary-container text-on-primary px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                {serverInfo.code}
              </span>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm mt-1 font-light">
              {isTr 
                ? "Canlı PvP Savaşları, Oyuncu Arama ve Güncel Lonca Sıralaması"
                : "Live PvP Battles, Player Search & Guild Rankings"}
            </p>
          </div>
        </div>

        <div className="bg-black/40 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-left sm:text-right shrink-0">
          <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{isTr ? "Son Savaşlar" : "Recent Battles"}</div>
          <div className="text-base sm:text-lg font-bold text-emerald-400">{initialKills.length} {isTr ? "Canlı Maç" : "Live Matches"}</div>
        </div>
      </div>

      {/* Interactive Search Field */}
      <div className="bg-[#12121a]/85 border border-outline-variant/30 rounded-2xl p-4 sm:p-6 mb-8 shadow-lg">
        <form onSubmit={handleFormSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder={isTr ? `Oyuncu veya lonca adı yazın... (${serverInfo.name})` : `Type player or guild name... (${serverInfo.name})`}
                className={`w-full bg-black/60 border ${searchError ? 'border-error/60' : 'border-primary-container/40 focus:border-primary-container'} rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder:text-on-surface-variant/50 outline-none transition-all`}
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

          {searchError && !isSearching && (
            <div className="mt-3 p-3 bg-error/15 border border-error/40 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Search Dropdown */}
          {searchResults && (searchResults.players?.length > 0 || searchResults.guilds?.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#151720] border border-outline-variant/40 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-white/5">
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

      {/* Kills List */}
      <div className="mb-12">
        <div className="flex items-center gap-2.5 mb-6">
          <Swords size={22} className="text-error" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {serverInfo.name} {isTr ? "Canlı Son Savaşlar" : "Live Recent Battles"}
          </h2>
        </div>

        {initialKills.length > 0 ? (
          <div className="space-y-4">
            {initialKills.map((kill) => (
              <KillMatch key={kill.EventId} event={kill} server={serverKey} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-high/40 rounded-2xl border border-outline-variant/30 text-on-surface-variant text-xs">
            {isTr ? "Bu sunucu için henüz canlı veri bulunamadı." : "No live battle data found for this server."}
          </div>
        )}
      </div>

      <CtaBanner />
    </div>
  );
}
