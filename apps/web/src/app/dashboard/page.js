"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { Server, Settings, AlertCircle, Clock, Infinity, ShieldAlert, Key } from "lucide-react";
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

  const [redeemCodes, setRedeemCodes] = useState({});
  const [redeeming, setRedeeming] = useState({});
  const { toasts, showToast } = useToast();

  const handleRedeem = async (guildId) => {
    const code = redeemCodes[guildId];
    if (!code) return;

    setRedeeming(prev => ({ ...prev, [guildId]: true }));
    try {
      const res = await fetch(`/api/campaigns/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, guildId })
      });
      const result = await res.json();
      
      if (res.ok) {
        showToast(t.dRedeemSuccess || "Success!", "success");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(result.message || t.dRedeemError || "Error!", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setRedeeming(prev => ({ ...prev, [guildId]: false }));
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
          <div className="spin"><Server size={32} color="var(--accent-color)" /></div>
          <span style={{ fontWeight: 600 }}>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <ToastContainer toasts={toasts} />
      
      <div className={styles.header}>
        <h1 className={styles.welcomeText}>
          {t.dashWelcome} <span>{session.user?.name}</span>
        </h1>
        <p className={styles.subtitle}>
          {t.dashSubtitle}
        </p>
      </div>

      <div className={styles.grid}>
        {errorMsg && (
          <div style={{ color: '#ff4d4f', padding: '1.5rem', background: 'rgba(255, 77, 79, 0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255, 77, 79, 0.2)' }}>
            <AlertCircle size={24} />
            <span style={{ fontWeight: 500 }}>{errorMsg === "Supabase credentials missing" ? t.dashErrCreds : errorMsg}</span>
          </div>
        )}

        <div className={styles.cardHeader}>
          <Server size={28} />
          {t.dashServers}
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", textAlign: 'center', padding: '4rem 0' }}>{t.dashLoading}</div>
        ) : servers.length === 0 && !errorMsg ? (
          <div style={{ color: "var(--text-muted)", textAlign: 'center', padding: '4rem 0', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
            <ShieldAlert size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
            <p>{t.dashNoServers}</p>
          </div>
        ) : (
          <div className={styles.serverList}>
            {servers.map((server) => {
              const expired = isPast(new Date(server.expires_at));
              let timeStatus = "";
              let StatusIcon = Clock;
              let statusClass = "";

              if (server.is_unlimited) {
                timeStatus = t.dashUnlimited;
                StatusIcon = Infinity;
                statusClass = styles.statusUnlimited;
              } else if (expired) {
                timeStatus = t.dashExpired;
                StatusIcon = AlertCircle;
                statusClass = styles.statusExpired;
              } else {
                timeStatus = formatDistanceToNow(new Date(server.expires_at), { locale }) + ` ${t.dashLeft}`;
                StatusIcon = Clock;
                statusClass = styles.statusActive;
              }

              return (
                <div key={server.id} className={styles.serverCard}>
                  <div className={styles.serverCardTop}>
                    <div className={styles.serverAvatar}>
                      {server.guild_name ? server.guild_name.substring(0, 2).toUpperCase() : "SR"}
                    </div>
                    <div className={styles.serverInfo}>
                      <h3 className={styles.serverName} title={server.guild_name}>{server.guild_name || t.dashUnknown}</h3>
                      <div className={`${styles.statusBadge} ${statusClass}`}>
                        <StatusIcon size={14} />
                        {timeStatus} {!server.is_active && t.dashPassive}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.serverActions}>
                    <div className={styles.redeemWrapper}>
                      <input 
                        type="text" 
                        placeholder={t.dRedeemPlaceholder || "Kodu Girin"}
                        className={styles.redeemInput}
                        value={redeemCodes[server.guild_id] || ""}
                        onChange={(e) => setRedeemCodes(prev => ({ ...prev, [server.guild_id]: e.target.value.toUpperCase() }))}
                      />
                      <button 
                        className={styles.btnRedeem} 
                        onClick={() => handleRedeem(server.guild_id)}
                        disabled={redeeming[server.guild_id] || !redeemCodes[server.guild_id]}
                      >
                        {redeeming[server.guild_id] ? "..." : <Key size={18} />}
                      </button>
                    </div>

                    {expired && !server.is_unlimited ? (
                      <button className={`${styles.btnManage} ${styles.btnManageDisabled}`} disabled>
                        <Settings size={18} />
                        {t.dashManageBtn}
                      </button>
                    ) : (
                      <Link href={`/dashboard/server/${server.guild_id}`} className={`${styles.btnManage} ${styles.btnManageActive}`}>
                        <Settings size={18} />
                        {t.dashManageBtn}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
