"use client";

import { Search, Loader2, Sword, Send, Eye, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function KillBoardTab({ 
  t, 
  lang, 
  settings, 
  setSettings, 
  discordChannels, 
  guildSearchQuery, 
  setGuildSearchQuery, 
  searchGuilds, 
  searchingGuild, 
  guildSearchResults, 
  setGuildSearchResults,
  guildDetail, 
  setGuildDetail, 
  killboardPreview, 
  loadingPreview, 
  handlePreviewKillBoard, 
  handleTriggerKillBoard, 
  triggeringKillBoard 
}) {

  const handleSelectGuild = (guild) => {
    setSettings({ ...settings, albion_guild_id: guild.Id, albion_guild_name: guild.Name });
    setGuildDetail(guild);
    setGuildSearchResults([]);
    setGuildSearchQuery("");
  };

  return (
    <div className="bentoGrid">
      {/* Search & Select Guild */}
      <div className="bentoBox span6">
        <h2 className="bentoTitle"><Sword /> Albion Guild Configuration</h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>Search and link your Albion Online Guild to fetch KillBoard stats.</p>

        {settings.albion_guild_id && guildDetail ? (
          <div style={{ background: 'rgba(252, 163, 17, 0.1)', border: '1px solid var(--accent-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div>
               <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Guild</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                 {guildDetail.AllianceTag ? `[${guildDetail.AllianceTag}] ` : ''}{guildDetail.Name}
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
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>Alliance: {g.AllianceTag || 'None'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KillBoard Settings & Triggers */}
      <div className="bentoBox span6">
        <h2 className="bentoTitle"><Send /> Discord Integration</h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>Where and when should the KillBoard report be posted?</p>

        <div className="inputGroup">
          <label className="label">Target Channel</label>
          <select 
            className="select" 
            value={settings.killboard_channel_id || ""}
            onChange={(e) => setSettings({ ...settings, killboard_channel_id: e.target.value })}
          >
            <option value="">-- Select a Channel --</option>
            {discordChannels.filter(c => c.type === 0).map(c => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">Daily Post Time (UTC)</label>
          <input 
            type="time" 
            className="input" 
            value={settings.killboard_time || "06:00"}
            onChange={(e) => setSettings({ ...settings, killboard_time: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
           <button className="dockItem" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }} onClick={handlePreviewKillBoard} disabled={!settings.albion_guild_id || loadingPreview}>
              {loadingPreview ? <Loader2 size={18} className="spin"/> : <Eye size={18}/>} 
              Preview Data
           </button>
           <button className="dockItem" style={{ flex: 1, justifyContent: 'center', background: 'var(--accent-color)', color: '#000' }} onClick={handleTriggerKillBoard} disabled={!settings.albion_guild_id || !settings.killboard_channel_id || triggeringKillBoard}>
              {triggeringKillBoard ? <Loader2 size={18} className="spin"/> : <ShieldAlert size={18}/>} 
              Trigger Now
           </button>
        </div>
      </div>

      {/* Preview Section */}
      {killboardPreview && (
        <div className="bentoBox span12" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
          <h2 className="bentoTitle">Daily Summary Preview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
             <div style={{ background: '#000', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Kills</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>{killboardPreview.total_kills}</div>
             </div>
             <div style={{ background: '#000', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Deaths</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>{killboardPreview.total_deaths}</div>
             </div>
             <div style={{ background: '#000', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Kill Fame</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-color)' }}>{killboardPreview.total_kill_fame.toLocaleString()}</div>
             </div>
          </div>
          
          <p className="hint">Note: This is just a numerical preview. The actual Discord post will include an elegant embed with player leaderboards.</p>
        </div>
      )}
    </div>
  );
}
