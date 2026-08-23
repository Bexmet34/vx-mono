"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Loader2, 
  Settings, 
  AlertCircle, 
  Key, 
  ChevronRight, 
  Sparkles, 
  Server, 
  ShieldCheck, 
  Clock, 
  Search, 
  User, 
  Swords, 
  LayoutDashboard, 
  ArrowRight,
  PlusCircle,
  Users
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import { useToast, ToastContainer } from "@/components/Toast";
import Logo from "@/components/Logo";

const slugify = (str) => {
  const map = { 'ç':'c', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u', 'Ç':'C', 'Ğ':'G', 'İ':'I', 'Ö':'O', 'Ş':'S', 'Ü':'U' };
  return str.replace(/[çğıöşüÇĞİÖŞÜ]/g, match => map[match])
            .toLowerCase()
            .replace(/[^a-z0-9\-]+/g, '-')
            .replace(/\-+/g, '-')
            .replace(/^-|-$/g, '') || 'server';
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [servers, setServers] = useState([]);
  const [activeTab, setActiveTab] = useState("all_servers"); // 'all_servers' or 'personal'
  const [filteredFilter, setFilteredFilter] = useState("all"); // 'all', 'premium', 'freemium'
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredServers = servers.filter((s) => {
    const isPremium = s.is_unlimited || !isPast(new Date(s.expires_at));
    if (filteredFilter === "premium" && !isPremium) return false;
    if (filteredFilter === "freemium" && isPremium) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (s.guild_name || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#081425]">
        <Logo className="w-16 h-16 animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-container-max mx-auto px-4 md:px-margin-desktop pt-4 pb-24">
      <ToastContainer toasts={toasts} />

      {/* --- DASHBOARD TOP HEADER --- */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-label-bold text-xs uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
          <Sparkles size={14} />
          {lang === 'tr' ? 'Veyronix Yönetim Merkezi' : 'Veyronix Control Center'}
        </div>
        
        <h1 className="font-headline-xl text-3xl md:text-5xl text-on-surface mb-2 font-bold tracking-tight">
          {lang === 'tr' ? 'HOŞ GELDİN,' : 'WELCOME,'}{" "}
          <span className="bg-gradient-to-r from-primary-container via-yellow-400 to-secondary bg-clip-text text-transparent">
            {session.user?.name}
          </span>
        </h1>

        <p className="text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto font-light leading-relaxed">
          {lang === 'tr' 
            ? 'Yönettiğiniz tüm sunucuları ve bireysel parti şablonlarınızı tek bir yerden kolayca kontrol edin.' 
            : 'Effortlessly manage all your servers and personal party templates in one unified dashboard.'}
        </p>
      </div>

      {/* --- PROMINENT DUAL SECTION SWITCHER & BIREYSEL SHOWCASE --- */}
      <div className="mb-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* CARD 1: BİREYSEL ŞABLONLAR (HIGH VISIBILITY) */}
          <Link
            href="/dashboard/user"
            className="group relative rounded-2xl p-5 md:p-6 bg-gradient-to-br from-surface-container-high/90 via-surface-container/90 to-surface-container-high/90 border-2 border-primary-container/40 shadow-[0_0_30px_rgba(255,215,0,0.1)] hover:border-primary-container hover:shadow-[0_0_40px_rgba(255,215,0,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container font-label-bold text-[11px] uppercase tracking-wider">
                  <User size={13} />
                  {lang === 'tr' ? 'Kişisel Alan' : 'Personal Space'}
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
                  <Swords size={20} />
                </div>
              </div>

              <h3 className="font-headline-xl text-lg md:text-xl text-on-surface font-bold mb-1.5 group-hover:text-primary-container transition-colors">
                {lang === 'tr' ? '👤 Bireysel Parti Şablonları' : '👤 Personal Party Templates'}
              </h3>
              
              <p className="text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                {lang === 'tr' 
                  ? 'Kendinize ait özel Tank, Healer, DPS parti kompozisyonlarını oluşturun ve tüm sunucularda tek tıkla kullanın.'
                  : 'Build your custom Tank, Healer, DPS party compositions and launch them across any server instantly.'}
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-primary-container/20 flex items-center justify-between text-xs font-label-bold text-primary-container">
              <span>{lang === 'tr' ? 'Şablonları Düzenle' : 'Manage Templates'}</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{lang === 'tr' ? 'Panele Git' : 'Open'}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* CARD 2: SUNUCU YÖNETİMİ ÖZETİ */}
          <div className="rounded-2xl p-5 md:p-6 bg-surface-container/70 border border-outline-variant/30 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/40 text-on-surface font-label-bold text-[11px] uppercase tracking-wider">
                  <Server size={13} className="text-primary-container" />
                  {lang === 'tr' ? 'Sunucu Yönetimi' : 'Server Management'}
                </div>
                <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-on-surface">
                  <LayoutDashboard size={20} />
                </div>
              </div>

              <h3 className="font-headline-xl text-lg md:text-xl text-on-surface font-bold mb-1.5">
                {lang === 'tr' ? '🏰 Yönetilen Sunucular' : '🏰 Managed Servers'}
              </h3>
              
              <p className="text-xs text-on-surface-variant font-light leading-relaxed mb-4">
                {lang === 'tr' 
                  ? `Şu anda ${servers.length} sunucuda yönetici yetkiniz bulunuyor. Killboard, VoiceForge ve diğer sistemleri yapılandırın.`
                  : `You have admin access on ${servers.length} servers. Configure Killboard, VoiceForge and other modules.`}
              </p>
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {servers.length} {lang === 'tr' ? 'Aktif Sunucu Bağlı' : 'Active Connected Servers'}
              </span>
              <span className="font-label-bold text-primary-container">
                {servers.filter(s => s.is_unlimited || !isPast(new Date(s.expires_at))).length} Premium
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* --- SERVERS SECTION HEADER & FILTER BAR --- */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5 pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-primary-container" />
            <h2 className="font-headline-lg text-lg md:text-xl text-on-surface font-bold">
              {lang === 'tr' ? 'Yönettiğiniz Sunucular' : 'Servers You Manage'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container font-label-bold text-xs border border-primary-container/30">
              {servers.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder={lang === 'tr' ? 'Sunucu ismi ara...' : 'Search server name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 text-on-surface text-xs rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-container transition-all placeholder:text-on-surface-variant/50 shadow-inner"
            />
          </div>
        </div>

        {/* Filter Pills */}
        {servers.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar mb-6 pb-1">
            {[
              { key: 'all', label: lang === 'tr' ? 'Tüm Sunucular' : 'All Servers', count: servers.length },
              { key: 'premium', label: lang === 'tr' ? 'Aktif Premium' : 'Active Premium', count: servers.filter(s => s.is_unlimited || !isPast(new Date(s.expires_at))).length },
              { key: 'freemium', label: lang === 'tr' ? 'Freemium' : 'Freemium', count: servers.filter(s => !s.is_unlimited && isPast(new Date(s.expires_at))).length },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilteredFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex items-center gap-2 touch-manipulation active:scale-95 ${
                  filteredFilter === f.key
                    ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.25)] font-bold'
                    : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  filteredFilter === f.key ? 'bg-black/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-error/10 border border-error text-error font-body-md text-xs p-3 mb-6 text-center max-w-2xl mx-auto rounded-xl">
            {errorMsg === "Supabase credentials missing" ? t.dashErrCreds : errorMsg}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary-container gap-3">
            <Logo className="w-14 h-14 animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
            <span className="font-label-bold text-xs uppercase tracking-widest opacity-80">
              {lang === 'tr' ? 'Sunucular Yükleniyor...' : 'Loading Servers...'}
            </span>
          </div>
        ) : filteredServers.length === 0 && !errorMsg ? (
          <div className="glass-panel p-8 text-center border-dashed border-outline-variant/50 text-on-surface-variant max-w-xl mx-auto flex flex-col items-center rounded-2xl">
            <AlertCircle size={44} className="text-primary-container opacity-60 mb-3" />
            <p className="font-headline-md text-sm text-on-surface mb-2 font-semibold">
              {searchQuery 
                ? (lang === 'tr' ? 'Aramanıza uygun sunucu bulunamadı.' : 'No server matching search query.') 
                : t.dashNoServers}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-primary-container font-label-bold underline hover:brightness-125"
              >
                {lang === 'tr' ? 'Filtreyi Temizle' : 'Clear Filter'}
              </button>
            )}
          </div>
        ) : (
          /* --- SERVER CARDS GRID --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServers.map((server) => {
              const expired = isPast(new Date(server.expires_at));
              let timeStatus = "";
              let statusClass = "";

              if (server.is_unlimited) {
                timeStatus = lang === 'tr' ? 'Sınırsız Premium' : 'Lifetime Premium';
                statusClass = "bg-primary-container text-on-primary shadow-[0_0_12px_rgba(255,215,0,0.3)] font-bold";
              } else if (!expired) {
                timeStatus = t.dPremiumPlan || "Premium";
                statusClass = "bg-primary-container text-on-primary shadow-[0_0_10px_rgba(255,215,0,0.2)] font-bold";
              } else {
                timeStatus = t.dFreePlan || "Freemium";
                statusClass = "bg-surface-container-highest text-on-surface-variant border border-outline-variant/40";
              }

              const daysLeft = !server.is_unlimited && !expired 
                ? Math.ceil((new Date(server.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
                : 0;

              return (
                <div 
                  key={server.id} 
                  className="glass-card-native rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-primary-container/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] active:scale-[0.99] border border-outline-variant/30"
                >
                  <div className="p-5 flex-grow">
                    {/* Top Header Badge */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="w-12 h-12 bg-surface-container-high border border-outline-variant/40 rounded-xl flex items-center justify-center font-headline-md text-sm text-primary-container font-bold uppercase shadow-inner shrink-0">
                        {server.guild_name ? server.guild_name.substring(0, 2) : "VX"}
                      </div>
                      <div className={`font-label-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 ${statusClass}`}>
                        <ShieldCheck size={13} />
                        <span>{timeStatus}</span>
                      </div>
                    </div>

                    {/* Server Title */}
                    <h3 className="font-headline-md text-sm md:text-base text-on-surface mb-2 font-bold truncate" title={server.guild_name}>
                      {server.guild_name || "Unknown Server"}
                    </h3>

                    {/* Expiration Details */}
                    <div className="font-body-md text-xs text-on-surface-variant/90 flex items-center gap-2 mt-3 bg-surface-container-low/60 p-2.5 rounded-xl border border-outline-variant/20">
                      <Clock size={14} className="text-primary-container shrink-0" />
                      <div className="truncate text-[11px]">
                        {server.is_unlimited && (
                          <span className="text-primary-container font-bold">
                            {lang === 'tr' ? 'Sınırsız (Ömür Boyu Erişim)' : 'Lifetime Access'}
                          </span>
                        )}
                        {!server.is_unlimited && !expired && (
                          <span>
                            <strong className="text-primary-container font-bold">{daysLeft}</strong> {lang === 'tr' ? "gün kaldı" : "days left"}
                            <span className="opacity-50 text-[10px] ml-1">({formatDistanceToNow(new Date(server.expires_at), { locale })})</span>
                          </span>
                        )}
                        {!server.is_unlimited && expired && (
                          <span className="text-on-surface-variant/70">
                            {lang === 'tr' ? "Freemium — Top.gg oyu aktif" : "Freemium — Top.gg active"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-surface-container-low/90 border-t border-outline-variant/30 grid grid-cols-2 gap-2">
                    <button 
                      className="w-full flex items-center justify-center gap-1.5 font-label-bold text-xs uppercase tracking-wider text-on-surface-variant border border-outline-variant/50 hover:border-primary-container hover:text-primary-container transition-all py-2 rounded-xl touch-manipulation active:scale-95"
                      onClick={() => openRedeemModal(server.guild_id)}
                    >
                      <Key size={14} /> Redeem
                    </button>
                    <Link 
                      href={`/dashboard/server/${slugify(server.guild_name)}-${server.guild_id}`} 
                      className="w-full flex items-center justify-center gap-1.5 font-label-bold text-xs uppercase tracking-wider bg-primary-container text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all py-2 rounded-xl tactical-glow touch-manipulation"
                    >
                      <Settings size={14} /> {t.dashManageBtn}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- REDEEM MODAL --- */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" 
            onClick={() => setRedeemModalOpen(false)}
          ></div>

          <div className="relative z-10 w-full max-w-md glass-card-native rounded-t-3xl md:rounded-3xl p-6 animate-slide-up border-t md:border border-primary-container/40 shadow-2xl">
            <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-4 md:hidden"></div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container">
                <Key size={18} />
              </div>
              <h2 className="font-headline-lg text-base text-on-surface uppercase tracking-tight font-bold">
                Redeem Code
              </h2>
            </div>
            
            <p className="font-body-md text-xs text-on-surface-variant mb-4 leading-relaxed font-light">
              {lang === 'tr' ? 'Premium kodunuzu girerek sunucunuza hemen lisans tanımlayın.' : 'Enter your premium code to activate or extend your server license.'}
            </p>

            <input 
              type="text" 
              className="w-full bg-surface-container-lowest border border-outline-variant/40 focus:border-primary-container text-on-surface font-mono text-center tracking-widest p-3 rounded-xl mb-4 outline-none transition-all uppercase text-sm font-bold shadow-inner" 
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2">
              <button 
                className="w-full border border-outline-variant/50 text-on-surface-variant font-label-bold text-xs uppercase tracking-wider py-2.5 rounded-xl hover:bg-on-surface/5 transition-colors touch-manipulation active:scale-95"
                onClick={() => setRedeemModalOpen(false)}
              >
                {lang === 'tr' ? 'İptal' : 'Cancel'}
              </button>
              <button 
                className="w-full bg-primary-container text-on-primary font-label-bold text-xs uppercase tracking-wider py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tactical-glow touch-manipulation"
                onClick={handleRedeem}
                disabled={!redeemCode.trim() || redeeming}
              >
                {redeeming ? <Loader2 className="animate-spin" size={16}/> : (lang === 'tr' ? 'Etkinleştir' : 'Activate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
