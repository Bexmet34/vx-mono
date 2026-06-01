import React from 'react';
import { Users, Search, Shield, X, Plus } from "lucide-react";
import SaveButton from './SaveButton';

export default function WhitelistTab({ t, settings, setSettings, whitelistAddTab, setWhitelistAddTab, searchQuery, setSearchQuery, discordRoles, discordMembers, removeWhitelistId, handleSave, saving }) {
  return (
    <div className="dash-section-card animate-fade-in">
      <h2 className="section-title"><Users size={22}/> {t.dAccess}</h2>
      <p className="dash-hint">
        Parti limitlerini aşmasına izin verilen özel rolleri veya kullanıcıları belirleyin.
      </p>

      <div className="dash-grid-2" style={{marginTop: '2.5rem'}}>
         <div className="wl-picker-container">
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '12px'}}>
               <button className={`tab-mini ${whitelistAddTab === 'roles' ? 'active' : ''}`} onClick={() => setWhitelistAddTab('roles')} style={{flex: 1, padding: '0.85rem', borderRadius: '10px', background: whitelistAddTab === 'roles' ? 'var(--dash-accent-muted)' : 'transparent', color: whitelistAddTab === 'roles' ? 'var(--dash-accent)' : 'var(--dash-text-muted)', border: 'none', fontWeight: '700'}}>Roller</button>
               <button className={`tab-mini ${whitelistAddTab === 'users' ? 'active' : ''}`} onClick={() => setWhitelistAddTab('users')} style={{flex: 1, padding: '0.85rem', borderRadius: '10px', background: whitelistAddTab === 'users' ? 'var(--dash-accent-muted)' : 'transparent', color: whitelistAddTab === 'users' ? 'var(--dash-accent)' : 'var(--dash-text-muted)', border: 'none', fontWeight: '700'}}>Üyeler</button>
            </div>

            <div className="wl-search-box">
               <Search size={18} />
               <input type="text" placeholder={whitelistAddTab === 'roles' ? "Rol ara..." : "Üye ara..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="wl-picker-list">
               {whitelistAddTab === 'roles' ? (
                  discordRoles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !settings.whitelist.includes(r.id)).map(role => (
                    <div key={role.id} className="wl-picker-item">
                       <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                          <div style={{width: '10px', height: '10px', borderRadius: '50%', background: role.color ? `#${role.color.toString(16)}` : 'var(--dash-accent)'}} />
                          <span>{role.name}</span>
                       </div>
                       <button onClick={() => setSettings({...settings, whitelist: [...settings.whitelist, role.id]})} className="btn-add-mini"><Plus size={16} /></button>
                    </div>
                  ))
               ) : (
                  discordMembers.filter(m => m.user.username.toLowerCase().includes(searchQuery.toLowerCase()) && !settings.whitelist.includes(m.user.id)).map(member => (
                    <div key={member.user.id} className="wl-picker-item">
                       <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                          <img src={member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} style={{width: '24px', height: '24px', borderRadius: '50%'}} alt="" />
                          <span>{member.user.username}</span>
                       </div>
                       <button onClick={() => setSettings({...settings, whitelist: [...settings.whitelist, member.user.id]})} className="btn-add-mini"><Plus size={16} /></button>
                    </div>
                  ))
               )}
            </div>
         </div>

         <div className="wl-active-container">
            <label className="dash-label" style={{marginBottom: '1.5rem', display: 'block'}}>Aktif Yetkililer ({settings.whitelist.length})</label>
            <div className="whitelist-grid">
               {settings.whitelist.length === 0 ? (
                 <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--dash-text-muted)'}}>Henüz kimse eklenmedi.</div>
               ) : settings.whitelist.map(id => {
                  const role = discordRoles.find(r => r.id === id);
                  const member = discordMembers.find(m => m.user.id === id);
                  return (
                    <div key={id} className="wl-card-mini">
                       <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden'}}>
                          {role ? <Shield size={16} color="var(--dash-accent)" /> : <Users size={16} />}
                          <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem', fontWeight: '600'}}>{role?.name || member?.user?.username || 'Bilinmeyen'}</span>
                       </div>
                       <button onClick={() => removeWhitelistId(id)} className="btn-remove-mini"><X size={14} /></button>
                    </div>
                  );
               })}
            </div>
         </div>
      </div>
      <SaveButton onClick={handleSave} saving={saving} t={t} />
    </div>
  );
}
