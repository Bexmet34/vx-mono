"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, ChevronLeft, ChevronRight, RefreshCw, Hash } from "lucide-react";

export default function DropLeaderboard({ guildId, lang }) {
  const isEn = lang === "en";

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (p) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/drop-leaderboard/${guildId}?page=${p}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
        setPage(json.page || 1);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page, fetchLeaderboard]);

  const handlePrev = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const getRankBadge = (index, pageNum) => {
    const globalRank = (pageNum - 1) * 20 + (index + 1);
    
    if (globalRank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (globalRank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (globalRank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    
    return <span className="text-sm font-bold text-slate-500 w-5 text-center">{globalRank}</span>;
  };

  const getRankColor = (index, pageNum) => {
    const globalRank = (pageNum - 1) * 20 + (index + 1);
    if (globalRank === 1) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-100";
    if (globalRank === 2) return "bg-slate-300/10 border-slate-300/30 text-slate-100";
    if (globalRank === 3) return "bg-amber-600/10 border-amber-600/30 text-amber-100";
    return "bg-surface border-white/5 text-on-surface-variant hover:bg-surface-variant/50";
  };

  return (
    <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 animate-fade-in mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="text-primary" />
            {isEn ? "Drop Leaderboard" : "Drop Puan Tablosu"}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {isEn ? "Top drop catchers in this server" : "Bu sunucudaki en çok drop yakalayanlar"}
          </p>
        </div>
        <button
          onClick={() => fetchLeaderboard(page)}
          className="p-2 rounded-xl bg-surface border border-white/5 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-white"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      <div className="border border-white/5 rounded-xl overflow-hidden bg-surface">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-surface-variant/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">#</div>
          <div className="col-span-4">{isEn ? "User" : "Kullanıcı"}</div>
          <div className="col-span-3 text-center">{isEn ? "Points" : "Puan"}</div>
          <div className="col-span-3 text-center">{isEn ? "Wins" : "Kazanım"}</div>
        </div>

        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            {isEn ? "Loading leaderboard..." : "Sıralama yükleniyor..."}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500 italic">
            {isEn ? "No one has claimed a drop yet." : "Henüz kimse drop yakalamadı."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.map((user, idx) => (
              <div 
                key={user.user_id} 
                className={`grid grid-cols-12 gap-4 p-3 items-center transition-colors ${getRankColor(idx, page)}`}
              >
                <div className="col-span-2 flex justify-center">
                  {getRankBadge(idx, page)}
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                    {user.discordUser?.avatarUrl ? (
                      <img src={user.discordUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">
                        <Hash className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div className="font-medium truncate flex flex-col">
                    {user.discordUser?.name ? (
                      <>
                        <span className="text-sm">{user.discordUser.name}</span>
                        <span className="opacity-50 text-[10px]">ID: {user.user_id}</span>
                      </>
                    ) : (
                      <>
                        <span className="opacity-50 text-[10px]">ID:</span>
                        <span className="text-sm">{user.user_id}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-span-3 text-center font-bold text-primary">
                  {user.total_points}
                </div>
                <div className="col-span-3 text-center text-sm">
                  {user.win_count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-on-surface-variant">
            {isEn ? `Showing ${data.length} of ${total} users` : `Toplam ${total} kullanıcıdan ${data.length} tanesi gösteriliyor`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1 || loading}
              className="p-2 rounded-xl bg-surface border border-white/5 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-2 rounded-xl bg-surface border border-white/5 text-sm font-medium min-w-[5rem] text-center">
              {page} / {totalPages}
            </div>
            <button
              onClick={handleNext}
              disabled={page === totalPages || loading}
              className="p-2 rounded-xl bg-surface border border-white/5 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
