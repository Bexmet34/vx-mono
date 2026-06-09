"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { Loader2, Settings, AlertCircle, Key, ChevronRight } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemServerId, setRedeemServerId] = useState(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const { toasts, showToast } = useToast();
  const locale = lang === 'tr' ? tr : enUS;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((res) => {
          if (!res.ok) {
            return res.json().then(data => { throw new Error(data.error) });
          }
          return res.json();
        })
        .then((data) => {
          setServers(data);
          setLoading(false);
        })
        .catch((err) => {
          setErrorMsg(err.message);
          setLoading(false);
        });
    }
  }, [status]);

  const openRedeemModal = (guildId) => {
    setRedeemServerId(guildId);
    setRedeemCode("");
    setRedeemModalOpen(true);
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim() || !redeemServerId) return;

    setRedeeming(true);
    try {
      const res = await fetch(`/api/campaigns/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim(), guildId: redeemServerId })
      });
      const result = await res.json();
      
      if (res.ok) {
        showToast(t.dRedeemSuccess || "Success!", "success");
        setRedeemModalOpen(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(result.message || t.dRedeemError || "Error!", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setRedeeming(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className={styles.appWrapper}>
        <div className={styles.loadingBox}>
          <Loader2 className="spin" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appWrapper}>
      <ToastContainer toasts={toasts} />

      <div className={styles.centerContent}>
        <div className={styles.titleArea}>
          <h1 className={styles.mainTitle}>{t.dashWelcome}</h1>
          <p className={styles.subTitle}>{session.user?.name}</p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {errorMsg === "Supabase credentials missing" ? t.dashErrCreds : errorMsg}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 className="spin" size={32} />
          </div>
        ) : servers.length === 0 && !errorMsg ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>{t.dashNoServers}</p>
          </div>
        ) : (
          <div className={styles.widgetGrid}>
            {servers.map((server) => {
              const expired = isPast(new Date(server.expires_at));
              let timeStatus = "";
              let statusClass = "";

              if (server.is_unlimited) {
                timeStatus = "Unlimited";
                statusClass = styles.statusInfinity;
              } else if (server.trial_used === false && !expired) {
                // Real paid subscription, not expired
                timeStatus = t.dPremiumPlan || "Premium";
                statusClass = styles.statusActive;
              } else {
                // Trial (trial_used=true) OR expired paid plan → Freemium
                timeStatus = t.dFreePlan || "Freemium";
                statusClass = styles.statusExpired;
              }

              return (
                <div key={server.id} className={styles.widgetBox}>
                  <div className={styles.widgetBody}>
                    <div className={styles.widgetHeader}>
                      <div className={styles.widgetIcon}>
                        {server.guild_name ? server.guild_name.substring(0, 1).toUpperCase() : "S"}
                      </div>
                      <div className={`${styles.widgetStatus} ${statusClass}`}>
                        {timeStatus}
                      </div>
                    </div>
                    <div className={styles.widgetName} title={server.guild_name}>
                      {server.guild_name || "Unknown Server"}
                    </div>
                    <div className={styles.widgetMeta}>
                      {server.is_unlimited && (lang === 'tr' ? "Sınırsız (Ömür Boyu)" : "Lifetime access")}
                      {!server.is_unlimited && server.trial_used === false && !expired && (
                        <>{formatDistanceToNow(new Date(server.expires_at), { locale })} left</>
                      )}
                      {!server.is_unlimited && (server.trial_used !== false || expired) && (lang === 'tr' ? "Freemium — Top.gg oyu gerekli" : "Freemium — Top.gg vote required")}
                    </div>
                  </div>
                  <div className={styles.widgetFooter}>
                    <button 
                      className={`${styles.btnAction} ${styles.btnSecondary}`}
                      onClick={() => openRedeemModal(server.guild_id)}
                    >
                      <Key size={16} /> Redeem
                    </button>
                    <Link href={`/dashboard/server/${server.guild_id}`} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                      <Settings size={18} />
                      {t.dashManageBtn}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redeem Modal */}
      {redeemModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setRedeemModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Redeem Code</h2>
            <p className={styles.modalDesc}>Enter your premium code to activate or extend your subscription.</p>
            <input 
              type="text" 
              className={styles.modalInput} 
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button 
                className={`${styles.btnAction} ${styles.btnSecondary}`} 
                onClick={() => setRedeemModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={`${styles.btnAction} ${styles.btnPrimary}`} 
                onClick={handleRedeem}
                disabled={!redeemCode.trim() || redeeming}
              >
                {redeeming ? <Loader2 className="spin" size={16}/> : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
