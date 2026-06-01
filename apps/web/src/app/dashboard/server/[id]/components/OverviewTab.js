import React from 'react';
import { useParams } from "next/navigation";
import { Home, Clock, Calendar, Star, CheckCircle, AlertTriangle, Shield, Layout, Copy } from "lucide-react";

export default function OverviewTab({ t, subscription, setActiveTab, showToast }) {
  const { id: guildId } = useParams();
  return (
    <div className="overview-grid">
       <div className="overview-card welcome-card">
          <div className="card-icon-bg"><Home size={120} /></div>
          <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem'}}>{t.dWelcome}</h2>
          <p style={{color: 'var(--dash-text-muted)', maxWidth: '600px'}}>{t.dWelcomeDesc}</p>
       </div>

       {/* Subscription Status */}
       <div className="overview-card">
          <div className="card-icon-bg"><Clock size={120} /></div>
          <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Calendar size={20} color="var(--dash-accent)" /> {t.dSubStatus}</h3>
          
          {subscription ? (
            <>
              <div className={`status-badge ${new Date(subscription.expires_at) > new Date() || subscription.is_unlimited ? 'active' : 'expired'}`}>
                 {subscription.is_unlimited ? (
                   <><Star size={16} fill="currentColor" /> {t.dashUnlimited}</>
                 ) : new Date(subscription.expires_at) > new Date() ? (
                   <><CheckCircle size={16} /> {t.dActive}</>
                 ) : (
                   <><AlertTriangle size={16} /> {t.dExpired}</>
                 )}
              </div>

              {!subscription.is_unlimited && (
                <div className="time-display">
                   <div style={{fontSize: '0.9rem', color: 'var(--dash-text-muted)', marginBottom: '1rem'}}>{t.dRemaining}</div>
                   <div className="countdown-timer">
                      {(() => {
                        const diff = new Date(subscription.expires_at) - new Date();
                        if (diff < 0) return <div style={{fontWeight: '800', color: '#ef4444'}}>{t.dExpired}</div>;
                        
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        
                        return (
                          <>
                            <div className="time-unit">
                               <span className="time-value">{days}</span>
                               <span className="time-label">{t.dDays}</span>
                            </div>
                            <div className="time-unit">
                               <span className="time-value">{hours}</span>
                               <span className="time-label">{t.dHours}</span>
                            </div>
                          </>
                        );
                      })()}
                   </div>
                </div>
              )}
            </>
          ) : (
            <div style={{color: 'var(--dash-text-muted)'}}>Yükleniyor...</div>
          )}
       </div>

       {/* Quick Access */}
       <div className="overview-card">
          <div className="card-icon-bg"><Shield size={120} /></div>
          <h3 style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Shield size={20} color="var(--dash-accent)" /> {t.dQuickAccess}</h3>
          <p style={{fontSize: '0.9rem', color: 'var(--dash-text-muted)', marginBottom: '1.5rem'}}>{t.dQuickDesc}</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            <button onClick={() => setActiveTab('general')} className="sidebar-item" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dash-border)'}}>
               <Layout size={18} /> <span>{t.dGeneral}</span>
            </button>
            <button onClick={() => setActiveTab('templates')} className="sidebar-item" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dash-border)'}}>
               <Copy size={18} /> <span>{t.dTemplates}</span>
            </button>
          </div>
       </div>

    </div>
  );
}
