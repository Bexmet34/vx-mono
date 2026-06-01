import React from 'react';
import { Layout } from "lucide-react";
import SaveButton from './SaveButton';

export default function GeneralTab({ t, settings, setSettings, handleSave, saving }) {
  return (
    <div className="dash-section-card animate-fade-in">
      <h2 className="section-title"><Layout size={22}/> {t.dGeneral}</h2>
      <p className="dash-hint" style={{marginBottom: '2rem'}}>{t.dGeneralDesc}</p>
      
      <div className="dash-input-group">
        <label className="dash-label">{t.dBotLang}</label>
        <select className="dash-select" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
        <p className="dash-hint">{t.dBotLangDesc}</p>
      </div>

      <div className="dash-input-group">
        <label className="dash-label">{t.dGuildId}</label>
        <input type="text" className="dash-input" placeholder="Guild ID (e.g. 7q...)" value={settings.albion_guild_id} onChange={(e) => setSettings({ ...settings, albion_guild_id: e.target.value })} />
        <p className="dash-hint">{t.dGuildIdDesc}</p>
      </div>

      <div className="dash-input-group" style={{marginTop: '2rem'}}>
         <label className="dash-label" style={{display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--dash-border)', transition: 'all 0.2s'}}>
            <input type="checkbox" style={{width: '22px', height: '22px', accentColor: 'var(--dash-accent)'}} checked={settings.auto_role_sync} onChange={(e) => setSettings({ ...settings, auto_role_sync: e.target.checked })} />
            <div>
              <div style={{fontWeight: '700', fontSize: '1.1rem'}}>{t.dAutoRole}</div>
              <p className="dash-hint" style={{margin: 0}}>{t.dAutoRoleDesc}</p>
            </div>
         </label>
      </div>
      
      <SaveButton onClick={handleSave} saving={saving} t={t} />
    </div>
  );
}
