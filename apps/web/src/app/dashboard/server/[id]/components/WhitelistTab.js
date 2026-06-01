"use client";

import { Users, Plus, Trash2 } from "lucide-react";

export default function WhitelistTab({ t, settings, setSettings, whitelistAddTab, setWhitelistAddTab, searchQuery, setSearchQuery, discordRoles, discordMembers, removeWhitelistId }) {
  const filteredRoles = discordRoles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !settings.whitelist.includes(r.id));
  const filteredMembers = discordMembers.filter(m => m.user.username.toLowerCase().includes(searchQuery.toLowerCase()) && !settings.whitelist.includes(m.user.id));

  const handleAdd = (id) => {
    if (!settings.whitelist.includes(id)) {
      setSettings(prev => ({ ...prev, whitelist: [...prev.whitelist, id] }));
      setSearchQuery("");
    }
  };

  const getEntityInfo = (id) => {
    const r = discordRoles.find(r => r.id === id);
    if (r) return { name: `@${r.name}`, color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#fff', type: 'role' };
    const m = discordMembers.find(m => m.user.id === id);
    if (m) return { name: m.user.username, color: '#fff', type: 'user' };
    return { name: `ID: ${id}`, color: '#888', type: 'unknown' };
  };

  return (
    <div className="bentoGrid">
      <div className="bentoBox span7">
        <h2 className="bentoTitle"><Users /> Active Whitelist</h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>Users or roles listed here can use restricted commands like /createparty.</p>

        {settings.whitelist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', color: '#666' }}>
            No whitelist entries. Everyone can use commands.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {settings.whitelist.map(id => {
              const info = getEntityInfo(id);
              return (
                <div key={id} className="listItem">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="listItemIcon" style={{ width: '12px', height: '12px', background: info.color }}></div>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{info.name}</span>
                  </div>
                  <button className="btnIcon" onClick={() => removeWhitelistId(id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bentoBox span5">
        <h3 className="bentoTitle" style={{ fontSize: '1.1rem' }}>Add New Entry</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className={`dockItem ${whitelistAddTab === 'roles' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setWhitelistAddTab('roles')}>Roles</button>
          <button className={`dockItem ${whitelistAddTab === 'users' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setWhitelistAddTab('users')}>Users</button>
        </div>

        <input
          type="text"
          className="input"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />

        <div style={{ background: '#000', borderRadius: '12px', padding: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
          {whitelistAddTab === 'roles' ? (
            filteredRoles.slice(0, 50).map(role => (
              <div key={role.id} className="listItem" style={{ marginBottom: '0.25rem', padding: '0.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#fff' }}></div>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>{role.name}</span>
                </div>
                <button className="dockItem" style={{ padding: '0.4rem', borderRadius: '6px' }} onClick={() => handleAdd(role.id)}>
                  <Plus size={16} />
                </button>
              </div>
            ))
          ) : (
            filteredMembers.slice(0, 50).map(member => (
              <div key={member.user.id} className="listItem" style={{ marginBottom: '0.25rem', padding: '0.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333' }}>
                     {member.user.avatar && <img src={`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />}
                   </div>
                   <span style={{ color: '#fff', fontSize: '0.9rem' }}>{member.user.username}</span>
                </div>
                <button className="dockItem" style={{ padding: '0.4rem', borderRadius: '6px' }} onClick={() => handleAdd(member.user.id)}>
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
