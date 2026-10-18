"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Loader2, ShieldCheck, ExternalLink } from "lucide-react";

/**
 * PermissionStatusCard
 *
 * Dashboard'daki her özellik sekmesinde kullanılabilen,
 * botun o özelliği çalıştırabilmesi için gerekli Discord izinlerini
 * kontrol eden ve eksikleri GM'e gösteren reusable bileşen.
 *
 * @param {string}   guildId      - Discord sunucu ID'si
 * @param {string}   mode         - Hangi özelliğin izinleri kontrol edilsin:
 *                                  'voiceforge' | 'counters' | 'ticket' | 'rolemenu' |
 *                                  'giveaway' | 'log' | 'application' | 'general'
 * @param {string}   [channelId]  - Kanal bazlı kontrol için (opsiyonel)
 * @param {string}   lang         - 'tr' | 'en'
 * @param {Function} [onResult]   - Sonuç callback: ({ hasAccess, missingPermissions }) => void
 * @param {boolean}  [autoCheck]  - Bileşen mount edildiğinde otomatik kontrol yap (default: true)
 * @param {string}   [className]  - Ek CSS class
 */
export default function PermissionStatusCard({
  guildId,
  mode = "general",
  channelId = null,
  lang = "tr",
  onResult = null,
  autoCheck = true,
  className = "",
}) {
  const [status, setStatus] = useState(null); // null | 'loading' | 'ok' | 'error' | 'unknown'
  const [result, setResult] = useState(null);

  const isTr = lang === "tr";

  // ─── Feature labels (hangi özelliği kontrol ettiğini kullanıcıya söyle) ──
  const FEATURE_LABELS = {
    voiceforge:  { tr: "Geçici Ses Kanalı (VoiceForge)", en: "Temp Voice Channels (VoiceForge)" },
    counters:    { tr: "Sayaç Kanalları",                 en: "Counter Channels"                 },
    ticket:      { tr: "Ticket Sistemi",                  en: "Ticket System"                   },
    rolemenu:    { tr: "Rol Menüsü",                     en: "Role Menu"                        },
    giveaway:    { tr: "Çekiliş Sistemi",                en: "Giveaway System"                  },
    log:         { tr: "Log Sistemi",                     en: "Log System"                      },
    application: { tr: "Başvuru Sistemi",                 en: "Application System"              },
    general:     { tr: "Genel Mesajlaşma",               en: "General Messaging"                },
  };

  const featureLabel = FEATURE_LABELS[mode]
    ? (isTr ? FEATURE_LABELS[mode].tr : FEATURE_LABELS[mode].en)
    : mode;

  const check = useCallback(async () => {
    setStatus("loading");
    setResult(null);
    try {
      const params = new URLSearchParams({ mode });
      if (channelId) params.set("channelId", channelId);
      const url = `/api/check-channel-permissions/${guildId}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setResult(data);
      if (data.hasAccess) {
        setStatus("ok");
        onResult?.({ hasAccess: true, missingPermissions: [] });
      } else {
        setStatus("error");
        onResult?.({ hasAccess: false, missingPermissions: data.missingPermissions || [] });
      }
    } catch {
      setStatus("unknown");
      onResult?.({ hasAccess: false, missingPermissions: [] });
    }
  }, [guildId, mode, channelId, onResult]);

  useEffect(() => {
    if (!autoCheck) return;
    const t = setTimeout(() => { check(); }, 0);
    return () => clearTimeout(t);
  }, [autoCheck, check]);

  // ─── Renk sınıfları ───────────────────────────────────────────────────────
  const borderColor =
    status === "ok"      ? "border-emerald-500/30" :
    status === "error"   ? "border-red-500/30"     :
    status === "unknown" ? "border-yellow-500/30"  :
                           "border-outline-variant";

  const bgColor =
    status === "ok"      ? "bg-emerald-500/8"  :
    status === "error"   ? "bg-red-500/8"       :
    status === "unknown" ? "bg-yellow-500/8"    :
                           "bg-surface-container";

  const textColor =
    status === "ok"      ? "text-emerald-400" :
    status === "error"   ? "text-red-400"     :
    status === "unknown" ? "text-yellow-400"  :
                           "text-on-surface-variant";

  // ─── Durum mesajı ─────────────────────────────────────────────────────────
  const statusText = (() => {
    if (status === "loading") return isTr ? "İzinler kontrol ediliyor..." : "Checking permissions...";
    if (status === "ok")
      return isTr
        ? `✓ Bot'un ${featureLabel} için gerekli tüm izinleri var.`
        : `✓ Bot has all required permissions for ${featureLabel}.`;
    if (status === "error")
      return isTr
        ? `⚠ Bot'un ${featureLabel} için eksik izinleri var!`
        : `⚠ Bot is missing permissions for ${featureLabel}!`;
    if (status === "unknown")
      return isTr ? "İzin durumu kontrol edilemedi." : "Could not check permissions.";
    return isTr ? "İzinler henüz kontrol edilmedi." : "Permissions not checked yet.";
  })();

  return (
    <div className={`space-y-2 animate-fade-in ${className}`}>
      {/* ── Ana durum satırı ── */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-sm transition-all ${bgColor} ${borderColor}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {status === "loading" && (
            <Loader2 size={15} className="animate-spin text-on-surface-variant shrink-0" />
          )}
          {status === "ok" && (
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          )}
          {status === "error" && (
            <AlertTriangle size={15} className="text-red-500 shrink-0" />
          )}
          {status === "unknown" && (
            <AlertTriangle size={15} className="text-yellow-500 shrink-0" />
          )}
          {status === null && (
            <ShieldCheck size={15} className="text-on-surface-variant shrink-0" />
          )}

          <span className={`text-xs font-medium truncate ${textColor}`}>
            {statusText}
          </span>
        </div>

        <button
          onClick={check}
          disabled={status === "loading"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all border bg-surface-container-high border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary-container disabled:opacity-50 ml-2 shrink-0"
        >
          <RefreshCw size={11} className={status === "loading" ? "animate-spin" : ""} />
          {isTr ? "Test Et" : "Test"}
        </button>
      </div>

      {/* ── Eksik izinler listesi ── */}
      {status === "error" && result?.missingPermissions?.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-md px-3 py-2.5">
          <p className="text-red-400 text-[11px] font-semibold mb-2">
            {isTr
              ? `${featureLabel} özelliğinin çalışması için botun rolüne şu izinleri verin:`
              : `Grant these permissions to the bot's role for ${featureLabel} to work:`}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {result.missingPermissions.map((p, i) => (
              <span
                key={i}
                className="bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] px-2 py-0.5 rounded font-medium"
              >
                {isTr ? p.name_tr : p.name_en}
              </span>
            ))}
          </div>
          <a
            href="https://support.discord.com/hc/tr/articles/206029707"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-red-400/70 hover:text-red-300 transition-colors"
          >
            <ExternalLink size={10} />
            {isTr
              ? "Discord'da bot rolü izinleri nasıl düzenlenir?"
              : "How to edit bot role permissions on Discord?"}
          </a>
        </div>
      )}
    </div>
  );
}
