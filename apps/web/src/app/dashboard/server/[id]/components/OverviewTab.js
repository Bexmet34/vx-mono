"use client";

import { AlertCircle, Infinity, Star, Crown, Users } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";

export default function OverviewTab({ subscription, setActiveTab }) {
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
    <div className="bentoGrid">
      {/* Main Welcome Bento */}
      <div className="bentoBox span12" style={{ background: 'linear-gradient(135deg, rgba(252, 163, 17, 0.05) 0%, rgba(10, 10, 15, 0.8) 100%)', borderLeft: '4px solid var(--accent-color)' }}>
        <h2 className="bentoTitle"><Star /> Overview</h2>
        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem' }}>
          {lang === 'tr'
            ? 'Sunucu komuta merkezine hoş geldiniz. Entegrasyonları yapılandırın, şablonları yönetin ve performansı izleyin.'
            : 'Welcome to your server command center. Configure integrations, manage templates, and monitor performance.'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="floatingSave" style={{ position: 'relative', bottom: 'auto', right: 'auto', boxShadow: 'none' }} onClick={() => setActiveTab('general')}>
            {lang === 'tr' ? 'Hızlı Kurulum' : 'Quick Setup'}
          </button>
        </div>
      </div>

      {/* Subscription Status Bento */}
      <div className="bentoBox span6">
        <h3 className="bentoTitle" style={{ fontSize: '1.1rem' }}>
          {lang === 'tr' ? 'Abonelik Durumu' : 'Subscription Status'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StatusIcon size={40} color={statusColor} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: statusColor }}>{timeStatus}</div>
            <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>{statusDesc}</div>
          </div>
        </div>

        {tier === 'freemium' && (
          <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(252, 163, 17, 0.08)', borderRadius: '8px', border: '1px solid rgba(252, 163, 17, 0.2)', fontSize: '0.85rem', color: '#fca30b' }}>
            {lang === 'tr'
              ? '💡 Premium paket alarak oy zorunluluğunu kaldırabilirsiniz.'
              : '💡 Upgrade to Premium to remove the vote requirement.'}
          </div>
        )}
      </div>

      {/* Quick Stats Bento */}
      <div className="bentoBox span6">
        <h3 className="bentoTitle" style={{ fontSize: '1.1rem' }}>
          {lang === 'tr' ? 'Aktif Özellikler' : 'Active Features'}
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <li className="listItem" style={{ padding: '0.5rem 1rem' }}>✓ Party Creator</li>
           <li className="listItem" style={{ padding: '0.5rem 1rem' }}>✓ Role Whitelists</li>
           <li className="listItem" style={{ padding: '0.5rem 1rem', opacity: 0.5 }}>
             - Auto Registration ({lang === 'tr' ? 'Kurulum gerekli' : 'Setup required'})
           </li>
        </ul>
      </div>
    </div>
  );
}
