"use client";

import { useEffect, useState } from "react";
import { Users, Save, Loader2, Send, ShieldPlus } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";

export default function RoleMenuTab({ t, lang, guildId, discordChannels, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggeringSetup, setTriggeringSetup] = useState(false);
  const [triggeringSend, setTriggeringSend] = useState(false);

  const [globalRoles, setGlobalRoles] = useState([]);
  const [settings, setSettings] = useState({
    channel_id: "",
    active_roles: [],
    category_limits: { combat: 5, economy: 5, crafting: 5 },
    header_image_url: "",
    is_installed: false
  });

  useEffect(() => {
    fetchData();
  }, [guildId]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/roles/${guildId}`);
      const data = await res.json();
      if (res.ok) {
        setGlobalRoles(data.global_roles || []);
        if (data.settings) {
          setSettings(prev => ({
            ...prev,
            ...data.settings,
            active_roles: data.settings.active_roles || [],
            category_limits: data.settings.category_limits || { combat: 5, economy: 5, crafting: 5 }
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast(lang === "en" ? "Role settings saved!" : "Rol ayarları kaydedildi!", "success");
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSetupRoles = async () => {
    setTriggeringSetup(true);
    try {
      const res = await fetch(`/api/roles/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      if (res.ok) {
        showToast(lang === "en" ? "Installation started. Bot is creating roles in your server..." : "Kurulum başladı. Bot rolleri sunucunuzda oluşturuyor...", "success");
        // Poll for completion
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const checkRes = await fetch(`/api/roles/${guildId}`);
          if (checkRes.ok) {
            const data = await checkRes.json();
            if (data.settings && data.settings.is_installed) {
              clearInterval(interval);
              setSettings(prev => ({ ...prev, is_installed: true }));
              setTriggeringSetup(false);
              showToast(lang === "en" ? "Roles installed successfully!" : "Roller başarıyla kuruldu!", "success");
            }
          }
          if (attempts > 30) {
            clearInterval(interval);
            setTriggeringSetup(false);
            showToast(lang === "en" ? "Taking too long. Check back later." : "İşlem uzun sürdü, daha sonra tekrar kontrol edin.", "warning");
          }
        }, 3000);
      } else {
        throw new Error("Failed to trigger setup");
      }
    } catch (err) {
      showToast(err.message, "error");
      setTriggeringSetup(false);
    }
  };

  const handleSendMenu = async () => {
    if (!settings.channel_id) {
      showToast(lang === "en" ? "Please select a channel first." : "Lütfen önce bir kanal seçin.", "error");
      return;
    }
    
    // Save settings first, then trigger send
    await handleSave();
    
    setTriggeringSend(true);
    try {
      const res = await fetch(`/api/roles/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_menu" }),
      });
      if (res.ok) {
        showToast(lang === "en" ? "Menu send command issued to the bot." : "Menü gönderme komutu bota iletildi.", "success");
      } else {
        throw new Error("Failed to trigger send menu");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setTriggeringSend(false);
    }
  };

  const toggleRole = (roleKey) => {
    setSettings(prev => {
      const active = prev.active_roles.includes(roleKey)
        ? prev.active_roles.filter(r => r !== roleKey)
        : [...prev.active_roles, roleKey];
      return { ...prev, active_roles: active };
    });
  };

  const updateLimit = (category, value) => {
    setSettings(prev => ({
      ...prev,
      category_limits: {
        ...prev.category_limits,
        [category]: parseInt(value) || 1
      }
    }));
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-container" size={32} /></div>;

  if (!settings.is_installed) {
    return (
      <div className="grid grid-cols-1 gap-6 animate-slide-up">
        <div className="glass-panel p-12 relative overflow-visible border border-outline-variant flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-container/20 text-primary-container rounded-full flex items-center justify-center mb-6 border border-primary-container/50">
            <ShieldPlus size={40} />
          </div>
          <h2 className="font-headline-lg text-3xl text-on-surface mb-4 uppercase tracking-tight">
            {lang === 'en' ? 'Bot Roles Setup Required' : 'Bot Rolleri Kurulumu Gerekiyor'}
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-lg mb-8 text-lg">
            {lang === 'en' 
              ? 'To use the Role Selection Menu, the bot needs to create all the necessary Albion Online roles (PvP, Gatherer, Crafter etc.) in your server.' 
              : 'Rol Seçim Menüsünü kullanabilmek için botun sunucunuzda gerekli tüm Albion Online rollerini (PvP, Toplayıcı, Zanaatkar vb.) oluşturması gerekmektedir.'}
          </p>
          <button 
            className="px-8 py-4 bg-primary-container text-on-primary rounded-sm font-label-bold uppercase tracking-widest flex items-center gap-3 transition-all hover:brightness-110 active:scale-95 tactical-glow disabled:opacity-50"
            onClick={handleSetupRoles}
            disabled={triggeringSetup}
          >
            {triggeringSetup ? (
              <span className="flex items-center justify-center"><Loader2 size={20} className="animate-spin" /></span>
            ) : (
              <span className="flex items-center justify-center"><ShieldPlus size={20} /></span>
            )}
            <span>{lang === 'en' ? 'Install Bot Roles Now' : 'Bot Rollerini Sunucuya Kur'}</span>
          </button>
        </div>
      </div>
    );
  }

  const combatRoles = globalRoles.filter(r => r.category === 'combat');
  const economyRoles = globalRoles.filter(r => r.category === 'economy' || r.category === 'gathering');
  const craftingRoles = globalRoles.filter(r => r.category === 'crafting');

  return (
    <div className="grid grid-cols-1 gap-6 animate-slide-up">
      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-outline-variant/30 gap-4">
           <h2 className="font-headline-lg text-2xl text-on-surface flex items-center gap-3 uppercase tracking-tight">
             <Users className="text-primary-container" /> 
             {lang === 'en' ? 'Role Menu Settings' : 'Rol Menü Ayarları'}
           </h2>
           <div className="flex gap-3">
             <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-surface-container border border-outline-variant text-on-surface hover:text-primary-container hover:border-primary-container rounded-sm font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50">
               {saving ? (
                 <span className="flex items-center justify-center"><Loader2 size={16} className="animate-spin" /></span>
               ) : (
                 <span className="flex items-center justify-center"><Save size={16} /></span>
               )}
               <span>{lang === 'en' ? 'Save' : 'Kaydet'}</span>
             </button>
             <button onClick={handleSendMenu} disabled={triggeringSend} className="px-6 py-2.5 bg-primary-container text-on-primary rounded-sm font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:brightness-110 tactical-glow disabled:opacity-50">
               {triggeringSend ? (
                 <span className="flex items-center justify-center"><Loader2 size={16} className="animate-spin" /></span>
               ) : (
                 <span className="flex items-center justify-center"><Send size={16} /></span>
               )}
               <span>{lang === 'en' ? 'Send to Channel' : 'Kanala Gönder'}</span>
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Menu Channel' : 'Menü Kanalı'}
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.channel_id}
              onChange={(e) => setSettings({ ...settings, channel_id: e.target.value })}
            >
              <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
              {discordChannels?.filter(c => c.type === 0 || c.type === 5).map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'en' ? 'Header Image URL' : 'Başlık Görseli URL'}
              <InfoTooltip text={lang === 'en' ? 'Optional aesthetic image URL above the menus.' : 'Menülerin üstünde görünecek opsiyonel görsel linki.'} />
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.png"
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.header_image_url || ""}
              onChange={(e) => setSettings({ ...settings, header_image_url: e.target.value })}
            />
          </div>
        </div>

        {/* Category Limits */}
        <h3 className="font-headline-md text-xl text-on-surface mb-4 uppercase tracking-widest mt-8">
          {lang === 'en' ? 'Role Selection Limits' : 'Rol Seçim Limitleri'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-surface-container p-6 rounded-sm border border-outline-variant/30">
          <div>
            <label className="block text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">⚔️ {lang === 'en' ? 'Combat Roles Max' : 'Savaş Rolleri Max'}</label>
            <input type="number" min="1" max="25" className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-2 text-on-surface" value={settings.category_limits?.combat || 5} onChange={(e) => updateLimit('combat', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">🌾 {lang === 'en' ? 'Economy/Gathering Max' : 'Ekonomi/Toplayıcı Max'}</label>
            <input type="number" min="1" max="25" className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-2 text-on-surface" value={settings.category_limits?.economy || 5} onChange={(e) => updateLimit('economy', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">⚒️ {lang === 'en' ? 'Crafting Roles Max' : 'Zanaat Rolleri Max'}</label>
            <input type="number" min="1" max="25" className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-2 text-on-surface" value={settings.category_limits?.crafting || 5} onChange={(e) => updateLimit('crafting', e.target.value)} />
          </div>
        </div>

        {/* Active Roles Selection */}
        <h3 className="font-headline-md text-xl text-on-surface mb-4 uppercase tracking-widest mt-8 flex justify-between items-end">
          <span>{lang === 'en' ? 'Active Roles to Display' : 'Gösterilecek Aktif Roller'}</span>
          <span className="text-xs text-on-surface-variant font-body-md normal-case opacity-70">
            {lang === 'en' ? 'Select which roles should appear in the menus' : 'Menülerde görünecek rolleri seçin'}
          </span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Combat Roles */}
          <div className="bg-surface-container p-6 border border-outline-variant/30 rounded-sm">
             <div className="text-sm font-label-bold text-primary-container uppercase tracking-widest mb-4 border-b border-outline-variant/30 pb-2">⚔️ {lang === 'en' ? 'Combat Roles' : 'Savaş Rolleri'}</div>
             <div className="flex flex-col gap-3">
               {combatRoles.map(r => (
                 <label key={r.role_key} className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded-sm checked:bg-primary-container checked:border-primary-container transition-all" checked={settings.active_roles.includes(r.role_key)} onChange={() => toggleRole(r.role_key)} />
                      <div className="absolute inset-0 flex items-center justify-center text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                         <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z" fill="currentColor"/></svg>
                      </div>
                   </div>
                   <span className="text-on-surface font-body-md group-hover:text-primary-container transition-colors">
                     {r.role_name}
                   </span>
                 </label>
               ))}
             </div>
          </div>

          {/* Economy Roles */}
          <div className="bg-surface-container p-6 border border-outline-variant/30 rounded-sm">
             <div className="text-sm font-label-bold text-primary-container uppercase tracking-widest mb-4 border-b border-outline-variant/30 pb-2">🌾 {lang === 'en' ? 'Economy & Gathering' : 'Ekonomi ve Toplayıcılık'}</div>
             <div className="flex flex-col gap-3">
               {economyRoles.map(r => (
                 <label key={r.role_key} className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded-sm checked:bg-primary-container checked:border-primary-container transition-all" checked={settings.active_roles.includes(r.role_key)} onChange={() => toggleRole(r.role_key)} />
                      <div className="absolute inset-0 flex items-center justify-center text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                         <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z" fill="currentColor"/></svg>
                      </div>
                   </div>
                   <span className="text-on-surface font-body-md group-hover:text-primary-container transition-colors">
                     {r.role_name}
                   </span>
                 </label>
               ))}
             </div>
          </div>

          {/* Crafting Roles */}
          <div className="bg-surface-container p-6 border border-outline-variant/30 rounded-sm">
             <div className="text-sm font-label-bold text-primary-container uppercase tracking-widest mb-4 border-b border-outline-variant/30 pb-2">⚒️ {lang === 'en' ? 'Crafting Roles' : 'Zanaat Rolleri'}</div>
             <div className="flex flex-col gap-3">
               {craftingRoles.map(r => (
                 <label key={r.role_key} className="flex items-center gap-3 cursor-pointer group">
                   <div className="relative flex items-center justify-center w-5 h-5">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded-sm checked:bg-primary-container checked:border-primary-container transition-all" checked={settings.active_roles.includes(r.role_key)} onChange={() => toggleRole(r.role_key)} />
                      <div className="absolute inset-0 flex items-center justify-center text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                         <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z" fill="currentColor"/></svg>
                      </div>
                   </div>
                   <span className="text-on-surface font-body-md group-hover:text-primary-container transition-colors">
                     {r.role_name}
                   </span>
                 </label>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
