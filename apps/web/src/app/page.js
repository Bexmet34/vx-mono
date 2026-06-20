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

  const handleManualPurchase = () => {
    if (!selectedServer) return setCheckoutError("Lütfen bir sunucu seçin.");
    if (!senderName || senderName.trim().length < 3) return setCheckoutError("Lütfen kart üzerindeki ismi doğru giriniz.");
    setCheckoutError("");
    
    // Rastgele 8 haneli kod oluştur
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setGeneratedCode(code);
    setManualSuccess(true);
  };

  const handleConfirmManualPayment = async () => {
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
          senderName: senderName.trim(),
          descriptionCode: generatedCode
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setShowCheckout(false);
        alert("Ödeme bildiriminiz başarıyla admin paneline iletildi. Onaylandığında paketiniz aktif olacaktır.");
      } else {
        alert(data.error || "Ödeme oluşturulamadı.");
      }
    } catch (err) {
      alert("Bağlantı hatası.");
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(280px,auto)]">
            <div className="md:col-span-2 glass-panel p-8 md:p-10 flex flex-col justify-end relative overflow-hidden group border border-outline-variant hover:border-primary-container/50 transition-colors">
              <div className="absolute top-8 right-8 text-on-surface-variant/20 group-hover:text-primary-container/20 transition-colors">
                <Users size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-surface border border-outline-variant flex items-center justify-center text-on-surface mb-6">
                  <Users size={24} />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{t.feat1Title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{t.feat1Desc}</p>
              </div>
            </div>
            
            <div className="glass-panel p-8 flex flex-col justify-end relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-surface border border-outline-variant flex items-center justify-center text-on-surface mb-6">
                  <Sword size={24} />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{t.feat2Title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{t.feat2Desc}</p>
              </div>
            </div>
            
            <div className="glass-panel p-8 flex flex-col justify-end relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-surface border border-outline-variant flex items-center justify-center text-on-surface mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{t.feat3Title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{t.feat3Desc}</p>
              </div>
            </div>
            
            <div className="md:col-span-2 glass-panel p-8 md:p-10 flex flex-col justify-end relative overflow-hidden group border border-primary-container/30 bg-primary-container/5 hover:border-primary-container transition-colors">
              <div className="scanline"></div>
              <div className="absolute top-8 right-8 text-primary-container/10 group-hover:text-primary-container/30 transition-colors">
                <Activity size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary-container mb-6 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                  <Activity size={24} />
                </div>
                <h3 className="font-headline-md text-headline-md text-primary-container mb-2">{t.feat4Title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{t.feat4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- BLOG SECTION --- */}
        {blogs.length > 0 && (
          <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-lowest border-y border-on-surface/">
            <div className="max-w-container-max mx-auto">
              <div className="mb-12">
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{t.blogHeaderTitle}</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">{t.blogHeaderDesc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs.slice(0, 3).map((blog, idx) => (
                  <a href={`/blog/${blog.slug}`} key={idx} className="block group">
                    <div className="h-full glass-panel p-8 border border-outline-variant group-hover:border-primary-container/50 transition-colors relative overflow-hidden">
                      <div className="w-10 h-10 bg-surface border border-outline-variant flex items-center justify-center text-primary-container mb-4 group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                        <Star size={20} />
                      </div>
                      <h3 className="font-headline-md text-xl text-on-surface mb-2 line-clamp-2">{blog.title}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">{blog.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --- HOW IT WORKS & FAQ SECTION --- */}
        <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-low border-y border-on-surface/">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-4">{t.faqMainTitle}</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">{t.faqMainDesc}</p>
            </div>

            {/* 3-Step Onboarding */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
              <div className="glass-panel p-8 text-center border border-outline-variant">
                <div className="w-16 h-16 mx-auto bg-surface-container-highest border border-outline flex items-center justify-center text-primary-container mb-6">
                  <span className="font-headline-md">1</span>
                </div>
                <h3 className="font-headline-md text-xl text-on-surface mb-3 uppercase">{t.step1Title}</h3>
                <p className="font-body-md text-sm text-on-surface-variant">{t.step1Desc}</p>
              </div>

              <div className="glass-panel p-8 text-center border border-primary-container/30 bg-primary-container/5 relative overflow-hidden">
                <div className="scanline"></div>
                <div className="w-16 h-16 mx-auto bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary-container mb-6 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                  <span className="font-headline-md">2</span>
                </div>
                <h3 className="font-headline-md text-xl text-on-surface mb-3 uppercase">{t.step2Title}</h3>
                <p className="font-body-md text-sm text-on-surface-variant">{t.step2Desc}</p>
              </div>

              <div className="glass-panel p-8 text-center border border-outline-variant">
                <div className="w-16 h-16 mx-auto bg-surface-container-highest border border-outline flex items-center justify-center text-primary-container mb-6">
                  <span className="font-headline-md">3</span>
                </div>
                <h3 className="font-headline-md text-xl text-on-surface mb-3 uppercase">{t.step3Title}</h3>
                <p className="font-body-md text-sm text-on-surface-variant">{t.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

{/* --- DASHBOARD SHOWCASE SECTION --- */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 bg-surface-container-lowest border-t border-on-surface/20">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-4">
                {lang === 'tr' ? 'Kontrol Paneli (Dashboard)' : 'Dashboard Control Panel'}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                {lang === 'tr' 
                  ? 'Gelişmiş web panelimizle loncanızı kusursuz yönetin. Her özellik ihtiyaçlarınıza göre özel olarak tasarlandı.' 
                  : 'Manage your guild flawlessly with our advanced web panel. Every feature is tailored to your needs.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {[
                { title: "Genel Bakış (Overview)", src: "/mockups/overview.svg", desc: "Abonelik ve sistem durumunuzu tek ekrandan izleyin." },
                { title: "Albion Entegrasyonu (General)", src: "/mockups/general.svg", desc: "Loncanızı saniyeler içinde bağlayıp anında senkronize edin." },
                { title: "Kayıt Sistemi (Registration)", src: "/mockups/registration.svg", desc: "API bağlantılı, otomatik rol veren kayıt ve temizlik sistemi." },
                { title: "Rol Menüsü (Roles)", src: "/mockups/roles.svg", desc: "ZvZ, PvE, Toplayıcı gibi rolleri kategoriler halinde otomatik dağıtın." },
                { title: "Parti Şablonları (Templates)", src: "/mockups/templates.svg", desc: "Sürekli kurduğunuz partilerin kompozisyonunu kaydedip tek tıkla oluşturun." },
                { title: "Özel Erişim (Access/Whitelist)", src: "/mockups/access.svg", desc: "Sadece güvendiğiniz kişilere veya rollere bot komut yetkisi verin." },
                { title: "Otomatik Killboard", src: "/mockups/killboard.svg", desc: "Günlük Kill, Death ve Fame raporlarınızı otomatik olarak Discord'a çekin." },
                { title: "Markalaşma (Branding)", src: "/mockups/visual.svg", desc: "Botun karşılama mesajlarını ve görsellerini sunucunuza göre özelleştirin." }
              ].map((item, idx) => (
                <div key={idx} className="glass-panel overflow-hidden group border border-outline-variant hover:border-primary-container/50 transition-all p-0">
                  <div className="bg-surface-container px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                    <h3 className="font-headline-md text-lg text-on-surface uppercase tracking-tight">{item.title}</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-50"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-50"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-50"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-[#0B0F19] relative">
                    <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <img src={item.src} alt={item.title} className="w-full h-auto rounded-md shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 border border-outline-variant/30" />
                    <p className="mt-6 font-body-md text-on-surface-variant text-center">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

                {/* --- FAQ SECTION --- */}
        <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-low border-y border-on-surface/">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{t.faqTitle2}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { q: t.faqQ1, a: t.faqA1, num: 1 },
                { q: t.faqQ2, a: t.faqA2, num: 2 },
                { q: t.faqQ3, a: t.faqA3, num: 3 },
                { q: t.faqQ4, a: t.faqA4, num: 4 }
              ].map((item, idx) => (
                <div key={idx} className="bg-surface border border-outline-variant p-8 relative overflow-hidden group hover:border-primary-container/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-outline-variant group-hover:bg-primary-container transition-colors"></div>
                  <h3 className="font-headline-md text-lg text-on-surface mb-4 flex items-center gap-4">
                    <span className="text-primary-container font-label-bold opacity-50">0{item.num}</span>
                    {item.q}
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant pl-9 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- COMMANDS SECTION (Komuta Merkezi) --- */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Text */}
            <div className="space-y-8">
              <h2 className="font-headline-xl text-3xl md:text-5xl text-on-surface uppercase tracking-tight">
                {lang === 'tr' ? 'Komuta Merkezi Emrinizde' : 'Command Center at your Command'}
              </h2>
              <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
                {lang === 'tr' 
                  ? 'Basit ama güçlü slash komutlarıyla sunucunuzu bir savaş odasına dönüştürün. Karmaşık bot ayarlarıyla uğraşmayın.' 
                  : 'Transform your server into a war room with simple yet powerful slash commands. No need to mess with complex bot settings.'}
              </p>
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 border border-primary-container flex items-center justify-center text-primary-container shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-body-md text-on-surface"><strong className="text-primary-container font-headline-md uppercase tracking-widest">/help</strong> – {lang === 'tr' ? 'Tüm yeteneklerin listesi' : 'List of all abilities'}</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 border border-primary-container flex items-center justify-center text-primary-container shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-body-md text-on-surface"><strong className="text-primary-container font-headline-md uppercase tracking-widest">/createparty</strong> – {lang === 'tr' ? 'Anında savaşa hazırlık' : 'Instant battle preparation'}</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 border border-primary-container flex items-center justify-center text-primary-container shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-body-md text-on-surface"><strong className="text-primary-container font-headline-md uppercase tracking-widest">/settings</strong> – {lang === 'tr' ? 'Guild ayarlarınızı özelleştirin' : 'Customize your guild settings'}</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Terminal Mockup */}
            <div className="glass-panel border border-outline-variant p-0 overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.05)]">
              {/* Terminal Header */}
              <div className="bg-surface-container-highest px-4 py-3 flex items-center gap-2 border-b border-outline-variant/50">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              {/* Terminal Body */}
              <div className="p-6 md:p-8 font-mono text-sm md:text-base space-y-6 bg-[#0B0F19]">
                <div className="flex gap-4 text-on-surface-variant">
                  <span className="text-on-surface-variant/50 shrink-0">09:12:45</span>
                  <div>
                    <span className="text-on-surface">@Commander:</span> <span className="text-primary-container">/createparty</span> type:ZvZ time:20:00
                  </div>
                </div>
                
                {/* Bot Response Box */}
                <div className="ml-12 md:ml-[4.5rem] bg-surface-container-high border-l-2 border-primary-container p-4 space-y-2">
                  <div className="font-label-bold text-on-surface tracking-widest uppercase">{lang === 'tr' ? 'PARTİ OLUŞTURULDU' : 'PARTY CREATED'}</div>
                  <div className="text-on-surface-variant">{lang === 'tr' ? 'Hedef' : 'Objective'}: Red Zone Castle Fight</div>
                  <div className="text-on-surface-variant">{lang === 'tr' ? 'Durum' : 'Status'}: {lang === 'tr' ? 'Bekleniyor' : 'Waiting'} (0/20)</div>
                </div>

                <div className="flex gap-4 text-on-surface-variant">
                  <span className="text-on-surface-variant/50 shrink-0">09:12:58</span>
                  <div>
                    <span className="text-on-surface">@WarriorX:</span> <span className="text-primary-container">/join</span> slot:Tank
                  </div>
                </div>

                <div className="flex gap-4 text-on-surface-variant">
                  <span className="text-on-surface-variant/50 shrink-0">09:13:02</span>
                  <div>
                    <span className="text-primary-container">Veyronix:</span> @WarriorX {lang === 'tr' ? 'sisteme kayıt edildi.' : 'registered to the system.'}
                  </div>
                </div>
                
                <div className="text-on-surface-variant/50 animate-pulse">_</div>
              </div>
            </div>
          </div>
        </section>


{/* --- PRICING SECTION --- */}
        <section className="px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary-container/5 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-4">{t.pricingTitle}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">{t.pricingSubtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 relative z-10">
            {loadingPlans ? (
              <div className="w-full flex flex-col items-center justify-center py-20 text-primary-container">
                <Loader2 className="animate-spin mb-4" size={48} />
                <span className="font-label-bold uppercase tracking-widest">Veriler Bekleniyor...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="w-full text-center py-20 text-on-surface-variant font-body-lg border border-dashed border-outline-variant">
                Şu anda aktif paket bulunmamaktadır.
              </div>
            ) : plans.map((plan) => {
              const features = lang === 'tr' ? (plan.features_tr || []) : (plan.features_en || []);
              
              return (
                <div key={plan.id} className={`w-full md:w-[320px] flex-shrink-0 glass-panel p-8 flex flex-col relative overflow-hidden border ${plan.is_featured ? 'border-primary-container shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'border-outline-variant hover:border-primary-container/50'} transition-colors`}>
                  {plan.is_featured && (
                    <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl">
                      {t.bestSeller}
                    </div>
                  )}
                  
                  <h3 className="font-headline-md text-xl text-on-surface mb-2 uppercase">{lang === 'tr' ? plan.name_tr : plan.name_en}</h3>
                  <div className="font-headline-xl text-primary-container mb-8 flex items-baseline gap-2">
                    {plan.amount} <span className="font-label-bold text-label-sm text-on-surface-variant">USDT</span>
                  </div>
                  
                  <ul className="flex-grow space-y-4 mb-8">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 font-body-md text-sm text-on-surface-variant">
                        <Star size={16} className="text-primary-container shrink-0 mt-1" /> 
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    className={`w-full py-4 font-label-bold text-label-bold uppercase tracking-widest transition-all active:scale-95 ${plan.is_featured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface border border-outline text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                    onClick={() => handleBuyClick(plan)}
                  >
                    {t.buyNow}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

              </main>

      {/* Checkout Modal (Imperial Conquest Design) */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-background/ backdrop-blur-md" onClick={() => setShowCheckout(false)}></div>
          
          <div className="relative z-10 w-full max-w-2xl my-auto pt-20 pb-10">
            <div className="glass-panel glow-gold flex flex-col p-6 md:p-12 relative border border-primary-container/20">
              {/* Inner Decorative Highlight */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-transparent via-primary-container to-transparent opacity-50"></div>
              
              {/* Close Button */}
              <button 
                className="absolute top-6 right-6 text-on-surface-variant hover:text-error transition-colors"
                onClick={() => setShowCheckout(false)}
              >
                <X size={24} />
              </button>

              {manualSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-slide-up">
                     <div className="relative mb-8 mt-4">
                       <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full scale-150"></div>
                       <CheckCircle size={80} className="text-primary-container relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
                     </div>
                     <h3 className="font-headline-xl text-3xl md:text-4xl text-on-surface uppercase tracking-tight mb-4">Talebini Aldık!</h3>
                     <p className="text-on-surface-variant font-body-lg mb-8 max-w-md">Aşağıdaki IBAN adresine havale/EFT yaparken açıklama kısmına kesinlikle sistemin ürettiği bu kodu yazın.</p>
                     
                     <div className="bg-[#0B0F19] p-6 border border-primary-container/50 rounded-xl mb-8 w-full max-w-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <div className="font-label-bold text-xs text-primary-container uppercase tracking-widest mb-2 opacity-80">Açıklama Kodu (Kesinlikle Yazılmalı)</div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-mono text-3xl md:text-4xl font-bold text-on-surface tracking-[0.2em] break-all">{generatedCode}</div>
                          <button 
                             onClick={() => navigator.clipboard.writeText(generatedCode)}
                             className="p-3 bg-primary-container/10 hover:bg-primary-container text-primary-container hover:text-on-primary transition-all border border-primary-container/30 rounded-lg shrink-0 group"
                             title="Kodu Kopyala"
                          >
                             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        </div>
                     </div>

                     <div className="bg-error/10 border border-error/50 p-5 rounded-lg text-left mb-8 w-full max-w-md relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1 h-full bg-error"></div>
                        <strong className="text-error font-headline-md uppercase text-lg mb-2 tracking-widest flex items-center gap-2">
                           <AlertCircle size={20} /> DİKKAT!
                        </strong>
                        <span className="text-on-surface font-body-md text-sm leading-relaxed opacity-90">
                           Lütfen havale açıklamasına bu kodu yazmayı <strong className="text-error font-bold">kesinlikle unutmayın!</strong> Aksi takdirde otomatik sistemimiz ödemenizi eşleştiremez ve hesabınız onaylanmaz.
                        </span>
                     </div>

                     <div className="w-full max-w-md text-left font-body-md text-sm text-on-surface-variant space-y-3 bg-surface-container-high p-5 rounded-xl border border-outline-variant shadow-inner">
                        <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3">
                           <strong className="text-on-surface uppercase tracking-widest text-xs opacity-70">Banka</strong> 
                           <span className="text-on-surface font-semibold">Örnek Bankası A.Ş.</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-outline-variant/50 pb-3 pt-1">
                           <strong className="text-on-surface uppercase tracking-widest text-xs opacity-70">Alıcı</strong> 
                           <span className="text-on-surface font-semibold">Veyronix Yazılım</span>
                        </div>
                        <div className="pt-2">
                           <strong className="text-on-surface uppercase tracking-widest text-xs opacity-70 block mb-2">IBAN Adresi</strong>
                           <div className="font-mono bg-[#0B0F19] p-3 rounded-lg border border-outline-variant text-on-surface flex justify-between items-center group hover:border-primary-container/50 transition-colors">
                              <span className="tracking-widest">TR12 3456 7890 1234 5678 9012 34</span>
                              <button onClick={() => navigator.clipboard.writeText("TR123456789012345678901234")} className="text-primary-container text-xs hover:underline uppercase font-label-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Kopyala</button>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex gap-4 w-full max-w-md mt-6">
                       <button 
                         onClick={() => setShowCheckout(false)}
                         className="flex-1 px-4 py-3 border border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg font-label-bold uppercase tracking-widest transition-all"
                       >
                         İptal
                       </button>
                       <button 
                         onClick={handleConfirmManualPayment}
                         disabled={isProcessing}
                         className="flex-[2] px-4 py-3 bg-primary-container text-on-primary rounded-lg font-label-bold uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(255,215,0,0.2)] hover:brightness-110 active:scale-95 disabled:opacity-50"
                       >
                         {isProcessing ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
                         Ödemeyi Yaptım
                       </button>
                     </div>
                </div>
              ) : (
                <>
                  <div className="mb-10 text-center mt-4">
                    <span className="inline-block py-1 px-3 mb-4 bg-primary-container text-on-primary font-label-bold text-label-sm tracking-widest uppercase">Premium Deployment</span>
                    <h1 className="font-headline-xl text-3xl md:text-5xl text-on-surface mb-2 uppercase tracking-tight">Upgrade Infrastructure</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Select the strategic asset for {lang === 'tr' ? selectedPlan.name_tr : selectedPlan.name_en} integration.</p>
                  </div>

                  {checkoutError && (
                    <div className="mb-8 p-4 bg-error/10 border border-error text-error font-body-md text-sm">
                      {checkoutError}
                    </div>
                  )}

                  <div className="space-y-8">
                    {/* Section: Server Selection */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end flex-wrap gap-2">
                        <h2 className="font-label-bold text-label-bold text-primary-container uppercase tracking-widest">Target Servers</h2>
                        <a className="font-label-sm text-label-sm text-secondary-fixed hover:text-primary-fixed-dim transition-colors flex items-center gap-1" href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands" target="_blank" rel="noopener noreferrer">
                          <PlusCircle size={16} />
                          Add Bot to New Server
                        </a>
                      </div>
                      
                      {/* Server List Grid */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingServers ? (
                          <div className="flex items-center justify-center p-8 text-primary-container">
                            <Loader2 className="animate-spin mr-3" size={24} />
                            <span className="font-label-bold tracking-widest uppercase">Scanning Assets...</span>
                          </div>
                        ) : userServers.length === 0 ? (
                          <div className="p-8 text-center border border-dashed border-outline-variant text-on-surface-variant">
                            {t.checkoutNoServerText || "No active servers found. Add bot to a server first."}
                          </div>
                        ) : (
                          userServers.map(s => (
                            <label key={s.guild_id} className={`server-row flex items-center justify-between p-4 border cursor-pointer transition-all ${selectedServer === s.guild_id ? 'border-primary-container/50 bg-primary-container/10' : 'border-outline-variant hover:border-outline'}`}>
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-surface-container-high border border-outline flex items-center justify-center overflow-hidden">
                                  {s.icon ? (
                                    <img alt={s.guild_name} className="w-full h-full object-cover" src={`https://cdn.discordapp.com/icons/${s.guild_id}/${s.icon}.png`} />
                                  ) : (
                                    <Server size={20} className="text-on-surface-variant" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-body-md text-body-md font-bold text-on-surface">{s.guild_name}</div>
                                  <div className="font-label-sm text-label-sm text-on-surface-variant">ID: {s.guild_id}</div>
                                </div>
                              </div>
                              <input 
                                checked={selectedServer === s.guild_id} 
                                onChange={() => setSelectedServer(s.guild_id)}
                                className="w-5 h-5 text-primary-container bg-surface border-outline focus:ring-primary-container" 
                                name="server" 
                                type="radio"
                              />
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section: Plan Summary */}
                    <div className="bg-surface-container p-6 border-l-4 border-primary-container">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-label-bold text-label-bold text-on-surface mb-1 uppercase tracking-tight">{lang === 'tr' ? selectedPlan.name_tr : `${selectedPlan.name_en} Package`}</h3>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">Tactical Deployment Tier</p>
                        </div>
                        <div className="text-right">
                          <div className="font-headline-md text-headline-md text-primary-container">{selectedPlan.amount}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">USDT</div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {(lang === 'tr' ? (selectedPlan.features_tr || []) : (selectedPlan.features_en || [])).slice(0,3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                            <CheckCircle size={18} className="text-primary-container shrink-0" /> {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Payment Method Tabs & Action */}
                    <div className="flex gap-4 mb-6">
                      <button 
                        onClick={() => setPaymentMethod('crypto')} 
                        className={`flex-1 py-3 font-label-bold text-sm uppercase transition-all ${paymentMethod === 'crypto' ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-surface border border-outline text-on-surface hover:border-primary-container/50'}`}
                      >
                        Kripto İle Öde
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('havale')} 
                        className={`flex-1 py-3 font-label-bold text-sm uppercase transition-all ${paymentMethod === 'havale' ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-surface border border-outline text-on-surface hover:border-primary-container/50'}`}
                      >
                        Havale / EFT
                      </button>
                    </div>

                    <div className="space-y-4">
                      {paymentMethod === 'crypto' ? (
                        <button 
                          onClick={handleConfirmPurchase}
                          disabled={isProcessing || !selectedServer}
                          className="w-full py-5 px-4 bg-primary-container text-on-primary font-label-bold text-body-md flex items-center justify-center gap-3 transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-[0_10px_20px_rgba(255,215,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-center"
                        >
                          {isProcessing ? (
                            <><Loader2 className="animate-spin shrink-0" size={24} /> INITIALIZING DEPLOYMENT...</>
                          ) : (
                            <><Wallet size={24} className="shrink-0" /> <span>PAY WITH USDT (CRYPTOMUS)</span></>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-4 bg-surface p-6 border border-outline-variant">
                           <div className="text-sm font-body-md text-on-surface-variant mb-4">Banka ödemesi onayının hızlı olması için gönderimi yapacağınız banka hesabının sahibinin adını giriniz.</div>
                           
                           <div className="space-y-2">
                              <label className="font-label-bold text-xs text-on-surface uppercase tracking-widest opacity-70">Kart Üzerindeki İsim (Ad Soyad)</label>
                              <input 
                                type="text" 
                                placeholder="Örn: Ahmet Yılmaz" 
                                className="w-full bg-[#0B0F19] border border-outline-variant p-4 text-on-surface font-body-md focus:border-primary-container outline-none transition-colors"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                              />
                           </div>

                           <button 
                             onClick={handleManualPurchase}
                             disabled={isProcessing || !selectedServer || senderName.trim().length < 3}
                             className="w-full py-5 px-4 bg-primary-container text-on-primary font-label-bold text-body-md flex items-center justify-center gap-3 transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-[0_10px_20px_rgba(255,215,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-center mt-6"
                           >
                             {isProcessing ? (
                               <><Loader2 className="animate-spin shrink-0" size={24} /> İŞLENİYOR...</>
                             ) : (
                               <><span>ÖDEME BİLDİRİMİ YAP</span></>
                             )}
                           </button>
                        </div>
                      )}
                      {paymentMethod === 'crypto' && (
                        <p className="text-center font-label-sm text-label-sm text-on-tertiary-container">
                          Secure cryptographic transaction processed via Cryptomus Terminal.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-8 flex justify-center gap-8 opacity-60 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Lock size={18} className="text-on-surface-variant" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Military-Grade Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-on-surface-variant" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Instant Activation</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
