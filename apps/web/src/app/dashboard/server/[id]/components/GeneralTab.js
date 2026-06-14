"use client";

import { Layout, Search, Loader2, Sword } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useLanguage } from "@/context/LanguageContext";

export default function GeneralTab({ 
  t, settings, setSettings, 
  guildSearchQuery, setGuildSearchQuery, 
  searchGuilds, searchingGuild, 
  guildSearchResults, setGuildSearchResults, 
  guildDetail, setGuildDetail 
}) {
  const { lang } = useLanguage();

  const handleSelectGuild = (guild) => {
    setSettings({ ...settings, albion_guild_id: guild.Id, albion_guild_name: guild.Name });
    setGuildDetail(guild);
    setGuildSearchResults([]);
    setGuildSearchQuery("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 animate-slide-up">
      <div className="glass-panel p-8 relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-2xl text-on-surface mb-6 flex items-center gap-3 uppercase tracking-tight"><Layout className="text-primary-container" /> {t.dGeneral}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {t.dLangLabel}
              <InfoTooltip text={lang === 'en' ? 'Determines the main language the bot uses when sending messages in your server.' : 'Botun sunucunuzda mesaj atarken kullanacağı ana dili belirler.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.language || "tr"}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search & Select Guild - Moved from Killboard */}
      <div className="glass-panel p-8 relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-2xl text-on-surface mb-2 flex items-center gap-3 uppercase tracking-tight">
          <Sword className="text-primary-container" /> Albion Guild Configuration
          <InfoTooltip text={lang === 'en' ? 'Search and link your Albion Online Guild. This is required for Killboard and Auto-Check features to work globally.' : 'Albion Online Loncanızı arayıp bağlayın. Killboard ve Otomatik Kontrol özelliklerinin çalışması için bu zorunludur.'} />
        </h2>
        <p className="font-body-md text-on-surface-variant mb-6">Search and link your Albion Online Guild to be used globally across all features.</p>

        {settings.albion_guild_id && guildDetail ? (
          <div className="bg-primary-container/5 border border-primary-container/50 rounded-sm p-6 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div>
               <div className="text-xs font-label-bold text-primary-container uppercase tracking-widest mb-1">Active Guild</div>
               <div className="text-2xl font-headline-lg text-on-surface">
                 {guildDetail.AllianceTag ? `[${guildDetail.AllianceTag}] ` : ''}{guildDetail.Name}
               </div>
               <div className="text-sm font-body-md text-on-surface-variant mt-1">
                 Leader: <span className="text-on-surface">{guildDetail.FounderName || 'Unknown'}</span> &bull; Members: <span className="text-on-surface">{guildDetail.MemberCount || 0}</span>
               </div>
             </div>
             <button className="px-6 py-2 bg-error/10 text-error border border-error/50 hover:bg-error hover:text-on-error rounded-sm font-label-bold uppercase tracking-widest transition-colors" onClick={() => {
                setSettings({ ...settings, albion_guild_id: "", albion_guild_name: "" });
                setGuildDetail(null);
             }}>
               Disconnect
             </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                className="flex-1 bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
                placeholder="Enter Albion Guild Name..."
                value={guildSearchQuery}
                onChange={(e) => setGuildSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchGuilds()}
              />
              <button className="px-6 py-3 bg-surface-container-highest border border-outline-variant text-on-surface hover:text-primary-container hover:border-primary-container rounded-sm transition-colors disabled:opacity-50" onClick={searchGuilds} disabled={searchingGuild || guildSearchQuery.length < 3}>
                {searchingGuild ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              </button>
            </div>

            {guildSearchResults.length > 0 && (
              <div className="bg-surface-container border border-outline-variant rounded-sm p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {guildSearchResults.map(g => (
                  <div key={g.Id} className="flex flex-col p-3 hover:bg-white/5 cursor-pointer border-b border-outline-variant/30 last:border-0 transition-colors" onClick={() => handleSelectGuild(g)}>
                    <div className="font-label-bold text-on-surface">{g.Name}</div>
                    <div className="text-xs font-body-md text-on-surface-variant mt-1">
                      Kill Fame: {g.KillFame ? g.KillFame.toLocaleString() : 0} &bull; Death Fame: {g.DeathFame ? g.DeathFame.toLocaleString() : 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
