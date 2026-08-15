"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Gift, Zap, RefreshCw, Save, CheckCircle2,
  Clock, AlertTriangle, Sparkles
} from "lucide-react";
import GiveawayTab from "./GiveawayTab";
import DropTab from "./DropTab";

// ─── Sub-tab definitions ──────────────────────────────────────────────────────
const SUB_TABS = [
  { id: "giveaway",    labelTr: "Çekiliş",     labelEn: "Giveaway",    icon: Gift },
  { id: "random_drop", labelTr: "Random Drop", labelEn: "Random Drop", icon: Zap  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DROP_CHANCE_OPTIONS = [
  { value: "low",    labelTr: "Düşük",   labelEn: "Low"    },
  { value: "medium", labelTr: "Orta",    labelEn: "Medium" },
  { value: "high",   labelTr: "Yüksek",  labelEn: "High"   },
  { value: "custom", labelTr: "Özel %",  labelEn: "Custom %" },
];

const REWARD_TYPES = [
  { value: "coin",   labelTr: "Coin",      labelEn: "Coin"   },
  { value: "xp",     labelTr: "XP",        labelEn: "XP"     },
  { value: "role",   labelTr: "Özel Rol",  labelEn: "Custom Role" },
];

// ─── Random Drop Settings Tab ─────────────────────────────────────────────────
// ─── RandomDropTab: DropTab bileşenini saran wrapper ─────────────────────────
function RandomDropTab({ lang, guildId, discordChannels }) {
  const isEn = lang === "en";

  const defaultSettings = {
    is_enabled:           false,
    schedule_type:        "exact_minutes",
    channel_ids:          [],
    channel_drop_mode:    "random_one",
    exact_minutes:        [],
    random_interval_min:  30,
    random_interval_max:  120,
    hourly_chance_pct:    25,
    drop_chance_pct:      5.0,
    reward_type:          "coin",
    reward_amount:        100,
    reward_role_id:       "",
    drop_points:          10,
    code_expire_seconds:  60,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/drop-settings/${guildId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error("Error fetching drop settings:", e);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/drop-settings/${guildId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("Error saving drop settings:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        {isEn ? "Loading..." : "Yükleniyor..."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* DropTab: tüm UI buradan geliyor */}
      <DropTab
        lang={lang}
        settings={settings}
        setSettings={setSettings}
        saving={saving}
        saveSettings={handleSave}
        discordChannels={discordChannels}
      />

      {/* Kaydet Butonu */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-yellow-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {saving ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : saved ? (
          <><CheckCircle2 className="w-5 h-5" /> {isEn ? "Saved!" : "Kaydedildi!"}</>
        ) : (
          <><Save className="w-5 h-5" /> {isEn ? "Save Drop Settings" : "Drop Ayarlarını Kaydet"}</>
        )}
      </button>

      {/* Son Droplar (Geçmiş) */}
      {history.length > 0 && (
        <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            {isEn ? "Recent Drops" : "Son Droplar"}
          </h4>
          <div className="space-y-2">
            {history.map(d => (
              <div key={d.id} className="flex items-center justify-between bg-[#171926] px-3 py-2 rounded-lg border border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                    d.trigger_type === "percent_roll"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                  }`}>
                    {d.trigger_type === "percent_roll" ? "% Roll" : "Scheduled"}
                  </span>
                  {d.drop_code && (
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                      {d.drop_code}
                    </span>
                  )}
                  <span className="text-slate-400">
                    {d.claimed_by ? `✅ <@${d.claimed_by}>` : (isEn ? "⏳ Unclaimed" : "⏳ Kapılmadı")}
                  </span>
                </div>
                <span className="text-slate-600 font-mono text-[10px]">
                  {new Date(d.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

            checked={settings.is_enabled}
            onChange={e => setSettings(p => ({ ...p, is_enabled: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#1A1C29] border border-slate-700/80 rounded-full peer peer-checked:bg-yellow-500 peer-checked:border-yellow-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white peer-checked:after:translate-x-[20px] after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>

      <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5 space-y-5">

        {/* İzlenecek Kanallar */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <Hash className="w-4 h-4 text-yellow-400" />
            {isEn ? "Monitored Channels" : "İzlenecek Kanallar"}
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            {isEn ? "Drop will only appear in selected channels." : "Drop sadece seçilen kanallarda düşebilir."}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {textChannels.map(c => {
              const selected = settings.channel_ids.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChannel(c.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left ${
                    selected
                      ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-300"
                      : "bg-[#1A1C29] border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                  }`}
                >
                  <span className="text-slate-500">#</span>
                  <span className="truncate">{c.name}</span>
                  {selected && <CheckCircle2 className="w-3 h-3 ml-auto shrink-0 text-yellow-400" />}
                </button>
              );
            })}
            {textChannels.length === 0 && (
              <p className="col-span-3 text-[11px] text-slate-500 italic">
                {isEn ? "No text channels found." : "Metin kanalı bulunamadı."}
              </p>
            )}
          </div>
        </div>

        {/* Drop Şansı & Cooldown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {isEn ? "Drop Chance" : "Drop Şansı"}
            </label>
            <select
              value={settings.drop_chance}
              onChange={e => setSettings(p => ({ ...p, drop_chance: e.target.value }))}
              className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
            >
              {DROP_CHANCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {isEn ? o.labelEn : o.labelTr}
                </option>
              ))}
            </select>
          </div>

          {settings.drop_chance === "custom" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {isEn ? "Custom Chance (%)" : "Özel Oran (%)"}
              </label>
              <input
                type="number"
                min={1} max={100}
                value={settings.custom_chance_pct}
                onChange={e => setSettings(p => ({ ...p, custom_chance_pct: parseInt(e.target.value, 10) || 15 }))}
                className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              <Clock className="inline w-3.5 h-3.5 mr-1 text-yellow-400" />
              {isEn ? "Cooldown (minutes)" : "Bekleme Süresi (dakika)"}
            </label>
            <input
              type="number"
              min={1} max={1440}
              value={settings.cooldown_minutes}
              onChange={e => setSettings(p => ({ ...p, cooldown_minutes: parseInt(e.target.value, 10) || 15 }))}
              className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {isEn ? "Minimum time between two drops." : "İki drop arasındaki minimum süre."}
            </p>
          </div>
        </div>

        {/* Ödül Tipi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              <Coins className="inline w-3.5 h-3.5 mr-1 text-yellow-400" />
              {isEn ? "Reward Type" : "Ödül Tipi"}
            </label>
            <select
              value={settings.reward_type}
              onChange={e => setSettings(p => ({ ...p, reward_type: e.target.value }))}
              className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
            >
              {REWARD_TYPES.map(r => (
                <option key={r.value} value={r.value}>
                  {isEn ? r.labelEn : r.labelTr}
                </option>
              ))}
            </select>
          </div>

          {settings.reward_type !== "role" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {isEn ? "Reward Amount" : "Ödül Miktarı"}
              </label>
              <input
                type="number"
                min={1}
                value={settings.reward_amount}
                onChange={e => setSettings(p => ({ ...p, reward_amount: parseInt(e.target.value, 10) || 100 }))}
                className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
              />
            </div>
          )}

          {settings.reward_type === "role" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                <Tag className="inline w-3.5 h-3.5 mr-1 text-yellow-400" />
                {isEn ? "Reward Role" : "Ödül Rolü"}
              </label>
              <select
                value={settings.reward_role_id}
                onChange={e => setSettings(p => ({ ...p, reward_role_id: e.target.value }))}
                className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500"
              >
                <option value="">{isEn ? "@ Select a role" : "@ Bir rol seçin"}</option>
                {(discordRoles || []).map(r => (
                  <option key={r.id} value={r.id}>@ {r.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* İleri Seviye Ayarlar (Accordion) */}
        <div className="pt-2 border-t border-slate-800/60">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            {isEn ? "Advanced Detection Settings" : "Gelişmiş Algılama Ayarları"}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0E0F1A]/60 p-4 rounded-xl border border-slate-800/50">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-widest">
                  {isEn ? "Silence Threshold (min)" : "Sessizlik Eşiği (dk)"}
                </label>
                <input
                  type="number" min={1} max={120}
                  value={settings.silence_threshold_min}
                  onChange={e => setSettings(p => ({ ...p, silence_threshold_min: parseInt(e.target.value, 10) || 15 }))}
                  className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">
                  {isEn ? "How long the channel must be silent before triggering." : "Kanalın ne kadar sessiz kalması gerektiği."}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-widest">
                  {isEn ? "Burst Threshold (msg)" : "Burst Eşiği (mesaj)"}
                </label>
                <input
                  type="number" min={5} max={200}
                  value={settings.burst_threshold_msg}
                  onChange={e => setSettings(p => ({ ...p, burst_threshold_msg: parseInt(e.target.value, 10) || 30 }))}
                  className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">
                  {isEn ? "Messages in burst window to trigger a drop." : "Drop tetiklemek için penceredeki mesaj sayısı."}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-widest">
                  {isEn ? "Burst Window (sec)" : "Burst Penceresi (sn)"}
                </label>
                <input
                  type="number" min={30} max={600}
                  value={settings.burst_window_sec}
                  onChange={e => setSettings(p => ({ ...p, burst_window_sec: parseInt(e.target.value, 10) || 180 }))}
                  className="w-full bg-[#1A1C29] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-500"
                />
                <p className="text-[9px] text-slate-500 mt-1">
                  {isEn ? "Time window to count burst messages." : "Burst mesajlarının sayıldığı süre."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3.5 px-6 rounded-2xl transition-all shadow-xl hover:shadow-yellow-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {saving ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : saved ? (
          <><CheckCircle2 className="w-5 h-5" /> {isEn ? "Saved!" : "Kaydedildi!"}</>
        ) : (
          <><Save className="w-5 h-5" /> {isEn ? "Save Drop Settings" : "Drop Ayarlarını Kaydet"}</>
        )}
      </button>

      {/* Drop History */}
      {history.length > 0 && (
        <div className="bg-[#12131C]/90 border border-slate-800/80 rounded-2xl p-5">
          <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            {isEn ? "Recent Drops" : "Son Droplar"}
          </h4>
          <div className="space-y-2">
            {history.map(d => (
              <div key={d.id} className="flex items-center justify-between bg-[#171926] px-3 py-2 rounded-lg border border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                    d.trigger_type === "silence_break"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                  }`}>
                    {d.trigger_type === "silence_break" ? (isEn ? "Silence" : "Sessizlik") : "Burst"}
                  </span>
                  <span className="text-slate-400">
                    {d.claimed_by ? `✅ <@${d.claimed_by}>` : (isEn ? "⏳ Unclaimed" : "⏳ Kapılmadı")}
                  </span>
                </div>
                <span className="text-slate-600 font-mono text-[10px]">
                  {new Date(d.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EventsHub ────────────────────────────────────────────────────────────────
export default function EventsHub({ t, lang, guildId, discordChannels, discordRoles }) {
  const [subTab, setSubTab] = useState("giveaway");

  return (
    <div className="flex flex-col gap-4 animate-slide-up">

      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
        <div className="p-2.5 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-xl border border-pink-500/20">
          <Sparkles className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">
            {lang === "tr" ? "🎪 Etkinlik Merkezi" : "🎪 Events Hub"}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {lang === "tr"
              ? "Çekilişler, rastgele ganimetler ve daha fazlası tek çatı altında."
              : "Giveaways, random drops, and more — all in one place."}
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation — same design pill as RegistrationTab */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-4">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          const label = lang === "tr" ? tab.labelTr : tab.labelEn;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-label-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary border border-primary-container tactical-glow"
                  : "bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab Content */}
      {subTab === "giveaway" && (
        <GiveawayTab
          t={t}
          lang={lang}
          guildId={guildId}
          discordChannels={discordChannels}
          discordRoles={discordRoles}
        />
      )}

      {subTab === "random_drop" && (
        <RandomDropTab
          lang={lang}
          guildId={guildId}
          discordChannels={discordChannels}
          discordRoles={discordRoles}
        />
      )}
    </div>
  );
}
