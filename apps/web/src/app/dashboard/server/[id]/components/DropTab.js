"use client";
import { AlertCircle, Clock, CalendarClock, Zap, Dices, MessageSquare, Gift, Hash, Users } from "lucide-react";

/**
 * DropTab v2 — Manuel Drop Oranı Sistemi
 * 
 * Modlar:
 *   exact_minutes  — Her saatin seçili dakikalarında
 *   random_interval — Min~Max dakika arasında rastgele
 *   hourly_chance  — Her saat başı % ihtimalle
 *   percent_based  — Her mesajda % şansla
 */
export default function DropTab({ lang, t, settings, setSettings, saving, saveSettings, discordChannels }) {
  const isEn = lang === "en";
  const textChannels = (discordChannels || []).filter(c => c.type === 0);

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const scheduleType   = settings.schedule_type   || "exact_minutes";
  const channelDropMode = settings.channel_drop_mode || "random_one";

  // ── Kanal seçimi toggle ──────────────────────────────────────────────────────
  const toggleChannel = (channelId) => {
    let current = settings.channel_ids || [];
    if (typeof current === "string") {
      try { current = JSON.parse(current); } catch { current = []; }
    }
    if (current.includes(channelId)) {
      updateSettings("channel_ids", current.filter(id => id !== channelId));
    } else {
      updateSettings("channel_ids", [...current, channelId]);
    }
  };

  const selectedChannels = Array.isArray(settings.channel_ids)
    ? settings.channel_ids
    : (typeof settings.channel_ids === "string"
        ? JSON.parse(settings.channel_ids || "[]")
        : []);

  const exactMinutes = Array.isArray(settings.exact_minutes)
    ? settings.exact_minutes
    : (typeof settings.exact_minutes === "string"
        ? JSON.parse(settings.exact_minutes || "[]")
        : []);

  const handleExactMinuteToggle = (minute) => {
    const current = exactMinutes.includes(minute)
      ? exactMinutes.filter(m => m !== minute)
      : [...exactMinutes, minute].sort((a, b) => a - b);
    updateSettings("exact_minutes", current);
  };

  // ── Mod tanımları ─────────────────────────────────────────────────────────────
  const MODES = [
    {
      id: "exact_minutes",
      icon: CalendarClock,
      labelTr: "Kesin Dakikalar",
      labelEn: "Exact Minutes",
      descTr: "Her saatin seçilen dakikasında kesin olarak düşer. (örn: xx:00, xx:30)",
      descEn: "Drops at exactly the selected minutes of every hour. (e.g. xx:00, xx:30)",
    },
    {
      id: "random_interval",
      icon: Zap,
      labelTr: "Rastgele Aralık",
      labelEn: "Random Interval",
      descTr: "Belirlediğiniz min~maks dakika arasında tamamen rastgele düşer.",
      descEn: "Drops at a completely random time between your min~max range.",
    },
    {
      id: "hourly_chance",
      icon: Dices,
      labelTr: "Saatlik Şans %",
      labelEn: "Hourly Chance %",
      descTr: "Her saat başı (xx:00) zar atılır, belirlediğiniz % ihtimalle düşer.",
      descEn: "Rolls a dice every hour at xx:00. Drops only if the set % is hit.",
    },
    {
      id: "percent_based",
      icon: MessageSquare,
      labelTr: "Mesaj Bazlı %",
      labelEn: "Per-Message Chance %",
      descTr: "Seçili kanallardaki her mesajda belirlediğiniz % ihtimalle drop düşer.",
      descEn: "Every message in selected channels has a % chance to trigger a drop.",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Başlık & Enable Toggle ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gift className="text-primary" />
            {isEn ? "Random Drop System" : "Rastgele Drop Sistemi"}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            {isEn
              ? "Bot posts a random 8-character code in the channel. First person to type it wins points!"
              : "Bot kanala rastgele 8 haneli bir kod atar. Kodu ilk yazan puan kazanır!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {settings.is_enabled
              ? (isEn ? "Active" : "Aktif")
              : (isEn ? "Disabled" : "Kapalı")}
          </span>
          <button
            onClick={() => updateSettings("is_enabled", !settings.is_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.is_enabled ? "bg-primary" : "bg-surface-variant"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.is_enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {settings.is_enabled && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Sol: Mod Seçimi ────────────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} />
                {isEn ? "Trigger Mode" : "Tetiklenme Modu"}
              </h3>
              {MODES.map(({ id, icon: Icon, labelTr, labelEn: labelEnStr, descTr, descEn }) => (
                <label
                  key={id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    scheduleType === id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface border-white/5 hover:bg-surface-variant/50"
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="schedule_type"
                      checked={scheduleType === id}
                      onChange={() => updateSettings("schedule_type", id)}
                      className="accent-primary"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Icon size={13} className="text-primary" />
                      {isEn ? labelEnStr : labelTr}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      {isEn ? descEn : descTr}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* ── Sağ: Dinamik Ayarlar ───────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* exact_minutes */}
              {scheduleType === "exact_minutes" && (
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 animate-fade-in">
                  <h3 className="text-base font-bold mb-1">{isEn ? "Select Drop Minutes" : "Düşme Dakikalarını Seçin"}</h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    {isEn
                      ? "Select which minutes of the hour drops occur. Multiple selections allowed."
                      : "Her saatin hangi dakikalarında drop düşeceğini seçin. Birden fazla seçebilirsiniz."}
                  </p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {[...Array(60)].map((_, i) => {
                      const sel = exactMinutes.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => handleExactMinuteToggle(i)}
                          className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            sel
                              ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)] scale-105"
                              : "bg-surface hover:bg-surface-variant border border-white/5"
                          }`}
                        >
                          {i.toString().padStart(2, "0")}
                        </button>
                      );
                    })}
                  </div>
                  {exactMinutes.length > 0 && (
                    <p className="text-xs text-primary mt-3">
                      ✅ {isEn ? "Selected:" : "Seçili:"} {exactMinutes.map(m => `xx:${m.toString().padStart(2, "0")}`).join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* random_interval */}
              {scheduleType === "random_interval" && (
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 animate-fade-in">
                  <h3 className="text-base font-bold mb-1">{isEn ? "Random Time Interval" : "Rastgele Zaman Aralığı"}</h3>
                  <p className="text-xs text-on-surface-variant mb-5">
                    {isEn
                      ? "Bot picks a random time between min and max wait. The timer resets after each drop."
                      : "Bot, min ve maks arasında rastgele bir süre bekler. Her drop sonrası sayaç sıfırlanır."}
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{isEn ? "Min Wait (minutes)" : "Min Bekleme (dakika)"}</label>
                      <input
                        type="number" min="1"
                        value={settings.random_interval_min || 30}
                        onChange={e => updateSettings("random_interval_min", parseInt(e.target.value))}
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{isEn ? "Max Wait (minutes)" : "Max Bekleme (dakika)"}</label>
                      <input
                        type="number" min={settings.random_interval_min || 30}
                        value={settings.random_interval_max || 120}
                        onChange={e => updateSettings("random_interval_max", parseInt(e.target.value))}
                        className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {isEn
                        ? `A drop will occur ${settings.random_interval_min || 30}–${settings.random_interval_max || 120} minutes after the previous one.`
                        : `Bir drop'tan ${settings.random_interval_min || 30}–${settings.random_interval_max || 120} dakika sonra rastgele bir zamanda düşer.`}
                    </span>
                  </div>
                </div>
              )}

              {/* hourly_chance */}
              {scheduleType === "hourly_chance" && (
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 animate-fade-in">
                  <h3 className="text-base font-bold mb-1">{isEn ? "Hourly Drop Probability" : "Saatlik Düşme İhtimali"}</h3>
                  <p className="text-xs text-on-surface-variant mb-5">
                    {isEn
                      ? "Every hour at xx:00, the bot rolls the dice. Drop occurs only if it hits."
                      : "Her saat başı (xx:00) zar atılır. Sadece ayarladığınız yüzdede düşer."}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <input
                        type="range" min="1" max="100"
                        value={settings.hourly_chance_pct || 25}
                        onChange={e => updateSettings("hourly_chance_pct", parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                        <span>1% ({isEn ? "Rare" : "Nadir"})</span>
                        <span>50%</span>
                        <span>100% ({isEn ? "Every hour" : "Her saat"})</span>
                      </div>
                    </div>
                    <div className="bg-surface px-4 py-3 rounded-xl border border-white/5 font-bold text-2xl text-primary w-24 text-center">
                      %{settings.hourly_chance_pct || 25}
                    </div>
                  </div>
                </div>
              )}

              {/* percent_based */}
              {scheduleType === "percent_based" && (
                <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 animate-fade-in">
                  <h3 className="text-base font-bold mb-1">{isEn ? "Per-Message Drop Chance" : "Mesaj Başına Drop Şansı"}</h3>
                  <p className="text-xs text-on-surface-variant mb-5">
                    {isEn
                      ? "Every message sent in the selected channels has this % chance to trigger a drop."
                      : "Seçili kanallara gönderilen her mesajda bu yüzde ihtimalle drop tetiklenir."}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <input
                        type="range" min="0.1" max="100" step="0.1"
                        value={settings.drop_chance_pct || 5}
                        onChange={e => updateSettings("drop_chance_pct", parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                        <span>0.1% ({isEn ? "Very Rare" : "Çok Nadir"})</span>
                        <span>50%</span>
                        <span>100% ({isEn ? "Every msg" : "Her mesaj"})</span>
                      </div>
                    </div>
                    <div className="bg-surface px-4 py-3 rounded-xl border border-white/5 font-bold text-2xl text-primary w-24 text-center">
                      %{(settings.drop_chance_pct || 5).toFixed(1)}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary flex items-start gap-2">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {isEn
                        ? "Minimum 60s cooldown between drops per channel to prevent spam."
                        : "Spam önlemek için kanal başına droplar arasında minimum 60 saniye bekleme uygulanır."}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Puan & Kod Yapılandırması ──────────────────────────────────────── */}
              <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <h3 className="text-base font-bold mb-4">{isEn ? "Points & Code Settings" : "Puan & Kod Ayarları"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{isEn ? "Drop Points (per win)" : "Drop Puanı (kazanım başı)"}</label>
                    <input
                      type="number" min="1"
                      value={settings.drop_points || 10}
                      onChange={e => updateSettings("drop_points", parseInt(e.target.value))}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                    <p className="text-xs text-on-surface-variant">{isEn ? "Points added to winner via /mypoints" : "/mypoints komutuyla birikir"}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{isEn ? "Code Expires After (seconds)" : "Kod Geçerlilik Süresi (saniye)"}</label>
                    <select
                      value={settings.code_expire_seconds || 60}
                      onChange={e => updateSettings("code_expire_seconds", parseInt(e.target.value))}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    >
                      <option value={30}>30 {isEn ? "seconds" : "saniye"}</option>
                      <option value={60}>60 {isEn ? "seconds" : "saniye"}</option>
                      <option value={120}>120 {isEn ? "seconds" : "saniye"}</option>
                      <option value={300}>300 {isEn ? "seconds" : "saniye"}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Kanal Seçimi ──────────────────────────────────────────────── */}
              <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Hash size={16} className="text-primary" />
                    {isEn ? "Target Channels" : "Hedef Kanallar"}
                  </h3>

                  {/* Channel Drop Mode Toggle */}
                  <div className="flex items-center gap-2 bg-surface rounded-xl p-1 border border-white/5">
                    <button
                      onClick={() => updateSettings("channel_drop_mode", "random_one")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        channelDropMode === "random_one"
                          ? "bg-primary text-on-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <Dices size={12} />
                      {isEn ? "Random One" : "Rastgele Biri"}
                    </button>
                    <button
                      onClick={() => updateSettings("channel_drop_mode", "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        channelDropMode === "all"
                          ? "bg-primary text-on-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <Users size={12} />
                      {isEn ? "All Channels" : "Tüm Kanallar"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant mb-3">
                  {channelDropMode === "random_one"
                    ? (isEn ? "Drop will go to one randomly selected channel." : "Drop, seçili kanallardan rastgele birine gider.")
                    : (isEn ? "Drop will be sent to all selected channels at once." : "Drop, seçili tüm kanallara aynı anda gönderilir.")}
                </p>

                {textChannels.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    {isEn ? "No text channels found." : "Text kanalı bulunamadı."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {textChannels.map(ch => {
                      const selected = selectedChannels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => toggleChannel(ch.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-sm transition-all ${
                            selected
                              ? "bg-primary/15 border-primary/40 text-primary"
                              : "bg-surface border-white/5 hover:bg-surface-variant/50 text-on-surface-variant"
                          }`}
                        >
                          <span className="text-xs opacity-60">#</span>
                          <span className="truncate font-medium">{ch.name}</span>
                          {selected && <span className="ml-auto text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedChannels.length > 0 && (
                  <p className="text-xs text-primary mt-3">
                    ✅ {isEn ? `${selectedChannels.length} channel(s) selected` : `${selectedChannels.length} kanal seçili`}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
