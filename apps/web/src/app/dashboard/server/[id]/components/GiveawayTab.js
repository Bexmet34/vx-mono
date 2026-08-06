"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Trash2, CheckCircle2, Clock, Users, ShieldAlert, AlertCircle, Loader2 } from "lucide-react";

export default function GiveawayTab({ t, lang, guildId, discordChannels, discordRoles }) {
  const [activeGiveaways, setActiveGiveaways] = useState([]);
  const [endedGiveaways, setEndedGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channelId, setChannelId] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [winnerCount, setWinnerCount] = useState(1);
  const [backupCount, setBackupCount] = useState(1);
  const [requiredRoles, setRequiredRoles] = useState([]);
  const [secretFairness, setSecretFairness] = useState(true);

  const textChannels = (discordChannels || []).filter(c => c.type === 0);

  const fetchGiveaways = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/giveaways/${guildId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveGiveaways(data.active || []);
        setEndedGiveaways(data.ended || []);
      }
    } catch (e) {
      console.error("Error fetching giveaways:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiveaways();
  }, [guildId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !channelId) return;

    try {
      setCreating(true);
      const endsAt = new Date(Date.now() + parseFloat(durationHours) * 60 * 60 * 1000).toISOString();

      const res = await fetch(`/api/giveaways/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          channel_id: channelId,
          winner_count: winnerCount,
          backup_count: backupCount,
          required_role_ids: requiredRoles,
          secret_fairness: secretFairness,
          ends_at: endsAt
        })
      });

      if (res.ok) {
        // Reset form
        setTitle("");
        setDescription("");
        setDurationHours("24");
        setWinnerCount(1);
        setBackupCount(1);
        setRequiredRoles([]);
        fetchGiveaways();
      }
    } catch (e) {
      console.error("Error creating giveaway:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (giveawayId) => {
    try {
      setCancellingId(giveawayId);
      const res = await fetch(`/api/giveaways/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", giveawayId })
      });

      if (res.ok) {
        fetchGiveaways();
      }
    } catch (e) {
      console.error("Error cancelling giveaway:", e);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-slate-900/50 p-2 rounded-2xl border border-pink-500/20 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="p-3 bg-pink-500/20 rounded-xl border border-pink-500/30 text-pink-400">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-[10px] font-bold text-white tracking-wide">
              {lang === "tr" ? "🎁 Çekiliş Yönetimi" : "🎁 Giveaway Management"}
            </h2>
            <p className="text-slate-400 text-[10px] mt-1">
              {lang === "tr"
                ? "Sunucunuzda şeffaf, adil ve otomatik çekilişler oluşturun."
                : "Create transparent, fair and automated giveaways on your server."}
            </p>
          </div>
        </div>
      </div>

      {/* Form: Create Giveaway */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 shadow-lg backdrop-blur-md">
        <h3 className="text-[10px] font-semibold text-white flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-pink-400" />
          {lang === "tr" ? "Yeni Çekiliş Oluştur" : "Start New Giveaway"}
        </h3>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-2">
                {lang === "tr" ? "Ödül Başlığı *" : "Prize Title *"}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === "tr" ? "Örn: 10M Silver & VIP Rolü" : "e.g. 10M Silver & VIP Role"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Target Channel */}
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-2">
                {lang === "tr" ? "Yayınlanacak Kanal *" : "Target Channel *"}
              </label>
              <select
                required
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-pink-500 transition-colors"
              >
                <option value="">{lang === "tr" ? "-- Kanal Seçin --" : "-- Select Channel --"}</option>
                {textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-2">
              {lang === "tr" ? "Çekiliş Açıklaması / Şartlar" : "Description / Conditions"}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === "tr" ? "Çekiliş detaylarını yazın..." : "Write giveaway details..."}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Duration */}
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-2">
                {lang === "tr" ? "Çekiliş Süresi *" : "Duration *"}
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-pink-500 transition-colors"
              >
                <option value="1">{lang === "tr" ? "1 Saat" : "1 Hour"}</option>
                <option value="6">{lang === "tr" ? "6 Saat" : "6 Hours"}</option>
                <option value="12">{lang === "tr" ? "12 Saat" : "12 Hours"}</option>
                <option value="24">{lang === "tr" ? "24 Saat (1 Gün)" : "24 Hours (1 Day)"}</option>
                <option value="72">{lang === "tr" ? "3 Gün" : "3 Days"}</option>
                <option value="168">{lang === "tr" ? "7 Gün (1 Hafta)" : "7 Days (1 Week)"}</option>
              </select>
            </div>

            {/* Winner Count */}
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-2">
                {lang === "tr" ? "Kazanan Sayısı (Asil)" : "Winner Count"}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={winnerCount}
                onChange={(e) => setWinnerCount(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Backup Count */}
            <div>
              <label className="block text-[10px] font-medium text-slate-300 mb-2">
                {lang === "tr" ? "Yedek Sayısı" : "Backup Count"}
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={backupCount}
                onChange={(e) => setBackupCount(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-white focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          {/* Smart Fairness Switch */}
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-pink-400 shrink-0" />
              <div>
                <h4 className="text-[10px] font-semibold text-white">
                  {lang === "tr" ? "Akıllı Adil Dağıtım Koruması" : "Smart Fairness Protection"}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "tr"
                    ? "Son 14 günde çekiliş kazanmış kişileri kura torbasından gizlice muaf tutar."
                    : "Secretly excludes users who won a giveaway in the last 14 days."}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={secretFairness}
                onChange={(e) => setSecretFairness(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={creating || !title || !channelId}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-pink-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Gift className="w-5 h-5" />
                {lang === "tr" ? "🎉 Çekilişi Başlat ve Gönder" : "🎉 Start & Publish Giveaway"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Active Giveaways List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 shadow-lg backdrop-blur-md">
        <h3 className="text-[10px] font-semibold text-white flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-amber-400" />
          {lang === "tr" ? "Aktif Çekilişler" : "Active Giveaways"} ({activeGiveaways.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            {lang === "tr" ? "Yükleniyor..." : "Loading..."}
          </div>
        ) : activeGiveaways.length === 0 ? (
          <div className="text-center p-3 text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <Gift className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-[10px]">{lang === "tr" ? "Şu an aktif çekiliş yok." : "No active giveaways right now."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeGiveaways.map((g) => (
              <div key={g.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-white text-base">{g.title}</h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-medium">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{g.description || "-"}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-pink-400" /> {g.winner_count} Kazanan
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {new Date(g.ends_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(g.id)}
                  disabled={cancellingId === g.id}
                  className="mt-4 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-medium py-2 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === "tr" ? "İptal Et" : "Cancel"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ended Giveaways List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 shadow-lg backdrop-blur-md">
        <h3 className="text-[10px] font-semibold text-white flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {lang === "tr" ? "Sonuçlanan Çekilişler" : "Ended Giveaways"} ({endedGiveaways.length})
        </h3>

        {endedGiveaways.length === 0 ? (
          <div className="text-center p-2 text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <p className="text-[10px]">{lang === "tr" ? "Henüz bitmiş çekiliş yok." : "No ended giveaways yet."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {endedGiveaways.map((g) => (
              <div key={g.id} className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-[10px]">{g.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    🏆 Kazananlar: {g.winners?.length > 0 ? g.winners.map((w) => `<@${w}>`).join(", ") : "Yok"}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(g.ends_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
