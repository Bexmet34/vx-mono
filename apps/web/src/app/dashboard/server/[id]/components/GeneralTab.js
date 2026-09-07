"use client";

import { Layout, Search, Loader2, Sword, Plus, Trash2, ShieldAlert } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useMemo } from "react";

export default function GeneralTab({ 
  t, settings, setSettings, 
  guildSearchQuery, setGuildSearchQuery, 
  searchGuilds, searchingGuild, 
  guildSearchResults, setGuildSearchResults, 
  albionGuildDetail, setAlbionGuildDetail,
  isOwner, discordMembers, guildId, subscription, showToast, discordChannels, discordRoles
}) {
  const { lang } = useLanguage();

  const [adminSearch, setAdminSearch] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleSelectGuild = (guild) => {
    setSettings({ 
      ...settings, 
      albion_guild_id: guild.Id, 
      albion_guild_name: guild.Name,
      albion_server: guild.Server || 'Europe'
    });
    setAlbionGuildDetail(guild);
    setGuildSearchResults([]);
    setGuildSearchQuery("");
  };

  // Parse authorized users
  const authorizedUsers = useMemo(() => {
    if (!subscription?.authorized_users) return [];
    if (Array.isArray(subscription.authorized_users)) return subscription.authorized_users;
    if (typeof subscription.authorized_users === 'string') {
      try {
        return JSON.parse(subscription.authorized_users);
      } catch(e) {
        const stripped = subscription.authorized_users.replace(/^{|}$/g, '');
        return stripped ? stripped.split(',') : [];
      }
    }
    return [];
  }, [subscription]);

  const handleAddAdmin = async () => {
    if (!selectedMember) return;
    setAddingAdmin(true);
    try {
      const res = await fetch(`/api/admins/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", targetUserId: selectedMember.id })
      });
      if (!res.ok) throw new Error(await res.text());
      showToast(lang === 'tr' ? "Yönetici eklendi." : "Admin added.", "success");
      setShowWarningModal(false);
      setSelectedMember(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(lang === 'tr' ? "Hata oluştu" : "An error occurred", "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      const res = await fetch(`/api/admins/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", targetUserId: userId })
      });
      if (!res.ok) throw new Error(await res.text());
      showToast(lang === 'tr' ? "Yönetici kaldırıldı." : "Admin removed.", "success");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast(lang === 'tr' ? "Hata oluştu" : "An error occurred", "error");
    }
  };

  const filteredMembers = useMemo(() => {
    if (adminSearch.length < 2) return [];
    
    const searchLower = adminSearch.toLowerCase();
    let results = discordMembers.filter(m => (
        !authorizedUsers.includes(m.id) &&
        (m.username?.toLowerCase()?.includes(searchLower) || 
         m.global_name?.toLowerCase()?.includes(searchLower) ||
         m.id?.includes(adminSearch))
      )).slice(0, 10);

    // Exact ID fallback for large guilds where member is not in the first 1000
    if (/^\d{17,20}$/.test(adminSearch) && !authorizedUsers.includes(adminSearch)) {
        if (!results.find(m => m.id === adminSearch)) {
            results.push({
                id: adminSearch,
                username: "ID ile Eklendi",
                global_name: `Discord ID: ${adminSearch}`
            });
        }
    }
    return results;
  }, [adminSearch, discordMembers, authorizedUsers]);

  return (
    <div className="grid grid-cols-1 gap-2 animate-slide-up pb-10">
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-[10px] text-on-surface mb-3 flex items-center gap-2 uppercase tracking-tight"><Layout className="text-primary-container" /> {t.dGeneral}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {t.dLangLabel}
              <InfoTooltip text={lang === 'en' ? 'Determines the main language the bot uses when sending messages in your server.' : 'Botun sunucunuzda mesaj atarken kullanacağı ana dili belirler.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.language || "tr"}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>



      {/* Search & Select Guild - Moved from Killboard */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-[10px] text-on-surface mb-2 flex items-center gap-2 uppercase tracking-tight">
          <Sword className="text-primary-container" /> Albion Guild Configuration
          <InfoTooltip text={lang === 'en' ? 'Search and link your Albion Online Guild. This is required for Killboard and Auto-Check features to work globally.' : 'Albion Online Loncanızı arayıp bağlayın. Killboard ve Otomatik Kontrol özelliklerinin çalışması için bu zorunludur.'} />
        </h2>
        <p className="font-body-md text-on-surface-variant mb-3">Search and link your Albion Online Guild to be used globally across all features.</p>

        {settings.albion_guild_id && albionGuildDetail ? (
          <div className="bg-primary-container/5 border border-primary-container/50 rounded-sm p-2 mb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
             <div>
               <div className="text-[10px] font-label-bold text-primary-container uppercase tracking-widest mb-1">Active Guild</div>
               <div className="text-[10px] font-headline-lg text-on-surface">
                 {albionGuildDetail.AllianceTag ? `[${albionGuildDetail.AllianceTag}] ` : ''}{albionGuildDetail.Name || settings.albion_guild_name}
               </div>
               <div className="text-[10px] font-body-md text-on-surface-variant mt-1">
                 Server: <span className="text-primary-container font-semibold uppercase">{settings.albion_server || 'Europe'}</span> &bull; Leader: <span className="text-on-surface">{albionGuildDetail.FounderName || 'Unknown'}</span> &bull; Members: <span className="text-on-surface">{albionGuildDetail.MemberCount || 0}</span>
               </div>
             </div>
             <button className="px-3 py-1 bg-error/10 text-error border border-error/50 hover:bg-error hover:text-on-error rounded-sm font-label-bold uppercase tracking-widest transition-colors" onClick={() => {
                setSettings({ ...settings, albion_guild_id: "", albion_guild_name: "", albion_server: "Europe" });
                setAlbionGuildDetail(null);
             }}>
               Disconnect
             </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <div className="w-full md:w-1/4">
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                  value={settings.albion_server || "Europe"}
                  onChange={(e) => setSettings({ ...settings, albion_server: e.target.value })}
                >
                  <option value="Europe">Europe</option>
                  <option value="Americas">Americas</option>
                  <option value="Asia">Asia</option>
                </select>
              </div>
              <div className="flex-1 flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
                  placeholder="Enter Albion Guild Name..."
                  value={guildSearchQuery}
                  onChange={(e) => setGuildSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchGuilds()}
                />
                <button className="px-3 py-1.5 bg-surface-container-highest border border-outline-variant text-on-surface hover:text-primary-container hover:border-primary-container rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center" onClick={searchGuilds} disabled={searchingGuild || guildSearchQuery.length < 3}>
                  {searchingGuild ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </button>
              </div>
            </div>

            {guildSearchResults.length > 0 && (
              <div className="bg-surface-container border border-outline-variant rounded-sm p-2 max-h-[350px] overflow-y-auto custom-scrollbar space-y-1">
                {guildSearchResults.map(g => (
                  <div 
                    key={`${g.Id}:${g.Server}`} 
                    className="flex flex-col p-2 hover:bg-white/5 cursor-pointer border-b border-outline-variant/30 last:border-0 transition-colors rounded-sm" 
                    onClick={() => handleSelectGuild(g)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-label-bold text-on-surface text-xs flex items-center gap-2">
                        {g.AllianceTag ? <span className="text-primary-container">[{g.AllianceTag}]</span> : null}
                        <span>{g.Name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-primary-container/10 border border-primary-container/30 text-primary-container font-semibold rounded-full uppercase tracking-wider">
                        {g.Server}
                      </span>
                    </div>
                    <div className="text-[10px] font-body-sm text-on-surface-variant mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Members: <strong className="text-on-surface">{g.MemberCount ?? '...'}</strong></span>
                      {g.FounderName && <span>Leader: <strong className="text-on-surface">{g.FounderName}</strong></span>}
                      {g.AllianceName && <span>Alliance: <strong className="text-on-surface">{g.AllianceName}</strong></span>}
                      <span>Kill Fame: <strong className="text-on-surface">{g.KillFame ? g.KillFame.toLocaleString() : 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Management Box (Only visible to OWNER) */}
      {isOwner && (
        <div className="glass-panel p-3 relative overflow-visible border-t-4 border-t-error mt-2">
           <h3 className="font-headline-md text-[10px] text-error mb-2 uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert size={16} /> {lang === 'tr' ? 'Yöneticiler (Sadece Size Görünür)' : 'Administrators (Only Visible to You)'}
           </h3>
           <p className="text-on-surface-variant text-[10px] mb-3">
             {lang === 'tr' 
               ? 'Buradan eklediğiniz kişiler web paneline sizin gibi giriş yapabilir ve tüm bot ayarlarını değiştirebilir. Eklediğiniz kişiler bu sekmeyi göremez.' 
               : 'People added here can log into the web dashboard just like you and change all bot settings. They cannot see this tab.'}
           </p>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
             {/* Add Admin */}
             <div>
                <h4 className="font-label-bold text-on-surface mb-3 uppercase text-[10px] tracking-widest">
                  {lang === 'tr' ? 'Yönetici Ekle' : 'Add Admin'}
                </h4>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder={lang === 'tr' ? 'Discord İsmi Ara...' : 'Search Discord Name...'}
                    className="w-full bg-surface border border-outline text-on-surface pl-10 pr-4 py-1.5 rounded-sm focus:border-primary-container outline-none transition-colors"
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                  />
                </div>
                
                {adminSearch.length > 1 && (
                  <div className="mt-2 bg-surface border border-outline rounded-sm overflow-hidden shadow-lg max-h-[200px] overflow-y-auto">
                    {filteredMembers.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer border-b border-outline/50 last:border-0"
                        onClick={() => {
                          setSelectedMember(m);
                          setShowWarningModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                           {m.avatar ? (
                             <img src={`https://cdn.discordapp.com/avatars/${m.id}/${m.avatar}.png`} width="32" height="32" alt="Avatar" className="w-8 h-8 rounded-full" />
                           ) : (
                             <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                               {m.username.charAt(0).toUpperCase()}
                             </div>
                           )}
                           <span className="font-label-bold text-[10px]">{m.global_name || m.username}</span>
                        </div>
                        <Plus size={16} className="text-success" />
                      </div>
                    ))}
                    {filteredMembers.length === 0 && (
                      <div className="p-2 text-center text-[10px] text-on-surface-variant">
                        {lang === 'tr' ? 'Kullanıcı bulunamadı veya zaten ekli.' : 'User not found or already added.'}
                      </div>
                    )}
                  </div>
                )}
             </div>

             {/* List Admins */}
             <div>
                <h4 className="font-label-bold text-on-surface mb-3 uppercase text-[10px] tracking-widest">
                  {lang === 'tr' ? 'Mevcut Yöneticiler' : 'Current Admins'}
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {authorizedUsers.length === 0 ? (
                    <div className="p-2 border border-dashed border-outline-variant text-center text-[10px] text-on-surface-variant rounded-sm">
                      {lang === 'tr' ? 'Ekli yönetici yok.' : 'No admins added.'}
                    </div>
                  ) : (
                    authorizedUsers.map(adminId => {
                      const member = (discordMembers || []).find(m => m.id === adminId);
                      return (
                        <div key={adminId} className="flex items-center justify-between p-3 bg-surface border border-outline rounded-sm">
                          <div className="flex items-center gap-2">
                             {member?.avatar ? (
                               <img src={`https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png`} width="32" height="32" alt="Avatar" className="w-8 h-8 rounded-full" />
                             ) : (
                               <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container text-[10px]">
                                 {member ? member.username.charAt(0).toUpperCase() : '?'}
                               </div>
                             )}
                             <div>
                               <div className="font-label-bold text-[10px]">{member?.global_name || member?.username || 'Unknown User'}</div>
                               <div className="text-[10px] text-on-surface-variant">{adminId}</div>
                             </div>
                          </div>
                          <button onClick={() => handleRemoveAdmin(adminId)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-sm transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-2">
           <div className="glass-panel w-full max-w-md p-2 border-2 border-error animate-slide-up relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
              <ShieldAlert size={48} className="text-error mx-auto mb-2" />
              <h2 className="text-[10px] font-headline-md text-center text-on-surface mb-2">
                {lang === 'tr' ? 'DİKKAT!' : 'WARNING!'}
              </h2>
              <p className="text-center text-on-surface-variant mb-3 text-[10px]">
                {lang === 'tr' 
                  ? `Şu anda ${selectedMember.global_name || selectedMember.username} adlı kişiye sunucunuzun web paneli üzerinde TAM YETKİ veriyorsunuz. Bu kişi sizin adınıza kayıt kanallarını, rollerini değiştirebilir veya bot özelliklerini kapatabilir.`
                  : `You are giving FULL ACCESS to ${selectedMember.global_name || selectedMember.username} on your server's web dashboard. They will be able to change all settings and roles on your behalf.`}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 py-1.5 border border-outline hover:bg-white/5 rounded-sm font-label-bold uppercase tracking-widest text-[10px] transition-colors"
                >
                  {lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
                <button 
                  onClick={handleAddAdmin}
                  disabled={addingAdmin}
                  className="flex-1 py-1.5 bg-error text-on-error hover:brightness-110 rounded-sm font-label-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50"
                >
                  {addingAdmin ? '...' : (lang === 'tr' ? 'Onaylıyorum' : 'I Confirm')}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
