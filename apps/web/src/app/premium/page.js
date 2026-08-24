"use client";
import { LINKS } from '@veyronix/config';

import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { 
  Settings, CreditCard, Heart, ChevronDown, ChevronUp,
  X, Loader2, CheckCircle, PlusCircle, Server, Lock, Zap, Wallet, Sparkles, Copy, Check
} from "lucide-react";

export default function PremiumPage() {
  const { lang, t } = useLanguage();
  const { supportServer } = usePublicConfig();
  const { data: session, status } = useSession();

  // Accordion State (default open server packages)
  const [openAccordion, setOpenAccordion] = useState('server');

  // Plans & Payment Data
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

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
  const [finalSuccess, setFinalSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setPaymentMethod("crypto");
    setSenderName("");
    setManualSuccess(false);
    setFinalSuccess(false);
    setGeneratedCode("");
    setTermsAccepted(false);
    setShowCheckout(true);
    fetchUserServers();
    fetchBankAccounts();
  };

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch("/api/bank-accounts");
      const data = await res.json();
      if (res.ok) {
        setBankAccounts(data);
        if (data.length > 0) setSelectedBank(data[0]);
      }
    } catch (err) {
      console.error("Banka hesapları yüklenemedi", err);
    }
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
        setCheckoutError(lang === 'tr' ? "Sunucular yüklenemedi." : "Failed to load servers.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError(lang === 'tr' ? "Sunucular yüklenirken bir hata oluştu." : "Error loading servers.");
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleManualPurchase = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) {
      return setCheckoutError(lang === 'tr' ? "Lütfen bir sunucu seçin." : "Please select a server.");
    }
    if (!selectedBank) {
      return setCheckoutError(lang === 'tr' ? "Lütfen bir banka seçin." : "Please select a bank.");
    }
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
          senderName: senderName.trim() || "Belirtilmedi",
          targetBank: selectedBank?.bank_name || "Bilinmiyor"
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedCode(data.description_code);
        setManualSuccess(true);
      } else {
        setCheckoutError(data.error || (lang === 'tr' ? "Ödeme başlatılamadı. Lütfen tekrar deneyin." : "Failed to start payment."));
      }
    } catch (err) {
      setCheckoutError(lang === 'tr' ? "Bağlantı hatası. Lütfen tekrar deneyin." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmManualPayment = async () => {
    if (!senderName || senderName.trim().length < 3) {
      alert(lang === 'tr' ? "Lütfen kart üzerindeki isminizi giriniz." : "Please enter the sender name.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payment/manual-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriptionCode: generatedCode,
          senderName: senderName.trim()
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setFinalSuccess(true);
      } else {
        alert(data.error || (lang === 'tr' ? "Onay işlemi başarısız oldu. Lütfen tekrar deneyin." : "Verification failed."));
      }
    } catch (err) {
      alert(lang === 'tr' ? "Bağlantı hatası." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) {
      return setCheckoutError(lang === 'tr' ? "Lütfen bir sunucu seçin." : "Please select a server.");
    }
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
        setCheckoutError(data.error || (lang === 'tr' ? "Ödeme oluşturulamadı." : "Failed to create payment."));
      }
    } catch (err) {
      setCheckoutError(lang === 'tr' ? "Bağlantı hatası." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'iban') {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <>
      <main className="min-h-screen pt-20 sm:pt-24 md:pt-28 pb-32 px-3.5 sm:px-6 md:px-8 max-w-4xl mx-auto w-full overflow-x-hidden">
        <section className="relative text-center flex flex-col items-center w-full overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm sm:max-w-md h-[250px] bg-primary-container/10 blur-[90px] pointer-events-none rounded-full"></div>
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-label-bold text-xs uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,215,0,0.15)] relative z-10">
            <Sparkles size={14} />
            <span>{lang === 'tr' ? 'Veyronix Premium' : 'Veyronix Premium'}</span>
          </div>

          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl text-on-surface mb-3 font-bold tracking-tight relative z-10">
            {t.premiumTitle}
          </h1>
          
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto mb-8 relative z-10 leading-relaxed font-light">
            {t.premiumSubtitle}
          </p>

          <div className="w-full space-y-4 relative z-10 text-left">
            
            {/* Accordion 1: Sunucu Paketleri (Server Packages) */}
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openAccordion === 'server' ? 'border-primary-container/50 shadow-[0_0_25px_rgba(255,215,0,0.15)] bg-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/70 hover:border-outline-variant/60 hover:bg-surface-container-high/60'}`}>
              <button 
                className="w-full p-4 flex items-center justify-between focus:outline-none group touch-manipulation"
                onClick={() => toggleAccordion('server')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary-container/40 flex items-center justify-center text-primary-container shrink-0 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                    <Server size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-bold">{t.premiumServerTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-light">{t.premiumServerSubtitle}</p>
                  </div>
                </div>
                {openAccordion === 'server' ? <ChevronUp className="text-primary-container shrink-0" size={20} /> : <ChevronDown className="text-on-surface-variant shrink-0" size={20} />}
              </button>
              
              <div className={`px-4 transition-all duration-300 ease-in-out ${openAccordion === 'server' ? 'max-h-[2500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-4 border-t border-outline-variant/30">
                  {loadingPlans ? (
                    <div className="w-full flex flex-col items-center justify-center py-8 text-primary-container gap-2">
                      <Loader2 className="animate-spin" size={32} />
                      <span className="font-label-bold text-xs uppercase tracking-widest">{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</span>
                    </div>
                  ) : plans.filter(p => p.plan_type === 'server' || !p.plan_type).length === 0 ? (
                    <div className="w-full text-center py-6 text-on-surface-variant text-xs border border-dashed border-outline-variant/40 rounded-xl bg-surface/30">
                      {lang === 'tr' ? 'Şu anda aktif sunucu paketi bulunmamaktadır.' : 'No active server packages available.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {plans.filter(p => p.plan_type === 'server' || !p.plan_type).map((plan) => {
                        const features = lang === 'tr' ? (plan.features_tr || []) : (plan.features_en || []);
                        return (
                          <div key={plan.id} className={`w-full flex flex-col p-5 rounded-2xl relative overflow-hidden border ${plan.is_featured ? 'border-primary-container/60 shadow-[0_0_30px_rgba(255,215,0,0.12)] bg-gradient-to-b from-primary-container/10 to-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/80'} transition-all hover:border-primary-container/40`}>
                            {plan.is_featured && (
                              <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl font-black shadow-sm">
                                {t.bestSeller || 'POPÜLER'}
                              </div>
                            )}
                            
                            <h3 className="font-headline-md text-base text-on-surface mb-1 font-bold uppercase tracking-tight">{lang === 'tr' ? plan.name_tr : plan.name_en}</h3>
                            
                            <div className="font-headline-xl text-2xl text-primary-container mb-4 flex items-baseline gap-1.5 font-extrabold">
                              {plan.amount} <span className="font-label-bold text-xs text-on-surface-variant font-medium">USDT</span>
                            </div>
                            
                            <ul className="flex-grow space-y-2.5 mb-5">
                              {features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                                  <CheckCircle size={14} className="text-primary-container shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <button 
                              className={`w-full py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all active:scale-95 touch-manipulation font-bold flex items-center justify-center gap-2 ${plan.is_featured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface-container-highest border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                              onClick={() => handleBuyClick(plan)}
                            >
                              <Zap size={14} className="fill-current" />
                              {t.buyNow || 'HEMEN SATIN AL'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accordion 2: Bireysel Paketler (Individual Space) */}
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openAccordion === 'individual' ? 'border-[#009cde]/50 shadow-[0_0_25px_rgba(0,156,222,0.15)] bg-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/70 hover:border-outline-variant/60 hover:bg-surface-container-high/60'}`}>
              <button 
                className="w-full p-4 flex items-center justify-between focus:outline-none group touch-manipulation"
                onClick={() => toggleAccordion('individual')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#009cde]/15 border border-[#009cde]/40 flex items-center justify-center text-[#009cde] shrink-0 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(0,156,222,0.15)]">
                    <Wallet size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-bold">{t.premiumIndividualTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-light">{t.premiumIndividualSubtitle}</p>
                  </div>
                </div>
                {openAccordion === 'individual' ? <ChevronUp className="text-[#009cde] shrink-0" size={20} /> : <ChevronDown className="text-on-surface-variant shrink-0" size={20} />}
              </button>
              
              <div className={`px-4 transition-all duration-300 ease-in-out ${openAccordion === 'individual' ? 'max-h-[2500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-4 border-t border-outline-variant/30">
                  {loadingPlans ? (
                    <div className="w-full flex flex-col items-center justify-center py-8 text-primary-container gap-2">
                      <Loader2 className="animate-spin" size={32} />
                      <span className="font-label-bold text-xs uppercase tracking-widest">{lang === 'tr' ? 'Yükleniyor...' : 'Loading...'}</span>
                    </div>
                  ) : plans.filter(p => p.plan_type === 'user').length === 0 ? (
                    <div className="w-full text-center py-6 text-on-surface-variant text-xs border border-dashed border-outline-variant/40 rounded-xl bg-surface/30">
                      {lang === 'tr' ? 'Şu anda aktif bireysel paket bulunmamaktadır.' : 'No active personal packages available.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {plans.filter(p => p.plan_type === 'user').map((plan) => {
                        const features = lang === 'tr' ? (plan.features_tr || []) : (plan.features_en || []);
                        return (
                          <div key={plan.id} className={`w-full flex flex-col p-5 rounded-2xl relative overflow-hidden border ${plan.is_featured ? 'border-primary-container/60 shadow-[0_0_30px_rgba(255,215,0,0.12)] bg-gradient-to-b from-primary-container/10 to-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/80'} transition-all hover:border-primary-container/40`}>
                            {plan.is_featured && (
                              <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl font-black shadow-sm">
                                {t.bestSeller || 'POPÜLER'}
                              </div>
                            )}
                            
                            <h3 className="font-headline-md text-base text-on-surface mb-1 font-bold uppercase tracking-tight">{lang === 'tr' ? plan.name_tr : plan.name_en}</h3>
                            
                            <div className="font-headline-xl text-2xl text-primary-container mb-4 flex items-baseline gap-1.5 font-extrabold">
                              {plan.amount} <span className="font-label-bold text-xs text-on-surface-variant font-medium">USDT</span>
                            </div>
                            
                            <ul className="flex-grow space-y-2.5 mb-5">
                              {features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                                  <CheckCircle size={14} className="text-primary-container shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <button 
                              className={`w-full py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all active:scale-95 touch-manipulation font-bold flex items-center justify-center gap-2 ${plan.is_featured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface-container-highest border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                              onClick={() => handleBuyClick(plan)}
                            >
                              <Zap size={14} className="fill-current" />
                              {t.buyNow || 'HEMEN SATIN AL'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accordion 3: Top.gg Ücretsiz Oy (Voting) */}
            <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openAccordion === 'vote' ? 'border-[#5865F2]/50 shadow-[0_0_25px_rgba(88,101,242,0.15)] bg-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/70 hover:border-outline-variant/60 hover:bg-surface-container-high/60'}`}>
              <button 
                className="w-full p-4 flex items-center justify-between focus:outline-none group touch-manipulation"
                onClick={() => toggleAccordion('vote')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] shrink-0 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(88,101,242,0.15)]">
                    <Heart size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-bold">{t.premiumVoteTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-light">{t.premiumVoteSubtitle}</p>
                  </div>
                </div>
                {openAccordion === 'vote' ? <ChevronUp className="text-[#5865F2] shrink-0" size={20} /> : <ChevronDown className="text-on-surface-variant shrink-0" size={20} />}
              </button>
              
              <div className={`px-4 transition-all duration-300 ease-in-out ${openAccordion === 'vote' ? 'max-h-[800px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-4 border-t border-outline-variant/30 space-y-3">
                  <p className="text-xs text-on-surface-variant leading-relaxed">{t.premiumVoteDesc1}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{t.premiumVoteDesc2}</p>
                  
                  <div className="pt-2">
                    <h4 className="font-bold text-xs text-on-surface mb-1">{t.premiumVoteHowTo}</h4>
                    <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{t.premiumVoteHowToDesc}</p>
                    
                    <a 
                      href="https://top.gg/bot/1082239904169336902/vote" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
                    >
                      <Heart size={14} className="fill-current" />
                      <span>Top.gg Üzerinden Oy Ver</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL (FULL RESPONSIVE & MOBILE FRIENDLY) */}
      {/* ========================================================================= */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setShowCheckout(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl bg-[#080C18] border-t sm:border border-primary-container/30 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-slide-up">
            <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full mx-auto mb-4 sm:hidden"></div>

            <button 
              className="absolute top-5 right-5 p-2 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant hover:text-error transition-colors"
              onClick={() => setShowCheckout(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {finalSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 px-2 text-center animate-slide-up">
                <div className="relative mb-3 mt-2">
                  <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full scale-150"></div>
                  <CheckCircle size={64} className="text-primary-container relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
                </div>
                <h3 className="font-headline-xl text-xl sm:text-2xl text-on-surface uppercase tracking-tight mb-2 font-bold">
                  {lang === 'tr' ? 'Talebinizi Aldık!' : 'Payment Submitted!'}
                </h3>
                <p className="text-on-surface-variant text-xs sm:text-sm mb-6 max-w-md leading-relaxed font-light">
                  {lang === 'tr' 
                    ? 'Ödeme bildiriminiz başarıyla sistemimize ulaştı. Kontrol edilip onaylandığında paketiniz otomatik olarak tanımlanacaktır.' 
                    : 'Your payment notification has been received. Once confirmed, your subscription will be activated automatically.'}
                </p>
                
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-2.5 bg-primary-container text-on-primary rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:brightness-110 active:scale-95 font-bold"
                >
                  {lang === 'tr' ? 'Tamam / Kapat' : 'Close'}
                </button>
              </div>
            ) : manualSuccess ? (
              <div className="animate-slide-up w-full text-left">
                <div className="text-center mb-5">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container text-[10px] font-label-bold uppercase tracking-widest mb-2">
                    {lang === 'tr' ? 'Adım 2 / 2' : 'Step 2 / 2'}
                  </span>
                  <h3 className="font-headline-xl text-lg sm:text-xl text-on-surface uppercase tracking-tight font-bold">
                    {lang === 'tr' ? 'Güvenli Havale / EFT Akışı' : 'Bank Transfer Instructions'}
                  </h3>
                  <p className="text-on-surface-variant text-xs mt-1">
                    {lang === 'tr' ? 'Lütfen ödemenizi tamamlamak için aşağıdaki bilgileri kullanın.' : 'Please follow the instructions below to complete your transfer.'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {/* Bank Info Card */}
                  <div className="bg-surface-container-high/60 p-4 rounded-2xl border border-outline-variant/40 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                      <span className="font-bold text-xs text-on-surface">{selectedPlan?.name_tr || selectedPlan?.name_en || "Premium"}</span>
                      <span className="text-primary-container font-headline-xl text-base font-bold">
                        {((selectedPlan?.amount || 0) * (parseFloat(process.env.NEXT_PUBLIC_USDT_TRY_RATE) || 40)).toLocaleString('tr-TR')} TL
                      </span>
                    </div>

                    <div className="text-xs text-on-surface-variant space-y-2">
                      <div className="flex justify-between"><span className="text-on-surface-variant/70">Banka:</span> <span className="font-semibold text-on-surface">{selectedBank?.bank_name}</span></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant/70">Alıcı:</span> <span className="font-semibold text-on-surface">{selectedBank?.account_holder}</span></div>
                      
                      <div className="pt-1">
                        <div className="text-on-surface-variant/70 mb-1">IBAN Numarası:</div>
                        <div className="font-mono text-xs bg-[#060913] p-2.5 rounded-xl border border-outline-variant/40 text-on-surface flex justify-between items-center gap-2">
                          <span className="truncate">{selectedBank?.iban}</span>
                          <button 
                            onClick={() => copyToClipboard(selectedBank?.iban || "", 'iban')} 
                            className="px-2.5 py-1 rounded-lg bg-primary-container/15 hover:bg-primary-container text-primary-container hover:text-on-primary text-[10px] font-bold uppercase transition-colors shrink-0 flex items-center gap-1"
                          >
                            {copiedIban ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedIban ? 'Kopyalandı' : 'Kopyala'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Code Warning Box */}
                  <div className="bg-primary-container/10 p-3.5 border border-primary-container/40 rounded-2xl shadow-lg">
                    <div className="font-label-bold text-[11px] text-primary-container uppercase tracking-wider mb-1">
                      {lang === 'tr' ? 'Açıklama Kodu (Zorunlu)' : 'Transfer Reference Code (Required)'}
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="font-mono text-sm font-bold text-on-surface tracking-widest break-all bg-black/40 px-3 py-1.5 rounded-xl border border-primary-container/30">
                        {generatedCode}
                      </div>
                      <button 
                        onClick={() => copyToClipboard(generatedCode, 'code')} 
                        className="px-3 py-1.5 bg-primary-container text-on-primary rounded-xl shrink-0 text-xs font-bold uppercase transition-colors flex items-center gap-1 active:scale-95"
                      >
                        {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedCode ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-error font-semibold">
                      {lang === 'tr' ? '⚠️ Banka transferi yaparken açıklama kısmına SADECE bu kodu yazınız!' : '⚠️ Put ONLY this code in the payment description field!'}
                    </p>
                  </div>

                  {/* Sender Name Form */}
                  <div>
                    <label className="font-label-bold text-xs text-on-surface uppercase opacity-80 mb-1.5 block">
                      {lang === 'tr' ? 'Ödemeyi Yapan Ad Soyad' : 'Sender Full Name'}
                    </label>
                    <input 
                      type="text" 
                      placeholder={lang === 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe'} 
                      value={senderName} 
                      onChange={(e) => setSenderName(e.target.value)} 
                      className="w-full bg-[#060913] border border-outline-variant/50 p-3 text-on-surface text-xs rounded-xl focus:border-primary-container outline-none transition-colors" 
                    />
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={termsAccepted} 
                      onChange={(e) => setTermsAccepted(e.target.checked)} 
                      className="mt-0.5 w-4 h-4 rounded text-primary-container shrink-0 cursor-pointer" 
                    />
                    <span className="text-[11px] text-on-surface-variant leading-relaxed">
                      {lang === 'tr' ? 'Mesafeli satış ve kullanım sözleşmesini okudum, kabul ediyorum.' : 'I accept the terms of service and purchase conditions.'}
                    </span>
                  </label>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => setShowCheckout(false)} 
                      className="py-2.5 border border-outline-variant/40 text-on-surface-variant hover:text-on-surface rounded-xl text-xs uppercase font-bold transition-colors active:scale-95"
                    >
                      {lang === 'tr' ? 'İptal' : 'Cancel'}
                    </button>
                    <button 
                      onClick={handleConfirmManualPayment} 
                      disabled={isProcessing || senderName.trim().length < 3 || !termsAccepted} 
                      className="py-2.5 bg-primary-container text-on-primary rounded-xl text-xs uppercase font-bold disabled:opacity-40 transition-all flex items-center justify-center gap-2 tactical-glow active:scale-95"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={16} /> : (lang === 'tr' ? 'Ödemeyi Yaptım' : 'I Have Paid')}
                    </button>
                  </div>
                </div>
              </div>
            
            ) : (
              <div className="text-left space-y-4">
                {/* Modal Header */}
                <div className="text-center mb-4">
                  <span className="inline-block py-0.5 px-2.5 mb-2 bg-primary-container/15 border border-primary-container/30 text-primary-container font-label-bold text-[10px] tracking-widest uppercase rounded-full">
                    {lang === 'tr' ? 'Ödeme Yapılandırması' : 'Checkout'}
                  </span>
                  <h2 className="font-headline-xl text-lg sm:text-xl text-on-surface font-bold uppercase tracking-tight">
                    {lang === 'tr' ? selectedPlan.name_tr : selectedPlan.name_en}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 font-light">
                    {lang === 'tr' ? 'Paketin tanımlanacağı hedefi ve ödeme yöntemini seçin.' : 'Select target server and payment method.'}
                  </p>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-error/10 border border-error/40 text-error font-body-md text-xs rounded-xl text-center">
                    {checkoutError}
                  </div>
                )}

                {/* Server Selection (if server plan) */}
                {selectedPlan?.plan_type !== 'user' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-label-bold text-xs text-primary-container uppercase tracking-wider">
                        {lang === 'tr' ? 'Hedef Sunucu' : 'Target Server'}
                      </span>
                      <a 
                        className="text-[11px] text-primary-container/90 hover:underline flex items-center gap-1" 
                        href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <PlusCircle size={13} />
                        <span>{lang === 'tr' ? 'Yeni Sunucu Ekle' : 'Add Bot to Guild'}</span>
                      </a>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar bg-[#060913] p-2 rounded-2xl border border-outline-variant/30">
                      {status !== "authenticated" ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                          <p className="text-on-surface-variant text-xs">
                            {lang === 'tr' ? 'Sunucularınızı görmek için giriş yapmalısınız.' : 'Please sign in to view your servers.'}
                          </p>
                          <button 
                            onClick={() => signIn("discord")} 
                            className="py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-colors text-xs uppercase"
                          >
                            Discord ile Giriş Yap
                          </button>
                        </div>
                      ) : isLoadingServers ? (
                        <div className="flex items-center justify-center py-6 text-primary-container gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          <span className="font-label-bold text-xs uppercase tracking-widest">{lang === 'tr' ? 'Sunucular Taranıyor...' : 'Scanning Servers...'}</span>
                        </div>
                      ) : userServers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-on-surface-variant">
                          {t.checkoutNoServerText || (lang === 'tr' ? 'Yönetici olduğunuz sunucu bulunamadı. Lütfen önce botu sunucunuza ekleyin.' : 'No active servers found.')}
                        </div>
                      ) : (
                        userServers.map(s => (
                          <label 
                            key={s.guild_id} 
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${selectedServer === s.guild_id ? 'border-primary-container/60 bg-primary-container/15' : 'border-outline-variant/30 hover:border-outline-variant/60 bg-surface-container-high/40'}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-surface-container-highest border border-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                                {s.icon ? (
                                  <img alt={s.guild_name} className="w-full h-full object-cover" src={`https://cdn.discordapp.com/icons/${s.guild_id}/${s.icon}.png`} />
                                ) : (
                                  <Server size={14} className="text-on-surface-variant" />
                                )}
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-bold text-on-surface truncate">{s.guild_name}</div>
                                <div className="text-[10px] text-on-surface-variant/70">ID: {s.guild_id}</div>
                              </div>
                            </div>
                            <input 
                              checked={selectedServer === s.guild_id} 
                              onChange={() => setSelectedServer(s.guild_id)}
                              className="w-4 h-4 text-primary-container bg-surface border-outline focus:ring-primary-container shrink-0 ml-2" 
                              name="server" 
                              type="radio"
                            />
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Price & Summary Box */}
                <div className="bg-surface-container-high/60 p-3.5 rounded-2xl border border-outline-variant/40 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-on-surface">{lang === 'tr' ? selectedPlan.name_tr : selectedPlan.name_en}</div>
                    <div className="text-[10px] text-on-surface-variant">
                      {paymentMethod === 'havale' ? 'Havale / EFT ile Ödeme' : 'Cryptomus USDT Payment'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-headline-xl text-lg font-bold text-primary-container">
                      {paymentMethod === 'havale' 
                        ? `${((selectedPlan?.amount || 0) * (parseFloat(process.env.NEXT_PUBLIC_USDT_TRY_RATE) || 40)).toLocaleString('tr-TR')} TL` 
                        : `${selectedPlan?.amount} USDT`}
                    </div>
                  </div>
                </div>

                {/* Payment Method Switcher */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPaymentMethod('crypto')} 
                      className={`py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all touch-manipulation flex items-center justify-center gap-1.5 ${paymentMethod === 'crypto' ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.25)] font-bold' : 'bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant'}`}
                    >
                      <Wallet size={14} />
                      <span>Kripto (USDT)</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('havale')} 
                      className={`py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all touch-manipulation flex items-center justify-center gap-1.5 ${paymentMethod === 'havale' ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.25)] font-bold' : 'bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant'}`}
                    >
                      <CreditCard size={14} />
                      <span>Havale / EFT</span>
                    </button>
                  </div>

                  {status !== "authenticated" ? (
                    <button 
                      onClick={() => signIn("discord")}
                      className="w-full py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-label-bold text-xs flex items-center justify-center gap-2 transition-all rounded-xl uppercase tracking-wider shadow-lg active:scale-95 mt-3"
                    >
                      <span>Discord ile Giriş Yap</span>
                    </button>
                  ) : paymentMethod === 'crypto' ? (
                    <button 
                      onClick={handleConfirmPurchase}
                      disabled={isProcessing || (selectedPlan?.plan_type !== 'user' && !selectedServer)}
                      className="w-full py-3 bg-primary-container text-on-primary font-label-bold text-xs flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase rounded-xl tracking-wider font-bold tactical-glow mt-3"
                    >
                      {isProcessing ? (
                        <><Loader2 className="animate-spin shrink-0" size={16} /> ÖDEME OLUŞTURULUYOR...</>
                      ) : (
                        <><Wallet size={16} className="shrink-0" /> <span>USDT İLE ÖDE (CRYPTOMUS)</span></>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3 bg-[#060913] p-3.5 border border-outline-variant/40 rounded-2xl mt-3">
                      {bankAccounts.length === 0 ? (
                        <div className="text-xs text-error">Şu anda aktif banka hesabı bulunmuyor. Lütfen kripto ödemesini kullanın.</div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="font-label-bold text-xs text-on-surface uppercase tracking-wider opacity-80">Ödeme Yapılacak Banka</label>
                            <select 
                              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl p-2.5 text-on-surface text-xs focus:border-primary-container outline-none transition-colors"
                              value={selectedBank?.id || ""}
                              onChange={(e) => setSelectedBank(bankAccounts.find(b => b.id === e.target.value))}
                            >
                              {bankAccounts.map(b => (
                                <option key={b.id} value={b.id}>{b.bank_name} ({b.account_holder})</option>
                              ))}
                            </select>
                          </div>

                          <button 
                            onClick={handleManualPurchase}
                            disabled={isProcessing || (selectedPlan?.plan_type !== 'user' && !selectedServer) || !selectedBank}
                            className="w-full py-3 bg-primary-container text-on-primary font-label-bold text-xs flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase rounded-xl tracking-wider font-bold tactical-glow"
                          >
                            {isProcessing ? (
                              <><Loader2 className="animate-spin shrink-0" size={16} /> İŞLENİYOR...</>
                            ) : (
                              <><span>HAVALE BİLGİLERİNİ GÖSTER</span></>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="pt-2 flex justify-center items-center gap-4 text-on-surface-variant/60 text-[10px] flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} />
                    <span>256-Bit SSL Şifreleme</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} />
                    <span>Anında Otomatik Tanımlama</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
