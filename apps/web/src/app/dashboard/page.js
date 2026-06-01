"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { Server, Settings, AlertCircle } from "lucide-react";
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
        <div className={styles.container}>
          <div className="animate-fade-in">Yükleniyor...</div>
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
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {t.dashSubtitle}
          </p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} glass-panel`} style={{ gridColumn: "1 / -1" }}>
            <div className={styles.cardHeader}>
              <Server size={24} />
              {t.dashServers}
            </div>

            {errorMsg && (
              <div style={{ color: '#ff4d4f', padding: '1rem', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                {errorMsg === "Supabase credentials missing" ? t.dashErrCreds : errorMsg}
              </div>
            )}

            {loading ? (
              <div style={{ color: "var(--text-muted)" }}>{t.dashLoading}</div>
            ) : servers.length === 0 && !errorMsg ? (
              <div style={{ color: "var(--text-muted)" }}>{t.dashNoServers}</div>
            ) : (
              <div className={styles.serverList}>
                {servers.map((server) => {
                  const expired = isPast(new Date(server.expires_at));
                  let timeStatus = "";
                  let statusColor = "var(--text-muted)";

                  if (server.is_unlimited) {
                    timeStatus = t.dashUnlimited;
                    statusColor = "var(--accent-color)";
                  } else if (expired) {
                    timeStatus = t.dashExpired;
                    statusColor = "#ff4d4f";
                  } else {
                    timeStatus = formatDistanceToNow(new Date(server.expires_at), { locale }) + ` ${t.dashLeft}`;
                    statusColor = "#52c41a";
                  }

                  return (
                    <div key={server.id} className={styles.serverItem}>
                      <div className={styles.serverInfo}>
                        <div className={styles.serverAvatar}>
                          {server.guild_name ? server.guild_name.substring(0, 3).toUpperCase() : "SRV"}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem' }}>{server.guild_name || t.dashUnknown}</h3>
                          <span style={{ color: statusColor, fontSize: '0.9rem', fontWeight: '600' }}>
                            {timeStatus} {!server.is_active && t.dashPassive}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            placeholder={t.dRedeemPlaceholder || "Kod girin..."}
                            className={styles.redeemInput}
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              borderRadius: '8px', 
                              padding: '0.5rem 1rem', 
                              color: 'white',
                              fontSize: '0.85rem',
                              width: '150px'
                            }}
                            value={redeemCodes[server.guild_id] || ""}
                            onChange={(e) => setRedeemCodes(prev => ({ ...prev, [server.guild_id]: e.target.value.toUpperCase() }))}
                          />
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            onClick={() => handleRedeem(server.guild_id)}
                            disabled={redeeming[server.guild_id]}
                          >
                            {redeeming[server.guild_id] ? "..." : (t.dRedeemBtn || "Kullan")}
                          </button>
                        </div>

                        {expired && !server.is_unlimited ? (
                          <button className="btn-primary" style={{ padding: '0.5rem 1rem', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                            <Settings size={18} />
                            {t.dashManageBtn}
                          </button>
                        ) : (
                          <Link href={`/dashboard/server/${server.guild_id}`} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
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
      </div>
    );
}
