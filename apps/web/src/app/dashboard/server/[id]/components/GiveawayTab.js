"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Trash2, CheckCircle2, Clock, Users, ShieldAlert, Image, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";

export default function GiveawayTab({ t, lang, guildId, discordChannels, discordRoles }) {
  const [activeGiveaways, setActiveGiveaways] = useState([]);
  const [endedGiveaways, setEndedGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Default dates: Today and 7 days later
  const now = new Date();
  const defaultStartDate = now.toISOString().split('T')[0];
  const defaultStartTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const defaultEndDate = future.toISOString().split('T')[0];
  const defaultEndTime = `${String(future.getHours()).padStart(2, '0')}:${String(future.getMinutes()).padStart(2, '0')}`;

  // Form State
  const [channelId, setChannelId] = useState("");
  const [title, setTitle] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [backupCount, setBackupCount] = useState(1);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [endTime, setEndTime] = useState(defaultEndTime);
  
  // Auto Rewards & Image
  const [rewardRoleId, setRewardRoleId] = useState("");
  const [rewardRoleDuration, setRewardRoleDuration] = useState("permanent");
  const [imageUrl, setImageUrl] = useState("");
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [secretFairness, setSecretFairness] = useState(true);

  // Role Settings (Screenshot 2)
  const [showRoleSettings, setShowRoleSettings] = useState(true);
  const [requiredRoles, setRequiredRoles] = useState([]);
  const [excludedRoles, setExcludedRoles] = useState([]);
  const [roleMatchMode, setRoleMatchMode] = useState("any"); // 'any' or 'all'
  const [roleMultipliers, setRoleMultipliers] = useState([]); // [{ role_id: '', multiplier: 1.0 }]

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

  const handleAddMultiplierRow = () => {
    setRoleMultipliers([...roleMultipliers, { role_id: "", multiplier: 1.0 }]);
  };

  const handleUpdateMultiplier = (index, field, value) => {
    const updated = [...roleMultipliers];
    updated[index][field] = value;
    setRoleMultipliers(updated);
  };

  const handleRemoveMultiplier = (index) => {
    setRoleMultipliers(roleMultipliers.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !channelId) return;

    try {
      setCreating(true);

      const startsAt = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endsAt = new Date(`${endDate}T${endTime}:00`).toISOString();

      const validMultipliers = roleMultipliers.filter(m => m.role_id);

      const res = await fetch(`/api/giveaways/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: channelId,
          title,
          winner_count: winnerCount,
          backup_count: backupCount,
          starts_at: startsAt,
          ends_at: endsAt,
          reward_role_id: rewardRoleId || null,
          reward_role_duration: rewardRoleDuration,
          image_url: imageUrl || null,
          auto_repeat: autoRepeat,
          secret_fairness: secretFairness,
          required_role_ids: requiredRoles,
          excluded_role_ids: excludedRoles,
          role_match_mode: roleMatchMode,
          role_multipliers: validMultipliers
        })
      });

      if (res.ok) {
        // Reset Form
        setTitle("");
        setWinnerCount(1);
        setBackupCount(1);
        setRewardRoleId("");
        setImageUrl("");
        setAutoRepeat(false);
        setRequiredRoles([]);
        setExcludedRoles([]);
        setRoleMultipliers([]);
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900/50 p-4 rounded-2xl border border-pink-500/20 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/20 rounded-xl border border-pink-500/30 text-pink-400">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              {lang === "tr" ? "🎁 Çekiliş Yönetimi" : "🎁 Giveaway Management"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {lang === "tr"
                ? "Sunucunuzda özelleştirilebilir, adil ve otomatik çekilişler oluşturun."
                : "Create custom, fair, and automated giveaways on your server."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form (Screenshot 1 Layout) */}
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-5">
          
          {/* Duyuru Kanalı */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {lang === "tr" ? "Duyuru kanalı" : "Announcement Channel"}
            </label>
            <select
              required
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
            >
              <option value="">{lang === "tr" ? "# Bir kanal seçin" : "# Select a channel"}</option>
              {textChannels.map((c) => (
                <option key={c.id} value={c.id}>
                  # {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === "tr" ? "Sadece metin kanalları." : "Text channels only."}
            </p>
          </div>

          {/* Ödül Metni & Kazanan / Yedek Sayısı */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-6">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === "tr" ? "Ödül metni *" : "Prize text *"}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === "tr" ? "Nitro, hediye kartı, premium rol..." : "Nitro, gift card, premium role..."}
                className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Kazanan Sayısı */}
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === "tr" ? "Kazanan sayısı" : "Winner count"}
              </label>
              <div className="flex items-center bg-[#1A1C29] border border-slate-700/60 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))}
                  className="px-3 py-2.5 text-pink-400 hover:bg-slate-800/50 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-transparent text-center text-white text-sm focus:outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setWinnerCount(winnerCount + 1)}
                  className="px-3 py-2.5 text-pink-400 hover:bg-slate-800/50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Yedek Sayısı */}
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === "tr" ? "Yedek sayısı" : "Backup count"}
              </label>
              <div className="flex items-center bg-[#1A1C29] border border-slate-700/60 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBackupCount(Math.max(0, backupCount - 1))}
                  className="px-3 py-2.5 text-slate-400 hover:bg-slate-800/50 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={backupCount}
                  onChange={(e) => setBackupCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-transparent text-center text-white text-sm focus:outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setBackupCount(backupCount + 1)}
                  className="px-3 py-2.5 text-slate-400 hover:bg-slate-800/50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Başlangıç Noktası & Bittiği Yer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Başlangıç noktası */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === "tr" ? "Başlangıç noktası" : "Start point"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="col-span-2 bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="col-span-1 bg-[#1A1C29] border border-slate-700/60 rounded-xl px-2 py-2 text-white text-xs text-center focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Bittiği yer */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {lang === "tr" ? "Bittiği yer" : "End point"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="col-span-2 bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="col-span-1 bg-[#1A1C29] border border-slate-700/60 rounded-xl px-2 py-2 text-white text-xs text-center focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Otomatik Ödüller */}
          <div className="bg-[#171926]/90 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-white">
                {lang === "tr" ? "Otomatik ödüller" : "Automatic rewards"}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === "tr"
                  ? "Kazananlar belirlendiği anda bot tarafından dağıtılır, kod gerekmez."
                  : "Distributed by bot automatically as soon as winners are drawn."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kazanan rolü */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {lang === "tr" ? "Kazanan rolü" : "Winner role"}
                </label>
                <select
                  value={rewardRoleId}
                  onChange={(e) => setRewardRoleId(e.target.value)}
                  className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="">{lang === "tr" ? "@ Select a role" : "@ Select a role"}</option>
                  {(discordRoles || []).map((r) => (
                    <option key={r.id} value={r.id}>
                      @ {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  {lang === "tr"
                    ? "Tüm kazananlara verilir. Moderasyon yetkisine sahip roller kullanılamaz."
                    : "Given to all winners. Moderation roles cannot be used."}
                </p>
              </div>

              {/* Görev süresi */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {lang === "tr" ? "Görev süresi" : "Duration"}
                </label>
                <select
                  value={rewardRoleDuration}
                  onChange={(e) => setRewardRoleDuration(e.target.value)}
                  className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="permanent">{lang === "tr" ? "Kalıcı" : "Permanent"}</option>
                  <option value="1_day">{lang === "tr" ? "1 Gün" : "1 Day"}</option>
                  <option value="7_days">{lang === "tr" ? "7 Gün" : "7 Days"}</option>
                  <option value="30_days">{lang === "tr" ? "30 Gün" : "30 Days"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ödüllü Fotoğraf */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {lang === "tr" ? "Ödüllü fotoğraf" : "Prize photo"}
            </label>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#1A1C29] border border-slate-700/60 rounded-xl text-slate-400">
                <Image className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {lang === "tr"
                ? "İsteğe bağlı. Seçmenlerin neler kazanabileceklerini görmeleri için çekiliş duyurularının içinde gösterilir."
                : "Optional. Displayed inside giveaway announcement embeds."}
            </p>
          </div>

          {/* Tamamlandıktan sonra tekrarlayın Switch */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs font-semibold text-white">
                {lang === "tr" ? "Tamamlandıktan sonra tekrarlayın." : "Repeat after completion."}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === "tr"
                  ? "Bu çekiliş sona erdiğinde, aynı ayarlarla otomatik olarak yeni bir çekiliş başlatır."
                  : "When this giveaway ends, automatically starts a new one with identical settings."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoRepeat}
                onChange={(e) => setAutoRepeat(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1A1C29] border border-slate-700/80 rounded-full peer peer-checked:bg-pink-600 peer-checked:border-pink-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-[20px] after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>

        </div>

        {/* Rol Ayarları Card (Screenshot 2) */}
        <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowRoleSettings(!showRoleSettings)}>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              {lang === "tr" ? "Rol ayarları" : "Role settings"}
            </h3>
            {showRoleSettings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {showRoleSettings && (
            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              {/* Gerekli roller & Hariç tutulan roller */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gerekli roller */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {lang === "tr" ? "Gerekli roller" : "Required roles"}
                  </label>
                  <select
                    value={requiredRoles[0] || ""}
                    onChange={(e) => setRequiredRoles(e.target.value ? [e.target.value] : [])}
                    className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="">{lang === "tr" ? "@ Bir rol seçin" : "@ Select a role"}</option>
                    {(discordRoles || []).map((r) => (
                      <option key={r.id} value={r.id}>
                        @ {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hariç tutulan roller */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {lang === "tr" ? "Hariç tutulan roller" : "Excluded roles"}
                  </label>
                  <select
                    value={excludedRoles[0] || ""}
                    onChange={(e) => setExcludedRoles(e.target.value ? [e.target.value] : [])}
                    className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="">{lang === "tr" ? "@ Bir rol seçin" : "@ Select a role"}</option>
                    {(discordRoles || []).map((r) => (
                      <option key={r.id} value={r.id}>
                        @ {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gerekli rol eşleştirme modu */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {lang === "tr" ? "Gerekli rol eşleştirme modu" : "Required role matching mode"}
                </label>
                <select
                  value={roleMatchMode}
                  onChange={(e) => setRoleMatchMode(e.target.value)}
                  className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="any">{lang === "tr" ? "Herhangi bir rol" : "Any role"}</option>
                  <option value="all">{lang === "tr" ? "Tüm roller" : "All roles"}</option>
                </select>
              </div>

              {/* Rol giriş çarpanları */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-300">
                    {lang === "tr" ? "Rol giriş çarpanları" : "Role entry multipliers"}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMultiplierRow}
                    className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                  >
                    {lang === "tr" ? "Çarpanı ekle" : "Add multiplier"}
                  </button>
                </div>

                {roleMultipliers.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    {lang === "tr" ? "Henüz rol çarpanı eklenmedi." : "No role multipliers added yet."}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {roleMultipliers.map((m, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row items-center gap-3 bg-[#171926] p-2.5 rounded-xl border border-slate-800">
                        {/* Rol Seçici */}
                        <div className="w-full md:w-5/12">
                          <select
                            value={m.role_id}
                            onChange={(e) => handleUpdateMultiplier(idx, "role_id", e.target.value)}
                            className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
                          >
                            <option value="">{lang === "tr" ? "@ Bir rol seçin" : "@ Select a role"}</option>
                            {(discordRoles || []).map((r) => (
                              <option key={r.id} value={r.id}>
                                @ {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Preset Butonları + Counter */}
                        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-6/12 justify-center">
                          {[0.25, 0.5, 1, 2, 3, 5, 10].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateMultiplier(idx, "multiplier", preset)}
                              className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-all ${
                                m.multiplier === preset
                                  ? "bg-pink-600/90 text-white border-pink-500 shadow-md shadow-pink-600/20"
                                  : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-700/80"
                              }`}
                            >
                              {preset}x
                            </button>
                          ))}
                          
                          <div className="flex items-center bg-[#1A1C29] border border-slate-700/60 rounded-lg overflow-hidden ml-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateMultiplier(idx, "multiplier", Math.max(0.1, +(m.multiplier - 0.5).toFixed(2)))}
                              className="px-1.5 py-0.5 text-pink-400 hover:bg-slate-800 text-xs font-bold"
                            >
                              −
                            </button>
                            <span className="px-1.5 text-[10px] text-white font-semibold min-w-[20px] text-center">
                              {m.multiplier}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateMultiplier(idx, "multiplier", +(m.multiplier + 0.5).toFixed(2))}
                              className="px-1.5 py-0.5 text-pink-400 hover:bg-slate-800 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Sil Butonu */}
                        <div className="w-full md:w-1/12 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveMultiplier(idx)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Submit Button */}
        <button
          type="submit"
          disabled={creating || !title || !channelId}
          className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-pink-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {creating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Gift className="w-5 h-5" />
              {lang === "tr" ? "🎉 Çekilişi Başlat ve Gönder" : "🎉 Start & Publish Giveaway"}
            </>
          )}
        </button>
      </form>

      {/* Active Giveaways List */}
      <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-400" />
          {lang === "tr" ? "Aktif Çekilişler" : "Active Giveaways"} ({activeGiveaways.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-6 text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            {lang === "tr" ? "Yükleniyor..." : "Loading..."}
          </div>
        ) : activeGiveaways.length === 0 ? (
          <div className="text-center p-6 text-slate-500 bg-[#171926]/50 rounded-xl border border-slate-800/50">
            <Gift className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">{lang === "tr" ? "Şu an aktif çekiliş yok." : "No active giveaways right now."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGiveaways.map((g) => (
              <div key={g.id} className="bg-[#171926] p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-white text-sm">{g.title}</h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      Aktif
                    </span>
                  </div>

                  {g.image_url && (
                    <img src={g.image_url} alt="Giveaway Prize" className="w-full h-28 object-cover rounded-lg mt-2 border border-slate-800" />
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-3 bg-[#1A1C29] p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Kazanan / Yedek</span>
                      <span className="font-semibold text-white">{g.winner_count} / {g.backup_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Bitiş Tarihi</span>
                      <span className="font-semibold text-amber-400">{new Date(g.ends_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCancel(g.id)}
                  disabled={cancellingId === g.id}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-2 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {lang === "tr" ? "Çekilişi İptal Et" : "Cancel Giveaway"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ended Giveaways List */}
      <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {lang === "tr" ? "Sonuçlanan Çekilişler" : "Ended Giveaways"} ({endedGiveaways.length})
        </h3>

        {endedGiveaways.length === 0 ? (
          <div className="text-center p-4 text-slate-500 bg-[#171926]/50 rounded-xl border border-slate-800/50">
            <p className="text-xs">{lang === "tr" ? "Henüz bitmiş çekiliş yok." : "No ended giveaways yet."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {endedGiveaways.map((g) => (
              <div key={g.id} className="bg-[#171926] p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">{g.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    🏆 Kazananlar: {g.winners?.length > 0 ? g.winners.map((w) => `<@${w}>`).join(", ") : "Yok"}
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{new Date(g.ends_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
