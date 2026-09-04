"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Skull, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Hash, Lock, ChevronRight, XCircle, Loader2, Info } from 'lucide-react';
import InfoTooltip from "@/components/InfoTooltip";
import { useLanguage } from "@/context/LanguageContext";

// ─── Discord-like channel permission row ──────────────────────────────────────
function DiscordPermRow({ label, state }) {
  // state: 'allow' | 'deny' | 'neutral'
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[13px] text-[#dcddde]">{label}</span>
      <div className="flex items-center gap-1.5">
        {state === 'allow' && (
          <span className="text-[#3ba55c] flex items-center gap-1 text-[12px] font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            {state === 'allow' ? '✓' : ''}
          </span>
        )}
        {state === 'deny' && (
          <span className="text-[#ed4245] flex items-center text-[12px] font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
          </span>
        )}
        {state === 'neutral' && (
          <span className="text-[#72767d] text-[12px]">—</span>
        )}
      </div>
    </div>
  );
}

// ─── Discord-style channel permission panel ────────────────────────────────────
function DiscordPermissionPanel({ channelName, missingPermissions, lang }) {
  const allPerms = [
    { key: 'view', name_tr: 'Kanalı Görüntüle', name_en: 'View Channel' },
    { key: 'send', name_tr: 'Mesaj Gönder', name_en: 'Send Messages' },
    { key: 'embed', name_tr: 'Bağlantı Yerleştir', name_en: 'Embed Links' },
    { key: 'attach', name_tr: 'Dosya Ekle', name_en: 'Attach Files' },
  ];

  const missingKeys = new Set(
    missingPermissions.map(p => {
      if (p.name_en.includes('View')) return 'view';
      if (p.name_en.includes('Send')) return 'send';
      if (p.name_en.includes('Embed')) return 'embed';
      if (p.name_en.includes('Attach')) return 'attach';
      return '';
    })
  );

  return (
    <div className="rounded-lg overflow-hidden border border-[#202225] shadow-2xl" style={{ fontFamily: "'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Discord sidebar simulation */}
      <div className="flex" style={{ background: '#2f3136' }}>
        {/* Left: channels list */}
        <div className="w-52 shrink-0 py-3 px-2" style={{ background: '#2f3136' }}>
          <div className="text-[11px] font-bold text-[#8e9297] uppercase tracking-wider px-2 mb-1">
            {lang === 'tr' ? 'Metin Kanalları' : 'Text Channels'}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#42464d] cursor-default">
            <Hash size={14} className="text-[#8e9297] shrink-0" />
            <span className="text-[13px] text-white truncate font-medium">{channelName || 'killboard'}</span>
          </div>
          {['genel', 'duyurular', 'öldürmeler'].filter(n => n !== channelName).slice(0, 2).map(name => (
            <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded cursor-default mt-0.5 opacity-50">
              <Hash size={14} className="text-[#8e9297] shrink-0" />
              <span className="text-[13px] text-[#8e9297] truncate">{name}</span>
            </div>
          ))}
        </div>

        {/* Right: permissions panel */}
        <div className="flex-1 py-4 px-5" style={{ background: '#36393f' }}>
          {/* Modal header */}
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-[#8e9297]" />
            <span className="text-white font-semibold text-[15px]">
              #{channelName || 'killboard'} {lang === 'tr' ? '— İzin Ayarları' : '— Permissions'}
            </span>
          </div>

          {/* Bot role row */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
            <div className="w-7 h-7 rounded-full bg-[#5865f2] flex items-center justify-center shrink-0">
              <Skull size={14} className="text-white" />
            </div>
            <div>
              <div className="text-white text-[13px] font-semibold">Veyronix Bot</div>
              <div className="text-[#8e9297] text-[11px]">{lang === 'tr' ? 'Bot Rolü' : 'Bot Role'}</div>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-[#ed4245]/15 border border-[#ed4245]/40 text-[#ed4245] text-[11px] font-semibold px-2 py-0.5 rounded">
              <XCircle size={11} />
              {lang === 'tr' ? 'İzin Eksik' : 'Missing Perms'}
            </div>
          </div>

          {/* Permission rows */}
          <div className="space-y-0.5">
            {allPerms.map(perm => {
              const isMissing = missingKeys.has(perm.key);
              const label = lang === 'tr' ? perm.name_tr : perm.name_en;
              return (
                <DiscordPermRow
                  key={perm.key}
                  label={label}
                  state={isMissing ? 'deny' : 'allow'}
                />
              );
            })}
          </div>

          {/* Help text */}
          <p className="text-[#8e9297] text-[11px] mt-3 leading-relaxed">
            {lang === 'tr'
              ? '⚙️ Discord\'da bu kanalı sağ tıklayın → Kanalı Düzenle → İzinler → Botun rolünü bulup eksik izinleri ✓ işaretleyin.'
              : '⚙️ In Discord, right-click the channel → Edit Channel → Permissions → Find the bot\'s role and enable the missing permissions.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Channel Permission Status Card ────────────────────────────────────────────
function ChannelPermCard({ guildId, channelId, channelName, label, lang }) {
  const [status, setStatus] = useState(null); // null | 'loading' | 'ok' | 'error' | 'unknown'
  const [result, setResult] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const check = useCallback(async () => {
    if (!channelId) return;
    setStatus('loading');
    setResult(null);
    try {
      const res = await fetch(`/api/check-channel-permissions/${guildId}?channelId=${channelId}`);
      const data = await res.json();
      setResult(data);
      if (data.hasAccess) {
        setStatus('ok');
        setShowPanel(false);
      } else {
        setStatus('error');
        setShowPanel(true);
      }
    } catch {
      setStatus('unknown');
    }
  }, [guildId, channelId]);

  // Auto check when channelId changes
  useEffect(() => {
    if (channelId) {
      check();
    } else {
      setStatus(null);
      setResult(null);
      setShowPanel(false);
    }
  }, [channelId, check]);

  if (!channelId) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Status row */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-sm transition-all ${
        status === 'ok'
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : status === 'error'
          ? 'bg-red-500/10 border-red-500/30'
          : status === 'loading'
          ? 'bg-surface-container border-outline-variant'
          : 'bg-surface-container border-outline-variant'
      }`}>
        <div className="flex items-center gap-2">
          {status === 'loading' && <Loader2 size={15} className="animate-spin text-on-surface-variant" />}
          {status === 'ok' && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
          {status === 'error' && <AlertTriangle size={15} className="text-red-500 shrink-0" />}
          {status === 'unknown' && <AlertTriangle size={15} className="text-yellow-500 shrink-0" />}

          <span className={`text-xs font-medium ${
            status === 'ok' ? 'text-emerald-400' :
            status === 'error' ? 'text-red-400' :
            status === 'loading' ? 'text-on-surface-variant' :
            'text-yellow-400'
          }`}>
            {status === 'loading' && (lang === 'tr' ? 'İzinler kontrol ediliyor...' : 'Checking permissions...')}
            {status === 'ok' && (lang === 'tr' ? `✓ Bot #${result?.channelName || channelName} kanalında tüm izinlere sahip` : `✓ Bot has all required permissions in #${result?.channelName || channelName}`)}
            {status === 'error' && (lang === 'tr' ? `⚠ Bot #${result?.channelName || channelName} kanalında mesaj gönderme yetkisine sahip değil` : `⚠ Bot cannot send messages in #${result?.channelName || channelName}`)}
            {status === 'unknown' && (lang === 'tr' ? 'İzin durumu kontrol edilemedi' : 'Could not check permissions')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === 'error' && (
            <button
              onClick={() => setShowPanel(v => !v)}
              className="text-[11px] text-red-400 hover:text-red-300 underline transition-colors"
            >
              {showPanel
                ? (lang === 'tr' ? 'Gizle' : 'Hide')
                : (lang === 'tr' ? 'Nasıl Düzeltilir?' : 'How to fix?')}
            </button>
          )}
          <button
            onClick={check}
            disabled={status === 'loading'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
              status === 'error'
                ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-surface-container-high border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary-container'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw size={11} className={status === 'loading' ? 'animate-spin' : ''} />
            {lang === 'tr' ? 'Test Et' : 'Test'}
          </button>
        </div>
      </div>

      {/* Missing permissions detail */}
      {status === 'error' && result?.missingPermissions?.length > 0 && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-md px-3 py-2">
          <p className="text-red-400 text-[11px] font-semibold mb-1.5">
            {lang === 'tr' ? 'Eksik İzinler:' : 'Missing Permissions:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.missingPermissions.map((p, i) => (
              <span key={i} className="bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] px-2 py-0.5 rounded">
                {lang === 'tr' ? p.name_tr : p.name_en}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discord-style permission panel */}
      {status === 'error' && showPanel && result && (
        <div className="mt-2 animate-fade-in">
          <p className="text-[11px] text-on-surface-variant mb-2 flex items-center gap-1">
            <Info size={11} />
            {lang === 'tr'
              ? 'Aşağıda Discord kanal izin panelini görüyorsunuz. Kırmızı işaretli izinleri botun rolüne verin:'
              : 'Below you can see the Discord channel permission panel. Grant the red permissions to the bot\'s role:'}
          </p>
          <DiscordPermissionPanel
            channelName={result.channelName}
            missingPermissions={result.missingPermissions || []}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ──────────────────────────────────────────────────────────────────
export default function KillboardTab({ t, settings, setSettings, discordChannels, handleSave, saving, guildId }) {
  const { lang } = useLanguage();

  const textChannels = (discordChannels || []).filter(c => {
    if (c.type === undefined || c.type === null) return true;
    const numType = Number(c.type);
    if (!isNaN(numType)) {
      return numType === 0 || numType === 5;
    }
    return c.type !== 'GUILD_CATEGORY' && c.type !== 'GUILD_VOICE' && c.type !== 4 && c.type !== 2;
  });

  const killChannelName = textChannels.find(c => c.id === settings.killboard_kill_channel_id)?.name;
  const deathChannelName = textChannels.find(c => c.id === settings.killboard_death_channel_id)?.name;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-headline-md text-on-surface flex items-center gap-2 mb-2">
          <Skull className="text-primary-container" size={24} />
          {lang === 'tr' ? 'Albion Killboard (Ölüm & Öldürme)' : 'Albion Killboard'}
        </h2>
        <p className="font-body-md text-on-surface-variant">
          {lang === 'tr'
            ? 'Albion Online kill/death etkinliklerini, üyeleriniz oyunda öldüğünde veya öldürdüğünde Discord sunucunuzdaki özel kanallara otomatik olarak gönderin.'
            : 'Automatically send Albion Online kill/death events to your Discord channels when your members die or get a kill.'}
        </p>
      </div>

      {/* Main Settings */}
      <div className="bg-surface-container border border-outline-variant rounded-md p-4 space-y-5">
        <h3 className="text-lg font-headline-sm text-on-surface border-b border-outline-variant pb-2">
          {lang === 'tr' ? 'Kanal Ayarları' : 'Channel Settings'}
        </h3>

        {/* Albion guild not selected warning */}
        {!settings.albion_guild_id && (
          <div className="bg-error/10 border border-error/20 p-3 rounded-md flex gap-3 items-start">
            <AlertTriangle className="text-error mt-0.5" size={18} />
            <div>
              <p className="text-error font-body-md font-semibold text-sm">
                {lang === 'tr' ? 'Albion Guild Seçilmedi!' : 'No Albion Guild Selected!'}
              </p>
              <p className="text-error/80 text-xs mt-1">
                {lang === 'tr'
                  ? 'Lütfen önce Genel sekmesinden bir Albion Guild seçin. Aksi takdirde bildirimler çalışmayacaktır.'
                  : 'Please select an Albion Guild from the General tab first. Otherwise, notifications will not work.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kill Channel */}
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Kill (Öldürme) Kanalı' : 'Kill Channel'}
              <InfoTooltip text={lang === 'tr' ? 'Lonca üyeleriniz birini öldürdüğünde bildirimlerin gönderileceği kanal.' : 'Channel where notifications will be sent when your guild members kill someone.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.killboard_kill_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, killboard_kill_channel_id: e.target.value })}
            >
              <option value="">{lang === 'tr' ? 'Kanal Seçin...' : 'Select Channel...'}</option>
              {textChannels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>

            {/* Permission check for kill channel */}
            <ChannelPermCard
              guildId={guildId}
              channelId={settings.killboard_kill_channel_id}
              channelName={killChannelName}
              label={lang === 'tr' ? 'Kill Kanalı' : 'Kill Channel'}
              lang={lang}
            />
          </div>

          {/* Death Channel */}
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Death (Ölüm) Kanalı' : 'Death Channel'}
              <InfoTooltip text={lang === 'tr' ? 'Lonca üyeleriniz öldüğünde bildirimlerin gönderileceği kanal.' : 'Channel where notifications will be sent when your guild members die.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.killboard_death_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, killboard_death_channel_id: e.target.value })}
            >
              <option value="">{lang === 'tr' ? 'Kanal Seçin...' : 'Select Channel...'}</option>
              {textChannels.map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>

            {/* Permission check for death channel */}
            <ChannelPermCard
              guildId={guildId}
              channelId={settings.killboard_death_channel_id}
              channelName={deathChannelName}
              label={lang === 'tr' ? 'Death Kanalı' : 'Death Channel'}
              lang={lang}
            />
          </div>
        </div>

        {/* Same channel tip */}
        <div className="bg-primary-container/10 border border-primary-container/20 p-3 rounded-md flex gap-3 items-start">
          <Info className="text-primary-container mt-0.5 shrink-0" size={18} />
          <p className="text-on-surface font-body-md text-sm">
            {lang === 'tr'
              ? 'İpucu: Kill ve Death bildirimlerini aynı kanala göndermek isterseniz, her iki seçenek için de aynı kanalı seçebilirsiniz.'
              : 'Tip: If you want to send Kill and Death notifications to the same channel, you can select the same channel for both options.'}
          </p>
        </div>
      </div>
    </div>
  );
}
