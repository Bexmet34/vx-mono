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
           <button className="dockItem" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }} onClick={handlePreviewKillBoard} disabled={!settings.albion_guild_id || loadingPreview || triggeringKillBoard}>
              {loadingPreview ? <Loader2 size={18} className="spin"/> : <Eye size={18}/>} 
              Preview Data
           </button>
           <button className="dockItem" style={{ flex: 1, justifyContent: 'center', background: 'var(--accent-color)', color: '#000' }} onClick={handleTriggerKillBoard} disabled={!settings.albion_guild_id || !settings.killboard_channel_id || triggeringKillBoard || loadingPreview}>
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
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>{killboardPreview.totalKills || 0}</div>
             </div>
             <div style={{ background: '#000', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Deaths</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>{killboardPreview.totalDeaths || 0}</div>
             </div>
             <div style={{ background: '#000', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Kill Fame</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-color)' }}>{(killboardPreview.totalKillFame || 0).toLocaleString()}</div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>⚔️ Top Killers</h3>
              {killboardPreview.topKillers && killboardPreview.topKillers.length > 0 ? (
                killboardPreview.topKillers.map((k, i) => (
                  <div key={k.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#ccc' }}>{['🥇', '🥈', '🥉'][i] || '🏅'} {k.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{k.kills} Kills</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#666', fontSize: '0.9rem' }}>No kills recorded.</div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>💀 Top Deaths</h3>
              {killboardPreview.topDeaths && killboardPreview.topDeaths.length > 0 ? (
                killboardPreview.topDeaths.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#ccc' }}>{['🥇', '🥈', '🥉'][i] || '🏅'} {d.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{d.deaths} Deaths</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#666', fontSize: '0.9rem' }}>No deaths recorded.</div>
              )}
            </div>
          </div>

          {killboardPreview.topFameKill && (
            <div style={{ background: 'rgba(252, 163, 17, 0.1)', border: '1px solid var(--accent-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>💰 Most Valuable Kill</h3>
              <div style={{ color: '#fff', fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{killboardPreview.topFameKill.killer}</span> killed <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{killboardPreview.topFameKill.victim}</span>
              </div>
              <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                +{(killboardPreview.topFameKill.fame || 0).toLocaleString()} Fame
              </div>
            </div>
          )}
          
          <p className="hint">Note: This preview mirrors the actual Discord post data.</p>
        </div>
      )}
    </div>
  );
}
