import { Save, Info, Hash, Shield, Search, X as XIcon, Users, Plus, Trash2, Send } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useState, useRef, useEffect } from "react";
import TicketHistoryTab from "./TicketHistoryTab";

export default function TicketTab({ t, lang, settings, setSettings, discordChannels, discordRoles = [], discordMembers = [], handleSave, saving, guildId, showToast, isPremium }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = (settings?.ticket_staff_roles || "").split(/[\s,]+/).filter(Boolean);

  const handleAddId = (id) => {
    if (!selectedIds.includes(id)) {
      const newIds = [...selectedIds, id];
      setSettings({ ...settings, ticket_staff_roles: newIds.join(", ") });
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleRemoveId = (id) => {
    const newIds = selectedIds.filter(sid => sid !== id);
    setSettings({ ...settings, ticket_staff_roles: newIds.join(", ") });
  };

  const options = discordRoles.map(r => ({ id: r.id, name: r.name, type: 'role', icon: <Users size={14} /> }));

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || opt.id.includes(searchQuery)
  );

  const handleToggleEvent = (eventName) => {
    const newValue = !settings[eventName];
    setSettings({ ...settings, [eventName]: newValue });
  };

  const addOption = () => {
    const newOption = { label: "Yeni Konu", value: `konu_${Date.now()}`, description: "Açıklama", emoji: "📋" };
    const currentOptions = Array.isArray(settings.ticket_options) ? [...settings.ticket_options] : [];
    setSettings({ ...settings, ticket_options: [...currentOptions, newOption] });
  };

  const updateOption = (index, field, value) => {
    const currentOptions = [...(settings.ticket_options || [])];
    currentOptions[index][field] = value;
    setSettings({ ...settings, ticket_options: currentOptions });
  };

  const removeOption = (index) => {
    const currentOptions = [...(settings.ticket_options || [])];
    currentOptions.splice(index, 1);
    setSettings({ ...settings, ticket_options: currentOptions });
  };

  const handleDeploy = async () => {
    if (!settings.ticket_channel_id || !settings.ticket_category_id) {
        showToast(lang === 'tr' ? 'Lütfen önce kanal ve kategori ayarlarını yapıp kaydedin.' : 'Please set and save channel/category first.', 'error');
        return;
    }
    setDeploying(true);
    try {
        const res = await fetch(`/api/ticket/deploy/${guildId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        const data = await res.json();
        if (res.ok) {
            showToast(lang === 'tr' ? 'Panel başarıyla gönderildi!' : 'Panel deployed successfully!', 'success');
        } else {
            showToast(data.error || 'Deploy failed', 'error');
        }
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setDeploying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 animate-fade-in pb-12">
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-2">
        <div className="bg-surface-variant p-2 rounded-md border border-white/5 shadow-sm relative group overflow-hidden">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <h3 className="font-headline-md text-[10px] text-on-surface mb-3 uppercase tracking-wider flex items-center gap-2">
            <Shield className="text-primary-container" size={14}/> 
            {lang === 'tr' ? 'Ticket Durumu' : 'Ticket Status'}
          </h3>

          <div className="flex items-center justify-between p-2 bg-surface rounded-sm border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group/toggle" onClick={() => handleToggleEvent('ticket_system_enabled')}>
            <div>
              <div className="font-label-bold text-on-surface mb-1">{lang === 'tr' ? 'Ticket Sistemini Aç' : 'Enable Ticket System'}</div>
              <div className="text-[10px] text-on-surface-variant">{lang === 'tr' ? 'Özel kanallarda destek talebi oluşturmayı aktifleştirir.' : 'Enable creating support tickets in private channels.'}</div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings?.ticket_system_enabled ? 'bg-primary-container' : 'bg-surface-variant border border-white/10'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${settings?.ticket_system_enabled ? 'translate-x-5 bg-on-primary' : 'bg-on-surface-variant'}`}></div>
            </div>
          </div>
          
          <button 
             onClick={handleDeploy}
             disabled={deploying}
             className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 rounded transition-all disabled:opacity-50 font-bold uppercase tracking-widest text-[10px]"
          >
             <Send size={16} />
             {deploying ? (lang === 'tr' ? 'Gönderiliyor...' : 'Deploying...') : (lang === 'tr' ? 'Paneli Kanala Gönder' : 'Deploy Panel to Channel')}
          </button>
        </div>

        <div className="bg-surface-variant p-2 rounded-md border border-white/5 shadow-sm relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <h3 className="font-headline-md text-[10px] text-on-surface mb-3 uppercase tracking-wider flex items-center gap-2">
             <Hash className="text-primary-container" size={14}/> 
             {lang === 'tr' ? 'Kanal ve Kategori' : 'Channel & Category'}
          </h3>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-[10px]">
                {lang === 'tr' ? 'Ticket Kategorisi' : 'Ticket Category'}
                <InfoTooltip text={lang === 'tr' ? 'Yeni ticket kanallarının açılacağı kategori.' : 'The category where new ticket channels will be created.'} />
              </label>
              <select
                className="w-full bg-surface text-on-surface p-3 rounded-sm outline-none border border-white/10 focus:border-primary/50 transition-colors appearance-none"
                value={settings?.ticket_category_id || ""}
                onChange={(e) => setSettings({ ...settings, ticket_category_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? '-- Kategori Seçin --' : '-- Select Category --'}</option>
                {discordChannels.filter(c => c.type === 4).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-[10px]">
                {lang === 'tr' ? 'Panel Kanalı' : 'Panel Channel'}
                <InfoTooltip text={lang === 'tr' ? 'Destek talebi açma butonunun (Panelin) bulunacağı kanal.' : 'The channel where the ticket creation panel will be placed.'} />
              </label>
              <select
                className="w-full bg-surface text-on-surface p-3 rounded-sm outline-none border border-white/10 focus:border-primary/50 transition-colors appearance-none"
                value={settings?.ticket_channel_id || ""}
                onChange={(e) => setSettings({ ...settings, ticket_channel_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? '-- Kanal Seçin --' : '-- Select Channel --'}</option>
                {discordChannels.filter(c => c.type === 0).map(chan => (
                  <option key={chan.id} value={chan.id}># {chan.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface-variant p-2 rounded-md border border-white/5 shadow-sm relative group">
            <h3 className="font-headline-md text-[10px] text-on-surface mb-3 uppercase tracking-wider flex items-center gap-2">
               <Users className="text-primary-container" size={14}/> 
               {lang === 'tr' ? 'Yetkili Roller' : 'Staff Roles'}
            </h3>
            <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-[10px]">
              {lang === 'tr' ? 'Ticket Görme ve Cevaplama İzni' : 'Ticket View & Reply Permission'}
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="min-h-[50px] w-full bg-surface text-on-surface p-2 rounded-sm border border-white/10 focus-within:border-primary/50 transition-colors flex flex-wrap gap-2 items-center">
                {selectedIds.map(id => {
                  const opt = options.find(o => o.id === id);
                  return (
                    <div key={id} className="flex items-center gap-1 bg-surface-variant border border-white/10 px-2 py-1 rounded-sm text-[10px] font-medium">
                      {opt ? opt.icon : <Hash size={14} />}
                      <span className="max-w-[120px] truncate">{opt ? opt.name : id}</span>
                      <button onClick={() => handleRemoveId(id)} className="ml-1 text-on-surface-variant hover:text-red-400 transition-colors">
                        <XIcon size={12} />
                      </button>
                    </div>
                  );
                })}
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none min-w-[150px] text-[10px] py-1"
                  placeholder={lang === 'tr' ? "Aramak için yazın..." : "Type to search..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-[250px] overflow-y-auto bg-surface-variant border border-white/10 rounded-sm shadow-xl custom-scrollbar">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => handleAddId(opt.id)}
                        disabled={selectedIds.includes(opt.id)}
                        className={`w-full text-left px-2 py-1 flex items-center justify-between text-[10px] transition-colors ${selectedIds.includes(opt.id) ? 'opacity-50 cursor-not-allowed bg-surface/30' : 'hover:bg-surface'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400">{opt.icon}</span>
                          <span className="truncate max-w-[200px]">{opt.name}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-[10px] text-on-surface-variant text-center">
                      {lang === 'tr' ? 'Rol bulunamadı.' : 'No roles found.'}
                    </div>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-8 flex flex-col gap-2">
        <div className="bg-surface-variant p-2 rounded-md border border-white/5 shadow-sm relative group">
            <h3 className="font-headline-md text-[10px] text-on-surface mb-3 uppercase tracking-wider flex items-center gap-2">
               <Info className="text-primary-container" size={14}/> 
               {lang === 'tr' ? 'Panel Mesajı Ayarları' : 'Panel Message Settings'}
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-[10px]">
                    {lang === 'tr' ? 'Başlık' : 'Title'}
                </label>
                <input 
                   type="text" 
                   value={settings.ticket_message_title || ""} 
                   onChange={(e) => setSettings({...settings, ticket_message_title: e.target.value})}
                   className="w-full bg-surface text-on-surface p-3 rounded-sm outline-none border border-white/10 focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-[10px]">
                    {lang === 'tr' ? 'Açıklama' : 'Description'}
                </label>
                <textarea 
                   value={settings.ticket_message_desc || ""} 
                   onChange={(e) => setSettings({...settings, ticket_message_desc: e.target.value})}
                   className="w-full bg-surface text-on-surface p-3 rounded-sm outline-none border border-white/10 focus:border-primary/50 transition-colors h-24"
                />
              </div>
            </div>
        </div>

        <div className="bg-surface-variant p-2 rounded-md border border-white/5 shadow-sm relative group">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-headline-md text-[10px] text-on-surface uppercase tracking-wider flex items-center gap-2">
                <Search className="text-primary-container" size={14}/> 
                {lang === 'tr' ? 'Destek Konuları (Menü Seçenekleri)' : 'Support Topics (Menu Options)'}
                </h3>
                <button onClick={addOption} className="bg-primary-container/20 text-primary-container px-3 py-1.5 rounded-sm font-label-bold text-[10px] uppercase flex items-center gap-1 hover:bg-primary-container hover:text-on-primary transition-colors">
                    <Plus size={14} /> {lang === 'tr' ? 'Ekle' : 'Add'}
                </button>
            </div>
            
            <div className="space-y-4">
                {(settings.ticket_options || []).map((opt, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-2 bg-surface p-3 rounded border border-white/5">
                        <div className="w-16">
                            <input 
                               type="text" 
                               value={opt.emoji || ""} 
                               onChange={(e) => updateOption(i, 'emoji', e.target.value)}
                               placeholder="Emoji"
                               className="w-full bg-surface-variant text-on-surface p-2 rounded-sm outline-none border border-white/10 text-center"
                            />
                        </div>
                        <div className="flex-1">
                            <input 
                               type="text" 
                               value={opt.label || ""} 
                               onChange={(e) => updateOption(i, 'label', e.target.value)}
                               placeholder={lang === 'tr' ? 'Başlık' : 'Label'}
                               className="w-full bg-surface-variant text-on-surface p-2 rounded-sm outline-none border border-white/10"
                            />
                        </div>
                        <div className="flex-1">
                            <input 
                               type="text" 
                               value={opt.description || ""} 
                               onChange={(e) => updateOption(i, 'description', e.target.value)}
                               placeholder={lang === 'tr' ? 'Açıklama' : 'Description'}
                               className="w-full bg-surface-variant text-on-surface p-2 rounded-sm outline-none border border-white/10"
                            />
                        </div>
                        <div className="w-24">
                            <input 
                               type="text" 
                               value={opt.value || ""} 
                               onChange={(e) => updateOption(i, 'value', e.target.value)}
                               placeholder="ID (val)"
                               className="w-full bg-surface-variant text-on-surface p-2 rounded-sm outline-none border border-white/10"
                            />
                        </div>
                        <button onClick={() => removeOption(i)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors flex items-center justify-center">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {(!settings.ticket_options || settings.ticket_options.length === 0) && (
                    <div className="text-center p-2 text-on-surface-variant bg-surface border border-white/5 rounded">
                        {lang === 'tr' ? 'Henüz hiçbir konu eklenmemiş.' : 'No topics added yet.'}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-12 mt-2 border-t border-white/5 pt-8">
        <TicketHistoryTab t={t} lang={lang} guildId={guildId} showToast={showToast} isPremium={isPremium} />
      </div>
    </div>
  );
}
