"use client";

import { useState, useEffect } from "react";
import { Settings, MessageSquare, Tag, Users, Send, Loader2, Crown, Layout, CheckCircle, AlertTriangle } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";

export default function RegistrationTab({ t, lang, settings, setSettings, discordChannels, discordRoles, handleSave, saving, guildId, registeredCount = 0, setActiveTab, isPremium }) {
  const [subTab, setSubTab] = useState("core"); // core, roles, messages, sync, questionnaire
  const [sendingSetup, setSendingSetup] = useState(false);
  const [visibleRoleCount, setVisibleRoleCount] = useState(1);
  const textChannels = (discordChannels || []).filter(c => c.type === 0);
  const categories = (discordChannels || []).filter(c => c.type === 4);

  useEffect(() => {
    let count = 1;
    if (settings.registration_given_role_id_5) count = 5;
    else if (settings.registration_given_role_id_4) count = 4;
    else if (settings.registration_given_role_id_3) count = 3;
    else if (settings.registration_given_role_id_2) count = 2;
    // If they aren't premium, they are limited to 1 role. Force count to 1.
    if (!isPremium) {
      setVisibleRoleCount(1);
    } else {
      setVisibleRoleCount(count);
    }
  }, [
    settings.registration_given_role_id_2,
    settings.registration_given_role_id_3,
    settings.registration_given_role_id_4,
    settings.registration_given_role_id_5,
    isPremium
  ]);

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

  // Premium lock block rendering helper
  const renderPremiumLock = (title, desc) => {
    return (
      <div className="bg-gradient-to-br from-primary-container/10 to-primary-container/5 border border-primary-container/20 rounded-lg p-3 flex flex-col items-center text-center gap-2 my-4 animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary-container/50 to-transparent"></div>
        <div className="w-12 h-8 bg-primary-container/15 rounded-full flex items-center justify-center text-primary-container">
          <Crown size={16} className="animate-pulse" />
        </div>
        <h3 className="font-headline-md text-[10px] text-primary-container uppercase tracking-widest font-bold">
          {title}
        </h3>
        <p className="font-body-md text-on-surface-variant max-w-md leading-relaxed text-[10px]">
          {desc}
        </p>
        <a 
          href="https://veyronix.com.tr" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-3 py-1.5 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 text-[10px] mt-2"
        >
          {lang === 'en' ? 'Upgrade to Premium' : 'Premium Satın Al'}
        </a>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 animate-slide-up">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-4 mb-2">
        {[
          { id: "core", label: lang === 'en' ? "Core Config" : "Ana Ayarlar", icon: Settings },
          { id: "roles", label: lang === 'en' ? "Roles Setup" : "Rol Ayarları", icon: Tag },
          { id: "messages", label: lang === 'en' ? "Welcome & Logs" : "Karşılama & Loglar", icon: MessageSquare },
          { id: "sync", label: lang === 'en' ? "Leave Check" : "Ayrılık Kontrolü", icon: Users },
          { id: "questionnaire", label: lang === 'en' ? "Questionnaire" : "Başvuru Anketi", icon: Layout },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-full text-[10px] font-label-bold uppercase tracking-widest transition-all ${
                subTab === tab.id
                  ? "bg-primary-container text-on-primary border border-primary-container tactical-glow"
                  : "bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {!isPremium && (tab.id === "sync" || tab.id === "questionnaire") && (
                <Crown size={12} className="text-primary-container ml-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Core Settings */}
      {subTab === "core" && (
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors space-y-6">
          <div>
            <h2 className="font-headline-lg text-[10px] text-on-surface mb-2 flex items-center gap-2 uppercase tracking-tight">
              <Settings className="text-primary-container" />
              {lang === 'en' ? 'Core Registration Settings' : 'Ana Kayıt Ayarları'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {lang === 'en' 
                ? 'Configure the core settings of the automated registration system.' 
                : 'Otomatik kayıt sisteminin temel ayarlarını ve yetki rollerini yapılandırın.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-outline-variant/20">
            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Enable Registration System' : 'Kayıt Sistemini Aktifleştir'}
                <InfoTooltip text={lang === 'en' ? 'Turn the entire registration system on or off.' : 'Tüm kayıt sistemini açıp kapatmanızı sağlar.'} />
              </label>
              <div className="flex items-center gap-2 mt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.registration_enabled || false}
                    onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
                  />
                  <div className="w-10 h-5 bg-[#1e293b] border border-outline-variant/30 rounded-full peer peer-checked:bg-primary-container peer-checked:border-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-black peer-checked:after:translate-x-[20px] after:rounded-full after:h-4 after:w-4 after:transition-all shadow-inner"></div>
                </label>
                <span className="text-[10px] font-label-bold uppercase tracking-widest text-on-surface-variant">
                  {settings.registration_enabled 
                    ? (lang === 'en' ? 'System is Active' : 'Sistem Aktif') 
                    : (lang === 'en' ? 'System is Disabled' : 'Sistem Kapalı')}
                </span>
              </div>
            </div>

            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Welcome Channel' : 'Karşılama Kanalı'}
                <InfoTooltip text={lang === 'en' ? 'The channel where the "Register" button message will be sent.' : '"Kayıt Ol" butonunun bulunacağı sabit mesajın gönderileceği kanal.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
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
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Ticket Category' : 'Ticket Kategorisi'}
                <InfoTooltip text={lang === 'en' ? 'The Discord category where private registration tickets will be created.' : 'Kullanıcılar kayıt butonuna bastığında açılacak özel kanalların (ticket) oluşturulacağı kategori.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
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
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Staff Role' : 'Yetkili Rolü'}
                <InfoTooltip text={lang === 'en' ? 'The role allowed to see, review, and approve registration tickets.' : 'Kayıt kanallarını (ticket) görebilecek ve onaylayabilecek yetkili rolü.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.registration_staff_role_ids || ""}
                onChange={(e) => setSettings({ ...settings, registration_staff_role_ids: e.target.value })}
              >
                <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
                {(discordRoles || []).map(r => (
                  <option key={r.id} value={r.id}>@{r.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Main Guild Tag (For 1st Role)' : 'Ana Guild Tagi (1. Rol İçin)'}
                <InfoTooltip text={lang === 'en' ? 'This tag is automatically added with [ ] brackets when you approve with the 1st role.' : 'Kayıt onayında 1. role basıldığında oyuncunun isminin başına eklenecek olan tag. (Sistem otomatik olarak [] köşeli parantezleri ekler)'} />
              </label>
              <input
                type="text"
                maxLength="5"
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md uppercase"
                placeholder={lang === 'en' ? 'e.g. TAG (Brackets added automatically)' : 'Örn: TAG ([] parantezleri sistem ekler)'}
                value={settings.auto_check_guild_tag || ""}
                onChange={(e) => setSettings({ ...settings, auto_check_guild_tag: e.target.value.replace(/[\[\]]/g, '') })}
              />
            </div>
          </div>

          <div className="p-2 bg-surface-container/30 border border-outline-variant/30 text-center rounded-sm mt-3">
            <div className="text-[10px] font-label-bold text-on-surface uppercase tracking-wider">
              {lang === 'en' ? `Total Registered Members: ` : `Toplam Kayıtlı Üye: `}
              <span className="text-primary-container font-headline-md text-[10px] ml-1">{registeredCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Roles Setup */}
      {subTab === "roles" && (
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors space-y-6">
          <div>
            <h2 className="font-headline-lg text-[10px] text-on-surface mb-2 flex items-center gap-2 uppercase tracking-tight">
              <Tag className="text-primary-container" />
              {lang === 'en' ? 'Role Settings' : 'Rol Ayarları'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {lang === 'en' 
                ? 'Configure roles to be assigned during registration. Premium servers can assign up to 5 roles.' 
                : 'Kayıt onayında verilecek rolleri ayarlayın. Premium sunucular 5 adete kadar rol ekleyebilir.'}
            </p>
          </div>

          <div className="pt-6 border-t border-outline-variant/20 space-y-6">
            <div>
              <h3 className="text-[10px] font-label-bold text-on-surface uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Approval Given Roles' : 'Kayıt Onayında Verilecek Roller'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[...Array(visibleRoleCount)].map((_, i) => {
                  const roleKey = i === 0 ? 'registration_given_role_id' : `registration_given_role_id_${i + 1}`;
                  return (
                    <div key={roleKey} className="relative">
                      <label className="flex items-center justify-between text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        <span>{lang === 'en' ? `Given Role ${i + 1}` : `Verilecek Rol ${i + 1}`}</span>
                        {i > 0 && i === visibleRoleCount - 1 && (
                          <button 
                            onClick={() => {
                              setVisibleRoleCount(prev => prev - 1);
                              setSettings({ ...settings, [roleKey]: "" });
                            }}
                            className="text-[10px] text-error hover:text-error/80 transition-colors font-label-bold uppercase"
                          >
                            {lang === 'en' ? 'Remove' : 'Kaldır'}
                          </button>
                        )}
                      </label>
                      <select
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                        value={settings[roleKey] || ""}
                        onChange={(e) => setSettings({ ...settings, [roleKey]: e.target.value })}
                      >
                        <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
                        {(discordRoles || []).map(r => (
                          <option key={r.id} value={r.id}>@{r.name}</option>
                        ))}
                      </select>
                      {i === 0 && (
                        <p className="mt-2 text-[10px] text-primary-container/80 flex items-center gap-1">
                          ℹ️ {lang === 'en' 
                            ? 'Ensure this is set as the Guild Role for the auto-check system.' 
                            : 'Lütfen 1. rolün "Guild Rolü" olarak seçildiğinden emin olun. Ayrılık kontrolü bu rolü kontrol eder.'}
                        </p>
                      )}
                    </div>
                  );
                })}

                {visibleRoleCount < 5 && (
                  <div className="col-span-1 md:col-span-2 mt-2">
                    {isPremium ? (
                      <button
                        onClick={() => setVisibleRoleCount(prev => prev + 1)}
                        className="w-full py-1.5 border border-dashed border-outline-variant/60 rounded-sm text-on-surface-variant hover:text-primary-container hover:border-primary-container transition-colors text-[10px] uppercase tracking-widest font-label-bold flex items-center justify-center gap-2"
                      >
                        + {lang === 'en' ? 'Add Another Role' : 'Yeni Rol Ekle'}
                      </button>
                    ) : (
                      <div className="w-full p-2 border border-dashed border-outline-variant/30 rounded-sm bg-surface-container/20 flex flex-col md:flex-row items-center justify-between gap-2">
                        <span className="text-[10px] text-on-surface-variant flex items-center gap-1.5 font-label-bold uppercase tracking-wider">
                          <Crown size={14} className="text-primary-container animate-pulse" />
                          {lang === 'en' ? 'Multiple Roles (Up to 5) Requires Premium' : 'Çoklu Rol Ekleme (Max 5) Premium Gerektirir'}
                        </span>
                        <a 
                          href="https://veyronix.com.tr" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] bg-primary-container text-on-primary px-3 py-1.5 rounded-sm font-label-bold uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 tactical-glow"
                        >
                          {lang === 'en' ? 'Upgrade' : 'Yükselt'}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Guest & Fallback Roles */}
            <div className="border-t border-outline-variant/20 pt-6 space-y-6">
              <h3 className="text-[10px] font-label-bold text-on-surface uppercase tracking-widest">
                {lang === 'en' ? 'Guest & Join Settings' : 'Misafir ve Giriş Rol Ayarları'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Temporary Guest Role with Premium Check */}
                <div className={`p-3 rounded-lg border transition-all ${isPremium ? 'bg-surface-container/20 border-outline-variant/50' : 'bg-surface-container/5 border-outline-variant/20 opacity-90'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                      <span className={isPremium ? "text-secondary" : "text-on-surface-variant"}>{lang === 'en' ? 'Temporary Guest Role' : 'Geçici Misafir Rolü'}</span>
                    </label>
                    {!isPremium && (
                      <span className="text-[9px] bg-primary-container/20 text-primary-container px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1">
                        <Crown size={8} /> {lang === 'en' ? 'Premium' : 'Premium'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface-variant mb-2 leading-relaxed">
                    {lang === 'en' 
                      ? 'Temporarily assigns a role that expires automatically, returning them to unregistered status.' 
                      : 'Kullanıcıya geçici bir misafir rolü tanımlar. Belirlenen süre dolduğunda otomatik olarak geri alınır.'}
                  </p>
                  
                  {isPremium ? (
                    <>
                      <select
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md mb-2"
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
                          <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                            {lang === 'en' ? 'Duration (Days)' : 'Süre (Gün)'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                            value={settings.registration_guest_role_duration || 7}
                            onChange={(e) => setSettings({ ...settings, registration_guest_role_duration: parseInt(e.target.value) || 7 })}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-primary-container/5 border border-primary-container/20 rounded p-2 text-center mt-2 flex flex-col items-center gap-2">
                      <p className="text-[11px] text-on-surface-variant">
                        {lang === 'en' ? 'Temporary Guest Role requires a Premium server.' : 'Geçici Misafir Rolü özelliği Sunucu Premium gerektirir.'}
                      </p>
                      <a 
                        href="https://veyronix.com.tr" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] border border-primary-container/50 text-primary-container px-3 py-1 font-label-bold uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all rounded-sm"
                      >
                        {lang === 'en' ? 'Learn More' : 'Detaylı Bilgi'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Auto Role on Join */}
                <div className="bg-surface-container/20 p-3 rounded-lg border border-outline-variant/50">
                  <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    {lang === 'en' ? 'Auto Role on Join' : 'Otomatik Rol (Girişte)'}
                  </label>
                  <p className="text-[10px] text-on-surface-variant mb-2 leading-relaxed">
                    {lang === 'en' 
                      ? 'Role automatically granted by Discord bot to any member as soon as they join.' 
                      : 'Kullanıcı sunucuya katıldığında bot tarafından doğrudan verilecek varsayılan başlangıç rolü.'}
                  </p>
                  <select
                    className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
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
      )}

      {/* SUBTAB 3: Welcome Messages & Logs */}
      {subTab === "messages" && (
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors space-y-6">
          <div>
            <h2 className="font-headline-lg text-[10px] text-on-surface mb-2 flex items-center gap-2 uppercase tracking-tight">
              <MessageSquare className="text-primary-container" />
              {lang === 'en' ? 'Welcome & Log Messages' : 'Karşılama & Log Mesajları'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {lang === 'en' 
                ? 'Customize the button embed text, public greetings, and audit log channels.' 
                : 'Kayıt butonunun yazısını, genel karşılama kanallarını ve denetim kayıtlarını yapılandırın.'}
            </p>
          </div>

          {/* Welcome Message Config */}
          <div className="pt-6 border-t border-outline-variant/20 space-y-6">
            <div className="bg-surface-container/20 p-2 rounded-lg border border-outline-variant/30 space-y-4">
              <h3 className="text-[10px] font-label-bold text-on-surface uppercase tracking-widest">
                {lang === 'en' ? 'Register Button Setup' : 'Kayıt Ol Buton Kurulumu'}
              </h3>
              
              <div>
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Message Text' : 'Buton Mesaj Metni'}
                  <InfoTooltip text={lang === 'en' ? 'The text that appears above the Register button in the Welcome channel.' : 'Karşılama kanalındaki Kayıt Ol butonunun üzerinde yazacak açıklama metni.'} />
                </label>
                <textarea
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y"
                  rows={3}
                  placeholder={lang === 'en' ? 'Welcome! Click the button below to register.' : 'Hoşgeldiniz! Kayıt olmak için aşağıdaki butona tıklayın.'}
                  value={settings.registration_welcome_message || ""}
                  onChange={(e) => setSettings({ ...settings, registration_welcome_message: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Display Buttons' : 'Gösterilecek Butonlar'}
                  <InfoTooltip text={lang === 'en' ? 'Which language buttons to show below the welcome message.' : 'Hoş geldin mesajının altında hangi dillerin kayıt butonlarının gösterileceğini seçin.'} />
                </label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                  value={settings.registration_button_type || "both"}
                  onChange={(e) => setSettings({ ...settings, registration_button_type: e.target.value })}
                >
                  <option value="both">🇹🇷 Türkçe & 🇬🇧 English</option>
                  <option value="tr">🇹🇷 Sadece Türkçe (Only TR)</option>
                  <option value="en">🇬🇧 Sadece İngilizce (Only EN)</option>
                </select>
              </div>

              <button 
                className="w-full px-3 py-1 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest tactical-glow rounded-sm transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleSendSetup} 
                disabled={!settings.registration_channel_id || sendingSetup}
              >
                {sendingSetup ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} 
                {lang === 'en' ? 'Send Button Message to Channel' : 'Buton Mesajını Kanala Gönder'}
              </button>
              <p className="text-center text-[10px] text-on-surface-variant">
                {lang === 'en' 
                  ? '⚠️ Make sure you save settings first, then deploy the button message.' 
                  : '⚠️ Önce ayarları kaydettiğinizden emin olun, ardından butonu içeren mesajı kanala gönderin.'}
              </p>
            </div>

            {/* Post Registration logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4">
              <div>
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Log Channel' : 'Log Kanalı'}
                  <InfoTooltip text={lang === 'en' ? 'The channel where registration approvals and rejections will be logged.' : 'Kayıt onay veya red işlemlerinin loglanacağı (kaydedileceği) kanal.'} />
                </label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
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
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Public Welcome Channel' : 'Genel Karşılama Kanalı'}
                  <InfoTooltip text={lang === 'en' ? 'The channel where a public welcome message is sent after successful registration.' : 'Kayıt işlemi başarıyla tamamlandıktan sonra herkese açık hoş geldin mesajının atılacağı kanal.'} />
                </label>
                <select
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                  value={settings.registration_welcome_channel_id || ""}
                  onChange={(e) => setSettings({ ...settings, registration_welcome_channel_id: e.target.value })}
                >
                  <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
                  {textChannels.map(c => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Public Welcome Message' : 'Genel Karşılama Mesajı'}
                  <InfoTooltip text={lang === 'en' ? 'The text sent to the public welcome channel when a user registers.' : 'Bir kullanıcı kayıt olduğunda genel karşılama kanalına atılacak kutlama mesajı.'} />
                </label>
                <textarea
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y"
                  rows={3}
                  placeholder={lang === 'en' ? 'Welcome to the guild, {user} ({gamenickname})!' : 'Aramıza hoş geldin {user}! Oyun içi adın: {gamenickname}'}
                  value={settings.registration_welcome_message_text || ""}
                  onChange={(e) => setSettings({ ...settings, registration_welcome_message_text: e.target.value })}
                />
                <p className="text-[10px] font-body-md text-on-surface-variant/80 mt-1">
                  {lang === 'en' ? 'Variables: {user}, {gamenickname}, {realname}, {age}' : 'Değişkenler: {user}, {gamenickname}, {realname}, {age}'}
                </p>
              </div>

              {/* Özel Bilet Kanalı Açılış Mesajı TR */}
              <div className="md:col-span-2 border-t border-outline-variant/30 pt-4 mt-2">
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  🇹🇷 {lang === 'en' ? 'Private Ticket Channel Greeting (Turkish)' : 'Özel Bilet Kanalı Açılış Mesajı (Türkçe)'}
                  <InfoTooltip text={lang === 'en' ? 'Custom message sent in the user\'s private ticket channel upon opening. E.g. Ask user for screenshot directly.' : 'Kayıt tamamlanıp kullanıcı için özel bilet kanalı açıldığında, kanal içerisine bot tarafından atılacak özel mesaj. Örneğin buradan kullanıcıdan resim/ekran görüntüsü isteyebilirsiniz.'} />
                </label>
                <textarea
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y"
                  rows={3}
                  placeholder="Hoş geldin {user}! Lütfen oyun içi profilinizin / giriş ekranınızın ekran görüntüsünü bu kanala yükleyin."
                  value={settings.registration_ticket_welcome_message_tr || ""}
                  onChange={(e) => setSettings({ ...settings, registration_ticket_welcome_message_tr: e.target.value })}
                />
                <p className="text-[10px] font-body-md text-on-surface-variant/80 mt-1">
                  {lang === 'en' ? 'Variables: {user}, {gamenickname}, {realname}, {age}' : 'Değişkenler: {user}, {gamenickname}, {realname}, {age}'}
                </p>
              </div>

              {/* Özel Bilet Kanalı Açılış Mesajı EN */}
              <div className="md:col-span-2">
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  🇬🇧 {lang === 'en' ? 'Private Ticket Channel Greeting (English)' : 'Özel Bilet Kanalı Açılış Mesajı (İngilizce)'}
                  <InfoTooltip text={lang === 'en' ? 'Custom message sent in the user\'s private ticket channel if server language is English.' : 'Sunucu dili İngilizce olduğunda özel bilet kanalında gösterilecek mesaj.'} />
                </label>
                <textarea
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y"
                  rows={3}
                  placeholder="Welcome {user}! Please upload a screenshot of your in-game profile to this channel."
                  value={settings.registration_ticket_welcome_message_en || ""}
                  onChange={(e) => setSettings({ ...settings, registration_ticket_welcome_message_en: e.target.value })}
                />
                <p className="text-[10px] font-body-md text-on-surface-variant/80 mt-1">
                  {lang === 'en' ? 'Variables: {user}, {gamenickname}, {realname}, {age}' : 'Değişkenler: {user}, {gamenickname}, {realname}, {age}'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Leave Check & Sync */}
      {subTab === "sync" && (
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors space-y-6">
          <div>
            <h2 className="font-headline-lg text-[10px] text-on-surface mb-2 flex items-center gap-2 uppercase tracking-tight">
              <Users className="text-primary-container" />
              {lang === 'en' ? 'Guild Leave Check & Sync' : 'Ayrılık Kontrolü & Senkronizasyon'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {lang === 'en' 
                ? 'Track users who left the Albion Online guild roster and synchronize historical database members.' 
                : 'Albion Online loncanızdan ayrılan oyuncuların tespit edilip yetkilerinin geri alınması ve veri senkronizasyonu.'}
            </p>
          </div>

          <div className="pt-6 border-t border-outline-variant/20">
            {!isPremium ? (
              renderPremiumLock(
                lang === 'en' ? 'Guild Leave System Requires Premium' : 'Ayrılık Kontrolü Premium Gerektirir',
                lang === 'en' 
                  ? 'The automatic roster checking service and historical synchronization are advanced options available to Premium servers.'
                  : 'Otomatik kadro kontrol servisi ve geriye dönük senkronizasyon araçları Premium sunucuların kullanabildiği gelişmiş modüllerdir.'
              )
            ) : (
              <>
                {!settings.albion_guild_id && (
                  <div className="glass-panel p-2 border border-error/50 bg-error/5 flex flex-col md:flex-row justify-between items-center gap-2 mb-3">
                    <div className="text-left">
                      <h3 className="font-headline-md text-[10px] text-error mb-2 flex items-center gap-2 uppercase tracking-tight">
                        <AlertTriangle size={14} /> {lang === 'en' ? 'Action Required' : 'İşlem Gerekiyor'}
                      </h3>
                      <p className="font-body-md text-error-variant text-[10px]">
                        {lang === 'en' 
                          ? 'You must set your Albion Guild in General Settings to use the Auto-Check and Sync systems.' 
                          : 'Otomatik kontrol ve Senkronizasyon sistemlerini kullanabilmek için Genel ayarlardan Albion Guildinizi seçmelisiniz.'}
                      </p>
                    </div>
                    <button onClick={() => setActiveTab && setActiveTab('general')} className="px-3 py-1.5 bg-error hover:bg-error/80 text-white border border-error rounded-sm font-label-bold uppercase tracking-widest text-[10px] transition-colors whitespace-nowrap">
                      {lang === 'en' ? 'Go to General Settings' : 'Genel Ayarlara Git'}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        {lang === 'en' ? 'Enable Auto-Check' : 'Sistemi Aktif Et'}
                        <InfoTooltip text={lang === 'en' ? 'Turn on the automatic guild roster checking system.' : 'Otomatik lonca oyuncu kontrol sistemini açıp kapatır.'} />
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.auto_check_enabled || false}
                            onChange={(e) => setSettings({ ...settings, auto_check_enabled: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                        </label>
                        <span className="text-[10px] font-label-bold uppercase tracking-widest text-on-surface-variant">
                          {settings.auto_check_enabled 
                            ? (lang === 'en' ? 'Enabled' : 'Aktif') 
                            : (lang === 'en' ? 'Disabled' : 'Kapalı')}
                        </span>
                      </div>
                    </div>

                    <div className={`space-y-6 transition-all ${settings.auto_check_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <div>
                        <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                          {lang === 'en' ? 'Check Interval (Days, Min 3)' : 'Kontrol Aralığı (Gün, Min 3)'}
                        </label>
                        <input
                          type="number"
                          min="3"
                          className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                          value={settings.auto_check_interval || 3}
                          onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 3;
                            if (val < 3) val = 3;
                            setSettings({ ...settings, auto_check_interval: val });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`space-y-6 transition-all ${settings.auto_check_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                    <div>
                      <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        {lang === 'en' ? 'Role for Leavers' : "Guild'den Çıkanlara Verilecek Rol"}
                        <InfoTooltip text={lang === 'en' ? 'The role to give someone when they are detected as leaving the guild.' : 'Bir kişi loncadan ayrıldığında veya atıldığında ona verilecek Discord rolü.'} />
                      </label>
                      <div className="flex items-center gap-2 mt-2">
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
                        <span className="text-[10px] font-label-bold uppercase tracking-widest text-on-surface-variant">
                          {!settings.auto_check_custom_role_id 
                            ? (lang === 'en' ? 'Default Unregistered Role' : 'Kayıtsız Rolü Verilsin') 
                            : (lang === 'en' ? 'Custom Role' : 'Özel Rol Verilsin')}
                        </span>
                      </div>
                      
                      {settings.auto_check_custom_role_id && (
                        <div className="mt-2 animate-slide-up">
                          <select
                            className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
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
                      <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        {lang === 'en' ? 'Report Log Channel' : 'Rapor/Log Kanalı'}
                        <InfoTooltip text={lang === 'en' ? 'The channel where auto-check removal notifications will be sent.' : 'Otomatik sistemin loncadan çıkanları tespit edip yetkilerini aldığına dair atacağı raporların kanalı.'} />
                      </label>
                      <select
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                        value={settings.auto_check_log_channel_id || ""}
                        onChange={(e) => setSettings({ ...settings, auto_check_log_channel_id: e.target.value })}
                      >
                        <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
                        {textChannels.map(c => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 5: Questionnaire with Premium Check */}
      {subTab === "questionnaire" && (
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors space-y-6">
          <div>
            <h2 className="font-headline-lg text-[10px] text-on-surface mb-2 flex items-center gap-2 uppercase tracking-tight">
              <Layout className="text-primary-container" />
              {lang === 'en' ? 'Application Questionnaire' : 'Başvuru Anketi'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {lang === 'en' 
                ? 'Configure rule acceptance steps and questionnaire prompts before users join registration tickets.' 
                : 'Kullanıcılar kayıt bileti açmadan önce gösterilecek guild kurallarını ve özel başvuru sorularını yapılandırın.'}
            </p>
          </div>

          <div className="pt-6 border-t border-outline-variant/20">
            {!isPremium ? (
              renderPremiumLock(
                lang === 'en' ? 'Application Questionnaire Requires Premium' : 'Başvuru Anketi Premium Gerektirir',
                lang === 'en' 
                  ? 'Customized questionnaire builder, rules agreement step, and dynamic input fields are Premium server features.'
                  : 'Özelleştirilmiş başvuru soruları hazırlama modülü, kurallar onay adımı ve gelişmiş soru tipleri Sunucu Premium özellikleridir.'
              )
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[10px] font-label-bold text-on-surface uppercase tracking-widest mb-1">
                      {lang === 'en' ? 'Enable Questionnaire System' : 'Anket Sistemini Aktif Et'}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed max-w-lg">
                      {lang === 'en' 
                        ? 'Requires users to read rules and fill answers before opening registration channels.' 
                        : 'Kullanıcılardan kayıt kanalı oluşturulmadan önce kuralları onaylamasını ve soruları cevaplamasını ister.'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.application_enabled || false}
                      onChange={(e) => setSettings({ ...settings, application_enabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>

                {settings.application_enabled && (
                  <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant/20">
                    {/* Guild Rules TR */}
                    <div className="bg-surface-container/20 p-3 border border-outline-variant/30 rounded-lg">
                      <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        📜 {lang === 'en' ? 'Guild Rules Text (TR) (Optional)' : 'Guild Kuralları Metni (TR) (Opsiyonel)'}
                      </label>
                      <textarea
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y min-h-[120px]"
                        placeholder={lang === 'en'
                          ? 'Turkish rules text here...'
                          : 'Örn: Küfürlü konuşmamak önemlidir.\nAgresif tavırlar sergilememek...\n\nKabul ediyor musun?'}
                        value={settings.registration_rules_text || ''}
                        onChange={(e) => setSettings({ ...settings, registration_rules_text: e.target.value })}
                        maxLength={4000}
                      />
                      <p className="text-[10px] text-on-surface-variant/60 mt-1 text-right">
                        {(settings.registration_rules_text || '').length} / 4000
                      </p>
                    </div>

                    {/* Guild Rules EN */}
                    <div className="bg-surface-container/20 p-3 border border-outline-variant/30 rounded-lg">
                      <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        📜 {lang === 'en' ? 'Guild Rules Text (EN) (Optional)' : 'Guild Kuralları Metni (EN) (Opsiyonel)'}
                      </label>
                      <textarea
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y min-h-[120px]"
                        placeholder={lang === 'en'
                          ? 'e.g. No swearing, no harassment, no theft...\n\nDo you accept? Yes / No'
                          : 'İngilizce kurallar metni...'}
                        value={settings.registration_rules_text_en || ''}
                        onChange={(e) => setSettings({ ...settings, registration_rules_text_en: e.target.value })}
                        maxLength={4000}
                      />
                      <p className="text-[10px] text-on-surface-variant/60 mt-1 text-right">
                        {(settings.registration_rules_text_en || '').length} / 4000
                      </p>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                          ❓ {lang === 'en' ? 'Questions' : 'Sorular'}
                          <span className="ml-2 text-[10px] text-on-surface-variant/60 normal-case tracking-normal">
                            ({(settings.application_questions || []).length} / 15)
                          </span>
                        </label>
                        {(settings.application_questions || []).length < 15 && (
                          <button
                            onClick={() => {
                              const newQ = {
                                id: `q_${Date.now()}`,
                                order: (settings.application_questions || []).length + 1,
                                type: 'text',
                                question_tr: '',
                                question_en: '',
                                required: true,
                                max_length: 500,
                                options: []
                              };
                              setSettings({
                                ...settings,
                                application_questions: [...(settings.application_questions || []), newQ]
                              });
                            }}
                            className="px-3 py-1 bg-primary-container/10 border border-primary-container/40 text-primary-container rounded-sm text-[10px] font-label-bold uppercase tracking-widest hover:bg-primary-container/20 transition-all flex items-center gap-1"
                          >
                            + {lang === 'en' ? 'Add Question' : 'Soru Ekle'}
                          </button>
                        )}
                      </div>

                      {(settings.application_questions || []).length === 0 && (
                        <div className="py-1 text-center text-on-surface-variant text-[10px] border border-dashed border-outline-variant rounded-sm">
                          {lang === 'en' ? 'No questions yet. Click "+ Add Question" to get started.' : 'Henüz soru yok. "+ Soru Ekle" butonuna tıkla.'}
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        {(settings.application_questions || []).map((q, idx) => (
                          <div key={q.id} className="bg-surface-container/30 border border-outline-variant/50 rounded-lg p-3 flex flex-col gap-2 relative group hover:border-primary-container/30 transition-all">
                            
                            {/* Sort & Delete */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-label-bold text-primary-container uppercase tracking-widest">
                                #{idx + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                {idx > 0 && (
                                  <button
                                    onClick={() => {
                                      const arr = [...(settings.application_questions || [])];
                                      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                      setSettings({ ...settings, application_questions: arr });
                                    }}
                                    className="text-[10px] px-2 py-1 bg-surface-container border border-outline-variant/60 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                                  >↑</button>
                                )}
                                {idx < (settings.application_questions || []).length - 1 && (
                                  <button
                                    onClick={() => {
                                      const arr = [...(settings.application_questions || [])];
                                      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
                                      setSettings({ ...settings, application_questions: arr });
                                    }}
                                    className="text-[10px] px-2 py-1 bg-surface-container border border-outline-variant/60 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                                  >↓</button>
                                )}
                                <button
                                  onClick={() => {
                                    const arr = (settings.application_questions || []).filter((_, i) => i !== idx);
                                    setSettings({ ...settings, application_questions: arr });
                                  }}
                                  className="text-[10px] px-2 py-1 bg-error/10 border border-error/30 rounded text-error hover:bg-error/20 transition-colors font-label-bold uppercase tracking-wider"
                                >✕ {lang === 'en' ? 'Delete' : 'Sil'}</button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {/* Question Type */}
                              <div>
                                <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-1">
                                  {lang === 'en' ? 'Question Type' : 'Soru Tipi'}
                                </label>
                                <select
                                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors text-[10px]"
                                  value={q.type || 'text'}
                                  onChange={(e) => {
                                    const arr = [...(settings.application_questions || [])];
                                    arr[idx] = { ...arr[idx], type: e.target.value, options: [] };
                                    setSettings({ ...settings, application_questions: arr });
                                  }}
                                >
                                  <option value="text">📝 {lang === 'en' ? 'Short Text' : 'Kısa Metin'}</option>
                                  <option value="paragraph">📄 {lang === 'en' ? 'Long Text (Paragraph)' : 'Uzun Metin (Paragraf)'}</option>
                                  <option value="yesno">✅ {lang === 'en' ? 'Yes / No' : 'Evet / Hayır'}</option>
                                  <option value="select">🔘 {lang === 'en' ? 'Single Choice' : 'Tek Seçim'}</option>
                                  <option value="multiselect">☑️ {lang === 'en' ? 'Multiple Choice' : 'Çoklu Seçim'}</option>
                                </select>
                              </div>

                              {(q.type === 'text' || q.type === 'paragraph') && (
                                <div>
                                  <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-1">
                                    {lang === 'en' ? 'Max Characters' : 'Max Karakter'}
                                  </label>
                                  <input
                                    type="number"
                                    min="10"
                                    max="1000"
                                    className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors text-[10px]"
                                    value={q.max_length || 500}
                                    onChange={(e) => {
                                      const arr = [...(settings.application_questions || [])];
                                      arr[idx] = { ...arr[idx], max_length: parseInt(e.target.value) || 500 };
                                      setSettings({ ...settings, application_questions: arr });
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Question TR */}
                            <div>
                              <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-1">
                                🇹🇷 {lang === 'en' ? 'Question (Turkish)' : 'Soru Metni (Türkçe)'}
                              </label>
                              <input
                                type="text"
                                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors text-[10px]"
                                placeholder={lang === 'en' ? 'e.g. How do you earn in-game currency?' : 'Örn: Oyundaki ekonominizi nasıl sağlıyorsunuz?'}
                                value={q.question_tr || ''}
                                maxLength={(q.type === 'text' || q.type === 'paragraph') ? 45 : 200}
                                onChange={(e) => {
                                  const arr = [...(settings.application_questions || [])];
                                  arr[idx] = { ...arr[idx], question_tr: e.target.value };
                                  setSettings({ ...settings, application_questions: arr });
                                }}
                              />
                              {(q.type === 'text' || q.type === 'paragraph') && (
                                <p className="text-[9px] text-on-surface-variant/70 mt-1">
                                  {lang === 'en' ? 'Max 45 chars for Modals' : 'Modal (Form) sınırı: 45 karakter'} ({(q.question_tr || '').length}/45)
                                </p>
                              )}
                            </div>

                            {/* Question EN */}
                            <div>
                              <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-1">
                                🇬🇧 {lang === 'en' ? 'Question (English)' : 'Soru Metni (İngilizce)'}
                              </label>
                              <input
                                type="text"
                                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors text-[10px]"
                                placeholder="e.g. How do you earn in-game currency?"
                                value={q.question_en || ''}
                                maxLength={(q.type === 'text' || q.type === 'paragraph') ? 45 : 200}
                                onChange={(e) => {
                                  const arr = [...(settings.application_questions || [])];
                                  arr[idx] = { ...arr[idx], question_en: e.target.value };
                                  setSettings({ ...settings, application_questions: arr });
                                }}
                              />
                              {(q.type === 'text' || q.type === 'paragraph') && (
                                <p className="text-[9px] text-on-surface-variant/70 mt-1">
                                  {lang === 'en' ? 'Max 45 chars for Modals' : 'Modal (Form) sınırı: 45 karakter'} ({(q.question_en || '').length}/45)
                                </p>
                              )}
                            </div>

                            {/* Options */}
                            {(q.type === 'select' || q.type === 'multiselect') && (
                              <div>
                                <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                                  {lang === 'en' ? 'Options (one per line)' : 'Seçenekler (her satıra bir tane)'}
                                </label>
                                <textarea
                                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors text-[10px] resize-y min-h-[80px]"
                                  placeholder={lang === 'en'
                                    ? 'Option 1\nOption 2\nOption 3'
                                    : 'Tank\nRDPS\nMDPS\nHealer\nSupport'}
                                  value={q.options_raw !== undefined ? q.options_raw : (q.options || []).join('\n')}
                                  onChange={(e) => {
                                    const rawVal = e.target.value;
                                    const arr = [...(settings.application_questions || [])];
                                    arr[idx] = {
                                      ...arr[idx],
                                      options_raw: rawVal,
                                      options: rawVal.split('\n').map(s => s.trim()).filter(Boolean)
                                    };
                                    setSettings({ ...settings, application_questions: arr });
                                  }}
                                />
                                <p className="text-[10px] text-on-surface-variant/60 mt-1">
                                  {(q.options || []).length} {lang === 'en' ? 'options' : 'seçenek'} (max 25)
                                </p>
                              </div>
                            )}

                            {/* Required */}
                            <div className="flex items-center gap-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={q.required !== false}
                                  onChange={(e) => {
                                    const arr = [...(settings.application_questions || [])];
                                    arr[idx] = { ...arr[idx], required: e.target.checked };
                                    setSettings({ ...settings, application_questions: arr });
                                  }}
                                />
                                <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div>
                              </label>
                              <span className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                                {q.required !== false
                                  ? (lang === 'en' ? 'Required' : 'Zorunlu')
                                  : (lang === 'en' ? 'Optional' : 'Opsiyonel')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {(settings.application_questions || []).length > 0 && (
                        <div className="mt-2 p-3 bg-primary-container/5 border border-primary-container/20 rounded-sm text-[10px] text-on-surface-variant leading-relaxed">
                          💡 {lang === 'en'
                            ? 'Text/Paragraph questions are shown in groups of 5 per Discord modal. Yes/No and Choice questions appear as buttons/menus between modals.'
                            : 'Metin soruları Discord modal\'da 5\'er gruba ayrılır. Evet/Hayır ve Seçim soruları modallar arası buton/menü olarak gösterilir.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
