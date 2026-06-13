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
    <div className="grid grid-cols-1 gap-6 animate-slide-up">
      {/* Search & Select Guild - Moved to General */}
      {!settings.albion_guild_id && (
        <div className="glass-panel p-6 relative overflow-hidden border border-error/50 bg-error/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-xl text-error mb-2 flex items-center gap-3 uppercase tracking-tight"><ShieldAlert /> {lang === 'en' ? 'Action Required' : 'İşlem Gerekiyor'}</h2>
            <p className="font-body-md text-error/80">{lang === 'en' ? 'Please select an Albion Guild in the General settings before using the KillBoard.' : 'KillBoard kullanmadan önce lütfen Genel ayarlardan bir Albion Loncası seçin.'}</p>
          </div>
          <button onClick={() => setActiveTab('general')} className="px-6 py-3 bg-error hover:bg-error/80 text-white border border-error rounded-sm font-label-bold uppercase tracking-widest transition-colors whitespace-nowrap">
            {lang === 'en' ? 'Go to General Settings' : 'Genel Ayarlara Git'}
          </button>
        </div>
      )}

      {/* KillBoard Settings & Triggers */}
      <div className={`glass-panel p-8 relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-all ${!settings.albion_guild_id ? 'opacity-40 pointer-events-none' : ''}`}>
        <h2 className="font-headline-lg text-2xl text-on-surface mb-2 flex items-center gap-3 uppercase tracking-tight"><Send className="text-primary-container" /> Discord Integration</h2>
        <p className="font-body-md text-on-surface-variant mb-6">Where and when should the KillBoard report be posted?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">Target Channel</label>
            <select 
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
              value={settings.killboard_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, killboard_channel_id: e.target.value })}
            >
              <option value="">-- Select a Channel --</option>
              {discordChannels.filter(c => c.type === 0).map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">Daily Post Time (UTC)</label>
            <input 
              type="time" 
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
              value={settings.killboard_time || "06:00"}
              onChange={(e) => setSettings({ ...settings, killboard_time: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
           <button className="flex-1 px-6 py-3 bg-surface-container border border-outline-variant text-on-surface hover:text-primary-container hover:border-primary-container rounded-sm font-label-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50" onClick={handlePreviewKillBoard} disabled={!settings.albion_guild_id || loadingPreview || triggeringKillBoard}>
              {loadingPreview ? <Loader2 size={18} className="animate-spin"/> : <Eye size={18}/>} 
              Preview Data
           </button>
           <button className="flex-1 px-6 py-3 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50" onClick={handleTriggerKillBoard} disabled={!settings.albion_guild_id || !settings.killboard_channel_id || triggeringKillBoard || loadingPreview}>
              {triggeringKillBoard ? <Loader2 size={18} className="animate-spin"/> : <ShieldAlert size={18}/>} 
              Trigger Now
           </button>
        </div>
      </div>

      {/* Preview Section */}
      {killboardPreview && (
        <div className="glass-panel p-8 relative overflow-hidden border border-primary-container/30 animate-slide-up">
          <h2 className="font-headline-lg text-2xl text-on-surface mb-6 uppercase tracking-tight">Daily Summary Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <div className="bg-surface-container-lowest border border-outline-variant rounded-sm p-6 text-center">
               <div className="text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Kills</div>
               <div className="text-4xl font-headline-xl text-success">{killboardPreview.totalKills || 0}</div>
             </div>
             <div className="bg-surface-container-lowest border border-outline-variant rounded-sm p-6 text-center">
               <div className="text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Deaths</div>
               <div className="text-4xl font-headline-xl text-error">{killboardPreview.totalDeaths || 0}</div>
             </div>
             <div className="bg-surface-container-lowest border border-outline-variant rounded-sm p-6 text-center">
               <div className="text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">Kill Fame</div>
               <div className="text-4xl font-headline-xl text-primary-container">{(killboardPreview.totalKillFame || 0).toLocaleString()}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-sm p-6">
              <h3 className="font-headline-md text-lg text-on-surface mb-4 pb-2 border-b border-outline-variant/50 uppercase tracking-tight">⚔️ Top Killers</h3>
              {killboardPreview.topKillers && killboardPreview.topKillers.length > 0 ? (
                killboardPreview.topKillers.map((k, i) => (
                  <div key={k.name} className="flex justify-between items-center mb-2 font-body-md">
                    <span className="text-on-surface-variant">
                      {['🥇', '🥈', '🥉'][i] || '🏅'} <a href={`https://albiononline.com/en/killboard/player/${k.id}`} target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary-container transition-colors ml-1">{k.name}</a>
                    </span>
                    <span className="font-label-bold text-success text-sm">{k.kills} Kills</span>
                  </div>
                ))
              ) : (
                <div className="text-sm font-body-md text-on-surface-variant">No kills recorded.</div>
              )}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-sm p-6">
              <h3 className="font-headline-md text-lg text-on-surface mb-4 pb-2 border-b border-outline-variant/50 uppercase tracking-tight">💀 Top Deaths</h3>
              {killboardPreview.topDeaths && killboardPreview.topDeaths.length > 0 ? (
                killboardPreview.topDeaths.map((d, i) => (
                  <div key={d.name} className="flex justify-between items-center mb-2 font-body-md">
                    <span className="text-on-surface-variant">
                      {['🥇', '🥈', '🥉'][i] || '🏅'} <a href={`https://albiononline.com/en/killboard/player/${d.id}`} target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-error transition-colors ml-1">{d.name}</a>
                    </span>
                    <span className="font-label-bold text-error text-sm">{d.deaths} Deaths</span>
                  </div>
                ))
              ) : (
                <div className="text-sm font-body-md text-on-surface-variant">No deaths recorded.</div>
              )}
            </div>
          </div>

          {killboardPreview.topFameKill && (
            <div className="bg-primary-container/5 border border-primary-container/30 rounded-sm p-6 mb-6">
              <h3 className="font-headline-md text-lg text-primary-container mb-2 uppercase tracking-tight">💰 Most Valuable Kill</h3>
              <div className="font-body-md text-on-surface text-lg">
                <span className="font-label-bold text-success">{killboardPreview.topFameKill.killer}</span> killed <span className="font-label-bold text-error">{killboardPreview.topFameKill.victim}</span>
              </div>
              <div className="font-headline-md text-primary-container mt-2">
                +{(killboardPreview.topFameKill.fame || 0).toLocaleString()} Fame
              </div>
            </div>
          )}
          
          <p className="text-xs font-body-md text-on-surface-variant">Note: This preview mirrors the actual Discord post data.</p>
        </div>
      )}
    </div>
  );
}
