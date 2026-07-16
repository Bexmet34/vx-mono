"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Settings, AlertCircle, Key, ChevronRight } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";

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
      <>
        <Navbar isStatic={true} />
        <div className="min-h-screen flex items-center justify-center">
          <Logo className="w-20 h-20 animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isStatic={true} />
      <main className="pt-32 pb-20 min-h-screen max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <ToastContainer toasts={toasts} />

      <div className="flex flex-col items-center mb-16 text-center">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2 uppercase tracking-tight">{t.dashWelcome}</h1>
        <p className="font-label-bold text-label-bold text-primary-container tracking-widest uppercase mb-8">{session.user?.name}</p>

        <Link 
          href="/dashboard/user" 
          className="bg-surface-variant text-on-surface-variant hover:text-primary-container hover:border-primary-container border border-outline-variant px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all group max-w-sm w-full"
        >
          <div className="bg-surface-container-high p-2 rounded flex items-center justify-center group-hover:bg-primary-container/20 transition-colors">
            <Settings size={20} className="group-hover:text-primary-container transition-colors" />
          </div>
          <div className="text-left flex-1">
            <div className="font-headline-sm uppercase text-sm">{lang === 'tr' ? 'Bireysel Panel' : 'User Dashboard'}</div>
            <div className="font-body-sm text-xs opacity-70">{lang === 'tr' ? 'Kişisel templerinizi yönetin' : 'Manage your personal templates'}</div>
          </div>
          <ChevronRight size={20} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-error/10 border border-error text-error font-body-md text-sm p-4 mb-8 text-center max-w-2xl mx-auto">
          {errorMsg === "Supabase credentials missing" ? t.dashErrCreds : errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-primary-container">
          <Logo className="w-20 h-20 animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
        </div>
      ) : servers.length === 0 && !errorMsg ? (
        <div className="glass-panel p-16 text-center border-dashed border-outline-variant text-on-surface-variant max-w-2xl mx-auto flex flex-col items-center">
          <AlertCircle size={48} className="opacity-50 mb-4" />
          <p className="font-body-lg text-body-lg">{t.dashNoServers}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => {
            const expired = isPast(new Date(server.expires_at));
            let timeStatus = "";
            let statusClass = "";

            if (server.is_unlimited) {
              timeStatus = "Unlimited";
              statusClass = "bg-primary-container text-on-primary";
            } else if (!expired) {
              timeStatus = t.dPremiumPlan || "Premium";
              statusClass = "bg-primary-container text-on-primary";
            } else {
              timeStatus = t.dFreePlan || "Freemium";
              statusClass = "bg-surface-variant text-on-surface-variant border border-outline-variant";
            }

            return (
              <div key={server.id} className="glass-panel border border-outline-variant hover:border-primary-container/50 transition-colors flex flex-col">
                <div className="p-6 border-b border-outline-variant/30 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-surface-container-high border border-outline flex items-center justify-center font-headline-md text-on-surface uppercase">
                      {server.guild_name ? server.guild_name.substring(0, 1) : "S"}
                    </div>
                    <div className={`font-label-bold text-[10px] uppercase tracking-widest px-3 py-1 ${statusClass}`}>
                      {timeStatus}
                    </div>
                  </div>
                  <h3 className="font-headline-md text-lg text-on-surface mb-2 truncate" title={server.guild_name}>
                    {server.guild_name || "Unknown Server"}
                  </h3>
                  <div className="font-body-md text-sm text-on-surface-variant">
                    {server.is_unlimited && (lang === 'tr' ? "Sınırsız (Ömür Boyu)" : "Lifetime access")}
                    {!server.is_unlimited && !expired && (
                      <>
                        <span style={{color: 'var(--on-surface)'}}>{Math.ceil((new Date(server.expires_at) - new Date()) / (1000 * 60 * 60 * 24))}</span> {lang === 'tr' ? "gün kaldı" : "days left"}
                        <span className="text-xs ml-2 opacity-50">({formatDistanceToNow(new Date(server.expires_at), { locale })})</span>
                      </>
                    )}
                    {!server.is_unlimited && expired && (lang === 'tr' ? "Freemium — Top.gg oyu gerekli" : "Freemium — Top.gg vote required")}
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low flex justify-between gap-4">
                  <button 
                    className="flex-1 flex items-center justify-center gap-2 font-label-bold text-label-sm uppercase tracking-widest text-on-surface-variant border border-outline-variant hover:border-primary-container hover:text-primary-container transition-colors py-3"
                    onClick={() => openRedeemModal(server.guild_id)}
                  >
                    <Key size={16} /> Redeem
                  </button>
                  <Link 
                    href={`/dashboard/server/${server.guild_id}`} 
                    className="flex-1 flex items-center justify-center gap-2 font-label-bold text-label-sm uppercase tracking-widest bg-primary-container text-on-primary hover:brightness-110 active:scale-95 transition-all py-3 tactical-glow"
                  >
                    <Settings size={16} /> {t.dashManageBtn}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Redeem Modal */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setRedeemModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-md glass-panel border border-primary-container/20 p-8">
            <h2 className="font-headline-lg text-2xl text-on-surface uppercase tracking-tight mb-2">Redeem Code</h2>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">Enter your premium code to activate or extend your subscription.</p>
            <input 
              type="text" 
              className="w-full bg-surface-container-lowest border-b border-primary-container text-on-surface font-mono p-3 mb-8 outline-none focus:bg-surface-container-low transition-colors" 
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              autoFocus
            />
            <div className="flex gap-4">
              <button 
                className="flex-1 border border-outline-variant text-on-surface-variant font-label-bold text-sm uppercase tracking-widest py-3 hover:bg-on-surface/5 transition-colors"
                onClick={() => setRedeemModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-primary-container text-on-primary font-label-bold text-sm uppercase tracking-widest py-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tactical-glow"
                onClick={handleRedeem}
                disabled={!redeemCode.trim() || redeeming}
              >
                {redeeming ? <Loader2 className="animate-spin" size={16}/> : "Activate"}
              </button>
            </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
