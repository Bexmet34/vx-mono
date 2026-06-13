"use client";

import { Search, Loader2, Sword, Send, Eye, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function KillBoardTab({ 
  t, 
  lang, 
  settings, 
  setSettings, 
  discordChannels, 
  killboardPreview, 
  loadingPreview, 
  handlePreviewKillBoard, 
  handleTriggerKillBoard, 
  triggeringKillBoard,
  setActiveTab
}) {



  return (
    <div className="bentoGrid">
      {/* Search & Select Guild - Moved to General */}
      {/* Search & Select Guild - Moved to General */}
      {!settings.albion_guild_id && (
        <div className="bentoBox span12" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="bentoTitle" style={{ color: '#ef4444', marginBottom: '0.5rem' }}><ShieldAlert /> {lang === 'en' ? 'Action Required' : 'İşlem Gerekiyor'}</h2>
            <p style={{ margin: 0 }}>{lang === 'en' ? 'Please select an Albion Guild in the General settings before using the KillBoard.' : 'KillBoard kullanmadan önce lütfen Genel ayarlardan bir Albion Loncası seçin.'}</p>
          </div>
          <button onClick={() => setActiveTab('general')} style={{ padding: '0.6rem 1.2rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, marginLeft: '1rem' }}>
            {lang === 'en' ? 'Go to General Settings' : 'Genel Ayarlara Git'}
          </button>
        </div>
      )}

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
                    <span style={{ color: '#ccc' }}>
                      {['🥇', '🥈', '🥉'][i] || '🏅'} <a href={`https://albiononline.com/en/killboard/player/${k.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ccc', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#ccc'}>{k.name}</a>
                    </span>
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
                    <span style={{ color: '#ccc' }}>
                      {['🥇', '🥈', '🥉'][i] || '🏅'} <a href={`https://albiononline.com/en/killboard/player/${d.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ccc', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#ccc'}>{d.name}</a>
                    </span>
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
