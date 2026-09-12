"use client";

import { AlertCircle, Infinity, Star, Crown, Users, Layout } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";

export default function OverviewTab({ subscription, setActiveTab, settings, albionGuildDetail }) {
  const { lang, t } = useLanguage();
  const locale = lang === 'tr' ? tr : enUS;

  // Determine subscription tier
  let tier = "freemium"; // freemium | premium | unlimited
  let timeStatus = lang === 'tr' ? "Freemium" : "Freemium";
  let statusColor = "#888";
  let statusDesc = lang === 'tr' ? "Top.gg üzerinden oy vererek kullanılabilir" : "Available by voting on Top.gg";
  let StatusIcon = AlertCircle;

  if (subscription) {
    if (subscription.is_unlimited) {
      tier = "unlimited";
      timeStatus = lang === 'tr' ? "Ömür Boyu Premium" : "Lifetime Premium";
      statusColor = "var(--accent-color)";
      statusDesc = lang === 'tr' ? "Sınırsız erişim aktif" : "Unlimited access active";
      StatusIcon = Infinity;
    } else if (subscription.trial_used === false) {
      // Paid subscription
      const expired = isPast(new Date(subscription.expires_at));
      if (!expired && subscription.is_active) {
        tier = "premium";
        const remaining = formatDistanceToNow(new Date(subscription.expires_at), { locale });
        timeStatus = lang === 'tr' ? "Premium" : "Premium";
        statusColor = "#22c55e";
        statusDesc = `${remaining} ${t.dashLeft || "left"}`;
        StatusIcon = Crown;
      } else {
        tier = "freemium";
        timeStatus = lang === 'tr' ? "Freemium" : "Freemium";
        statusColor = "#888";
        statusDesc = lang === 'tr' ? "Paket süresi doldu — Top.gg oyu gerekli" : "Plan expired — Top.gg vote required";
        StatusIcon = AlertCircle;
      }
    }
    // else trial_used=true → freemium (default)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-slide-up items-start">
      {/* Main Welcome Box */}
      <div className="md:col-span-2 glass-panel p-3 relative overflow-visible border border-primary-container/30 bg-primary-container/5 hover:border-primary-container transition-colors group">
        <div className="scanline"></div>
        <div className="absolute top-8 right-8 text-primary-container/10 group-hover:text-primary-container/30 transition-colors">
          <Star size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="font-headline-lg text-sm text-primary-container mb-1 flex items-center gap-2 uppercase tracking-tight">
            <Star size={16} className="fill-current" /> {lang === 'en' ? 'Overview' : 'Genel Bakış'}
          </h2>
          <p className="font-body-lg text-xs text-on-surface-variant max-w-2xl mb-3 leading-relaxed">
            {lang === 'tr'
              ? 'Sunucu komuta merkezine hoş geldiniz. Entegrasyonları yapılandırın, şablonları yönetin ve performansı izleyin.'
              : 'Welcome to your server command center. Configure integrations, manage templates, and monitor performance.'}
          </p>

          <button className="px-2 py-1.5 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow rounded-sm" onClick={() => setActiveTab('general')}>
            {lang === 'tr' ? 'Hızlı Kurulum' : 'Quick Setup'}
          </button>
        </div>
      </div>

      {/* Left Column Stack (Subscription & System Mode) */}
      <div className="flex flex-col gap-2">
        {/* Subscription Status Box */}
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h3 className="font-headline-md text-xs text-on-surface mb-2 uppercase tracking-tight">
          {lang === 'tr' ? 'Abonelik Durumu' : 'Subscription Status'}
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-surface border border-outline flex items-center justify-center shadow-lg" style={{ color: statusColor, borderColor: statusColor }}>
            <StatusIcon size={20} />
          </div>
          <div>
            <div className="font-headline-lg text-xs uppercase tracking-tight" style={{ color: statusColor }}>{timeStatus}</div>
            <div className="font-label-sm text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-widest">{statusDesc}</div>
          </div>
        </div>

        {tier === 'freemium' && (
          <div className="mt-2 p-2 bg-primary-container/10 border border-primary-container/30 text-primary-container font-body-md text-[10px]">
            {lang === 'tr'
              ? '💡 Premium paket alarak oy zorunluluğunu kaldırabilirsiniz.'
              : '💡 Upgrade to Premium to remove the vote requirement.'}
          </div>
        )}
        </div>

        {/* System Content Mode Box */}
        <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
          <h3 className="font-headline-md text-xs text-on-surface mb-2 uppercase tracking-tight flex items-center gap-2">
            <Layout size={14} className="text-primary-container" />
            {lang === 'tr' ? 'Çalışma Modu (Content)' : 'Content System Mode'}
          </h3>
          <div className="flex items-center gap-3">
            <div className={`flex-1 p-2 rounded border ${settings?.system_mode === 'channel' ? 'border-primary-container/50 bg-primary-container/10 text-primary-container' : 'border-outline-variant/50 bg-surface text-on-surface-variant'} text-center transition-colors`}>
               <div className="font-label-bold text-[10px] uppercase tracking-widest">{lang === 'tr' ? 'Kanal Bazlı' : 'Channel Based'}</div>
            </div>
            <div className={`flex-1 p-2 rounded border ${settings?.system_mode === 'command' ? 'border-primary-container/50 bg-primary-container/10 text-primary-container' : 'border-outline-variant/50 bg-surface text-on-surface-variant'} text-center transition-colors`}>
               <div className="font-label-bold text-[10px] uppercase tracking-widest">{lang === 'tr' ? 'Komut Bazlı' : 'Command Based'}</div>
            </div>
          </div>
          <p className="text-[9px] text-on-surface-variant mt-2 leading-relaxed opacity-80">
            {lang === 'tr' 
              ? 'Botun içeriği sunma yöntemi. "Kanal Bazlı" içerikler sabit kanallara düşerken, "Komut Bazlı" komutlarla çağrılır.' 
              : 'How the bot delivers content. "Channel Based" drops content in fixed channels, "Command Based" triggers on user commands.'}
          </p>
        </div>
      </div>

      {/* Quick Stats Box */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors h-full">
        <h3 className="font-headline-md text-xs text-on-surface mb-2 uppercase tracking-tight">
          {lang === 'tr' ? 'Sistem Durumu' : 'System Status'}
        </h3>
        <ul className="space-y-3 h-full max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.albion_guild_id ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.albion_guild_id ? '✓' : '✗'} {lang === 'tr' ? 'Albion Lonca Bağlantısı' : 'Albion Guild Link'}</span>
             <span>{settings?.albion_guild_id ? (lang === 'tr' ? 'Bağlı' : 'Linked') : (lang === 'tr' ? 'Kurulum Bekliyor' : 'Setup Required')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.registration_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.registration_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Kayıt (Registration) Sistemi' : 'Registration System'}</span>
             <span>{settings?.registration_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${(settings?.tempvoice_creators && settings?.tempvoice_creators.length > 0) ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{(settings?.tempvoice_creators && settings?.tempvoice_creators.length > 0) ? '✓' : '✗'} {lang === 'tr' ? 'Geçici Ses Kanalları' : 'Temp Voice Channels'}</span>
             <span>{(settings?.tempvoice_creators && settings?.tempvoice_creators.length > 0) ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${(settings?.killboard_kill_channel_id || settings?.killboard_death_channel_id) ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{(settings?.killboard_kill_channel_id || settings?.killboard_death_channel_id) ? '✓' : '✗'} {lang === 'tr' ? 'KillBoard Raporları' : 'KillBoard Reports'}</span>
             <span>{(settings?.killboard_kill_channel_id || settings?.killboard_death_channel_id) ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.ticket_system_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.ticket_system_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Destek (Ticket) Sistemi' : 'Ticket System'}</span>
             <span>{settings?.ticket_system_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.log_system_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.log_system_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Denetim Logları' : 'Audit Logs'}</span>
             <span>{settings?.log_system_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className="flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest border-error/30 bg-error/5 text-error">
             <span className="flex items-center gap-2">✗ {lang === 'tr' ? 'Otomatik Ayrılık Kontrolü' : 'Guild Leave Auto-Check'}</span>
             <span>{lang === 'tr' ? 'Bakımda' : 'Maintenance'}</span>
           </li>
        </ul>
      </div>

      {/* Albion Guild Info Box */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h3 className="font-headline-md text-xs text-on-surface mb-2 uppercase tracking-tight">
          {lang === 'tr' ? 'Albion Lonca Durumu' : 'Albion Guild Status'}
        </h3>
        {albionGuildDetail ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded bg-surface border border-outline flex items-center justify-center shadow-lg">
                <Users size={24} className="text-primary-container" />
              </div>
              <div>
                <div className="font-headline-lg text-sm text-on-surface">
                  {albionGuildDetail.AllianceTag ? `[${albionGuildDetail.AllianceTag}] ` : ''}{albionGuildDetail.Name}
                </div>
                <div className="font-label-sm text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-widest">
                  {lang === 'tr' ? 'Bağlı Lonca' : 'Linked Guild'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-surface-container p-2 rounded border border-outline-variant/30">
                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{lang === 'tr' ? 'Sunucu' : 'Server'}</div>
                <div className="text-xs font-bold text-on-surface">{albionGuildDetail.Server || settings?.albion_server || 'Europe'}</div>
              </div>
              <div className="bg-surface-container p-2 rounded border border-outline-variant/30">
                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{lang === 'tr' ? 'Üye Sayısı' : 'Members'}</div>
                <div className="text-xs font-bold text-on-surface">{albionGuildDetail.MemberCount ? albionGuildDetail.MemberCount.toLocaleString() : '?'}</div>
              </div>
              <div className="bg-surface-container p-2 rounded border border-outline-variant/30">
                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Kill Fame</div>
                <div className="text-xs font-bold text-success">{albionGuildDetail.killFame ? albionGuildDetail.killFame.toLocaleString() : '?'}</div>
              </div>
              <div className="bg-surface-container p-2 rounded border border-outline-variant/30">
                <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Death Fame</div>
                <div className="text-xs font-bold text-error">{albionGuildDetail.DeathFame ? albionGuildDetail.DeathFame.toLocaleString() : '?'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center bg-surface-container/20 border border-dashed border-outline-variant rounded p-4">
            <Users size={24} className="text-on-surface-variant/50 mb-2" />
            <p className="text-xs text-on-surface-variant">
              {lang === 'tr' ? 'Henüz bir Albion loncası bağlanmadı.' : 'No Albion guild linked yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
