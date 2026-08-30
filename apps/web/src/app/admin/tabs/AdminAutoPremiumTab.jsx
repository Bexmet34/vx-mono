"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Infinity as InfinityIcon, 
  Server, 
  Users, 
  X, 
  Loader2, 
  ChevronRight,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Tag
} from "lucide-react";

export default function AdminAutoPremiumTab({ showToast }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [savingRule, setSavingRule] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    rule_name: "",
    albion_guilds: [],
    discord_servers: [],
    premium_type: "limited",
    days_to_give: 30
  });

  // Albion Guild Search States
  const [guildSearchQuery, setGuildSearchQuery] = useState("");
  const [guildSearchServer, setGuildSearchServer] = useState("all");
  const [guildSearchResults, setGuildSearchResults] = useState([]);
  const [isSearchingGuild, setIsSearchingGuild] = useState(false);
  const [manualGuildInput, setManualGuildInput] = useState("");
  const [discordServerInput, setDiscordServerInput] = useState("");

  const formRef = useRef(null);

  // Fetch Rules from Backend API
  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auto-premium-rules");
      if (res.ok) {
        const data = await res.json();
        setRules(Array.isArray(data) ? data : []);
      } else {
        showToast?.("Kurallar yüklenirken bir hata oluştu.", "error");
      }
    } catch (err) {
      console.error("Rules fetch error:", err);
      showToast?.("Bağlantı hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Search Albion Guild
  const handleSearchGuild = async () => {
    if (!guildSearchQuery || guildSearchQuery.trim().length < 3) {
      showToast?.("Lütfen aramak için en az 3 karakter girin.", "warning");
      return;
    }
    setIsSearchingGuild(true);
    try {
      const res = await fetch(`/api/admin/albion-search?q=${encodeURIComponent(guildSearchQuery.trim())}&server=${guildSearchServer}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setGuildSearchResults(data.guilds || []);
        if (!data.guilds || data.guilds.length === 0) {
          showToast?.("Eşleşen Albion loncası bulunamadı.", "info");
        }
      } else {
        showToast?.(data.error || "Lonca arama hatası.", "error");
      }
    } catch (e) {
      showToast?.("Arama servisine bağlanılamadı.", "error");
    } finally {
      setIsSearchingGuild(false);
    }
  };

  // Add Guild to Form List
  const handleAddGuild = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!formData.albion_guilds.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        albion_guilds: [...prev.albion_guilds, trimmed]
      }));
    }
    setGuildSearchQuery("");
    setGuildSearchResults([]);
    setManualGuildInput("");
  };

  // Remove Guild from Form List
  const handleRemoveGuild = (name) => {
    setFormData(prev => ({
      ...prev,
      albion_guilds: prev.albion_guilds.filter(g => g !== name)
    }));
  };

  // Add Discord Server ID
  const handleAddDiscordServer = () => {
    const raw = discordServerInput.trim();
    if (!raw) return;
    // Support multiple comma separated inputs
    const ids = raw.split(/[\s,]+/).map(s => s.trim()).filter(s => s.length > 5);
    if (ids.length === 0) {
      showToast?.("Geçerli bir Discord Sunucu ID'si girin.", "warning");
      return;
    }
    setFormData(prev => ({
      ...prev,
      discord_servers: Array.from(new Set([...prev.discord_servers, ...ids]))
    }));
    setDiscordServerInput("");
  };

  // Remove Discord Server ID
  const handleRemoveDiscordServer = (id) => {
    setFormData(prev => ({
      ...prev,
      discord_servers: prev.discord_servers.filter(s => s !== id)
    }));
  };

  // Start Editing Rule
  const handleEditRule = (rule) => {
    setEditingRuleId(rule.id);
    setFormData({
      id: rule.id,
      rule_name: rule.rule_name || "",
      albion_guilds: Array.isArray(rule.albion_guilds) ? rule.albion_guilds : [],
      discord_servers: Array.isArray(rule.discord_servers) ? rule.discord_servers : [],
      premium_type: rule.premium_type || "limited",
      days_to_give: rule.days_to_give || 30
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Reset Form
  const handleResetForm = () => {
    setEditingRuleId(null);
    setFormData({
      id: "",
      rule_name: "",
      albion_guilds: [],
      discord_servers: [],
      premium_type: "limited",
      days_to_give: 30
    });
    setShowForm(false);
    setGuildSearchResults([]);
    setGuildSearchQuery("");
  };

  // Save / Update Rule
  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!formData.rule_name.trim()) {
      showToast?.("Lütfen kural için bir isim belirleyin.", "warning");
      return;
    }
    if (formData.albion_guilds.length === 0) {
      showToast?.("Lütfen en az bir Albion loncası ekleyin.", "warning");
      return;
    }

    setSavingRule(true);
    try {
      const res = await fetch("/api/admin/auto-premium-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRuleId || undefined,
          rule_name: formData.rule_name.trim(),
          albion_guilds: formData.albion_guilds,
          discord_servers: formData.discord_servers,
          premium_type: formData.premium_type,
          days_to_give: formData.premium_type === 'unlimited' ? 0 : (parseInt(formData.days_to_give) || 30)
        })
      });

      if (res.ok) {
        showToast?.(editingRuleId ? "Kural başarıyla güncellendi!" : "Yeni kural başarıyla oluşturuldu!", "success");
        handleResetForm();
        fetchRules();
      } else {
        const err = await res.json();
        showToast?.(err.error || "Kural kaydedilemedi.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast?.("İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setSavingRule(false);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id, name) => {
    if (!confirm(`"${name || 'Bu kural'}" adlı kuralı silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/auto-premium-rules?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast?.("Kural başarıyla silindi.", "success");
        if (editingRuleId === id) handleResetForm();
        fetchRules();
      } else {
        const err = await res.json();
        showToast?.(err.error || "Silinirken hata oluştu.", "error");
      }
    } catch (e) {
      showToast?.("Silinirken bağlantı hatası oluştu.", "error");
    }
  };

  // Filtered Rules
  const filteredRules = rules.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchName = r.rule_name?.toLowerCase().includes(term);
    const matchGuilds = (r.albion_guilds || []).some(g => g.toLowerCase().includes(term));
    const matchServers = (r.discord_servers || []).some(s => s.includes(term));
    return matchName || matchGuilds || matchServers;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#1e1f22] border border-[#2b2d31] p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#5865F2]/10 to-transparent pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/30 shrink-0">
            <Sparkles size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Otomatik Premium Kuralları</h2>
              <span className="bg-[#5865F2]/20 text-[#5865F2] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#5865F2]/30">
                {rules.length} Aktif Kural
              </span>
            </div>
            <p className="text-[#949ba4] text-sm mt-1 max-w-2xl">
              Albion Online loncalarında bulunan ve belirli Discord sunucularına katılmış üyelere otomatik olarak Bireysel Premium (Top.gg oy muafiyeti) tanımlayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (showForm && !editingRuleId) {
                setShowForm(false);
              } else {
                handleResetForm();
                setShowForm(true);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#5865F2]/25 active:scale-95"
          >
            {showForm && !editingRuleId ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm && !editingRuleId ? "Formu Kapat" : "Yeni Kural Ekle"}</span>
          </button>
        </div>
      </div>

      {/* Rule Creation / Editing Form (Collapsible / Card View) */}
      {showForm && (
        <div ref={formRef} className="bg-[#1e1f22] border-2 border-[#5865F2]/40 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-[#2b2d31] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]">
                {editingRuleId ? <Edit3 size={18} /> : <Plus size={18} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingRuleId ? `Kuralı Düzenle: ${formData.rule_name}` : "Yeni Otomatik Premium Kuralı Ekle"}
                </h3>
                <p className="text-xs text-[#949ba4]">Şartları sağlayan kullanıcılar bot sisteminde anında lisans kazanır.</p>
              </div>
            </div>
            <button
              onClick={handleResetForm}
              className="p-2 text-[#949ba4] hover:text-white hover:bg-[#2b2d31] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveRule} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rule Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                  Kural Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.rule_name}
                  onChange={e => setFormData({ ...formData, rule_name: e.target.value })}
                  placeholder="Örn: REKKA Loncası & Ana Sunucu Premiumu"
                  className="w-full bg-[#111214] border border-[#2b2d31] focus:border-[#5865F2] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder-[#5e636e]"
                />
              </div>

              {/* Albion Guilds Section */}
              <div className="bg-[#111214]/60 border border-[#2b2d31] p-4 rounded-xl flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-[#fca311]" /> Albion Loncası Ekle <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-[#949ba4] font-medium">En az 1 lonca şarttır</span>
                  </div>
                  <p className="text-xs text-[#80848e] mb-3">
                    Kullanıcının bu loncalardan <strong>herhangi birinde</strong> kayıtlı olması yeterlidir.
                  </p>

                  {/* Search Bar */}
                  <div className="flex gap-2 mb-2">
                    <select
                      value={guildSearchServer}
                      onChange={e => setGuildSearchServer(e.target.value)}
                      className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="all">Tüm Sunucular</option>
                      <option value="europe">Europe</option>
                      <option value="americas">Americas</option>
                      <option value="asia">Asia</option>
                    </select>

                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={guildSearchQuery}
                        onChange={e => setGuildSearchQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchGuild(); } }}
                        placeholder="Lonca adını yazın..."
                        className="w-full bg-[#1e1f22] border border-[#2b2d31] focus:border-[#5865F2] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-[#5e636e]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSearchGuild}
                      disabled={isSearchingGuild}
                      className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isSearchingGuild ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      <span>Ara</span>
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {guildSearchResults.length > 0 && (
                    <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-2 max-h-40 overflow-y-auto custom-scrollbar mb-3 shadow-xl">
                      <div className="text-[10px] text-[#949ba4] font-bold uppercase px-2 py-1">Arama Sonuçları (Tıklayarak Ekleyin):</div>
                      {guildSearchResults.map(g => (
                        <div
                          key={g.Id || g.Name}
                          onClick={() => handleAddGuild(g.Name)}
                          className="flex items-center justify-between p-2 hover:bg-[#2b2d31] rounded-lg cursor-pointer transition-colors text-xs text-white"
                        >
                          <span className="font-semibold">{g.Name}</span>
                          <span className="text-[10px] text-[#5865F2] bg-[#5865F2]/10 px-2 py-0.5 rounded font-bold">+ Ekle</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual Quick Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualGuildInput}
                      onChange={e => setManualGuildInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddGuild(manualGuildInput); } }}
                      placeholder="Manuel lonca ismi yazıp ekle..."
                      className="flex-1 bg-[#1e1f22] border border-[#2b2d31] focus:border-[#5865F2] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none placeholder-[#5e636e]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddGuild(manualGuildInput)}
                      className="px-3 py-2 bg-[#2b2d31] hover:bg-[#383a40] text-white rounded-xl text-xs font-semibold"
                    >
                      Manuel Ekle
                    </button>
                  </div>
                </div>

                {/* Selected Guilds Tags */}
                <div>
                  <div className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                    Seçilen Albion Loncaları ({formData.albion_guilds.length}):
                  </div>
                  {formData.albion_guilds.length === 0 ? (
                    <div className="text-xs text-[#80848e] italic bg-[#1e1f22]/50 p-3 rounded-lg border border-dashed border-[#2b2d31]">
                      Henüz lonca eklenmedi. Yukarıdan arayarak veya manuel ekleyin.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.albion_guilds.map(guild => (
                        <span
                          key={guild}
                          className="inline-flex items-center gap-1.5 bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/30 px-3 py-1 rounded-lg text-xs font-bold"
                        >
                          <span>{guild}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGuild(guild)}
                            className="text-[#fca311]/60 hover:text-[#fca311]"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Discord Servers Section */}
              <div className="bg-[#111214]/60 border border-[#2b2d31] p-4 rounded-xl flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider flex items-center gap-1.5">
                      <Server size={14} className="text-[#5865F2]" /> Zorunlu Discord Sunucuları
                    </label>
                    <span className="text-[11px] text-[#949ba4] font-medium">Opsiyonel</span>
                  </div>
                  <p className="text-xs text-[#80848e] mb-3">
                    Kullanıcı bu sunucuların <strong>hepsinde</strong> üye olmalıdır. Sunucu ID'sini girin.
                  </p>

                  {/* Input Server ID */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={discordServerInput}
                      onChange={e => setDiscordServerInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDiscordServer(); } }}
                      placeholder="Discord Sunucu ID (Örn: 1007350278984564866)"
                      className="flex-1 bg-[#1e1f22] border border-[#2b2d31] focus:border-[#5865F2] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none placeholder-[#5e636e]"
                    />
                    <button
                      type="button"
                      onClick={handleAddDiscordServer}
                      className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Selected Discord Servers Tags */}
                <div>
                  <div className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                    Gereken Sunucu ID'leri ({formData.discord_servers.length}):
                  </div>
                  {formData.discord_servers.length === 0 ? (
                    <div className="text-xs text-[#80848e] italic bg-[#1e1f22]/50 p-3 rounded-lg border border-dashed border-[#2b2d31]">
                      Herhangi bir Discord sunucusu zorunlu tutulmadı.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.discord_servers.map(srvId => (
                        <span
                          key={srvId}
                          className="inline-flex items-center gap-1.5 bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/30 px-3 py-1 rounded-lg text-xs font-mono font-bold"
                        >
                          <span>{srvId}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDiscordServer(srvId)}
                            className="text-[#5865F2]/60 hover:text-[#5865F2]"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Type & Duration */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#111214]/60 border border-[#2b2d31] p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                    Verilecek Lisans Türü
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, premium_type: 'limited' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.premium_type === 'limited'
                          ? 'bg-[#5865F2]/20 border-[#5865F2] text-white shadow-sm'
                          : 'bg-[#1e1f22] border-[#2b2d31] text-[#949ba4] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Clock size={16} className={formData.premium_type === 'limited' ? 'text-[#5865F2]' : ''} />
                        <span>Süreli (Günlük)</span>
                      </div>
                      <div className="text-[11px] text-[#80848e] mt-1">Belirli gün kadar verilir</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, premium_type: 'unlimited' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.premium_type === 'unlimited'
                          ? 'bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 border-[#FF3366]/50 text-white shadow-sm'
                          : 'bg-[#1e1f22] border-[#2b2d31] text-[#949ba4] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <InfinityIcon size={16} className={formData.premium_type === 'unlimited' ? 'text-[#FF3366]' : ''} />
                        <span>Sınırsız (Ömür Boyu)</span>
                      </div>
                      <div className="text-[11px] text-[#80848e] mt-1">Süresiz aktif kalır</div>
                    </button>
                  </div>
                </div>

                {formData.premium_type === 'limited' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#b5bac1] uppercase tracking-wider mb-2">
                      Süre Miktarı (Gün)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="3650"
                        value={formData.days_to_give}
                        onChange={e => setFormData({ ...formData, days_to_give: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#1e1f22] border border-[#2b2d31] focus:border-[#5865F2] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all"
                      />
                      <div className="absolute right-4 top-3 text-xs text-[#949ba4] font-bold pointer-events-none">
                        GÜN
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center bg-[#1e1f22] p-4 rounded-xl border border-[#2b2d31]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2ecc71]">
                      <CheckCircle2 size={16} /> Sınırsız Lisans Seçildi
                    </div>
                    <p className="text-xs text-[#80848e] mt-1">
                      Kullanıcı şartı sağladığı sürece ömür boyu Top.gg oylama muafiyetine sahip olur.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2b2d31]">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2.5 bg-[#2b2d31] hover:bg-[#383a40] text-[#949ba4] hover:text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Vazgeç
              </button>

              <button
                type="submit"
                disabled={savingRule}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#5865F2]/30 disabled:opacity-50"
              >
                {savingRule ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{editingRuleId ? "Değişiklikleri Güncelle" : "Kuralı Kaydet"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules List Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#949ba4]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Kurallarda ara (lonca, sunucu id, isim)..."
            className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#5865F2] placeholder-[#5e636e]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949ba4] hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={fetchRules}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-[#949ba4] hover:text-white bg-[#1e1f22] border border-[#2b2d31] px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#5865F2]" : ""} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Rules Cards / Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#1e1f22] border border-[#2b2d31] rounded-2xl">
          <Loader2 size={36} className="animate-spin text-[#5865F2] mb-3" />
          <p className="text-sm font-semibold text-white">Kurallar yükleniyor...</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#1e1f22] border border-[#2b2d31] rounded-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#949ba4] mb-4">
            <Sparkles size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchTerm ? "Eşleşen Kural Bulunamadı" : "Henüz Otomatik Kural Eklenmemiş"}
          </h3>
          <p className="text-sm text-[#949ba4] max-w-md mb-6">
            {searchTerm ? "Arama kriterlerinizi değiştirerek tekrar deneyin." : "Yukarıdaki 'Yeni Kural Ekle' butonuna basarak ilk otomatik premium kuralınızı tanımlayabilirsiniz."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => { setShowForm(true); setEditingRuleId(null); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#5865F2]/25"
            >
              <Plus size={16} /> Yeni Kural Oluştur
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map(rule => {
            const isUnlimited = rule.premium_type === 'unlimited';
            const guildCount = (rule.albion_guilds || []).length;
            const serverCount = (rule.discord_servers || []).length;

            return (
              <div 
                key={rule.id}
                className="bg-[#1e1f22] border border-[#2b2d31] hover:border-[#5865F2]/40 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all shadow-lg hover:shadow-2xl relative overflow-hidden group"
              >
                {/* Accent Top Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isUnlimited ? 'bg-gradient-to-r from-[#FF3366] to-[#FF9900]' : 'bg-[#5865F2]'
                }`} />

                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        isUnlimited 
                          ? 'bg-[#FF3366]/15 text-[#FF3366] border border-[#FF3366]/30' 
                          : 'bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/30'
                      }`}>
                        {isUnlimited ? <InfinityIcon size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-[#5865F2] transition-colors line-clamp-1">
                          {rule.rule_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isUnlimited ? (
                            <span className="bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] text-[10px] font-bold px-2 py-0.5 rounded border border-[#FF3366]/30">
                              Sınırsız Premium
                            </span>
                          ) : (
                            <span className="bg-[#5865F2]/15 text-[#5865F2] text-[10px] font-bold px-2 py-0.5 rounded border border-[#5865F2]/30">
                              {rule.days_to_give} Gün Lisans
                            </span>
                          )}
                          <span className="text-[10px] text-[#80848e] font-mono">
                            {new Date(rule.created_at || Date.now()).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-2 text-[#949ba4] hover:text-white bg-[#2b2d31]/80 hover:bg-[#5865F2] rounded-xl transition-colors"
                        title="Kuralı Düzenle"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id, rule.rule_name)}
                        className="p-2 text-[#949ba4] hover:text-red-400 bg-[#2b2d31]/80 hover:bg-red-500/20 rounded-xl transition-colors"
                        title="Kuralı Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Conditions Content */}
                  <div className="mt-4 space-y-3 bg-[#111214]/60 border border-[#2b2d31] p-3.5 rounded-xl">
                    
                    {/* Albion Guilds */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1.5 text-[#fca311]">
                          <Users size={13} /> Albion Loncaları ({guildCount})
                        </span>
                        <span className="text-[10px] font-normal text-[#80848e]">1 tanesi yeterli</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(rule.albion_guilds || []).map((g, idx) => (
                          <span key={idx} className="bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/20 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Discord Servers */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1.5 text-[#5865F2]">
                          <Server size={13} /> Zorunlu Discord Sunucuları ({serverCount})
                        </span>
                        <span className="text-[10px] font-normal text-[#80848e]">
                          {serverCount > 0 ? "hepsinde üye olmalı" : "zorunlu sunucu yok"}
                        </span>
                      </div>
                      {serverCount === 0 ? (
                        <div className="text-[11px] text-[#80848e] italic">
                          Discord sunucu şartı yok (Sadece lonca üyeliği yeterli).
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {(rule.discord_servers || []).map((srv, idx) => (
                            <span key={idx} className="bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold">
                              {srv}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Card Footer Status */}
                <div className="flex items-center justify-between pt-3 border-t border-[#2b2d31] text-xs text-[#80848e]">
                  <span className="flex items-center gap-1.5 text-[#2ecc71] font-semibold">
                    <CheckCircle2 size={14} /> Otomatik Tetikleme Aktif
                  </span>
                  <span className="font-mono text-[11px]">ID: {rule.id.slice(0, 8)}...</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
