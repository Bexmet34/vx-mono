"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Settings, Trash2, ArrowLeft, Headphones, Sliders, Shield, MoreHorizontal, HelpCircle, FileText, Crown } from "lucide-react";
import Logo from "@/components/Logo";

const CustomSelect = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-sm text-left focus:border-primary-container hover:border-primary-container outline-none transition-all flex items-center justify-between"
      >
        <span className={selectedOption ? "text-on-surface" : "text-on-surface-variant"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 left-0 top-[calc(100%+8px)] max-h-[300px] overflow-y-auto custom-scrollbar bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl z-[100] flex flex-col p-2 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-colors text-left ${value === opt.value ? 'bg-white/5 text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="text-sm">{opt.label}</span>
              {value === opt.value && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-container"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TempVoiceTab({ t, lang, settings, setSettings, setInitialSettings, discordChannels, discordRoles, isPremium, guildId }) {
  const [editingCreatorId, setEditingCreatorId] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [showVarMenu, setShowVarMenu] = useState(false);
  const varMenuRef = useRef(null);

  // Close var menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (varMenuRef.current && !varMenuRef.current.contains(event.target)) {
        setShowVarMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isCreatingCreator, setIsCreatingCreator] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);

  // Temporary local state for the creators if it's not yet in main settings
  const creators = settings.tempvoice_creators || [];

  const handleAddCreator = async () => {
    setIsCreatingCreator(true);
    setCreationProgress(10);

    const newCreator = {
      id: crypto.randomUUID(),
      name: "➕・Open-Audio-Channel",
      channelNameFormat: "Veyronix - {NUMBER}",
      userLimit: 99,
      categoryId: "",
      bitrate: "64kbps",
      position: "Altta",
      allowedRoles: [],
      permissionSyncMode: "category",
      privacyMode: "public",
      ownerPermissions: ["manage_channels", "disconnect_members", "create_invite"]
    };

    const updatedSettings = {
      ...settings,
      tempvoice_creators: [...creators, newCreator]
    };

    setSettings(updatedSettings);
    if (setInitialSettings) setInitialSettings(updatedSettings);

    try {
      setCreationProgress(30);
      const res = await fetch(`/api/guild-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedSettings,
          trigger_tempvoice_setup: true
        })
      });

      if (!res.ok) throw new Error("Failed to trigger creation");

      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        setCreationProgress(p => Math.min(p + 5, 90));

        if (attempts > 15) { // 30s timeout
          clearInterval(pollInterval);
          setIsCreatingCreator(false);
          setEditingCreatorId(newCreator.id);
          // Also set initial settings so save button disappears
          if (setInitialSettings) setInitialSettings(updatedSettings);
          return;
        }

        try {
          const checkRes = await fetch(`/api/guild-settings/${guildId}`);
          if (checkRes.ok) {
            const data = await checkRes.json();
            const latestCreators = data.settings?.tempvoice_creators || [];
            const found = latestCreators.find(c => c.id === newCreator.id);
            if (found && found.channelId) {
              clearInterval(pollInterval);
              setCreationProgress(100);
              setSettings(data.settings);
              if (setInitialSettings) setInitialSettings(data.settings);
              
              setTimeout(() => {
                setIsCreatingCreator(false);
                setEditingCreatorId(newCreator.id);
              }, 500);
            }
          }
        } catch (e) {
          // ignore fetch errors on poll
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      setIsCreatingCreator(false);
      setEditingCreatorId(newCreator.id);
      if (setInitialSettings) setInitialSettings(updatedSettings);
    }
  };

  const handleUpdateCreator = (id, updates) => {
    setSettings({
      ...settings,
      tempvoice_creators: creators.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  };

  const handleDeleteCreator = (id) => {
    setSettings({
      ...settings,
      tempvoice_creators: creators.filter(c => c.id !== id)
    });
  };

  const handleVarClick = (tag) => {
    const creator = creators.find(c => c.id === editingCreatorId);
    if (creator) {
      handleUpdateCreator(creator.id, { channelNameFormat: (creator.channelNameFormat || "") + tag });
    }
    setShowVarMenu(false);
  };

  const variables = [
    {
      category: "Sahip",
      items: [
        { tag: "{OWNER_USERNAME}", desc: "Kanal sahibi olan kullanıcının kullanıcı adı" },
        { tag: "{OWNER_NICKNAME}", desc: "Kanal sahibi olan kullanıcının görünen adı" },
        { tag: "{OWNER_CREATED}", desc: "Kanal sahibi olan kullanıcının hesabını oluşturduğu tarih (GG/AA/YYYY)" },
        { tag: "{OWNER_JOINED}", desc: "Kanal sahibi olan kullanıcının sunucuya katıldığı tarih (GG/AA/YYYY)" },
      ]
    },
    {
      category: "Sahip Rolü",
      items: [
        { tag: "{ROLE_HIGHEST}", desc: "Kullanıcının sahip olduğu en yüksek rolün adı" },
        { tag: "{ROLE_HOIST}", desc: "Üye listesinde gösterilen en üst rolün adı" },
      ]
    },
    {
      category: "Sayaç",
      items: [
        { tag: "{NUMBER}", desc: "1 2 3 4 5" },
        { tag: "{NUMBER_ROMAN}", desc: "I II III IV V" },
        { tag: "{NUMBER_ALPHA}", desc: "A B C D E" },
        { tag: "{NUMBER_EXPONENT}", desc: "¹ ² ³ ⁴ ⁵" },
        { tag: "{NUMBER_DIGIT}", desc: "001 002 003 004 005" },
      ]
    },
    {
      category: "Etkinlik",
      isPremium: true,
      items: [
        { tag: "{ACTIVITY_NAME}", desc: "Sahibin oynadığı oyunun adı" },
        { tag: "{ACTIVITY_NAME_MAJORITY}", desc: "Çoğunluğun oynadığı oyunun adı" },
        { tag: "{ACTIVITY_DETAILS}", desc: "Bir etkinliğin ayrıntıları" },
        { tag: "{ACTIVITY_STATE}", desc: "Bir etkinliğin durumu" },
      ]
    }
  ];

  const ownerPermOptions = [
    { value: "manage_roles", label: "İzinleri Yönet (Önerilmez)" },
    { value: "manage_channels", label: "Kanalları Yönet" },
    { value: "manage_messages", label: "Mesajları Sil" },
    { value: "disconnect_members", label: "Üyelerin Bağlantısını Kes" },
    { value: "create_invite", label: "Davet Oluştur" },
    { value: "create_poll", label: "Anket Oluştur" },
    { value: "send_voice_messages", label: "Sesli Mesaj Gönder" },
    { value: "stream", label: "Kamera ve Ekran Paylaşma" },
    { value: "priority_speaker", label: "Öncelikli Konuşmacı" },
    { value: "use_voice_activity", label: "Ses Etkinliğini Kullan" },
    { value: "set_voice_channel_status", label: "Ses Kanalının Durumunu Ayarla" },
    { value: "use_soundboard", label: "Ses Panelini Kullan" }
  ];

  const toggleOwnerPerm = (creator, val) => {
    const current = creator.ownerPermissions || [];
    if (current.includes(val)) {
      handleUpdateCreator(creator.id, { ownerPermissions: current.filter(p => p !== val) });
    } else {
      handleUpdateCreator(creator.id, { ownerPermissions: [...current, val] });
    }
  };

  const [ownerPermDropdownOpen, setOwnerPermDropdownOpen] = useState(false);
  const ownerPermRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ownerPermRef.current && !ownerPermRef.current.contains(event.target)) {
        setOwnerPermDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const rolesRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rolesRef.current && !rolesRef.current.contains(event.target)) {
        setRolesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (editingCreatorId) {
    const creator = creators.find(c => c.id === editingCreatorId);
    if (!creator) return null;

    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        {isCreatingCreator && (
          <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#09090b]/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-5 p-8 bg-surface-container rounded-2xl border border-outline-variant shadow-2xl max-w-sm w-full mx-4">
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full"></div>
                <Logo width={48} height={48} className="text-primary-container animate-pulse-slow relative z-10" />
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <h3 className="text-lg font-headline-bold text-on-surface">{lang === 'tr' ? 'Kanal Oluşturuluyor' : 'Creating Channel'}</h3>
                <p className="text-sm text-on-surface-variant">{lang === 'tr' ? 'Bot şu anda Discord üzerinde kanalınızı kuruyor, lütfen bekleyin...' : 'The bot is currently setting up your channel on Discord, please wait...'}</p>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mt-2 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary-container rounded-full transition-all duration-300" 
                  style={{ width: `${creationProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 text-sm font-label-bold uppercase tracking-widest bg-surface-container p-3 rounded-xl border border-outline-variant w-fit shadow-md">
            <button onClick={() => setEditingCreatorId(null)} className="flex items-center gap-2 text-primary-container hover:brightness-125 transition-all">
              <ArrowLeft size={16} />
              {lang === 'tr' ? 'Geri Dön' : 'Go Back'}
            </button>
            <span className="text-on-surface-variant/50">/</span>
            <span className="text-on-surface">
              {lang === 'tr' ? 'Oluşturucu Ayarları' : 'Creator Settings'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-4xl font-headline-xl text-on-surface tracking-tight font-bold">
              {creator.name}
            </h2>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2 mb-2">
          {[
            { id: 'overview', label: lang === 'tr' ? 'Genel Bakış' : 'Overview', icon: FileText, disabled: false },
            { id: 'permissions', label: lang === 'tr' ? 'İzinler' : 'Permissions', icon: FileText, disabled: false },
            { id: 'moderation', label: lang === 'tr' ? 'Moderasyon' : 'Moderation', icon: Shield, disabled: true },
            { id: 'others', label: lang === 'tr' ? 'Diğerleri' : 'Others', icon: FileText, disabled: true }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { if (!tab.disabled) setActiveSubTab(tab.id); }}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-label-bold uppercase tracking-widest transition-all ${
                tab.disabled 
                  ? "opacity-50 cursor-not-allowed text-on-surface-variant" 
                  : activeSubTab === tab.id
                    ? "bg-surface text-on-surface border border-outline-variant/60 shadow-sm"
                    : "text-on-surface-variant hover:bg-white/5 border border-transparent hover:text-on-surface"
                }`}
            >
              <tab.icon size={14} className={activeSubTab === tab.id && !tab.disabled ? "text-on-surface" : "text-on-surface-variant"} />
              {tab.label}
              {tab.disabled && <span className="text-[9px] bg-outline-variant/30 px-1.5 py-0.5 rounded ml-1">{lang === 'tr' ? 'YAKINDA' : 'SOON'}</span>}
            </button>
          ))}
        </div>

        {activeSubTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Channel Name */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <Headphones size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Adı' : 'Temp Channel Name'}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={creator.channelNameFormat}
                    onChange={(e) => handleUpdateCreator(creator.id, { channelNameFormat: e.target.value })}
                    className="flex-1 bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-on-surface text-sm focus:border-primary-container outline-none transition-all shadow-inner"
                  />
                  <div className="relative" ref={varMenuRef}>
                    <button
                      onClick={() => setShowVarMenu(!showVarMenu)}
                      className={`p-3 border rounded-lg transition-all flex items-center justify-center min-w-[44px] ${showVarMenu ? 'bg-primary-container/20 border-primary-container text-primary-container' : 'bg-surface-container/30 border-outline-variant hover:border-primary-container text-on-surface hover:text-primary-container'}`}
                    >
                      {"{}"}
                    </button>

                    {showVarMenu && (
                      <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto custom-scrollbar bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl z-50 flex flex-col p-2 animate-fade-in">
                        {variables.map((group, idx) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <div className="flex items-center gap-2 px-2 mb-1">
                              <span className="text-xs font-label-bold text-on-surface-variant uppercase tracking-widest">{group.category}</span>
                              {group.isPremium && (
                                <span className="bg-primary-container/20 text-primary-container text-[8px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                  Kendi Markanız <Crown size={10} />
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {group.items.map((item, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleVarClick(item.tag)}
                                  className="flex flex-col items-start p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                >
                                  <span className="text-sm font-label-bold text-on-surface">{item.tag}</span>
                                  <span className="text-[10px] text-on-surface-variant leading-tight mt-0.5">{item.desc}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanallar oluşturulduğunda varsayılan olarak kullanılacak kanal adını belirleyin.' : 'Set the default channel name format for temporary channels.'}
                </p>
              </div>

              {/* User Limit */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <Shield size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Kullanıcı Limiti' : 'Temp Channel User Limit'}
                  <span className="bg-[#FF3366] text-white px-2 py-0.5 rounded text-[10px] ml-1 font-bold">
                    {creator.userLimit}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="99"
                    value={creator.userLimit}
                    onChange={(e) => handleUpdateCreator(creator.id, { userLimit: parseInt(e.target.value) })}
                    className="w-full accent-[#FF3366] h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FF3366 ${(creator.userLimit / 99) * 100}%, #2A2A2A ${(creator.userLimit / 99) * 100}%)`
                    }}
                  />
                  <div className="shrink-0 p-2 bg-surface-container/30 border border-outline-variant rounded-lg text-on-surface-variant rotate-45 transform">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanalların varsayılan olarak belirleneceği kullanıcı limitini ayarlayın.' : 'Set the default user limit for temporary channels.'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
              {/* Category */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                  {lang === 'tr' ? 'Geçici Kanalın Kategorisi' : 'Temp Channel Category'}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CustomSelect
                      value={creator.categoryId}
                      onChange={(val) => handleUpdateCreator(creator.id, { categoryId: val })}
                      placeholder={lang === 'tr' ? 'Kategori Seçin' : 'Select Category'}
                      options={(discordChannels?.filter(c => c.type === 4) || []).map(c => ({ value: c.id, label: c.name }))}
                    />
                  </div>
                  <button className="p-3 bg-surface-container/30 border border-outline-variant rounded-lg text-[#FF3366] hover:bg-[#FF3366]/10 transition-all flex items-center justify-center min-w-[44px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanalların oluşturulacağı kategoriyi seçin.' : 'Select the category where temp channels will be created.'}
                </p>
              </div>

              {/* Bitrate */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <HelpCircle size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Bit Hızı' : 'Temp Channel Bitrate'}
                </div>
                <CustomSelect
                  value={creator.bitrate}
                  onChange={(val) => handleUpdateCreator(creator.id, { bitrate: val })}
                  placeholder={lang === 'tr' ? 'Bit Hızı Seçin' : 'Select Bitrate'}
                  options={[
                    { value: '64kbps', label: '64kbps' },
                    { value: '96kbps', label: '96kbps' },
                    { value: '128kbps', label: '128kbps' }
                  ]}
                />
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici ses kanallarının bit hızını belirleyin. Daha yüksek değerler kaliteyi artırır ancak sunucunuzun takviye seviyesi bunu karşılamıyor olabilir.' : 'Set the bitrate for temp audio channels. Higher values increase quality but your server boost level may not support it.'}
                </p>
              </div>

              {/* Position */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {lang === 'tr' ? 'Geçici Kanalın Pozisyonu' : 'Temp Channel Position'}
                </div>
                <div className="relative">
                  <CustomSelect
                    value={creator.position}
                    onChange={(val) => handleUpdateCreator(creator.id, { position: val })}
                    placeholder={lang === 'tr' ? 'Pozisyon Seçin' : 'Select Position'}
                    options={[
                      { value: 'Altta', label: lang === 'tr' ? 'Altta' : 'Bottom' },
                      { value: 'Üstte', label: lang === 'tr' ? 'Üstte' : 'Top' },
                      { value: 'Oluşturucunun hemen altında', label: lang === 'tr' ? 'Oluşturucunun hemen altında' : 'Right below creator' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "permissions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Allowed Roles */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><circle cx="19" cy="11" r="2"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
                  {lang === 'tr' ? 'Geçici Kanala Erişebilecek Roller' : 'Allowed Roles'}
                  <span className="bg-[#FF3366] text-white px-2 py-0.5 rounded text-[10px] ml-1 font-bold">@everyone</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative" ref={rolesRef}>
                    <button
                      onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
                      className="w-full bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-sm text-left hover:border-primary-container outline-none transition-all flex items-center justify-between min-h-[46px]"
                    >
                      <span className="truncate pr-4 text-on-surface-variant">
                        {(creator.allowedRoles || []).length > 0
                          ? (discordRoles || []).filter(r => (creator.allowedRoles || []).includes(r.id)).map(r => r.name).join(", ")
                          : (lang === 'tr' ? 'Rolleri Seçin' : 'Select Roles')}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {creator.allowedRoles?.length > 0 && (
                          <span onClick={(e) => { e.stopPropagation(); handleUpdateCreator(creator.id, { allowedRoles: [] }); }} className="text-on-surface-variant hover:text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </span>
                        )}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </button>

                    {rolesDropdownOpen && (
                      <div className="absolute right-0 left-0 top-[calc(100%+8px)] max-h-[300px] overflow-y-auto custom-scrollbar bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl z-[100] flex flex-col p-2 animate-fade-in">
                        {discordRoles?.map((role) => {
                          const isChecked = (creator.allowedRoles || []).includes(role.id);
                          return (
                            <button
                              key={role.id}
                              onClick={() => {
                                const current = creator.allowedRoles || [];
                                if (current.includes(role.id)) {
                                  handleUpdateCreator(creator.id, { allowedRoles: current.filter(id => id !== role.id) });
                                } else {
                                  handleUpdateCreator(creator.id, { allowedRoles: [...current, role.id] });
                                }
                              }}
                              className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-colors text-left group"
                            >
                              <div className="flex items-center gap-2">
                                {role.color && role.color !== 0 && (
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${role.color.toString(16).padStart(6, '0')}` }}></div>
                                )}
                                <span className={`text-sm ${isChecked ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>{role.name}</span>
                              </div>
                              {isChecked && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-container"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <button className="p-3 bg-surface-container/30 border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary-container transition-all flex items-center justify-center min-w-[46px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Varsayılan olan @everyone iznini geçersiz kılarak geçici kanalları görebilmek veya erişebilmek için gereken rolleri seçin.' : 'Select the roles required to view or access temporary channels, overriding the default @everyone permission.'}
                </p>
              </div>

              {/* Permission Sync */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                  {lang === 'tr' ? 'Geçici Kanal İzinleri' : 'Temp Channel Permissions'}
                </div>
                <div className="relative">
                  <CustomSelect
                    value={creator.permissionSyncMode || "category"}
                    onChange={(val) => handleUpdateCreator(creator.id, { permissionSyncMode: val })}
                    placeholder={lang === 'tr' ? 'Senkronize Modu' : 'Sync Mode'}
                    options={[
                      { value: 'category', label: lang === 'tr' ? 'Kategoriden senkronize et' : 'Sync from category' },
                      { value: 'creator', label: lang === 'tr' ? 'Kanal Oluşturucu\'dan senkronize et' : 'Sync from creator channel' },
                      { value: 'none', label: lang === 'tr' ? 'Senkronize etme' : 'Do not sync' }
                    ]}
                  />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                  {lang === 'tr' ? 'Geçici bir kanal oluştururken izinlerin nereden senkronize edileceğini seçin.' : 'Select where permissions should be synced from when creating a temp channel.'}
                </p>

                {/* Info Alert Box */}
                <div className="bg-[#FF9900]/10 border border-[#FF9900]/30 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[#FF9900] font-label-bold text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {lang === 'tr' ? 'Bunu bilmelisiniz:' : 'Good to know:'}
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {lang === 'tr'
                      ? "'Bağlan', 'Kanalı Görüntüle' ve 'Mesaj Gönder' izinleri @everyone için senkronize edilemez. Çünkü bu izinler kanal kilitleme ve görünürlüğünü yönetmek için ayrılmıştır."
                      : "'Connect', 'View Channel' and 'Send Messages' permissions cannot be synced for @everyone. These are reserved for channel locking and visibility management."}
                  </p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {lang === 'tr'
                      ? "Eğer @everyone'ın geçici kanallara erişimini kısıtlamak istiyorsanız lütfen bunun yerine 'Geçici Kanallara Erişim Rolleri'ni kullanın."
                      : "If you want to restrict @everyone's access to temp channels, please use 'Allowed Roles' instead."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
              {/* Privacy Mode */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <Shield size={18} />
                  {lang === 'tr' ? 'Geçici Kanalın Gizlilik Modu' : 'Temp Channel Privacy Mode'}
                </div>
                <div className="relative">
                  <CustomSelect
                    value={creator.privacyMode || "public"}
                    onChange={(val) => handleUpdateCreator(creator.id, { privacyMode: val })}
                    placeholder={lang === 'tr' ? 'Gizlilik Modu' : 'Privacy Mode'}
                    options={[
                      { value: 'public', label: lang === 'tr' ? 'Herkese Açık' : 'Public' },
                      { value: 'locked', label: lang === 'tr' ? 'Kilitli' : 'Locked' },
                      { value: 'hidden', label: lang === 'tr' ? 'Gizli' : 'Hidden' }
                    ]}
                  />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanalların varsayılan olarak herkese açık, kilitli veya diğer kullanıcılardan gizli olma durumunu belirleyin.' : 'Set whether temporary channels should default to being public, locked, or hidden from other users.'}
                </p>
              </div>

              {/* Owner Permissions */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {lang === 'tr' ? 'Geçici Kanal Sahibinin İzinleri' : 'Temp Channel Owner Permissions'}
                </div>
                <div className="relative" ref={ownerPermRef}>
                  <button
                    onClick={() => setOwnerPermDropdownOpen(!ownerPermDropdownOpen)}
                    className="w-full bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-on-surface text-sm text-left hover:border-primary-container outline-none transition-all flex items-center justify-between"
                  >
                    <span className="truncate pr-4 text-on-surface-variant">
                      {(creator.ownerPermissions || []).length > 0
                        ? ownerPermOptions.filter(o => (creator.ownerPermissions || []).includes(o.value)).map(o => lang === 'en' ? o.value : o.label).join(", ")
                        : (lang === 'tr' ? 'İzin Seçin' : 'Select Permissions')}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {creator.ownerPermissions?.length > 0 && (
                        <span onClick={(e) => { e.stopPropagation(); handleUpdateCreator(creator.id, { ownerPermissions: [] }); }} className="text-on-surface-variant hover:text-white">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </span>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </button>

                  {ownerPermDropdownOpen && (
                    <div className="absolute right-0 left-0 top-[calc(100%+8px)] max-h-[300px] overflow-y-auto custom-scrollbar bg-surface-container-highest border border-outline-variant rounded-xl shadow-2xl z-[100] flex flex-col p-2 animate-fade-in">
                      {ownerPermOptions.map((opt) => {
                        const isChecked = (creator.ownerPermissions || []).includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => toggleOwnerPerm(creator, opt.value)}
                            className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-colors text-left group"
                          >
                            <span className={`text-sm ${isChecked ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>{opt.label}</span>
                            {isChecked && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-container"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === 'tr' ? 'Geçici kanal sahiplerine, kanal üzerinde kontrol sahibi oldukları sürece ek izinler (örn. Kanalı Yönetme, Üyeleri Taşıma) verin.' : 'Grant temporary channel owners additional permissions (e.g. Manage Channel, Move Members) as long as they have control over the channel.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Initial View
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {isCreatingCreator && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#09090b]/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-5 p-8 bg-surface-container rounded-2xl border border-outline-variant shadow-2xl max-w-sm w-full mx-4">
            <div className="relative mb-2">
              <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full"></div>
              <Logo width={48} height={48} className="text-primary-container animate-pulse-slow relative z-10" />
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <h3 className="text-lg font-headline-bold text-on-surface">{lang === 'tr' ? 'Kanal Oluşturuluyor' : 'Creating Channel'}</h3>
              <p className="text-sm text-on-surface-variant">{lang === 'tr' ? 'Bot şu anda Discord üzerinde kanalınızı kuruyor, lütfen bekleyin...' : 'The bot is currently setting up your channel on Discord, please wait...'}</p>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mt-2 relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary-container rounded-full transition-all duration-300" 
                style={{ width: `${creationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-headline-lg text-on-surface uppercase tracking-widest flex items-center gap-2">
          <Headphones className="text-primary-container" size={20} />
          {lang === 'tr' ? 'Geçici Ses Kanalları' : 'Temporary Voice Channels'}
        </h2>
        <span className="bg-primary-container text-on-primary text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">
          BETA
        </span>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-outline-variant rounded-xl bg-surface-container/20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl"></div>
          <button
            onClick={handleAddCreator}
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-outline-variant hover:border-primary-container text-on-surface hover:text-primary-container rounded-lg font-label-bold tracking-wide transition-all shadow-lg hover:shadow-primary-container/20 z-10"
          >
            <Plus size={20} />
            Open Audio Channel
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
              <Headphones size={18} />
              {lang === 'tr' ? 'Kanal Oluşturucular' : 'Channel Creators'}
            </div>
          </div>

          {creators.map(creator => (
            <div key={creator.id} className="flex items-center justify-between p-3 bg-surface-container/30 border border-outline-variant rounded-xl group hover:border-primary-container/50 transition-all">
              <div className="flex items-center gap-3">
                <Headphones size={20} className="text-on-surface-variant group-hover:text-primary-container transition-colors" />
                <span className="font-label-bold text-sm tracking-wide text-on-surface truncate">
                  {creator.name || '➕・Open-Audio-Channel'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCreatorId(creator.id)}
                  className="p-2 bg-surface-container/50 border border-outline-variant hover:border-primary-container text-on-surface-variant hover:text-primary-container rounded-lg transition-all"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCreator(creator.id)}
                  className="p-2 bg-surface-container/50 border border-outline-variant hover:border-[#FF3366] text-on-surface-variant hover:text-[#FF3366] rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {creators.length > 0 && (
            <button
              onClick={handleAddCreator}
              className="flex items-center justify-center gap-2 p-3 mt-2 bg-surface border border-dashed border-outline-variant hover:border-primary-container text-on-surface-variant hover:text-primary-container rounded-xl font-label-bold tracking-wide transition-all"
            >
              <Plus size={16} /> {lang === 'tr' ? 'Yeni Oluşturucu Ekle' : 'Add New Creator'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
