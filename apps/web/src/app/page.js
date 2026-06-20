"use client";

import Navbar from "@/components/Navbar";
import { Shield, Users, Sword, Command, Star, MessageCircle, Zap, Activity, HelpCircle, Eye, Server, BadgeCheck, X, Loader2, PlusCircle, CheckCircle, Wallet, Lock, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState, useRef } from "react";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { lang, t } = useLanguage();
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const { data: session, status } = useSession();
  const [gifs, setGifs] = useState([]);
  const [serverCount, setServerCount] = useState(0);

  const { data: session, status } = useSession();
  const [gifs, setGifs] = useState([]);
  const [serverCount, setServerCount] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [publicServers, setPublicServers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  
  // Checkout Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [senderName, setSenderName] = useState("");
  const [manualSuccess, setManualSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleBuyClick = (plan) => {
    if (status !== "authenticated") {
      signIn("discord");
      return;
    }
    setSelectedPlan(plan);
    setPaymentMethod("crypto");
    setSenderName("");
    setManualSuccess(false);
    setGeneratedCode("");
    setShowCheckout(true);
    fetchUserServers();
  };

  const fetchUserServers = async () => {
    setIsLoadingServers(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setUserServers(data);
      } else {
        setCheckoutError("Sunucular yüklenemedi.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError("Sunucular yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleManualPurchase = async () => {
    if (!selectedServer) return setCheckoutError("Lütfen bir sunucu seçin.");
    if (!senderName || senderName.trim().length < 3) return setCheckoutError("Lütfen kart üzerindeki ismi doğru giriniz.");
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const serverDetails = userServers.find(s => s.guild_id === selectedServer);
      const res = await fetch("/api/payment/manual-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          guildId: selectedServer, 
          guildName: serverDetails?.guild_name || "Bilinmeyen Sunucu",
          planId: selectedPlan.id,
          senderName: senderName.trim()
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setGeneratedCode(data.description_code);
        setManualSuccess(true);
      } else {
        setCheckoutError(data.error || "Ödeme oluşturulamadı.");
      }
    } catch (err) {
      setCheckoutError("Bağlantı hatası.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedServer) return setCheckoutError("Lütfen bir sunucu seçin.");
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guildId: selectedServer, planId: selectedPlan.id })
      });
      const data = await res.json();
      
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setCheckoutError(data.error || "Ödeme oluşturulamadı.");
      }
    } catch (err) {
      setCheckoutError("Bağlantı hatası.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetch('/api/gifs')
      .then(res => res.json())
      .then(data => setGifs(data))
      .catch(console.error);

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setServerCount(data.count || 0))
      .catch(console.error);

    fetch('/api/campaigns/active')
      .then(res => res.json())
      .then(data => setActiveCampaigns(data.filter(c => c.show_on_home)))
      .catch(console.error);

    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoadingPlans(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPlans(false);
      });

    fetch('/api/servers/public')
      .then(res => res.json())
      .then(data => setPublicServers(data))
      .catch(console.error);

    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(console.error);
  }, []);

  const renderGif = (cmdName) => {
    if (gifs.includes(cmdName)) {
      return (
        <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-1 bg-surface-container-high border border-outline-variant z-50 shadow-2xl">
          <img src={`/gif/${cmdName}.gif`} alt={`${cmdName} command`} className="w-full h-auto" />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        {/* --- HERO SECTION --- */}
        <section className="relative px-margin-mobile md:px-margin-desktop py-20 max-w-container-max mx-auto text-center flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary-container/5 blur-[120px] pointer-events-none rounded-full"></div>
          
          
          <h1 className="font-headline-xl text-4xl md:text-6xl text-on-surface mb-6 max-w-4xl mx-auto uppercase tracking-tight leading-tight">
            {t.heroTitle1} <br className="hidden md:block" />
            <span className="text-primary-container drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">{t.heroTitle2}</span>
          </h1>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
            {t.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-primary-container text-on-primary px-8 py-4 font-label-bold text-label-bold uppercase tracking-widest transition-all duration-300 active:scale-95 hover:brightness-110 tactical-glow rounded-sm flex items-center justify-center gap-2"
            >
              <Zap size={20} className="fill-current" />
              {t.heroBtn}
            </a>
            <a
              href="https://top.gg/bot/1082239904169336902"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-surface-container-high border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container px-8 py-4 font-label-bold text-label-bold uppercase tracking-widest transition-all duration-300 active:scale-95 rounded-sm flex items-center justify-center gap-2"
            >
              <Star size={20} className="fill-current" />
              {t.topggBtn ?? ("top.gg'de Oyla")}
            </a>
            <a
              href="https://discord.gg/D6T3t4beqa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-transparent border border-on-surface/ text-on-surface hover:bg-on-surface/ px-8 py-4 font-label-bold text-label-bold uppercase tracking-widest transition-all duration-300 active:scale-95 rounded-sm flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              {t.supportBtn}
            </a>
          </div>
        </section>

        {/* --- MARQUEE SOCIAL PROOF --- */}
        {publicServers.length > 0 && (
          <section className="py-12 border-y border-on-surface/ bg-surface-container-low overflow-hidden">
            <h3 className="text-center font-label-bold text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-8">
              {t.marqueeTitle}
            </h3>
            <div className="relative flex overflow-x-hidden w-full group">
              <div className="animate-marquee flex whitespace-nowrap items-center gap-12 px-6">
                {[...publicServers, ...publicServers, ...publicServers].map((server, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-surface-container-high px-4 py-2 border border-on-surface/">
                    <Server size={18} className="text-primary-container" />
                    <span className="font-label-bold text-on-surface">{server.length > 20 ? server.substring(0, 17) + '...' : server}</span>
                    <BadgeCheck size={18} className="text-[#e9c400]" />
                  </div>
                ))}
              </div>
              <div className="absolute top-0 animate-marquee2 flex whitespace-nowrap items-center gap-12 px-6">
                {[...publicServers, ...publicServers, ...publicServers].map((server, idx) => (
                  <div key={`dup-${idx}`} className="flex items-center gap-3 bg-surface-container-high px-4 py-2 border border-on-surface/">
                    <Server size={18} className="text-primary-container" />
                    <span className="font-label-bold text-on-surface">{server.length > 20 ? server.substring(0, 17) + '...' : server}</span>
                    <BadgeCheck size={18} className="text-[#e9c400]" />
                  </div>
                ))}
              </div>
            </div>
            <style jsx>{`
              .animate-marquee { animation: marquee 195s linear infinite; }
              .animate-marquee2 { animation: marquee2 195s linear infinite; }
              @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
              @keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
            `}</style>
          </section>
        )}

        {/* --- ACTIVE CAMPAIGNS --- */}
        {activeCampaigns.length > 0 && (
          <section className="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((camp, idx) => (
                <div key={camp.id} className="glass-panel p-8 relative overflow-hidden group hover:border-primary-container transition-colors duration-500">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/10 blur-3xl rounded-full group-hover:bg-primary-container/20 transition-all"></div>
                  <div className="w-12 h-12 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-6">
                    <Star size={24} className="fill-current" />
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-3">{lang === 'tr' ? camp.title_tr : camp.title_en}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">{lang === 'tr' ? camp.description_tr : camp.description_en}</p>
                  <a 
                    href="https://discord.gg/D6T3t4beqa" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-transparent border border-primary-container text-primary-container px-6 py-2 font-label-bold text-label-bold uppercase tracking-widest transition-all hover:bg-primary-container hover:text-on-primary"
                  >
                    {t.promoBtn}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- BENTO GRID FEATURES --- */}
        <section className="px-margin-mobile md:px-margin-desktop py-20 max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-4">{t.featuresSectionTitle}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">{t.featuresSectionDesc}</p>
          </div>
          
          {/* Promotional Video */}
          <div className="mb-20 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.15)] border border-primary-container/30 relative group cursor-pointer" onClick={toggleMute}>
            <div className="absolute inset-0 bg-primary-container/10 mix-blend-overlay pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
            
            {/* Custom Sound Toggle Overlay */}
            <div className="absolute bottom-4 right-4 z-10 bg-black/60 hover:bg-primary-container hover:text-on-primary text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center gap-2">
              {isVideoMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              <span className="font-label-bold text-sm hidden md:block">{isVideoMuted ? (lang === 'tr' ? 'Sesi Aç' : 'Unmute') : (lang === 'tr' ? 'Sesi Kapat' : 'Mute')}</span>
            </div>

            <video 
              ref={videoRef}
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-auto object-cover"
              poster="/mockups/video_intro_1.svg"
            >
              <source src="/videos/tanitim.mp4" type="video/mp4" />
              Tarayıcınız video etiketini desteklemiyor.
            </video>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-on-surface-variant" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Military-Grade Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-on-surface-variant" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Instant Activation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
