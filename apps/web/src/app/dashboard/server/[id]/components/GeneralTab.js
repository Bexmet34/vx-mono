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

  const filteredMembers = (discordMembers || []).filter(m => 
    !authorizedUsers.includes(m.id) && 
    (m.username?.toLowerCase().includes(adminSearch.toLowerCase()) || m.global_name?.toLowerCase().includes(adminSearch.toLowerCase()))
  ).slice(0, 5);

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

      {/* Content System Settings */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors mt-2">
        <h2 className="font-headline-lg text-[10px] text-on-surface mb-3 flex items-center gap-2 uppercase tracking-tight">
          <Layout className="text-primary-container" /> {lang === 'tr' ? 'Content Sistemi Ayarları' : 'Content System Settings'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Sistem Modu Seçimi' : 'System Mode Selection'}
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.system_mode || "command"}
              onChange={(e) => setSettings({ ...settings, system_mode: e.target.value })}
            >
              <option value="command">{lang === 'tr' ? 'Sadece Komut Modu (Mevcut)' : 'Command Only Mode (Default)'}</option>
              <option value="fixed_channel">{lang === 'tr' ? 'Sabit Kanal ve Buton Modu' : 'Fixed Channel & Button Mode'}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Kanal Otomatik Temizleme (Boş Kanallar)' : 'Auto-Delete Party Channels'}
              <InfoTooltip text={lang === 'tr' ? 'Oluşturulma tarihinin üzerinden bu süre geçen Content kanalları otomatik silinir.' : 'Party channels older than this duration will be deleted automatically.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.auto_delete_party_hours || 0}
              onChange={(e) => setSettings({ ...settings, auto_delete_party_hours: parseInt(e.target.value) })}
            >
              <option value={0}>{lang === 'tr' ? 'Kapalı' : 'Disabled'}</option>
              <option value={1}>{lang === 'tr' ? '1 Saat Sonra Sil' : 'Delete after 1 Hour'}</option>
              <option value={3}>{lang === 'tr' ? '3 Saat Sonra Sil' : 'Delete after 3 Hours'}</option>
              <option value={6}>{lang === 'tr' ? '6 Saat Sonra Sil' : 'Delete after 6 Hours'}</option>
              <option value={12}>{lang === 'tr' ? '12 Saat Sonra Sil' : 'Delete after 12 Hours'}</option>
              <option value={24}>{lang === 'tr' ? '24 Saat Sonra Sil' : 'Delete after 24 Hours'}</option>
            </select>
          </div>
        </div>

        {settings.system_mode === 'fixed_channel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-slide-down">
            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Sabit Mesaj Kanalı' : 'Fixed Message Channel'}
                <InfoTooltip text={lang === 'tr' ? 'Sabit butonlu mesajın atılacağı kanal.' : 'The channel where the fixed message will be sent.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.fixed_message_channel_id || ""}
                onChange={(e) => setSettings({ ...settings, fixed_message_channel_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? 'Kanal Seçin...' : 'Select Channel...'}</option>
                {(discordChannels || []).filter(c => c.type === 0 || c.type === 5).map(c => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Hedef Kategori' : 'Target Category'}
                <InfoTooltip text={lang === 'tr' ? 'Yeni açılacak content kanallarının konulacağı kategori.' : 'Category where new content channels will be created.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.target_category_id || ""}
                onChange={(e) => setSettings({ ...settings, target_category_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? 'Kategori Seçin...' : 'Select Category...'}</option>
                {(discordChannels || []).filter(c => c.type === 4).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Kanal İsim Formatı' : 'Channel Name Format'}
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.channel_name_format || "name_title"}
                onChange={(e) => setSettings({ ...settings, channel_name_format: e.target.value })}
              >
                <option value="name_title">{lang === 'tr' ? 'İsim - Başlık (Örn: ali-zvz)' : 'Name - Title (e.g. ali-zvz)'}</option>
                <option value="title_only">{lang === 'tr' ? 'Sadece Başlık (Örn: zvz)' : 'Title Only (e.g. zvz)'}</option>
                <option value="title_name">{lang === 'tr' ? 'Başlık - İsim (Örn: zvz-ali)' : 'Title - Name (e.g. zvz-ali)'}</option>
                <option value="type_title">{lang === 'tr' ? 'Kategori/Tür - Başlık (Örn: zvz-avalonda-zvz)' : 'Type - Title (e.g. zvz-avalonda-zvz)'}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                  {lang === 'tr' ? 'Kapatma Yetkisi Olan Roller' : 'Content Close Roles'}
                  <InfoTooltip text={lang === 'tr' ? 'Bu rollere sahip kişiler, parti sahibi olmasalar bile açık partileri kapatabilir.' : 'Users with these roles can close active parties even if they are not the owner.'} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(() => {
                  let currentRoles = [];
                  try {
                    currentRoles = typeof settings.content_close_roles === 'string' 
                      ? JSON.parse(settings.content_close_roles) 
                      : (settings.content_close_roles || []);
                  } catch(err) {}
                  
                  const selectsToRender = [...currentRoles, ""];
                  if (selectsToRender.length > 5) selectsToRender.length = 5;
                  
                  return selectsToRender.map((roleId, index) => (
                    <div key={index} className="relative mb-2">
                      <label className="flex items-center justify-between text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        <span>{lang === 'tr' ? `Yetkili Rol ${index + 1}` : `Authorized Role ${index + 1}`}</span>
                        {index < currentRoles.length && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newRoles = [...currentRoles];
                              newRoles.splice(index, 1);
                              setSettings({ ...settings, content_close_roles: JSON.stringify(newRoles) });
                            }}
                            className="text-[10px] text-error hover:text-error/80 transition-colors font-label-bold uppercase"
                          >
                            {lang === 'tr' ? 'Kaldır' : 'Remove'}
                          </button>
                        )}
                      </label>
                      <select
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                        value={roleId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newRoles = [...currentRoles];
                          if (index === currentRoles.length) {
                             if (val && !newRoles.includes(val)) newRoles.push(val);
                          } else {
                             if (!val) {
                               newRoles.splice(index, 1);
                             } else {
                               newRoles[index] = val;
                             }
                          }
                          setSettings({ ...settings, content_close_roles: JSON.stringify(newRoles) });
                        }}
                      >
                        <option value="">{lang === 'tr' ? 'Rol Seçin...' : 'Select Role...'}</option>
                        {(discordRoles || []).map(r => (
                          <option key={r.id} value={r.id}>@{r.name}</option>
                        ))}
                      </select>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Sabit Mesaj İçeriği' : 'Fixed Message Content'}
              </label>
              <textarea
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md h-24 custom-scrollbar"
                placeholder={lang === 'tr' ? "Lütfen bir parti oluşturmak için aşağıdaki butonları kullanın..." : "Please use the buttons below to create a party..."}
                value={settings.fixed_message_content || ""}
                onChange={(e) => setSettings({ ...settings, fixed_message_content: e.target.value })}
              />
            </div>
            
            <div className="md:col-span-2 mt-2">
              <button
                className="px-3 py-1.5 bg-primary-container text-on-primary border border-primary-container rounded-sm font-label-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow"
                onClick={async () => {
                   if(!settings.fixed_message_channel_id) return showToast(lang === 'tr' ? "Lütfen kanal seçin!" : "Please select a channel!", "error");
                   const res = await fetch(`/api/guild-settings/${guildId}/send-fixed-message`, { method: "POST" });
                   if (res.ok) showToast(lang === 'tr' ? "Sabit mesaj gönderildi!" : "Fixed message sent!", "success");
                   else showToast(lang === 'tr' ? "Mesaj gönderilirken hata oluştu." : "Error sending message.", "error");
                }}
              >
                {lang === 'tr' ? 'Sabit Mesajı Gönder/Güncelle' : 'Send/Update Fixed Message'}
              </button>
            </div>
          </div>
        )}
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
