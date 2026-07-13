import { Save, Info, Hash, Shield, Search, X as XIcon, User, Bot, Users } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useState, useRef, useEffect } from "react";

export default function LogSettingsTab({ t, lang, settings, setSettings, discordChannels, discordRoles = [], discordMembers = [], handleSave, saving }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = (settings?.log_exempts || "").split(/[\s,]+/).filter(Boolean);

  const handleAddId = (id) => {
    if (!selectedIds.includes(id)) {
      const newIds = [...selectedIds, id];
      setSettings({ ...settings, log_exempts: newIds.join(", ") });
    }
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleRemoveId = (id) => {
    const newIds = selectedIds.filter(sid => sid !== id);
    setSettings({ ...settings, log_exempts: newIds.join(", ") });
  };

  const options = [
    ...discordRoles.map(r => ({ id: r.id, name: r.name, type: 'role', icon: <Users size={14} /> })),
    ...discordMembers.map(m => ({ id: m.id, name: m.username || m.global_name, type: m.bot ? 'bot' : 'user', icon: m.bot ? <Bot size={14} /> : <User size={14} /> }))
  ];

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || opt.id.includes(searchQuery)
  );
  const handleToggleEvent = (eventName) => {
    const currentEvents = settings?.log_events || {};
    const newValue = !currentEvents[eventName];
    
    setSettings((prev) => ({
      ...prev,
      log_events: {
        ...prev.log_events,
        [eventName]: newValue
      }
    }));
  };

  const getEventName = (key) => {
    const names = {
      message_delete: lang === 'tr' ? "Mesaj Silinmesi" : "Message Deleted",
      message_edit: lang === 'tr' ? "Mesaj Düzenlenmesi" : "Message Edited",
      channel_create: lang === 'tr' ? "Kanal Açılması" : "Channel Created",
      channel_delete: lang === 'tr' ? "Kanal Silinmesi" : "Channel Deleted",
      bot_add: lang === 'tr' ? "Bot Eklenmesi" : "Bot Added",
      member_ban: lang === 'tr' ? "Üye Banlanması" : "Member Banned"
    };
    return names[key] || key;
  };

  const getEventDesc = (key) => {
    const descs = {
      message_delete: lang === 'tr' ? "Üyelerin sildiği veya botların sildiği mesajlar loglanır." : "Log when a message is deleted.",
      message_edit: lang === 'tr' ? "Mesajların eski ve yeni halleri loglanır." : "Log when a message is edited.",
      channel_create: lang === 'tr' ? "Sunucuda yeni kanal açıldığında loglanır." : "Log when a new channel is created.",
      channel_delete: lang === 'tr' ? "Sunucuda kanal silindiğinde loglanır." : "Log when a channel is deleted.",
      bot_add: lang === 'tr' ? "Sunucuya yeni bot eklendiğinde loglanır." : "Log when a new bot is added.",
      member_ban: lang === 'tr' ? "Bir üye banlandığında loglanır." : "Log when a member is banned."
    };
    return descs[key] || "";
  };

  const events = ["message_delete", "message_edit", "channel_create", "channel_delete", "bot_add", "member_ban"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sol Kolon: Ana Ayarlar */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-surface-variant p-4 border-l-4 border-primary shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div>
              <h3 className="font-title-bold text-on-surface flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {lang === 'tr' ? 'Log Sistemi Durumu' : 'Log System Status'}
              </h3>
              <p className="text-on-surface-variant text-sm mt-1 max-w-sm">
                {lang === 'tr' ? 'Sunucudaki denetim olaylarını takip etmek için sistemi aktif edin.' : 'Enable the system to track audit events in the server.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 z-10">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings?.log_system_enabled || false}
                onChange={(e) => setSettings({ ...settings, log_system_enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            </label>
          </div>

          <div className="bg-surface-variant p-5 rounded-md border border-white/5 shadow-sm relative group overflow-hidden">
             <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-xs">
              <Hash className="w-4 h-4 text-primary" />
              {lang === 'tr' ? 'Log Kanalı' : 'Log Channel'}
              <InfoTooltip text={lang === 'tr' ? 'Log kayıtlarının gönderileceği kanal.' : 'The channel where log records will be sent.'} />
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface text-on-surface p-3 pr-10 rounded-sm outline-none border border-white/10 focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                value={settings?.log_channel_id || ""}
                onChange={(e) => setSettings({ ...settings, log_channel_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? '-- Kanal Seçin --' : '-- Select Channel --'}</option>
                {(discordChannels || []).filter(c => c.type === 0).map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    #{channel.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-on-surface-variant">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="bg-surface-variant p-5 rounded-md border border-white/5 shadow-sm relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-md"></div>
            <label className="flex items-center gap-2 font-label-bold text-on-surface mb-3 uppercase tracking-wider text-xs">
              <Shield className="w-4 h-4 text-primary" />
              {lang === 'tr' ? 'Muaf Tutulan Kişiler, Botlar ve Roller' : 'Exempted Users, Bots, and Roles'}
              <InfoTooltip text={lang === 'tr' ? 'Loglanmasını istemediğiniz kişi, bot veya rolleri seçin.' : 'Select users, bots, or roles you want to exclude from logs.'} />
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="min-h-[50px] w-full bg-surface text-on-surface p-2 rounded-sm border border-white/10 focus-within:border-primary/50 transition-colors flex flex-wrap gap-2 items-center">
                {selectedIds.map(id => {
                  const opt = options.find(o => o.id === id);
                  return (
                    <div key={id} className="flex items-center gap-1 bg-surface-variant border border-white/10 px-2 py-1 rounded-sm text-xs font-medium">
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
                  className="flex-1 bg-transparent outline-none min-w-[150px] text-sm py-1"
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
                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-sm transition-colors ${selectedIds.includes(opt.id) ? 'opacity-50 cursor-not-allowed bg-surface/30' : 'hover:bg-surface'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`${opt.type === 'role' ? 'text-purple-400' : opt.type === 'bot' ? 'text-blue-400' : 'text-gray-300'}`}>
                            {opt.icon}
                          </span>
                          <span className="truncate max-w-[200px]">{opt.name}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant bg-surface px-1.5 py-0.5 rounded border border-white/5 uppercase">
                          {opt.type}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-on-surface-variant text-center">
                      {lang === 'tr' ? 'Sonuç bulunamadı.' : 'No results found.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Event Seçimi */}
        <div className="flex-1 bg-surface-variant rounded-md p-5 border border-white/5 shadow-sm relative">
           <h3 className="font-label-bold text-on-surface mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            {lang === 'tr' ? 'Loglanacak Olaylar' : 'Events to Log'}
          </h3>
          <div className="space-y-3">
            {events.map((eventKey) => {
              const isChecked = settings?.log_events?.[eventKey] ?? false;
              return (
                <div key={eventKey} className={`flex items-center justify-between p-3 rounded-md transition-colors border ${isChecked ? 'bg-primary/5 border-primary/30' : 'bg-surface/50 border-white/5 hover:bg-surface'}`}>
                  <div>
                    <div className={`font-medium ${isChecked ? 'text-primary' : 'text-on-surface'}`}>
                      {getEventName(eventKey)}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      {getEventDesc(eventKey)}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isChecked}
                      onChange={() => handleToggleEvent(eventKey)}
                    />
                    <div className="w-9 h-5 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2 rounded-sm font-label-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(var(--primary-color),0.4)] disabled:shadow-none"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              {t.dSaving || (lang === 'en' ? 'Saving...' : 'Kaydediliyor...')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {t.dSave || (lang === 'en' ? 'Save Settings' : 'Ayarları Kaydet')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
