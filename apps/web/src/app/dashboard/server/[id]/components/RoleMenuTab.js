"use client";

import { useEffect, useState } from "react";
import { Users, Save, Loader2, Send, Plus, Trash2, Edit2, ChevronDown, ChevronUp, GripVertical, AlertTriangle } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";

export default function RoleMenuTab({ t, lang, guildId, discordChannels, discordRoles, showToast }) {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState([]);
  
  const [viewState, setViewState] = useState("list"); // 'list', 'edit'
  const [currentConfig, setCurrentConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [triggeringId, setTriggeringId] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, [guildId]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/roles/${guildId}`);
      const data = await res.json();
      if (res.ok) {
        setConfigs(data.configs || []);
      } else {
        showToast(data.error || "Failed to fetch configs", "error");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const createNewConfig = () => {
    setCurrentConfig({
      id: null,
      channel_id: "",
      embed_title: "Role Selection",
      embed_description: "Please select your roles from the dropdown menus below.",
      embed_color: "#fca311",
      embed_image_url: "",
      menus: []
    });
    setViewState("edit");
  };

  const editConfig = (config) => {
    // Ensure all menus have arrays
    const sanitized = {
      ...config,
      menus: config.menus?.map(m => ({
        ...m,
        options: m.options || []
      })) || []
    };
    setCurrentConfig(sanitized);
    setViewState("edit");
  };

  const deleteConfig = async (id) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this menu?' : 'Bu menüyü silmek istediğinize emin misiniz?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/roles/${guildId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast(lang === "en" ? "Menu deleted!" : "Menü silindi!", "success");
        await fetchConfigs();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const saveCurrentConfig = async () => {
    if (!currentConfig.channel_id) {
      showToast(lang === 'en' ? 'Please select a channel.' : 'Lütfen bir kanal seçin.', 'error');
      return;
    }
    if (currentConfig.menus.length === 0) {
      showToast(lang === 'en' ? 'Add at least one menu.' : 'En az bir menü ekleyin.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentConfig),
      });
      if (res.ok) {
        showToast(lang === "en" ? "Menu saved!" : "Menü kaydedildi!", "success");
        setViewState("list");
        await fetchConfigs();
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const triggerSend = async (id) => {
    setTriggeringId(id);
    try {
      const res = await fetch(`/api/roles/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_menu", id }),
      });
      if (res.ok) {
        showToast(lang === "en" ? "Menu send command issued to the bot." : "Menü gönderme komutu bota iletildi.", "success");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setTriggeringId(null);
    }
  };

  // Menu Builders
  const addMenu = () => {
    if (currentConfig.menus.length >= 5) {
      showToast(lang === 'en' ? 'Discord limit: Max 5 menus per message.' : 'Discord sınırı: Bir mesajda en fazla 5 menü olabilir.', 'warning');
      return;
    }
    setCurrentConfig(prev => ({
      ...prev,
      menus: [
        ...prev.menus, 
        { 
          custom_id: `custom_role_select_${Date.now()}_${Math.floor(Math.random()*1000)}`, 
          placeholder: lang === 'en' ? 'Select Roles...' : 'Rol Seçiniz...',
          options: []
        }
      ]
    }));
  };

  const removeMenu = (index) => {
    setCurrentConfig(prev => {
      const newMenus = [...prev.menus];
      newMenus.splice(index, 1);
      return { ...prev, menus: newMenus };
    });
  };

  const updateMenu = (index, field, value) => {
    setCurrentConfig(prev => {
      const newMenus = [...prev.menus];
      newMenus[index][field] = value;
      return { ...prev, menus: newMenus };
    });
  };

  const addOption = (menuIndex) => {
    if (currentConfig.menus[menuIndex].options.length >= 25) {
      showToast(lang === 'en' ? 'Discord limit: Max 25 options per menu.' : 'Discord sınırı: Bir menüde en fazla 25 seçenek olabilir.', 'warning');
      return;
    }
    setCurrentConfig(prev => {
      const newMenus = [...prev.menus];
      newMenus[menuIndex].options.push({ label: '', value: '', emoji: '' });
      return { ...prev, menus: newMenus };
    });
  };

  const removeOption = (menuIndex, optionIndex) => {
    setCurrentConfig(prev => {
      const newMenus = [...prev.menus];
      newMenus[menuIndex].options.splice(optionIndex, 1);
      return { ...prev, menus: newMenus };
    });
  };

  const updateOption = (menuIndex, optionIndex, field, value) => {
    setCurrentConfig(prev => {
      const newMenus = [...prev.menus];
      newMenus[menuIndex].options[optionIndex][field] = value;
      return { ...prev, menus: newMenus };
    });
  };

  if (loading) return <div className="flex justify-center p-5"><Loader2 className="animate-spin text-primary-container" size={32} /></div>;

  if (viewState === "list") {
    return (
      <div className="grid grid-cols-1 gap-3 animate-slide-up w-full">
        <div className="glass-panel p-4 sm:p-5 relative overflow-hidden sm:overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-outline-variant/30 gap-3">
             <h2 className="font-headline-lg text-lg sm:text-lg text-on-surface flex items-center gap-3 uppercase tracking-tight">
               <Users className="text-primary-container shrink-0" /> 
               {lang === 'en' ? 'Custom Role Menus' : 'Özel Rol Menüleri'}
             </h2>
             <button onClick={createNewConfig} className="w-full sm:w-auto px-6 py-2.5 bg-primary-container text-on-primary rounded-sm font-label-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:brightness-110 tactical-glow">
               <Plus size={16} className="shrink-0" />
               <span>{lang === 'en' ? 'Create New Menu' : 'Yeni Menü Oluştur'}</span>
             </button>
          </div>

          {configs.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-outline-variant rounded-sm bg-surface-container-low/50">
               <Users className="mx-auto text-on-surface-variant mb-4 opacity-50" size={48} />
               <h3 className="text-lg sm:text-lg text-on-surface font-headline-md mb-2">{lang === 'en' ? 'No Role Menus Found' : 'Rol Menüsü Bulunamadı'}</h3>
               <p className="text-sm sm:text-base text-on-surface-variant font-body-md max-w-md mx-auto">
                 {lang === 'en' 
                  ? 'Create dynamic role selection menus where users can pick their roles from a dropdown.' 
                  : 'Kullanıcıların açılır menülerden rollerini seçebileceği dinamik rol seçim menüleri oluşturun.'}
               </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {configs.map(config => {
                const channel = discordChannels?.find(c => c.id === config.channel_id);
                return (
                  <div key={config.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-surface-container border border-outline-variant/50 rounded-sm hover:border-primary-container/50 transition-colors gap-3">
                    <div className="flex-1 w-full">
                      <h4 className="font-headline-sm text-base sm:text-lg text-on-surface flex flex-wrap items-center gap-2">
                        <span className="truncate">{config.embed_title || 'Untitled Menu'}</span>
                        <span className="text-xs font-label-bold px-2 py-0.5 bg-surface-container-high rounded-full border border-outline-variant text-on-surface-variant whitespace-nowrap">
                          {config.menus?.length || 0} Menus
                        </span>
                      </h4>
                      <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-2 mt-2">
                        <span className="opacity-70">Channel:</span> 
                        <span className="font-mono text-primary-container truncate">#{channel?.name || config.channel_id}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                      <button onClick={() => triggerSend(config.id)} disabled={triggeringId === config.id} className="flex-1 sm:flex-none px-4 py-2 bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface rounded-sm transition-colors border border-outline-variant disabled:opacity-50 flex justify-center items-center gap-2">
                        {triggeringId === config.id ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Send size={16} className="shrink-0" />}
                        <span className="font-label-bold uppercase text-[10px] sm:text-xs tracking-wider">{lang === 'en' ? 'Send' : 'Gönder'}</span>
                      </button>
                      <button onClick={() => editConfig(config)} className="flex-1 sm:flex-none px-4 py-2 bg-surface-container-high hover:bg-white/10 text-on-surface rounded-sm transition-colors border border-outline-variant flex justify-center items-center">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteConfig(config.id)} disabled={deletingId === config.id} className="flex-1 sm:flex-none px-4 py-2 bg-surface-container-high hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-sm transition-colors border border-outline-variant flex justify-center items-center disabled:opacity-50">
                        {deletingId === config.id ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit View
  return (
    <div className="grid grid-cols-1 gap-3 animate-slide-up w-full">
      <div className="glass-panel p-4 sm:p-5 relative overflow-hidden sm:overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-outline-variant/30 gap-3">
           <h2 className="font-headline-lg text-lg sm:text-lg text-on-surface flex items-center gap-3 uppercase tracking-tight">
             <Edit2 className="text-primary-container shrink-0" /> 
             {currentConfig.id ? (lang === 'en' ? 'Edit Menu' : 'Menüyü Düzenle') : (lang === 'en' ? 'Create Menu' : 'Menü Oluştur')}
           </h2>
           <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
             <button onClick={() => setViewState("list")} className="flex-1 sm:flex-none justify-center px-6 py-2.5 bg-surface-container border border-outline-variant text-on-surface hover:text-on-surface-variant rounded-sm font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all text-xs sm:text-sm">
               <span>{lang === 'en' ? 'Cancel' : 'İptal'}</span>
             </button>
             <button onClick={saveCurrentConfig} disabled={saving} className="flex-1 sm:flex-none justify-center px-6 py-2.5 bg-primary-container text-on-primary rounded-sm font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:brightness-110 tactical-glow disabled:opacity-50 text-xs sm:text-sm">
               {saving ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Save size={16} className="shrink-0" />}
               <span>{lang === 'en' ? 'Save' : 'Kaydet'}</span>
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
          {/* Left Column: Message Settings */}
          <div className="space-y-6">
            <h3 className="font-headline-md text-lg sm:text-lg text-primary-container uppercase tracking-widest border-b border-outline-variant/30 pb-2">
              {lang === 'en' ? 'Message Settings' : 'Mesaj Ayarları'}
            </h3>
            
            <div>
              <label className="flex items-center text-xs sm:text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Target Channel' : 'Hedef Kanal'} *
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md text-sm"
                value={currentConfig.channel_id}
                onChange={(e) => setCurrentConfig({ ...currentConfig, channel_id: e.target.value })}
              >
                <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
                {discordChannels?.filter(c => c.type === 0 || c.type === 5).map(c => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-xs sm:text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Embed Title' : 'Embed Başlığı'}
              </label>
              <input
                type="text"
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md text-sm"
                value={currentConfig.embed_title}
                onChange={(e) => setCurrentConfig({ ...currentConfig, embed_title: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center text-xs sm:text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Embed Description' : 'Embed Açıklaması'}
              </label>
              <textarea
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md min-h-[100px] text-sm"
                value={currentConfig.embed_description}
                onChange={(e) => setCurrentConfig({ ...currentConfig, embed_description: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 w-full">
                <label className="flex items-center text-xs sm:text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Embed Color' : 'Embed Rengi'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-sm cursor-pointer bg-transparent border-0 p-0 shrink-0"
                    value={currentConfig.embed_color || "#fca311"}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, embed_color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 w-full min-w-0 bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md text-sm"
                    value={currentConfig.embed_color || "#fca311"}
                    onChange={(e) => setCurrentConfig({ ...currentConfig, embed_color: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="flex items-center text-xs sm:text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Image URL' : 'Görsel URL'} <InfoTooltip text="Optional" />
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full min-w-0 bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md text-sm"
                  value={currentConfig.embed_image_url || ""}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, embed_image_url: e.target.value })}
                />
              </div>
            </div>
            
            <div className="bg-primary-container/10 border border-primary-container/30 rounded-sm p-4 mt-6">
              <h4 className="flex items-center gap-2 text-primary-container font-label-bold mb-2 uppercase text-xs tracking-widest">
                <AlertTriangle size={14} className="shrink-0" /> {lang === 'en' ? 'Permissions Note' : 'Yetkiler Hakkında Not'}
              </h4>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                {lang === 'en' 
                  ? 'The bot will attempt to assign the roles you configure below. If you select a role that has Administrator permissions or is placed higher than the Bot\'s highest role in your server settings, the Bot will throw a "Missing Permissions" error and fail to assign it.'
                  : 'Bot, aşağıda yapılandırdığınız rolleri vermeye çalışacaktır. Eğer botun sunucudaki kendi rolünden daha üstte olan veya "Yönetici" yetkisine sahip bir rol seçerseniz, bot "Yetki Yok" hatası verecek ve rolü veremeyecektir.'}
              </p>
            </div>
          </div>

          {/* Right Column: Select Menus Builder */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-outline-variant/30 pb-2 gap-3">
              <h3 className="font-headline-md text-lg sm:text-lg text-primary-container uppercase tracking-widest flex flex-wrap items-center gap-2">
                {lang === 'en' ? 'Select Menus' : 'Açılır Menüler'}
                <span className="bg-surface-container-high text-on-surface-variant text-xs px-2 py-0.5 rounded-full border border-outline-variant font-mono">
                  {currentConfig.menus.length} / 5
                </span>
              </h3>
              <button 
                onClick={addMenu}
                disabled={currentConfig.menus.length >= 5}
                className="w-full sm:w-auto justify-center text-xs font-label-bold uppercase tracking-widest bg-surface-container border border-outline-variant hover:border-primary-container hover:text-primary-container px-3 py-2 rounded-sm transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Plus size={14} className="shrink-0" /> {lang === 'en' ? 'Add Menu' : 'Menü Ekle'}
              </button>
            </div>

            {currentConfig.menus.length === 0 && (
               <div className="text-center py-8 px-4 text-on-surface-variant opacity-70 border border-dashed border-outline-variant rounded-sm text-sm">
                  {lang === 'en' ? 'No menus added yet. Click "Add Menu" to start.' : 'Henüz menü eklenmedi. Başlamak için "Menü Ekle" butonuna tıklayın.'}
               </div>
            )}

            <div className="space-y-4">
              {currentConfig.menus.map((menu, menuIdx) => (
                <div key={menu.custom_id} className="bg-surface-container border border-outline-variant/50 rounded-sm overflow-hidden flex flex-col">
                  {/* Menu Header */}
                  <div className="bg-surface-container-high p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-outline-variant/50">
                    <div className="flex-1 w-full flex flex-col gap-1">
                      <label className="text-xs font-label-bold text-on-surface-variant uppercase tracking-widest">{lang === 'en' ? 'Placeholder Text' : 'Menü İçi Yazı (Placeholder)'}</label>
                      <input
                        type="text"
                        placeholder={lang === 'en' ? 'e.g. Select your PvP roles...' : 'örn: Savaş rollerinizi seçin...'}
                        className="w-full bg-background border border-outline-variant rounded-sm px-3 py-2 text-on-surface focus:border-primary-container text-sm"
                        value={menu.placeholder}
                        onChange={(e) => updateMenu(menuIdx, 'placeholder', e.target.value)}
                      />
                    </div>
                    <button onClick={() => removeMenu(menuIdx)} className="w-full sm:w-auto justify-center p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-sm transition-colors sm:mt-4 flex items-center gap-2" title="Remove Menu">
                      <Trash2 size={16} /> <span className="sm:hidden text-xs font-label-bold uppercase">Remove</span>
                    </button>
                  </div>

                  {/* Menu Options */}
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                       <span className="text-[10px] sm:text-xs font-label-bold text-on-surface-variant uppercase tracking-widest">
                         {lang === 'en' ? 'Roles inside menu' : 'Menüdeki roller'} ({menu.options.length}/25)
                       </span>
                       <button 
                         onClick={() => addOption(menuIdx)}
                         disabled={menu.options.length >= 25}
                         className="w-full sm:w-auto justify-center text-[10px] bg-primary-container/20 text-primary-container px-3 py-1.5 rounded hover:bg-primary-container/30 transition-colors uppercase font-bold tracking-widest disabled:opacity-50 flex items-center gap-1"
                       >
                         <Plus size={12} className="shrink-0" /> {lang === 'en' ? 'Add Role' : 'Rol Ekle'}
                       </button>
                    </div>

                    {menu.options.length === 0 && (
                      <div className="text-[10px] sm:text-xs text-on-surface-variant/50 italic text-center py-2">
                        {lang === 'en' ? 'Add roles to display in this menu.' : 'Bu menüde gösterilecek rolleri ekleyin.'}
                      </div>
                    )}

                    <div className="space-y-3">
                      {menu.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background p-3 sm:p-2 rounded-sm border border-outline-variant/50">
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Emoji (✨)"
                              className="w-16 bg-surface-container-high border border-outline-variant rounded-sm px-2 py-2 sm:py-1.5 text-center text-sm shrink-0"
                              value={opt.emoji}
                              onChange={(e) => updateOption(menuIdx, optIdx, 'emoji', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder={lang === 'en' ? 'Display Name' : 'Görünür İsim'}
                              className="flex-1 min-w-0 bg-surface-container-high border border-outline-variant rounded-sm px-3 py-2 sm:py-1.5 text-sm"
                              value={opt.label}
                              onChange={(e) => updateOption(menuIdx, optIdx, 'label', e.target.value)}
                            />
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                            <select
                              className="flex-1 min-w-0 bg-surface-container-high border border-outline-variant rounded-sm px-2 py-2 sm:py-1.5 text-sm truncate"
                              value={opt.value}
                              onChange={(e) => updateOption(menuIdx, optIdx, 'value', e.target.value)}
                            >
                              <option value="">{lang === 'en' ? 'Select Discord Role' : 'Discord Rolü Seç'}</option>
                              {discordRoles?.map(dr => (
                                <option key={dr.id} value={dr.id} style={{ color: dr.color ? `#${dr.color.toString(16).padStart(6, '0')}` : 'inherit' }}>
                                  @{dr.name}
                                </option>
                              ))}
                            </select>
                            <button onClick={() => removeOption(menuIdx, optIdx)} className="p-2 sm:p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-sm shrink-0 flex items-center justify-center">
                              <Trash2 size={16} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
