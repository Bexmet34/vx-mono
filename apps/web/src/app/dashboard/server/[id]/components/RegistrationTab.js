"use client";

import { useState, useEffect } from "react";
import { Settings, MessageSquare, Tag, Users, Send, Loader2 } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";

export default function RegistrationTab({ t, lang, settings, setSettings, discordChannels, discordRoles, handleSave, saving, guildId, registeredCount = 0, setActiveTab, isPremium }) {
  const [sendingSetup, setSendingSetup] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [visibleRoleCount, setVisibleRoleCount] = useState(1);
  const textChannels = (discordChannels || []).filter(c => c.type === 0);
  const categories = (discordChannels || []).filter(c => c.type === 4);

  useEffect(() => {
    let count = 1;
    if (settings.registration_given_role_id_5) count = 5;
    else if (settings.registration_given_role_id_4) count = 4;
    else if (settings.registration_given_role_id_3) count = 3;
    else if (settings.registration_given_role_id_2) count = 2;
    setVisibleRoleCount(count);
  }, [
    settings.registration_given_role_id_2,
    settings.registration_given_role_id_3,
    settings.registration_given_role_id_4,
    settings.registration_given_role_id_5
  ]);

  // Poll for sync status if syncing is true locally or in settings
  useEffect(() => {
    let interval;
    if (syncing || settings.is_syncing) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/guild-settings/${guildId}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.settings) {
              // Canlı ilerlemeyi göstermek için veriyi her seferinde güncelle
              if (data.settings.last_sync_result) {
                setSettings(prev => ({
                  ...prev,
                  last_sync_result: data.settings.last_sync_result,
                  registered_count: data.settings.registered_count
                }));
              }

              if (data.settings.is_syncing === false) {
                // Sync finished! Update settings and stop polling
                setSettings(prev => ({
                  ...prev,
                  is_syncing: false
                }));
                setSyncing(false);
                clearInterval(interval);
              }
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [syncing, settings.is_syncing, guildId, setSettings]);

  const handleSendSetup = async () => {
    if (!settings.registration_channel_id) {
      alert("Please select a welcome channel first.");
      return;
    }
    setSendingSetup(true);
    try {
      const res = await fetch(`/api/register/setup/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (res.ok) alert(lang === 'en' ? "Setup message sent successfully!" : "Kurulum mesajı başarıyla gönderildi!");
      else alert(data.error || "Failed to send setup message.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingSetup(false);
    }
  };

  const handleSync = async () => {
    if (!settings.albion_guild_id) {
      alert(lang === 'en' ? "Please set your guild in General settings first!" : "Lütfen önce Genel ayarlardan guildinizi seçin!");
      return;
    }
    setSyncing(true);
    setSettings(prev => ({ ...prev, is_syncing: true })); // Immediately show UI change locally
    try {
      const res = await fetch(`/api/register/sync/${guildId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        // We do not alert here anymore because the polling will handle showing the result
      } else {
        alert(data.error || "Failed to start sync.");
        setSyncing(false);
        setSettings(prev => ({ ...prev, is_syncing: false }));
      }
    } catch (err) {
      alert(err.message);
      setSyncing(false);
      setSettings(prev => ({ ...prev, is_syncing: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 animate-slide-up">
      {/* Settings Section */}
      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-2xl text-on-surface mb-2 flex items-center gap-3 uppercase tracking-tight">
          <Settings className="text-primary-container" />
          {lang === 'en' ? 'Registration Config' : 'Kayıt Ayarları'}
        </h2>
        <p className="font-body-md text-on-surface-variant mb-6">
          {lang === 'en' 
            ? 'Set up an automated registration system. Users click "Register", enter their details, and a private ticket channel is created for staff to review their Albion stats.' 
            : 'Otomatik bir kayıt sistemi kurun. Kullanıcılar "Kayıt Ol" butonuna tıklar, bilgilerini girer ve yetkililerin Albion istatistiklerini incelemesi için özel bir ticket kanalı açılır.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Enable Registration System' : 'Kayıt Sistemini Aktifleştir'}
              <InfoTooltip text={lang === 'en' ? 'Turn the entire registration system on or off.' : 'Tüm kayıt sistemini açıp kapatmanızı sağlar.'} />
            </label>
            <div className="flex items-center gap-4 mt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.registration_enabled || false}
                  onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
              <span className="text-sm font-label-bold uppercase tracking-widest text-on-surface-variant">
                {settings.registration_enabled 
                  ? (lang === 'en' ? 'System is Active' : 'Sistem Aktif') 
                  : (lang === 'en' ? 'System is Disabled' : 'Sistem Kapalı')}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Welcome Channel' : 'Karşılama Kanalı'}
              <InfoTooltip text={lang === 'en' ? 'The channel where the "Register" button message will be sent.' : '"Kayıt Ol" butonunun bulunacağı sabit mesajın gönderileceği kanal.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.registration_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, registration_channel_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
              {textChannels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Ticket Category' : 'Ticket Kategorisi'}
              <InfoTooltip text={lang === 'en' ? 'The Discord category where private registration tickets will be created.' : 'Kullanıcılar kayıt butonuna bastığında açılacak özel kanalların (ticket) oluşturulacağı kategori.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.registration_category_id || ""}
              onChange={(e) => setSettings({ ...settings, registration_category_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Category' : 'Kategori Seçin'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Staff Role' : 'Yetkili Rolü'}
              <InfoTooltip text={lang === 'en' ? 'The role allowed to see, review, and approve registration tickets.' : 'Kayıt kanallarını (ticket) görebilecek ve onaylayabilecek yetkili rolü.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.registration_staff_role_ids || ""}
              onChange={(e) => setSettings({ ...settings, registration_staff_role_ids: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
              {(discordRoles || []).map(r => (
                <option key={r.id} value={r.id}>@{r.name}</option>
              ))}
            </select>
          </div>

          </div>
        </div>

        {/* ----- SECTION: Given Roles ----- */}
        <div className="mt-8 pt-8 border-t border-outline-variant/30">
          <h3 className="font-headline-md text-lg text-on-surface mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-container" />
            {lang === 'en' ? 'Registration Approval Roles' : 'Kayıt Onay Rolleri'}
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            {lang === 'en' 
              ? 'Select up to 5 roles to be given upon registration. These will appear as buttons.' 
              : 'Kayıt onayı verildiğinde kullanıcıya eklenecek rolleri seçin (en fazla 5 rol).'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dynamic Roles */}
          {[...Array(visibleRoleCount)].map((_, i) => {
            const roleKey = i === 0 ? 'registration_given_role_id' : `registration_given_role_id_${i + 1}`;
            return (
              <div key={roleKey} className="relative">
                <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>{lang === 'en' ? `Given Role ${i + 1}` : `Verilecek Rol ${i + 1}`}</span>
                  {i > 0 && i === visibleRoleCount - 1 && (
                    <button 
                      onClick={() => {
                        setVisibleRoleCount(prev => prev - 1);
                        setSettings({ ...settings, [roleKey]: "" });
                      }}
                      className="text-xs text-error hover:text-error/80 transition-colors"
                    >
                      {lang === 'en' ? 'Remove' : 'Kaldır'}
                    </button>
                  )}
                </label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                  value={settings[roleKey] || ""}
                  onChange={(e) => setSettings({ ...settings, [roleKey]: e.target.value })}
                >
                  <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
                  {(discordRoles || []).map(r => (
                    <option key={r.id} value={r.id}>@{r.name}</option>
                  ))}
                </select>
                {i === 0 && (
                  <p className="mt-2 text-xs text-primary-container flex items-center gap-1">
                    ℹ️ {lang === 'en' 
                      ? 'Ensure this is set as the Guild Role. The guild departure system will check this role.' 
                      : 'Lütfen 1. rolün "Guild Rolü" olarak seçildiğinden emin olun. Guild ayrılık kontrol sistemi bu rolü baz alacaktır.'}
                  </p>
                )}
              </div>
            );
          })}

            {visibleRoleCount < 5 && (
              <div className="col-span-1 md:col-span-2 mt-2">
                <button
                  onClick={() => setVisibleRoleCount(prev => prev + 1)}
                  className="w-full py-3 border border-dashed border-outline-variant rounded-sm text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors text-sm uppercase tracking-widest font-label-bold flex items-center justify-center gap-2"
                >
                  + {lang === 'en' ? 'Add Another Role' : 'Yeni Rol Ekle'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ----- SECTION: Guest & Fallback Roles ----- */}
        <div className="mt-8 pt-8 border-t border-outline-variant/30">
          <h3 className="font-headline-md text-lg text-on-surface mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            {lang === 'en' ? 'Guest & Unregistered Roles' : 'Misafir ve Kayıtsız Rolleri'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="bg-surface-container/30 p-5 rounded-lg border border-outline-variant/50">
            <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="text-secondary">{lang === 'en' ? 'Temporary Guest Role' : 'Geçici Misafir Rolü'}</span>
            </label>
            <p className="text-xs text-on-surface-variant mb-3">
              {lang === 'en' 
                ? 'If selected, the user will receive this role temporarily. After the duration expires, they will be given the Auto Role below.' 
                : 'Seçilirse kullanıcı bu rolü geçici olarak alır. Süre dolduğunda bu rol alınır ve aşağıdaki Otomatik Rol geri verilir.'}
            </p>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md mb-4"
              value={settings.registration_unregistered_role_id || ""}
              onChange={(e) => setSettings({ ...settings, registration_unregistered_role_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
              {(discordRoles || []).map(r => (
                <option key={r.id} value={r.id}>@{r.name}</option>
              ))}
            </select>

            {settings.registration_unregistered_role_id && (
              <div className="pl-4 border-l-2 border-secondary/30 mt-2 animate-fade-in">
                <label className="block text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Duration (Days)' : 'Süre (Gün)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                  value={settings.registration_guest_role_duration || 7}
                  onChange={(e) => setSettings({ ...settings, registration_guest_role_duration: parseInt(e.target.value) || 7 })}
                />
              </div>
            )}
          </div>

            </div>

            <div className="bg-surface-container/30 p-5 rounded-lg border border-outline-variant/50">
            <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Auto Role on Join' : 'Otomatik Rol (Girişte)'}
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.auto_role_on_join_id || ""}
              onChange={(e) => setSettings({ ...settings, auto_role_on_join_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
              {(discordRoles || []).map(r => (
                <option key={r.id} value={r.id}>@{r.name}</option>
              ))}
            </select>
              </div>
          </div>
        </div>
        </div>
      </div>

      {/* Message Setup Section */}
      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-2xl text-on-surface mb-2 flex items-center gap-3 uppercase tracking-tight">
          <MessageSquare className="text-primary-container" />
          {lang === 'en' ? 'Welcome Message' : 'Karşılama Mesajı'}
        </h2>
        <p className="font-body-md text-on-surface-variant mb-6">
          {lang === 'en' 
            ? 'Customize the message that will be sent along with the "Register" button.' 
            : '"Kayıt Ol" butonu ile birlikte gönderilecek mesajı özelleştirin.'}
        </p>

        <div className="mb-6">
          <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
            {lang === 'en' ? 'Message Text' : 'Buton Mesaj Metni'}
            <InfoTooltip text={lang === 'en' ? 'The text that appears above the Register button in the Welcome channel.' : 'Karşılama kanalındaki Kayıt Ol butonunun üzerinde yazacak açıklama metni.'} />
          </label>
          <textarea
            className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y"
            rows={4}
            placeholder={lang === 'en' ? 'Welcome! Click the button below to register.' : 'Hoşgeldiniz! Kayıt olmak için aşağıdaki butona tıklayın.'}
            value={settings.registration_welcome_message || ""}
            onChange={(e) => setSettings({ ...settings, registration_welcome_message: e.target.value })}
          />
        </div>
        
        <div className="border-t border-outline-variant/50 my-6"></div>
        
        <h3 className="font-headline-md text-xl text-primary-container mb-6 uppercase tracking-tight">
          {lang === 'en' ? 'Post-Registration Settings' : 'Kayıt Sonrası İşlemler'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Log Channel' : 'Log Kanalı'}
              <InfoTooltip text={lang === 'en' ? 'The channel where registration approvals and rejections will be logged.' : 'Kayıt onay veya red işlemlerinin loglanacağı (kaydedileceği) kanal.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.registration_log_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, registration_log_channel_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
              {textChannels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Public Welcome Channel' : 'Genel Karşılama Kanalı'}
              <InfoTooltip text={lang === 'en' ? 'The channel where a public welcome message is sent after successful registration.' : 'Kayıt işlemi başarıyla tamamlandıktan sonra herkese açık hoş geldin mesajının atılacağı kanal.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.registration_welcome_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, registration_welcome_channel_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
              {textChannels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
            {lang === 'en' ? 'Public Welcome Message' : 'Genel Karşılama Mesajı'}
            <InfoTooltip text={lang === 'en' ? 'The text sent to the public welcome channel when a user registers.' : 'Bir kullanıcı kayıt olduğunda genel karşılama kanalına atılacak kutlama mesajı.'} />
          </label>
          <textarea
            className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y"
            rows={3}
            placeholder={lang === 'en' ? 'Welcome to the guild, {user} ({gamenickname})!' : 'Aramıza hoş geldin {user}! Oyun içi adın: {gamenickname}'}
            value={settings.registration_welcome_message_text || ""}
            onChange={(e) => setSettings({ ...settings, registration_welcome_message_text: e.target.value })}
          />
          <p className="text-xs font-body-md text-on-surface-variant mt-1">
            {lang === 'en' ? 'Variables: {user}, {gamenickname}, {realname}, {age}' : 'Değişkenler: {user}, {gamenickname}, {realname}, {age}'}
          </p>
        </div>

        <button 
          className="w-full px-6 py-4 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-4 disabled:opacity-50" 
          onClick={handleSendSetup} 
          disabled={!settings.registration_channel_id || sendingSetup}
        >
          {sendingSetup ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>} 
          {lang === 'en' ? 'Send Setup Message to Channel' : 'Kurulum Mesajını Kanala Gönder'}
        </button>
        <p className="text-center text-xs font-body-md text-on-surface-variant mt-2">
          {lang === 'en' 
            ? 'Save your settings first, then click this button to send the persistent message with the Register button.' 
            : 'Önce ayarları kaydedin, ardından butonu içeren sabit mesajı göndermek için buraya tıklayın.'}
        </p>

        {/* Total Registered Count */}
        <div className="mt-8 p-4 bg-surface-container-highest border border-outline-variant text-center rounded-sm">
          <div className="text-lg font-headline-md text-on-surface uppercase tracking-tight">
            {lang === 'en' ? `Total Registered Members: ` : `Toplam Kayıtlı Üye: `}
            <span className="text-primary-container">{registeredCount}</span>
          </div>
        </div>
      </div>

      {/* Auto Check System Section */}
      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-2">
        <h2 className="font-headline-lg text-2xl text-on-surface mb-2 flex items-center gap-3 uppercase tracking-tight">
          <Users className="text-primary-container" />
          {lang === 'en' ? 'Guild Leave Auto-Check System' : 'Guild Ayrılık Kontrol Sistemi'}
        </h2>
        <p className="font-body-md text-on-surface-variant mb-6">
          {lang === 'en' 
            ? 'Automatically cross-checks registered users with your Albion guild roster. Removes roles if they leave.' 
            : 'Kayıtlı kullanıcıları Albion guild listenizle otomatik karşılaştırır. Ayrılanların yetkilerini alır.'}
        </p>

        {!isPremium ? (
          <div className="bg-primary-container/5 border border-primary-container/30 rounded-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
            <div>
              <h3 className="font-headline-md text-lg text-primary-container mb-2 flex items-center gap-2 uppercase tracking-tight font-bold">
                👑 {lang === 'en' ? 'Guild Premium Required' : 'Sunucu Premium Gerekli'}
              </h3>
              <p className="font-body-md text-on-surface-variant">
                {lang === 'en' 
                  ? 'The automatic leave-check system is a premium feature. Please upgrade your server subscription to unlock it.' 
                  : 'Otomatik ayrılık kontrol sistemi premium bir özelliktir. Aktifleştirmek için lütfen sunucu aboneliğinizi yükseltin.'}
              </p>
            </div>
            <a 
              href="https://veyronix.com.tr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 py-3 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 whitespace-nowrap text-xs md:text-sm"
            >
              {lang === 'en' ? 'Get Premium' : 'Premium Satın Al'}
            </a>
          </div>
        ) : (
          <>
            {!settings.albion_guild_id && (
              <div className="glass-panel p-6 relative overflow-visible border border-error/50 bg-error/5 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                  <h3 className="font-headline-md text-lg text-error mb-2 flex items-center gap-2 uppercase tracking-tight">
                    <Users size={20} /> {lang === 'en' ? 'Action Required' : 'İşlem Gerekiyor'}
                  </h3>
                  <p className="font-body-md text-error/80">
                    {lang === 'en' 
                      ? 'You must set your Albion Guild in General Settings to use the Auto-Check and Sync systems.' 
                      : 'Otomatik kontrol ve Senkronizasyon sistemlerini kullanabilmek için Genel ayarlardan Albion Guildinizi seçmelisiniz.'}
                  </p>
                </div>
                <button onClick={() => setActiveTab && setActiveTab('general')} className="px-6 py-3 bg-error hover:bg-error/80 text-white border border-error rounded-sm font-label-bold uppercase tracking-widest transition-colors whitespace-nowrap">
                  {lang === 'en' ? 'Go to General Settings' : 'Genel Ayarlara Git'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    {lang === 'en' ? 'Enable Auto-Check' : 'Sistemi Aktif Et'}
                    <InfoTooltip text={lang === 'en' ? 'Turn on the automatic guild roster checking system.' : 'Otomatik lonca oyuncu kontrol sistemini açıp kapatır.'} />
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.auto_check_enabled || false}
                        onChange={(e) => setSettings({ ...settings, auto_check_enabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                    <span className="text-sm font-label-bold uppercase tracking-widest text-on-surface-variant">
                      {settings.auto_check_enabled 
                        ? (lang === 'en' ? 'Enabled' : 'Aktif') 
                        : (lang === 'en' ? 'Disabled' : 'Kapalı')}
                    </span>
                  </div>
                </div>

                <div className={`space-y-6 transition-all ${settings.auto_check_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div>
                    <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      {lang === 'en' ? 'Check Interval (Days, Min 3)' : 'Kontrol Aralığı (Gün, Min 3)'}
                    </label>
                    <input
                      type="number"
                      min="3"
                      className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                      value={settings.auto_check_interval || 3}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = 3;
                        if (val < 3) val = 3;
                        setSettings({ ...settings, auto_check_interval: val });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      {lang === 'en' ? 'Guild Tag (Optional, Max 5 chars)' : 'Guild Tagi (İsteğe Bağlı, Max 5 harf)'}
                    </label>
                    <input
                      type="text"
                      maxLength="5"
                      className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md uppercase"
                      placeholder={lang === 'en' ? 'e.g. ABCDE' : 'Örn: TAG'}
                      value={settings.auto_check_guild_tag || ""}
                      onChange={(e) => setSettings({ ...settings, auto_check_guild_tag: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={`space-y-6 transition-all ${settings.auto_check_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div>
                  <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    {lang === 'en' ? 'Role for Leavers' : "Guild'den Çıkanlara Verilecek Rol"}
                    <InfoTooltip text={lang === 'en' ? 'The role to give someone when they are detected as leaving the guild.' : 'Bir kişi loncadan ayrıldığında veya atıldığında ona verilecek Discord rolü.'} />
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!settings.auto_check_custom_role_id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({ ...settings, auto_check_custom_role_id: "" });
                          } else {
                            setSettings({ ...settings, auto_check_custom_role_id: discordRoles?.[0]?.id || "none" });
                          }
                        }}
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                    <span className="text-sm font-label-bold uppercase tracking-widest text-on-surface-variant">
                      {!settings.auto_check_custom_role_id 
                        ? (lang === 'en' ? 'Default Unregistered Role' : 'Kayıtsız Rolü Verilsin') 
                        : (lang === 'en' ? 'Custom Role' : 'Özel Rol Verilsin')}
                    </span>
                  </div>
                  
                  {settings.auto_check_custom_role_id && (
                    <div className="mt-4 animate-slide-up">
                      <select
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                        value={settings.auto_check_custom_role_id === "none" ? "" : settings.auto_check_custom_role_id}
                        onChange={(e) => setSettings({ ...settings, auto_check_custom_role_id: e.target.value })}
                      >
                        <option value="" disabled>{lang === 'en' ? 'Select Role...' : 'Rol Seçin...'}</option>
                        {(discordRoles || []).map(r => (
                          <option key={r.id} value={r.id}>@{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    {lang === 'en' ? 'Report Log Channel' : 'Rapor/Log Kanalı'}
                    <InfoTooltip text={lang === 'en' ? 'The channel where auto-check removal notifications will be sent.' : 'Otomatik sistemin loncadan çıkanları tespit edip yetkilerini aldığına dair atacağı raporların kanalı.'} />
                  </label>
                  <select
                    className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                    value={settings.auto_check_log_channel_id || ""}
                    onChange={(e) => setSettings({ ...settings, auto_check_log_channel_id: e.target.value })}
                  >
                    <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
                    {textChannels.map(c => (
                      <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant/50">
                  <label className="block text-sm font-label-bold text-primary-container uppercase tracking-widest mb-2">
                    {lang === 'en' ? 'Backward Compatibility Sync' : 'Geriye Dönük Senkronizasyon (Sync)'}
                  </label>
                  <p className="text-xs font-body-md text-on-surface-variant mb-4 flex flex-col gap-1">
                    <span>{lang === 'en' 
                      ? 'Adds existing old members to the database safely. (Requires Guild to be set in General Settings)' 
                      : 'Eski kayıtlı üyelerinizi sisteme güvenle dahil eder. (Genel ayarlardan guild seçilmiş olması zorunludur)'}</span>
                    <strong className="text-error/90 mt-1 font-label-bold">{lang === 'en'
                      ? '⚠️ Note: This process may take up to 15 minutes. It runs in the background, so you can safely close this website once it starts.'
                      : '⚠️ Not: Bu işlem 15 dakikaya kadar sürebilir. İşlem tamamen arka planda çalışır, başlattıktan sonra bu web sayfasını güvenle kapatabilirsiniz.'}</strong>
                  </p>
                  <button 
                    className={`w-full px-6 py-4 font-label-bold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${settings.albion_guild_id ? ((syncing || settings.is_syncing) ? 'bg-primary-container/20 border border-primary-container/50 text-primary-container cursor-not-allowed' : 'bg-primary-container text-on-primary hover:brightness-110 tactical-glow cursor-pointer') : 'bg-surface-container border border-outline-variant text-on-surface-variant cursor-not-allowed'}`} 
                    onClick={handleSync} 
                    disabled={syncing || settings.is_syncing || !settings.albion_guild_id}
                  >
                    {(syncing || settings.is_syncing) ? <Loader2 size={18} className="animate-spin"/> : <Users size={18}/>} 
                    {lang === 'en' 
                      ? (settings.albion_guild_id ? ((syncing || settings.is_syncing) ? `Syncing... ${settings.last_sync_result?.scanned || 0} / ${settings.last_sync_result?.total || '?'}` : 'Start Sync Process') : 'Set Guild in General Settings First') 
                      : (settings.albion_guild_id ? ((syncing || settings.is_syncing) ? `Şu an Taranıyor: ${settings.last_sync_result?.scanned || 0} / ${settings.last_sync_result?.total || '?'}` : 'Senkronizasyon İşlemini Başlat') : 'Önce Genel Ayarlardan Guild Seçin')}
                  </button>

                  {settings.last_sync_result && (
                    <div className="mt-6 p-4 bg-primary-container/5 border border-primary-container/30 rounded-sm animate-slide-up">
                      <h4 className="text-sm font-label-bold text-primary-container uppercase tracking-widest mb-2">{(syncing || settings.is_syncing) ? (lang === 'en' ? 'Live Progress' : 'Canlı Tarama İlerlemesi') : (lang === 'en' ? 'Last Sync Result' : 'Son Senkronizasyon Çıktısı')}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm font-body-md">
                        <div className="text-on-surface-variant">{lang === 'en' ? 'Scanned:' : 'Taranan:'} <strong className="text-on-surface ml-1">{settings.last_sync_result.scanned || 0} {settings.last_sync_result.total ? `/ ${settings.last_sync_result.total}` : ''}</strong></div>
                        <div className="text-on-surface-variant">{lang === 'en' ? 'Synced:' : 'Eklenen:'} <strong className="text-success ml-1">{settings.last_sync_result.synced || 0}</strong></div>
                        <div className="text-on-surface-variant">{lang === 'en' ? 'Skipped:' : 'Atlanan:'} <strong className="text-error ml-1">{settings.last_sync_result.skipped || 0}</strong></div>
                      </div>
                      <div className="mt-3 text-xs font-label-sm text-on-surface-variant/70">
                        {new Date(settings.last_sync_result.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
