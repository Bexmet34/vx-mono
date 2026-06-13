"use client";

import { Layout, Search, Loader2, Sword } from "lucide-react";

export default function GeneralTab({ 
  t, settings, setSettings, 
  guildSearchQuery, setGuildSearchQuery, 
  searchGuilds, searchingGuild, 
  guildSearchResults, setGuildSearchResults, 
  guildDetail, setGuildDetail 
}) {
  const handleSelectGuild = (guild) => {
    setSettings({ ...settings, albion_guild_id: guild.Id, albion_guild_name: guild.Name });
    setGuildDetail(guild);
    setGuildSearchResults([]);
    setGuildSearchQuery("");
  };

  return (
    <div className="bentoGrid">
      <div className="bentoBox span12">
        <h2 className="bentoTitle"><Layout /> {t.dGeneral}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="inputGroup">
            <label className="label">{t.dLangLabel}</label>
            <select
              className="select"
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
      <div className="bentoBox span12">
        <h2 className="bentoTitle"><Sword /> Albion Guild Configuration</h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>Search and link your Albion Online Guild to be used globally across all features.</p>

        {settings.albion_guild_id && guildDetail ? (
          <div style={{ background: 'rgba(252, 163, 17, 0.1)', border: '1px solid var(--accent-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div>
               <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Guild</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                 {guildDetail.AllianceTag ? `[${guildDetail.AllianceTag}] ` : ''}{guildDetail.Name}
               </div>
               <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                 Leader: <span style={{color: '#fff'}}>{guildDetail.FounderName || 'Unknown'}</span> &bull; Members: <span style={{color: '#fff'}}>{guildDetail.MemberCount || 0}</span>
               </div>
             </div>
             <button className="dockItem" style={{ color: '#ef4444', padding: '0.5rem 1rem' }} onClick={() => {
                setSettings({ ...settings, albion_guild_id: "", albion_guild_name: "" });
                setGuildDetail(null);
             }}>
               Disconnect
             </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Enter Albion Guild Name..."
                value={guildSearchQuery}
                onChange={(e) => setGuildSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchGuilds()}
              />
              <button className="dockItem" style={{ background: '#fff', color: '#000', borderRadius: '8px' }} onClick={searchGuilds} disabled={searchingGuild || guildSearchQuery.length < 3}>
                {searchingGuild ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
              </button>
            </div>

            {guildSearchResults.length > 0 && (
              <div style={{ background: '#000', borderRadius: '12px', padding: '0.5rem', maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                {guildSearchResults.map(g => (
                  <div key={g.Id} className="listItem" style={{ cursor: 'pointer', marginBottom: '0.25rem' }} onClick={() => handleSelectGuild(g)}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{g.Name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Kill Fame: {g.KillFame ? g.KillFame.toLocaleString() : 0} &bull; Death Fame: {g.DeathFame ? g.DeathFame.toLocaleString() : 0}
                      </div>
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
