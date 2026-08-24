"use client";

import React, { useState } from "react";
import { Search, Server, Clock, Settings, Plus, RefreshCw, MoreVertical, Edit3, Trash2 } from "lucide-react";

export default function AdminServersTab({ 
  servers, 
  loading, 
  setLoading, 
  fetchServers, 
  showToast 
}) {
  const [serverSubTab, setServerSubTab] = useState("guilds");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredServers = servers.filter(s => {
    if (searchTerm && !s.guild_name.toLowerCase().includes(searchTerm.toLowerCase()) && !s.guild_id.includes(searchTerm) && !s.owner_id.includes(searchTerm)) return false;
    const isExpired = !s.is_unlimited && new Date(s.expires_at) < new Date();
    if (statusFilter === 'premium' && (!s.is_active || s.is_unlimited || isExpired)) return false;
    if (statusFilter === 'unlimited' && !s.is_unlimited) return false;
    if (statusFilter === 'passive' && s.is_active) return false;
    if (statusFilter === 'freemium' && (!s.is_active || s.is_unlimited || !isExpired)) return false;
    return true;
  });

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
              <span className="text-white text-2xl font-extrabold">{servers.length}</span>
            </div>
            <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#2ecc71] text-xs font-bold uppercase mb-1">Premium</span>
              <span className="text-white text-2xl font-extrabold">{servers.filter(s => s.is_active && !s.is_unlimited && new Date(s.expires_at) >= new Date()).length}</span>
            </div>
            <div className="bg-[#fca311]/10 border border-[#fca311]/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#fca311] text-xs font-bold uppercase mb-1">Sınırsız</span>
              <span className="text-white text-2xl font-extrabold">{servers.filter(s => s.is_unlimited).length}</span>
            </div>
            <div className="bg-[#ff4757]/10 border border-[#ff4757]/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-[#ff4757] text-xs font-bold uppercase mb-1">Freemium</span>
              <span className="text-white text-2xl font-extrabold">{servers.filter(s => s.is_active && !s.is_unlimited && new Date(s.expires_at) < new Date()).length}</span>
            </div>
            <div className="bg-[#1e1f22] border border-red-500/20 p-4 rounded-xl flex flex-col items-center text-center">
              <span className="text-red-400 text-xs font-bold uppercase mb-1">Pasif</span>
              <span className="text-white text-2xl font-extrabold">{servers.filter(s => !s.is_active).length}</span>
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
            
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar">
              <button 
                className="shrink-0 flex items-center justify-center gap-2 bg-[#2b2d31] hover:bg-[#383a40] text-white px-4 h-[44px] rounded-xl text-sm font-medium transition-colors border border-[#1e1f22]"
              >
                <RefreshCw size={16} /> Otomatik Tara
              </button>
              <button 
                className="shrink-0 flex items-center justify-center gap-2 bg-[#2b2d31] hover:bg-[#383a40] text-white px-4 h-[44px] rounded-xl text-sm font-medium transition-colors border border-[#1e1f22]"
              >
                <Settings size={16} /> Kurallar
              </button>
              <button 
                className="shrink-0 flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 h-[44px] rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#5865F2]/20"
              >
                <Plus size={16} /> Lisans Ekle
              </button>
            </div>
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
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fca311]/20 to-[#fca311]/5 border border-[#fca311]/20 flex items-center justify-center font-bold text-[#fca311]">
                            {s.guild_name?.charAt(0).toUpperCase() || 'V'}
                          </div>
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
                        <button className="p-2 text-[#949ba4] hover:text-white bg-[#2b2d31] hover:bg-[#383a40] rounded-lg transition-colors inline-flex">
                          <MoreVertical size={16} />
                        </button>
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
                  {/* Card Status Indicator Line */}
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
                    <button className="shrink-0 p-2 text-[#949ba4] hover:text-white bg-[#2b2d31] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <MoreVertical size={18} />
                    </button>
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
                </div>
              )
            })}
          </div>

        </div>
      )}

      {serverSubTab === "users" && (
        <div className="bg-[#1e1f22] p-8 rounded-2xl border border-[#2b2d31] text-center">
          <p className="text-[#949ba4]">Bireysel lisanslar görünümü yapım aşamasında...</p>
        </div>
      )}

    </div>
  );
}
