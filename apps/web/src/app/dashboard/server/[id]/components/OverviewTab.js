"use client";

import { AlertCircle, Infinity, Star } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";

export default function OverviewTab({ subscription, setActiveTab }) {
  const { lang, t } = useLanguage();
  const locale = lang === 'tr' ? tr : enUS;

  let timeStatus = t.dashUnknown || "Unknown";
  let expired = false;
  let statusColor = "#888";

  if (subscription) {
    expired = isPast(new Date(subscription.expires_at));
    if (subscription.is_unlimited) {
      timeStatus = t.dashUnlimited || "Unlimited";
      statusColor = "var(--accent-color)";
    } else if (expired) {
      timeStatus = t.dashExpired || "Expired";
      statusColor = "#ef4444";
    } else {
      timeStatus = formatDistanceToNow(new Date(subscription.expires_at), { locale }) + ` ${t.dashLeft || "left"}`;
      statusColor = "#22c55e";
    }
  }

  return (
    <div className="bentoGrid">
      {/* Main Welcome Bento */}
      <div className="bentoBox span12" style={{ background: 'linear-gradient(135deg, rgba(252, 163, 17, 0.05) 0%, rgba(10, 10, 15, 0.8) 100%)', borderLeft: '4px solid var(--accent-color)' }}>
        <h2 className="bentoTitle"><Star /> Overview</h2>
        <p style={{ color: '#888', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Welcome to your server command center. Configure integrations, manage templates, and monitor performance.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="floatingSave" style={{ position: 'relative', bottom: 'auto', right: 'auto', boxShadow: 'none' }} onClick={() => setActiveTab('general')}>
            Quick Setup
          </button>
        </div>
      </div>

      {/* Subscription Status Bento */}
      <div className="bentoBox span6">
        <h3 className="bentoTitle" style={{ fontSize: '1.1rem' }}>Subscription Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           {subscription?.is_unlimited ? (
             <Infinity size={40} color={statusColor} />
           ) : expired ? (
             <AlertCircle size={40} color={statusColor} />
           ) : (
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor, fontWeight: 800 }}>✓</div>
           )}
           <div>
             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: statusColor }}>{timeStatus}</div>
             <div style={{ color: '#888', fontSize: '0.85rem' }}>{subscription && !subscription.is_unlimited && !expired ? 'Premium Access' : 'Current Plan'}</div>
           </div>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="bentoBox span6">
        <h3 className="bentoTitle" style={{ fontSize: '1.1rem' }}>Active Features</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <li className="listItem" style={{ padding: '0.5rem 1rem' }}>✓ Party Creator</li>
           <li className="listItem" style={{ padding: '0.5rem 1rem' }}>✓ Role Whitelists</li>
           <li className="listItem" style={{ padding: '0.5rem 1rem', opacity: 0.5 }}>- Auto Registration (Setup required)</li>
        </ul>
      </div>
    </div>
  );
}
