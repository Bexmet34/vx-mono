"use client";

import React, { useState } from "react";
import { Search, Server, Clock, Settings, Plus, RefreshCw, MoreVertical, Edit3, Trash2, Infinity, Power, Gamepad2, Loader2, Calendar } from "lucide-react";

export default function AdminServersTab({ 
  servers, 
  loading, 
  setLoading, 
  fetchServers, 
  showToast,
  users,
  fetchUsers,
  savingId,
  handleServerAction,
  handleDeleteServer,
  handleUserAction,
  setShowRulesModal,
  setShowUserModal,
  userSearchTerm,
  setUserSearchTerm
}) {
  const [serverSubTab, setServerSubTab] = useState("guilds");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredServers = (servers || []).filter(s => {
    if (searchTerm && !s.guild_name?.toLowerCase().includes(searchTerm.toLowerCase()) && !s.guild_id.includes(searchTerm) && !(s.owner_id && s.owner_id.includes(searchTerm))) return false;
    const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
    if (statusFilter === 'premium' && (!s.is_active || s.is_unlimited || isExpired)) return false;
    if (statusFilter === 'unlimited' && !s.is_unlimited) return false;
    if (statusFilter === 'passive' && s.is_active) return false;
    if (statusFilter === 'freemium' && (!s.is_active || s.is_unlimited || !isExpired)) return false;
    return true;
  });

  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => !userSearchTerm || (u.discord_id && u.discord_id.includes(userSearchTerm)));

  const handleScanAutoPremium = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/scan-auto-premium', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Tarama tamamlandı! ${data.revokedCount || 0} kişinin otomatik premiumu iptal edildi.`, "success");
        fetchUsers(true);
      } else {
        showToast("Tarama sırasında bir hata oluştu.", "error");
      }
    } catch (e) {
      showToast("Bağlantı hatası.", "error");
    }
    setLoading(false);
  };

  const handleCleanServers = async () => {
    if (!confirm("Botun bulunmadığı tüm sunucular veritabanından kalıcı olarak silinecektir. Onaylıyor musunuz?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clean-servers', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Temizlik tamamlandı! ${data.deletedCount || 0} adet çöp sunucu veritabanından silindi.`, "success");
        fetchServers(true);
      } else {
        showToast(data.error || "Temizlik sırasında bir hata oluştu.", "error");
      }
    } catch (e) {
      showToast("Bağlantı hatası.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Subtabs */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Lisans Yönetimi</h2>
          <p className="text-[#949ba4] text-sm">Sunucu ve bireysel lisansları yönetin, paket atayın.</p>
        </div>

        <div className="flex bg-[#1e1f22] p-1 rounded-xl w-full sm:w-fit border border-[#2b2d31]">
          <button 
            onClick={() => setServerSubTab("guilds")} 
            className={`flex-1 sm:w-48 py-2.5 text-sm font-semibold rounded-lg transition-all ${serverSubTab === "guilds" ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20" : "text-[#949ba4] hover:text-white"}`}
          >
            Sunucu Lisansları
          </button>
          <button 
            onClick={() => setServerSubTab("users")} 
            className={`flex-1 sm:w-48 py-2.5 text-sm font-semibold rounded-lg transition-all ${serverSubTab === "users" ? "bg-[#5865F2] text-white shadow-md shadow-[#5865F2]/20" : "text-[#949ba4] hover:text-white"}`}
          >
            Bireysel Lisanslar
          </button>
        </div>
      </div>

      {serverSubTab === "guilds" && (
        <div className="flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-[#1e1f22] border border-[#2b2d31] p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#949ba4] text-xs font-bold uppercase mb-1">Toplam</span>
              <span className="text-white text-2xl font-extrabold">{(servers || []).length}</span>
            </div>
            <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#2ecc71] text-xs font-bold uppercase mb-1">Premium</span>
              <span className="text-white text-2xl font-extrabold">{(servers || []).filter(s => s.is_active && !s.is_unlimited && new Date(s.expires_at) >= new Date()).length}</span>
            </div>
            <div className="bg-[#fca311]/10 border border-[#fca311]/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#fca311] text-xs font-bold uppercase mb-1">Sınırsız</span>
              <span className="text-white text-2xl font-extrabold">{(servers || []).filter(s => s.is_unlimited).length}</span>
            </div>
            <div className="bg-[#ff4757]/10 border border-[#ff4757]/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#ff4757] text-xs font-bold uppercase mb-1">Freemium</span>
              <span className="text-white text-2xl font-extrabold">{(servers || []).filter(s => s.is_active && !s.is_unlimited && new Date(s.expires_at) < new Date()).length}</span>
            </div>
            <div className="bg-[#1e1f22] border border-red-500/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-red-400 text-xs font-bold uppercase mb-1">Pasif</span>
              <span className="text-white text-2xl font-extrabold">{(servers || []).filter(s => !s.is_active).length}</span>
            </div>
          </div>

          {/* Actions & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1e1f22] p-4 rounded-xl border border-[#2b2d31]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949ba4]" size={16} />
              <input 
                type="text"
                placeholder="Sunucu ismi veya ID ara..."
                className="w-full bg-[#2b2d31] border border-[#1e1f22] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#5865F2] transition-colors h-[44px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleCleanServers}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl border border-red-500/30 transition-colors flex items-center justify-center gap-2 h-[44px]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>Çöp Sunucuları Temizle</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'premium', 'unlimited', 'passive', 'freemium'].map(f => (
              <button 
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 h-[36px] rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                  statusFilter === f 
                    ? f === 'freemium' ? 'bg-[#ff4757] text-white border-[#ff4757]' : 'bg-[#5865F2] text-white border-[#5865F2]'
                    : 'bg-transparent text-[#949ba4] border-[#2b2d31] hover:bg-[#2b2d31]'
                }`}
              >
                {f === 'all' && 'Hepsi'}
                {f === 'premium' && 'Premium'}
                {f === 'unlimited' && 'Sınırsız'}
                {f === 'passive' && 'Pasif'}
                {f === 'freemium' && 'Freemium'}
              </button>
            ))}
          </div>

          {/* Data Display - Responsive Cards for Mobile, Table for Desktop */}
          <div className="hidden lg:block bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#2b2d31]/50 text-[#949ba4] font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Sunucu Bilgisi</th>
                  <th className="px-6 py-4">Sahip ID</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2d31]">
                {filteredServers.map(s => {
                  const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
                  const isPassive = !s.is_active;
                  return (
                    <tr key={s.id} className={`hover:bg-[#2b2d31]/30 transition-colors ${isPassive ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.guild_icon ? (
                            <img src={`https://cdn.discordapp.com/icons/${s.guild_id}/${s.guild_icon}.${s.guild_icon.startsWith('a_') ? 'gif' : 'png'}?size=64`} alt="icon" className="w-10 h-10 rounded-xl border border-[#fca311]/20 object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fca311]/20 to-[#fca311]/5 border border-[#fca311]/20 flex items-center justify-center font-bold text-[#fca311]">
                              {s.guild_name?.charAt(0).toUpperCase() || 'V'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white">{s.guild_name}</div>
                            <div className="text-xs text-[#949ba4] font-mono">{s.guild_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="bg-[#2b2d31] text-[#b5bac1] px-2 py-1 rounded-md text-xs">{s.owner_id}</code>
                      </td>
                      <td className="px-6 py-4">
                        {isPassive ? (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md text-xs font-semibold">Pasif</span>
                        ) : (
                          <span className="bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/20 px-2 py-1 rounded-md text-xs font-semibold">Aktif</span>
                        )}
                        {s.unlimited_party && (
                          <span className="ml-2 bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/20 px-2 py-1 rounded-md text-xs font-semibold">Party</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {s.is_unlimited ? (
                            <span className="bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] px-2 py-1 rounded-md text-xs font-bold border border-[#FF3366]/30">Sınırsız</span>
                          ) : !isExpired ? (
                            <>
                              <span className="bg-[#5865F2]/10 text-[#5865F2] px-2 py-1 rounded-md text-xs font-bold border border-[#5865F2]/20">Premium</span>
                              <span className="text-[10px] text-[#949ba4] flex items-center gap-1 font-semibold">
                                <Clock size={10} /> {Math.ceil((new Date(s.expires_at) - new Date()) / (1000 * 60 * 60 * 24))} Gün Kaldı
                              </span>
                            </>
                          ) : (
                            <span className="bg-[#ff4757]/10 text-[#ff4757] px-2 py-1 rounded-md text-xs font-bold border border-[#ff4757]/20">Freemium</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button 
                             className="p-2 bg-[#2ecc71]/10 hover:bg-[#2ecc71]/20 text-[#2ecc71] rounded-lg transition-colors border border-transparent hover:border-[#2ecc71]/30 disabled:opacity-50"
                             title="Özel Gün Ekle" 
                             disabled={savingId === s.guild_id}
                             onClick={() => {
                               const days = window.prompt("Eklenecek gün sayısını girin:", "30");
                               if (days && !isNaN(days) && parseInt(days) > 0) handleServerAction(s.guild_id, 'add_days', parseInt(days));
                             }}
                           >
                             {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                           </button>
                           
                           <button 
                             className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30 disabled:opacity-50"
                             title="Özel Gün Çıkar" 
                             disabled={savingId === s.guild_id}
                             onClick={() => {
                               const days = window.prompt("Çıkarılacak gün sayısını girin:", "30");
                               if (days && !isNaN(days) && parseInt(days) > 0) handleServerAction(s.guild_id, 'remove_days', parseInt(days));
                             }}
                           >
                             {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                           </button>

                           <button 
                              className={`p-2 rounded-lg transition-colors border border-transparent disabled:opacity-50 ${s.unlimited_party ? 'bg-[#fca311]/20 text-[#fca311] border-[#fca311]/30 font-bold' : 'bg-[#2b2d31] hover:bg-[#383a40] text-[#949ba4] hover:text-white'}`}
                              title={s.unlimited_party ? 'Sınırsız Party Aç: AÇIK — Kapat' : 'Sınırsız Party Aç: KAPALI — Aç'}
                              disabled={savingId === s.guild_id}
                              onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited_party', !s.unlimited_party)}
                            >
                              {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Gamepad2 size={16} />}
                            </button>
                            
                            <button 
                              className={`p-2 rounded-lg transition-colors border border-transparent disabled:opacity-50 ${s.is_unlimited ? 'bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] border-[#FF3366]/30 font-bold shadow-sm' : 'bg-[#2b2d31] hover:bg-[#383a40] text-[#949ba4] hover:text-white'}`}
                              title={s.is_unlimited ? "Sınırsız Premium: AÇIK — Kapat" : "Sınırsız Premium Yap"} 
                              disabled={savingId === s.guild_id}
                              onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited', !s.is_unlimited)}
                            >
                              {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Infinity size={16} />}
                            </button>
                            
                            <button 
                              className={`p-2 rounded-lg transition-colors border border-transparent disabled:opacity-50 ${!s.is_active ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#2b2d31] hover:bg-[#383a40] text-[#949ba4] hover:text-white'}`}
                              title={s.is_active ? "Sunucuyu Devre Dışı Bırak" : "Sunucuyu Etkinleştir"} 
                              disabled={savingId === s.guild_id}
                              onClick={() => handleServerAction(s.guild_id, 'toggle_active', !s.is_active)}
                            >
                              {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                            </button>
                            
                            <button 
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/30 disabled:opacity-50"
                              title="Sunucu Kaydını Sil (Freemium'a Düşür)" 
                              disabled={savingId === s.guild_id}
                              onClick={() => handleDeleteServer && handleDeleteServer(s.guild_id)}
                            >
                              {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Visible only on lg <) */}
          <div className="lg:hidden flex flex-col gap-4">
            {filteredServers.map(s => {
              const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
              const isPassive = !s.is_active;
              return (
                <div key={s.id} className={`bg-[#1e1f22] border border-[#2b2d31] rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden ${isPassive ? 'opacity-60' : ''}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    s.is_unlimited ? 'bg-gradient-to-b from-[#FF3366] to-[#FF9900]' : 
                    !isExpired ? 'bg-[#5865F2]' : 'bg-[#ff4757]'
                  }`} />
                  
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fca311]/20 to-[#fca311]/5 border border-[#fca311]/20 flex items-center justify-center font-bold text-[#fca311] text-lg shrink-0">
                        {s.guild_name?.charAt(0).toUpperCase() || 'V'}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <h3 className="font-bold text-white text-base truncate pr-2">{s.guild_name}</h3>
                        <div className="text-xs text-[#949ba4] font-mono mt-0.5 truncate">{s.guild_id}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2b2d31]/50 rounded-xl p-3 grid grid-cols-2 gap-3 pl-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#949ba4] text-[10px] uppercase font-bold tracking-wider">Durum</span>
                      <div className="flex flex-wrap gap-1">
                        {isPassive ? (
                          <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">Pasif</span>
                        ) : (
                          <span className="bg-[#2ecc71]/10 text-[#2ecc71] px-2 py-0.5 rounded text-xs font-semibold">Aktif</span>
                        )}
                        {s.unlimited_party && (
                          <span className="bg-[#fca311]/10 text-[#fca311] px-2 py-0.5 rounded text-xs font-semibold">Party</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[#949ba4] text-[10px] uppercase font-bold tracking-wider">Plan</span>
                      <div className="flex flex-col items-start gap-1">
                        {s.is_unlimited ? (
                          <span className="bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] px-2 py-0.5 rounded text-xs font-bold border border-[#FF3366]/30">Sınırsız</span>
                        ) : !isExpired ? (
                          <>
                            <span className="bg-[#5865F2]/10 text-[#5865F2] px-2 py-0.5 rounded text-xs font-bold">Premium</span>
                            <span className="text-[10px] text-[#949ba4] flex items-center gap-1 font-semibold">
                              <Clock size={10} /> {Math.ceil((new Date(s.expires_at) - new Date()) / (1000 * 60 * 60 * 24))} Gün Kaldı
                            </span>
                          </>
                        ) : (
                          <span className="bg-[#ff4757]/10 text-[#ff4757] px-2 py-0.5 rounded text-xs font-bold">Freemium</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions mobile */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#2b2d31]/50 mt-1">
                     <button className="p-2 bg-[#2ecc71]/10 text-[#2ecc71] rounded-lg disabled:opacity-50" disabled={savingId === s.guild_id} onClick={() => {
                         const days = window.prompt("Eklenecek gün sayısını girin:", "30");
                         if (days && !isNaN(days) && parseInt(days) > 0) handleServerAction(s.guild_id, 'add_days', parseInt(days));
                     }}>
                       {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                     </button>
                     <button className="p-2 bg-red-500/10 text-red-400 rounded-lg disabled:opacity-50" disabled={savingId === s.guild_id} onClick={() => {
                         const days = window.prompt("Çıkarılacak gün sayısını girin:", "30");
                         if (days && !isNaN(days) && parseInt(days) > 0) handleServerAction(s.guild_id, 'remove_days', parseInt(days));
                     }}>
                       {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                     </button>
                     <button className={`p-2 rounded-lg disabled:opacity-50 ${s.unlimited_party ? 'bg-[#fca311]/20 text-[#fca311] border border-[#fca311]/30 font-bold' : 'bg-[#2b2d31] text-[#949ba4]'}`} title={s.unlimited_party ? 'Sınırsız Party: AÇIK' : 'Sınırsız Party: KAPALI'} disabled={savingId === s.guild_id} onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited_party', !s.unlimited_party)}>
                       {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Gamepad2 size={16} />}
                     </button>
                     <button className={`p-2 rounded-lg disabled:opacity-50 ${s.is_unlimited ? 'bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] border border-[#FF3366]/30 font-bold' : 'bg-[#2b2d31] text-[#949ba4]'}`} title={s.is_unlimited ? 'Sınırsız: AÇIK' : 'Sınırsız: KAPALI'} disabled={savingId === s.guild_id} onClick={() => handleServerAction(s.guild_id, 'toggle_unlimited', !s.is_unlimited)}>
                       {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Infinity size={16} />}
                     </button>
                     <button className={`p-2 rounded-lg disabled:opacity-50 ${!s.is_active ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#2b2d31] text-[#949ba4]'}`} title={s.is_active ? 'Devre Dışı Bırak' : 'Etkinleştir'} disabled={savingId === s.guild_id} onClick={() => handleServerAction(s.guild_id, 'toggle_active', !s.is_active)}>
                       {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                     </button>
                     <button className="p-2 bg-red-500/10 text-red-500 rounded-lg disabled:opacity-50" disabled={savingId === s.guild_id} onClick={() => handleDeleteServer && handleDeleteServer(s.guild_id)}>
                       {savingId === s.guild_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                     </button>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}

      {serverSubTab === "users" && (
        <div className="flex flex-col gap-6">
          {/* Actions & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1e1f22] p-4 rounded-xl border border-[#2b2d31]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949ba4]" size={16} />
              <input 
                type="text"
                placeholder="Discord ID ile ara..."
                className="w-full bg-[#2b2d31] border border-[#1e1f22] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#5865F2] transition-colors h-[44px]"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
              <button 
                onClick={handleScanAutoPremium}
                className="shrink-0 flex items-center justify-center gap-2 bg-[#2b2d31] hover:bg-[#383a40] text-white px-4 h-[44px] rounded-xl text-sm font-medium transition-colors border border-[#1e1f22]"
              >
                <RefreshCw size={16} /> Otomatik Tara
              </button>
              <button 
                onClick={() => setShowRulesModal(true)}
                className="shrink-0 flex items-center justify-center gap-2 bg-[#2b2d31] hover:bg-[#383a40] text-white px-4 h-[44px] rounded-xl text-sm font-medium transition-colors border border-[#1e1f22]"
              >
                <Settings size={16} /> Kurallar
              </button>
              <button 
                onClick={() => setShowUserModal(true)}
                className="shrink-0 flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 h-[44px] rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#5865F2]/20"
              >
                <Plus size={16} /> Bireysel Lisans Ekle
              </button>
            </div>
          </div>

          <div className="hidden lg:block bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#2b2d31]/50 text-[#949ba4] font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Discord Kullanıcı Bilgisi</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Plan / Süre</th>
                  <th className="px-6 py-4">Ortak Sunucular</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2d31]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#949ba4]">Bireysel premium kullanan üye bulunamadı.</td>
                  </tr>
                ) : filteredUsers.map(u => {
                  const isExpired = !u.is_unlimited && u.premium_until && new Date(u.premium_until) < new Date();
                  const isPremiumActive = u.is_unlimited || (u.premium_until && new Date(u.premium_until) >= new Date());

                  return (
                    <tr key={u.discord_id} className="hover:bg-[#2b2d31]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} width={42} height={42} className="rounded-xl border border-[#2b2d31]" alt={u.username} />
                          ) : (
                            <div className="w-[42px] h-[42px] rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center font-bold text-[#5865F2]">U</div>
                          )}
                          <div>
                            <div className="font-bold text-white">{u.username || "Discord Kullanıcısı"}</div>
                            <div className="text-xs text-[#949ba4] font-mono">{u.discord_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {u.is_unlimited ? (
                            <span className="bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] px-2 py-0.5 rounded text-xs font-bold border border-[#FF3366]/30">Sınırsız</span>
                          ) : isPremiumActive ? (
                            <span className="bg-[#2ecc71]/10 text-[#2ecc71] px-2 py-0.5 rounded text-xs font-semibold border border-[#2ecc71]/20">Aktif</span>
                          ) : (
                            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-semibold border border-red-500/20">Süresi Dolan</span>
                          )}
                          
                          {u.is_auto_premium ? (
                            <span className="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 px-2 py-0.5 rounded text-[10px] font-bold">🤖 Otomatik</span>
                          ) : (
                            <span className="bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/20 px-2 py-0.5 rounded text-[10px] font-bold">💎 Manuel</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-semibold text-white">Bireysel</span>
                          {!u.is_unlimited && u.premium_until && (
                             <span className="text-[10px] text-[#949ba4] flex items-center gap-1">
                               <Clock size={10} /> {new Date(u.premium_until).toLocaleDateString('tr-TR')}
                             </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.mutual_guilds && u.mutual_guilds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(u.mutual_guilds) ? u.mutual_guilds : []).slice(0, 3).map((guild, idx) => {
                              const guildName = typeof guild === 'object' && guild !== null ? (guild.name || guild.id || 'Sunucu') : String(guild);
                              const guildInvite = typeof guild === 'object' && guild !== null ? (guild.invite || (guild.id ? `https://discord.com/channels/${guild.id}` : null)) : null;
                              if (guildInvite) {
                                return (
                                  <a
                                    key={guild.id || idx}
                                    href={guildInvite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#2b2d31] hover:bg-[#383a40] text-[#b5bac1] hover:text-white px-2 py-1 rounded-md text-[10px] transition-colors"
                                    title={guildName}
                                  >
                                    {guildName}
                                  </a>
                                );
                              }
                              return (
                                <span key={idx} className="bg-[#2b2d31] text-[#b5bac1] px-2 py-1 rounded-md text-[10px]" title={guildName}>
                                  {guildName}
                                </span>
                              );
                            })}
                            {Array.isArray(u.mutual_guilds) && u.mutual_guilds.length > 3 && (
                              <span className="bg-[#2b2d31] text-[#b5bac1] px-2 py-1 rounded-md text-[10px]">+{u.mutual_guilds.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#949ba4] text-xs">Bulunamadı</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           {!u.is_auto_premium && (
                             <>
                               <button 
                                 className="p-2 bg-[#2ecc71]/10 hover:bg-[#2ecc71]/20 text-[#2ecc71] rounded-lg transition-colors border border-transparent hover:border-[#2ecc71]/30 disabled:opacity-50"
                                 title="+30 Gün Ekle" 
                                 disabled={savingId === u.discord_id}
                                 onClick={() => handleUserAction(u.discord_id, 'add_days', 30)}
                               >
                                 {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                               </button>
                               <button 
                                 className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30 disabled:opacity-50"
                                 title="-30 Gün Çıkar" 
                                 disabled={savingId === u.discord_id}
                                 onClick={() => handleUserAction(u.discord_id, 'remove_days', 30)}
                               >
                                 {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                               </button>
                               <button 
                                 className={`p-2 rounded-lg transition-colors border border-transparent disabled:opacity-50 ${u.is_unlimited ? 'bg-[#5865F2]/20 text-[#5865F2] border-[#5865F2]/30' : 'bg-[#2b2d31] hover:bg-[#383a40] text-[#949ba4] hover:text-white'}`}
                                 title="Sınırsız Yap" 
                                 disabled={savingId === u.discord_id}
                                 onClick={() => handleUserAction(u.discord_id, 'toggle_unlimited', !u.is_unlimited)}
                               >
                                 {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Infinity size={16} />}
                               </button>
                             </>
                           )}
                           <button 
                             className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30 disabled:opacity-50"
                             title="Premium İptal Et / Sil" 
                             disabled={savingId === u.discord_id}
                             onClick={() => handleUserAction(u.discord_id, 'revoke')}
                           >
                             {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden flex flex-col gap-4">
             {filteredUsers.map(u => {
               const isExpired = !u.is_unlimited && u.premium_until && new Date(u.premium_until) < new Date();
               const isPremiumActive = u.is_unlimited || (u.premium_until && new Date(u.premium_until) >= new Date());
               return (
                 <div key={u.discord_id} className="bg-[#1e1f22] border border-[#2b2d31] rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
                   <div className="flex items-start justify-between gap-3">
                     <div className="flex items-center gap-3">
                       {u.avatar_url ? (
                         <img src={u.avatar_url} width={42} height={42} className="rounded-xl border border-[#2b2d31]" alt={u.username} />
                       ) : (
                         <div className="w-[42px] h-[42px] rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center font-bold text-[#5865F2]">U</div>
                       )}
                       <div className="flex flex-col">
                         <h3 className="font-bold text-white text-base truncate">{u.username || "Discord Kullanıcısı"}</h3>
                         <div className="text-xs text-[#949ba4] font-mono">{u.discord_id}</div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-[#2b2d31]/50 rounded-xl p-3 grid grid-cols-2 gap-3">
                     <div className="flex flex-col gap-1">
                       <span className="text-[#949ba4] text-[10px] uppercase font-bold tracking-wider">Durum</span>
                       <div className="flex flex-col items-start gap-1">
                          {u.is_unlimited ? (
                            <span className="bg-gradient-to-r from-[#FF3366]/20 to-[#FF9900]/20 text-[#FF3366] px-2 py-0.5 rounded text-xs font-bold border border-[#FF3366]/30">Sınırsız</span>
                          ) : isPremiumActive ? (
                            <span className="bg-[#2ecc71]/10 text-[#2ecc71] px-2 py-0.5 rounded text-xs font-semibold">Aktif</span>
                          ) : (
                            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">Süresi Dolan</span>
                          )}
                          {u.is_auto_premium ? (
                            <span className="bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded text-[10px] font-bold">🤖 Otomatik</span>
                          ) : (
                            <span className="bg-[#fca311]/10 text-[#fca311] px-2 py-0.5 rounded text-[10px] font-bold">💎 Manuel</span>
                          )}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex justify-end gap-2 pt-2 border-t border-[#2b2d31]/50 mt-1">
                     {!u.is_auto_premium && (
                       <>
                         <button className="p-2 bg-[#2ecc71]/10 text-[#2ecc71] rounded-lg disabled:opacity-50" disabled={savingId === u.discord_id} onClick={() => handleUserAction(u.discord_id, 'add_days', 30)}>
                           {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                         </button>
                         <button className="p-2 bg-red-500/10 text-red-400 rounded-lg disabled:opacity-50" disabled={savingId === u.discord_id} onClick={() => handleUserAction(u.discord_id, 'remove_days', 30)}>
                           {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                         </button>
                         <button className={`p-2 rounded-lg disabled:opacity-50 ${u.is_unlimited ? 'bg-[#5865F2]/20 text-[#5865F2]' : 'bg-[#2b2d31] text-[#949ba4]'}`} disabled={savingId === u.discord_id} onClick={() => handleUserAction(u.discord_id, 'toggle_unlimited', !u.is_unlimited)}>
                           {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Infinity size={16} />}
                         </button>
                       </>
                     )}
                     <button className="p-2 bg-red-500/10 text-red-400 rounded-lg disabled:opacity-50" disabled={savingId === u.discord_id} onClick={() => handleUserAction(u.discord_id, 'revoke')}>
                       {savingId === u.discord_id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                     </button>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      )}

    </div>
  );
}
