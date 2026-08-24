"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, Gamepad2, TerminalSquare, Server } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

export default function AdminStatsTab({ activeServerCount }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (res.ok) setStatsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analitik & İstatistikler</h2>
          <p className="text-[#949ba4] text-sm">Bot kullanım verilerini grafiklerle inceleyin.</p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#2b2d31] hover:bg-[#383a40] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-[#1e1f22] disabled:opacity-50"
        >
          <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      {loading && !statsData ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 size={32} className="text-[#5865F2] animate-spin" />
        </div>
      ) : statsData?.warning ? (
        <div className="flex flex-col items-center justify-center p-12 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
          <AlertCircle size={48} className="mb-4" />
          <h3 className="text-lg font-bold">Geçici Olarak Devre Dışı</h3>
          <p className="mt-2 text-sm opacity-80 text-center max-w-md">{statsData.warning}</p>
        </div>
      ) : statsData ? (
        <div className="flex flex-col gap-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/90 border border-white/5 p-6 rounded-2xl flex items-center gap-5 shadow-lg backdrop-blur-sm">
              <div className="bg-[#fca311]/10 p-4 rounded-2xl shrink-0">
                <Gamepad2 size={32} className="text-[#fca311]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[#949ba4] text-[11px] font-bold uppercase tracking-wider mb-1 truncate">Toplam Parti</div>
                <div className="text-white text-3xl font-extrabold truncate">
                  {statsData.stats?.totalParties?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/90 border border-white/5 p-6 rounded-2xl flex items-center gap-5 shadow-lg backdrop-blur-sm">
              <div className="bg-[#3a86ff]/10 p-4 rounded-2xl shrink-0">
                <TerminalSquare size={32} className="text-[#3a86ff]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[#949ba4] text-[11px] font-bold uppercase tracking-wider mb-1 truncate">Kullanılan Komut</div>
                <div className="text-white text-3xl font-extrabold truncate">
                  {statsData.stats?.totalCommands?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/90 border border-white/5 p-6 rounded-2xl flex items-center gap-5 shadow-lg backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <div className="bg-[#2ecc71]/10 p-4 rounded-2xl shrink-0">
                <Server size={32} className="text-[#2ecc71]" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[#949ba4] text-[11px] font-bold uppercase tracking-wider mb-1 truncate">Aktif Premium Sunucu</div>
                <div className="text-white text-3xl font-extrabold truncate">
                  {activeServerCount || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Parties Chart */}
            <div className="bg-[#2b2d31]/50 border border-[#1e1f22] p-5 rounded-2xl flex flex-col min-w-0">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Gamepad2 size={20} className="text-[#5865F2]" />
                Son 7 Günlük Parti Etkinliği
              </h3>
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorParties" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5865F2" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#5865F2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#383a40" vertical={false} />
                    <XAxis dataKey="date" stroke="#949ba4" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#949ba4" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#2b2d31', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#5865F2' }}
                    />
                    <Area type="monotone" dataKey="parties" stroke="#5865F2" strokeWidth={3} fillOpacity={1} fill="url(#colorParties)" name="Oluşturulan Parti" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Commands Chart */}
            <div className="bg-[#2b2d31]/50 border border-[#1e1f22] p-5 rounded-2xl flex flex-col min-w-0">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <TerminalSquare size={20} className="text-[#FF3366]" />
                Son 7 Günlük Komut Kullanımı
              </h3>
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#383a40" vertical={false} />
                    <XAxis dataKey="date" stroke="#949ba4" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#949ba4" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#2b2d31', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#FF3366' }}
                      cursor={{ fill: '#383a40', opacity: 0.4 }}
                    />
                    <Bar dataKey="commands" fill="#FF3366" radius={[4, 4, 0, 0]} name="Kullanılan Komut" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
