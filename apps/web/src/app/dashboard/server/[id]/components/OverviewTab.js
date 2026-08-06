"use client";

import { AlertCircle, Infinity, Star, Crown, Users } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";

export default function OverviewTab({ subscription, setActiveTab, settings }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-slide-up">
      {/* Main Welcome Box */}
      <div className="md:col-span-2 glass-panel p-3 relative overflow-visible border border-primary-container/30 bg-primary-container/5 hover:border-primary-container transition-colors group">
        <div className="scanline"></div>
        <div className="absolute top-8 right-8 text-primary-container/10 group-hover:text-primary-container/30 transition-colors">
          <Star size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="font-headline-lg text-[10px] text-primary-container mb-2 flex items-center gap-2 uppercase tracking-tight">
            <Star size={16} className="fill-current" /> {lang === 'en' ? 'Overview' : 'Genel Bakış'}
          </h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mb-2 leading-relaxed">
            {lang === 'tr'
              ? 'Sunucu komuta merkezine hoş geldiniz. Entegrasyonları yapılandırın, şablonları yönetin ve performansı izleyin.'
              : 'Welcome to your server command center. Configure integrations, manage templates, and monitor performance.'}
          </p>

          <button className="px-2 py-1.5 bg-primary-container text-on-primary font-label-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow rounded-sm" onClick={() => setActiveTab('general')}>
            {lang === 'tr' ? 'Hızlı Kurulum' : 'Quick Setup'}
          </button>
        </div>
      </div>

      {/* Subscription Status Box */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h3 className="font-headline-md text-[10px] text-on-surface mb-3 uppercase tracking-tight">
          {lang === 'tr' ? 'Abonelik Durumu' : 'Subscription Status'}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-16 h-7 rounded bg-surface border border-outline flex items-center justify-center shadow-lg" style={{ color: statusColor, borderColor: statusColor }}>
            <StatusIcon size={32} />
          </div>
          <div>
            <div className="font-headline-lg text-[10px] uppercase tracking-tight" style={{ color: statusColor }}>{timeStatus}</div>
            <div className="font-label-sm text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">{statusDesc}</div>
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

      {/* Quick Stats Box */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h3 className="font-headline-md text-[10px] text-on-surface mb-3 uppercase tracking-tight">
          {lang === 'tr' ? 'Sistem Durumu' : 'System Status'}
        </h3>
        <ul className="space-y-3">
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.albion_guild_id ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.albion_guild_id ? '✓' : '✗'} {lang === 'tr' ? 'Albion Lonca Bağlantısı' : 'Albion Guild Link'}</span>
             <span>{settings?.albion_guild_id ? (lang === 'tr' ? 'Bağlı' : 'Linked') : (lang === 'tr' ? 'Kurulum Bekliyor' : 'Setup Required')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.registration_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.registration_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Kayıt (Registration) Sistemi' : 'Registration System'}</span>
             <span>{settings?.registration_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.auto_check_enabled ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.auto_check_enabled ? '✓' : '✗'} {lang === 'tr' ? 'Otomatik Ayrılık Kontrolü' : 'Guild Leave Auto-Check'}</span>
             <span>{settings?.auto_check_enabled ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
           <li className={`flex items-center justify-between p-3 border rounded-sm font-label-bold text-[10px] uppercase tracking-widest ${settings?.killboard_channel_id ? 'border-success/30 bg-success/5 text-success' : 'border-outline text-on-surface-variant'}`}>
             <span className="flex items-center gap-2">{settings?.killboard_channel_id ? '✓' : '✗'} {lang === 'tr' ? 'KillBoard Raporları' : 'KillBoard Reports'}</span>
             <span>{settings?.killboard_channel_id ? (lang === 'tr' ? 'Aktif' : 'Active') : (lang === 'tr' ? 'Kapalı' : 'Disabled')}</span>
           </li>
        </ul>
      </div>
    </div>
  );
}
