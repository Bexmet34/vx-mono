"use client";

import { Users, Plus, Trash2 } from "lucide-react";

export default function WhitelistTab({ t, settings, setSettings, whitelistAddTab, setWhitelistAddTab, searchQuery, setSearchQuery, discordRoles, discordMembers, removeWhitelistId }) {
  const safeWhitelist = Array.isArray(settings?.whitelist) ? settings.whitelist : [];
  const safeSearch = (searchQuery || "").toLowerCase();

  const filteredRoles = (discordRoles || []).filter(r => 
    r?.name?.toLowerCase().includes(safeSearch) && !safeWhitelist.includes(r.id)
  );
  
  const filteredMembers = (discordMembers || []).filter(m => 
    m?.username?.toLowerCase().includes(safeSearch) && !safeWhitelist.includes(m.id)
  );

  const handleAdd = (id) => {
    if (!safeWhitelist.includes(id)) {
      setSettings(prev => ({ ...prev, whitelist: [...(Array.isArray(prev.whitelist) ? prev.whitelist : []), id] }));
      setSearchQuery("");
    }
  };

  const getEntityInfo = (id) => {
    const r = (discordRoles || []).find(r => r.id === id);
    if (r) return { name: `@${r.name}`, color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#fff', type: 'role' };
    const m = (discordMembers || []).find(m => m.id === id);
    if (m) return { name: m.username || 'Unknown', color: '#fff', type: 'user' };
    return { name: `ID: ${id}`, color: '#888', type: 'unknown' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-slide-up">
      <div className="glass-panel p-8 relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-7">
        <h2 className="font-headline-lg text-2xl text-on-surface mb-2 flex items-center gap-3 uppercase tracking-tight"><Users className="text-primary-container" /> Active Whitelist</h2>
        <p className="font-body-md text-on-surface-variant mb-6">Users or roles listed here can use restricted commands like /createparty.</p>

        {safeWhitelist.length === 0 ? (
          <div className="text-center p-12 bg-surface-container-highest border border-outline-variant rounded-sm text-on-surface-variant font-body-md">
            No whitelist entries. Everyone can use commands.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {safeWhitelist.map(id => {
              const info = getEntityInfo(id);
              return (
                <div key={id} className="flex justify-between items-center p-4 bg-surface-container border border-outline-variant rounded-sm hover:border-primary-container/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: info.color }}></div>
                    <span className="font-label-bold text-on-surface">{info.name}</span>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-sm transition-colors opacity-50 group-hover:opacity-100" onClick={() => removeWhitelistId(id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-panel p-8 relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-5">
        <h3 className="font-headline-md text-xl text-on-surface mb-6 uppercase tracking-tight">Add New Entry</h3>
        <div className="flex gap-2 mb-4 bg-surface-container-highest p-1 rounded-sm border border-outline-variant">
          <button className={`flex-1 py-2 rounded-sm font-label-bold uppercase tracking-widest text-sm transition-colors ${whitelistAddTab === 'roles' ? 'bg-primary-container text-on-primary tactical-glow' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setWhitelistAddTab('roles')}>Roles</button>
          <button className={`flex-1 py-2 rounded-sm font-label-bold uppercase tracking-widest text-sm transition-colors ${whitelistAddTab === 'users' ? 'bg-primary-container text-on-primary tactical-glow' : 'text-on-surface-variant hover:text-on-surface'}`} onClick={() => setWhitelistAddTab('users')}>Users</button>
        </div>

        <input
          type="text"
          className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md mb-4"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="bg-surface-container border border-outline-variant rounded-sm p-2 max-h-[350px] overflow-y-auto custom-scrollbar">
          {whitelistAddTab === 'roles' ? (
            filteredRoles.slice(0, 50).map(role => (
              <div key={role.id} className="flex justify-between items-center p-3 mb-1 hover:bg-white/5 rounded-sm transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#fff' }}></div>
                  <span className="font-label-bold text-on-surface text-sm">{role.name}</span>
                </div>
                <button className="p-1.5 text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100" onClick={() => handleAdd(role.id)}>
                  <Plus size={16} />
                </button>
              </div>
            ))
          ) : (
            filteredMembers.slice(0, 50).map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 mb-1 hover:bg-white/5 rounded-sm transition-colors group">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-surface-container-highest overflow-hidden">
                     {member.avatar && <img src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png`} className="w-full h-full object-cover" />}
                   </div>
                   <span className="font-label-bold text-on-surface text-sm">{member.username}</span>
                </div>
                <button className="p-1.5 text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100" onClick={() => handleAdd(member.id)}>
                  <Plus size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
