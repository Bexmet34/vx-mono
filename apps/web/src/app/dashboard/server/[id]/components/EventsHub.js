"use client";

import { useState, useEffect, useCallback } from "react";
import { Gift, Zap, RefreshCw, Sparkles, Trophy } from "lucide-react";
import GiveawayTab from "./GiveawayTab";
import DropTab from "./DropTab";
import DropLeaderboard from "./DropLeaderboard";

// ─── Sub-tab definitions ──────────────────────────────────────────────────────
const SUB_TABS = [
  { id: "giveaway",    labelTr: "🎁 Çekiliş",            labelEn: "🎁 Giveaway",            icon: Gift   },
  { id: "random_drop", labelTr: "⚡ Random Drop Ayarları", labelEn: "⚡ Random Drop Settings", icon: Zap    },
  { id: "leaderboard", labelTr: "🏆 Liderlik Sıralaması", labelEn: "🏆 Drop Leaderboard",     icon: Trophy },
];

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
    drop_chance_pct:      2.0,
    drop_points:          10,
    code_expire_seconds:  60,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/drop-settings/${guildId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
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
        // Success
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
    <div className="space-y-4">
      {/* Tüm UI ve Kaydet butonu DropTab bileşeninden geliyor */}
      <DropTab
        lang={lang}
        settings={settings}
        setSettings={setSettings}
        saving={saving}
        saveSettings={handleSave}
        discordChannels={discordChannels}
        guildId={guildId}
      />
    </div>
  );
}

// ─── EventsHub ────────────────────────────────────────────────────────────────
export default function EventsHub({ t, lang, guildId, discordChannels, discordRoles }) {
  const [subTab, setSubTab] = useState("random_drop");

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
              ? "Çekilişler, rastgele ganimetler ve drop liderlik sıralaması tek çatı altında."
              : "Giveaways, random drops, and drop leaderboard — all in one place."}
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/30 pb-4">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          const label = lang === "tr" ? tab.labelTr : tab.labelEn;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-label-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary font-bold shadow-[0_0_15px_rgba(255,215,0,0.25)]"
                  : "bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <Icon size={14} />
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
        />
      )}

      {subTab === "leaderboard" && (
        <div className="space-y-4">
          <DropLeaderboard guildId={guildId} lang={lang} />
        </div>
      )}
    </div>
  );
}
