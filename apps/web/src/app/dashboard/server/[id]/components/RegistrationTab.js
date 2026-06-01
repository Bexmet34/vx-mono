import React from 'react';
import { Users, Hash, X } from "lucide-react";
import SaveButton from './SaveButton';

export default function RegistrationTab({ 
  t, lang, settings, setSettings, discordChannels, discordRoles, handleSave, saving 
}) {
  return (
    <div className="dash-section-card animate-fade-in">
      <h2 className="section-title"><Users size={22}/> {lang === "en" ? "Registration System" : "Kayıt Sistemi"}</h2>
      <p className="dash-hint">{lang === "en" ? "Manage your server registration and application workflow." : "Sunucu kayıt ve başvuru sürecinizi yönetin."}</p>

      <div className="dash-input-group" style={{marginTop: '2rem'}}>
         <label className="dash-label" style={{display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--dash-border)', transition: 'all 0.2s'}}>
            <input type="checkbox" style={{width: '22px', height: '22px', accentColor: 'var(--dash-accent)'}} checked={settings.registration_enabled} onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })} />
            <div>
              <div style={{fontWeight: '700', fontSize: '1.1rem'}}>{lang === "en" ? "Enable Registration" : "Sistemi Aktif Et"}</div>
              <p className="dash-hint" style={{margin: 0}}>{lang === "en" ? "Allow new members to apply through the registration channel." : "Yeni üyelerin kayıt kanalı üzerinden başvuru yapmasına izin verir."}</p>
            </div>
         </label>
      </div>

      <div className="dash-grid-2" style={{marginTop: '2.5rem'}}>
        <div>
          <div className="dash-input-group">
            <label className="dash-label">{lang === "en" ? "Registration Channel" : "Kayıt Kanalı"}</label>
            <select className="dash-select" value={settings.registration_channel_id} onChange={(e) => setSettings({ ...settings, registration_channel_id: e.target.value })}>
              <option value="">{lang === "en" ? "Select Channel..." : "Kanal Seçin..."}</option>
              {discordChannels.filter(c => c.type === 0).map(ch => (
                <option key={ch.id} value={ch.id}># {ch.name}</option>
              ))}
            </select>
          </div>

          <div className="dash-input-group" style={{marginTop: '1.5rem'}}>
            <label className="dash-label">{lang === "en" ? "Staff Roles" : "Yetkili Rolleri"}</label>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem'}}>
              {settings.registration_staff_role_ids?.split(',').filter(id => id).map(roleId => {
                const role = discordRoles.find(r => r.id === roleId);
                return (
                  <div key={roleId} style={{background: 'var(--dash-accent-muted)', color: 'var(--dash-accent)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    {role?.name || 'Unknown Role'}
                    <X size={14} style={{cursor: 'pointer'}} onClick={() => {
                      const newRoles = settings.registration_staff_role_ids.split(',').filter(id => id !== roleId).join(',');
                      setSettings({ ...settings, registration_staff_role_ids: newRoles });
                    }} />
                  </div>
                );
              })}
            </div>
            <select className="dash-select" value="" onChange={(e) => {
              if (!e.target.value) return;
              const current = settings.registration_staff_role_ids ? settings.registration_staff_role_ids.split(',') : [];
              if (!current.includes(e.target.value)) {
                setSettings({ ...settings, registration_staff_role_ids: [...current, e.target.value].join(',') });
              }
            }}>
              <option value="">{lang === "en" ? "Add Staff Role..." : "Yetkili Rolü Ekle..."}</option>
              {discordRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="dash-input-group">
            <label className="dash-label">{lang === "en" ? "Welcome Message" : "Karşılama Mesajı"}</label>
            <textarea 
              className="dash-textarea" 
              rows={4} 
              value={settings.registration_welcome_message} 
              onChange={(e) => setSettings({ ...settings, registration_welcome_message: e.target.value })}
              placeholder={lang === "en" ? "Welcome! Please click the button below to register." : "Hoş geldiniz! Lütfen aşağıdaki butona basarak kayıt olun."}
            />
          </div>
        </div>
      </div>
      <SaveButton onClick={handleSave} saving={saving} t={t} />
    </div>
  );
}
