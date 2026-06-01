import React from 'react';
import { Sword, Search, Loader2, X, Plus, Clock, Hash } from "lucide-react";
import SaveButton from './SaveButton';

export default function KillBoardTab({ 
  t, lang, settings, setSettings, discordChannels, 
  guildSearchQuery, setGuildSearchQuery, searchGuilds, searchingGuild, guildSearchResults,
  guildDetail, setGuildDetail, killboardPreview, loadingPreview, handlePreviewKillBoard,
  handleTriggerKillBoard, triggeringKillBoard, handleSave, saving 
}) {
  return (
    <div className="dash-section-card animate-fade-in">
      <h2 className="section-title"><Sword size={22}/> {lang === "en" ? "KillBoard Configuration" : "KillBoard Ayarları"}</h2>
      <p className="dash-hint">Loncanızın günlük PvP faaliyetlerini otomatik olarak belirli bir kanalda paylaşın.</p>

      <div className="dash-grid-2" style={{marginTop: '2rem'}}>
        <div className="glass-panel" style={{padding: '2rem', borderRadius: '16px'}}>
          <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Search size={20} color="var(--dash-accent)" /> {lang === "en" ? "Step 1: Link Your Guild" : "1. Adım: Loncanızı Bağlayın"}
          </h3>
          
          {settings.albion_guild_id ? (
            <div style={{background: 'rgba(255,255,255, 0.03)', border: '1px solid var(--dash-accent)', padding: '1.5rem', borderRadius: '14px', position: 'relative', overflow: 'hidden'}}>
              <div style={{position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05}}><Sword size={120} /></div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, position: 'relative'}}>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--dash-accent)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.25rem'}}>Bağlı Lonca</div>
                  <div style={{fontSize: '1.4rem', fontWeight: '800'}}>{settings.albion_guild_name}</div>
                </div>
                <button onClick={() => { setSettings(prev => ({...prev, albion_guild_id: "", albion_guild_name: ""})); setGuildDetail(null); }} className="btn-remove-icon"><X size={24} /></button>
              </div>
              {guildDetail ? (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem', zIndex: 1, position: 'relative'}}>
                  <div style={{background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.6rem 0.8rem'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--dash-text-muted)'}}>Kurucu</div>
                    <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{guildDetail.FounderName || 'Bilinmiyor'}</div>
                  </div>
                  <div style={{background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.6rem 0.8rem'}}>
                    <div style={{fontSize: '0.7rem', color: 'var(--dash-text-muted)'}}>Üye Sayısı</div>
                    <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{guildDetail.MemberCount || '?'} üye</div>
                  </div>
                  {guildDetail.AllianceName && (
                    <div style={{background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.6rem 0.8rem', gridColumn: '1 / -1'}}>
                      <div style={{fontSize: '0.7rem', color: 'var(--dash-text-muted)'}}>İttifak</div>
                      <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{guildDetail.AllianceTag ? `[${guildDetail.AllianceTag}] ` : ''}{guildDetail.AllianceName}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--dash-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Loader2 size={14} className="spin" /> Lonca bilgileri yükleniyor...
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                <input type="text" className="dash-input" placeholder="Lonca adı yazın..." value={guildSearchQuery} onChange={(e) => setGuildSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchGuilds()} />
                <button onClick={searchGuilds} className="btn-primary" style={{padding: '0 1.5rem'}} disabled={searchingGuild}>
                  {searchingGuild ? <Loader2 size={20} className="spin" /> : <Search size={20} />}
                </button>
              </div>
              
              <div style={{maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--dash-border)'}}>
                {guildSearchResults.length > 0 ? guildSearchResults.map(g => (
                  <button key={g.Id} onClick={() => setSettings(prev => ({...prev, albion_guild_id: g.Id, albion_guild_name: g.Name}))} className="sidebar-item" style={{justifyContent: 'space-between', borderBottom: '1px solid var(--dash-border)', borderRadius: 0, padding: '1.25rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '800', fontSize: '1.05rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        {g.AllianceTag && <span style={{color: 'var(--dash-accent)', fontSize: '0.85rem'}}>[{g.AllianceTag}]</span>}
                        {g.Name}
                      </div>
                      <div style={{fontSize: '0.75rem', color: 'var(--dash-text-muted)', marginTop: '0.2rem', display: 'flex', gap: '1rem'}}>
                        <span>🛡️ {g.AllianceName || 'No Alliance'}</span>
                        {g.KillFame > 0 && <span>⚔️ {(g.KillFame / 1000000).toFixed(1)}M Fame</span>}
                      </div>
                    </div>
                    <div style={{background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px'}}>
                       <Plus size={18} color="var(--dash-accent)" />
                    </div>
                  </button>
                )) : (
                  <div style={{padding: '2rem', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.9rem'}}>
                    {guildSearchQuery.length < 3 ? "Aramak için en az 3 harf yazın." : "Sonuç bulunamadı."}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="glass-panel" style={{padding: '2rem', borderRadius: '16px'}}>
          <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Clock size={20} color="var(--dash-accent)" /> {lang === "en" ? "Step 2: Notification Info" : "2. Adım: Bildirim Ayarları"}
          </h3>

          <div className="dash-input-group">
            <label className="dash-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Hash size={16}/> Bildirim Kanalı</label>
            <select className="dash-select" value={settings.killboard_channel_id} onChange={(e) => setSettings({ ...settings, killboard_channel_id: e.target.value })}>
              <option value="">Kanal Seçin...</option>
              {discordChannels.filter(c => c.type === 0).map(ch => (
                <option key={ch.id} value={ch.id}># {ch.name}</option>
              ))}
            </select>
          </div>

          <div className="dash-input-group" style={{marginTop: '1.5rem'}}>
            <label className="dash-label" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Clock size={16}/> Özet Gönderim Saati (UTC)</label>
            <input type="time" className="dash-input" value={settings.killboard_time} onChange={(e) => setSettings({ ...settings, killboard_time: e.target.value })} />
            <p className="dash-hint">Varsayılan: 06:00 UTC (Sabah). Günlük istatistiklerin sıfırlanma vaktidir.</p>
          </div>

          <div style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--dash-border)'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
              <h4 style={{fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Sword size={18} color="var(--dash-accent)" /> Canlı Veri Önizleme</h4>
              <button onClick={handlePreviewKillBoard} className="btn-secondary" disabled={loadingPreview || !settings.albion_guild_id} style={{padding: '0.5rem 1.25rem', fontSize: '0.85rem'}}>
                {loadingPreview ? <><Loader2 size={16} className="spin" /> Çekiliyor...</> : <><Search size={16} /> Veriyi Çek</>}
              </button>
            </div>

            {killboardPreview && (
              <div style={{display: 'grid', gap: '1rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                  <div style={{background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '12px', padding: '1rem', textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: '900', color: '#2ecc71'}}>{killboardPreview.totalKills}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--dash-text-muted)'}}>⚔️ Toplam Kill</div>
                  </div>
                  <div style={{background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '12px', padding: '1rem', textAlign: 'center'}}>
                    <div style={{fontSize: '2rem', fontWeight: '900', color: '#e74c3c'}}>{killboardPreview.totalDeaths}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--dash-text-muted)'}}>💀 Toplam Ölüm</div>
                  </div>
                </div>
                {/* Simplified list logic for the component */}
                {killboardPreview.totalKills === 0 && killboardPreview.totalDeaths === 0 && (
                  <div style={{textAlign: 'center', padding: '1.5rem', color: 'var(--dash-text-muted)'}}>😴 Son 24 saatte aktivite bulunamadı.</div>
                )}
              </div>
            )}
          </div>

          <div style={{marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--dash-border)'}}>
            <button 
              onClick={handleTriggerKillBoard} 
              className="btn-primary" 
              disabled={triggeringKillBoard}
              style={{width: '100%', background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'}}
            >
              {triggeringKillBoard ? <Loader2 size={20} className="spin" /> : <Sword size={20} />}
              <span>{triggeringKillBoard ? (lang === "en" ? "Sending..." : "Gönderiliyor...") : (lang === "en" ? "Send Summary Now" : "Özeti Şimdi Gönder")}</span>
            </button>
          </div>
        </div>
      </div>
      <SaveButton onClick={handleSave} saving={saving} t={t} />
    </div>
  );
}
