"use client";
import { LINKS } from '@veyronix/config';

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { 
  Settings, CreditCard, Heart, ChevronDown, ChevronUp,
  X, Loader2, CheckCircle, PlusCircle, Server, Lock, Zap, Wallet 
} from "lucide-react";

export default function PremiumPage() {
  const { lang, t } = useLanguage();
  const { supportServer } = usePublicConfig();
  const { data: session, status } = useSession();

  // Accordion State
  const [openAccordion, setOpenAccordion] = useState(null);

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
      console.error("Banka hesaplarÄ± yÃ¼klenemedi", err);
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
        setCheckoutError("Sunucular yÃ¼klenemedi.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError("Sunucular yÃ¼klenirken bir hata oluÅŸtu.");
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleManualPurchase = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) return setCheckoutError("LÃ¼tfen bir sunucu seÃ§in.");
    if (!selectedBank) return setCheckoutError("LÃ¼tfen bir banka seÃ§in.");
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
        setCheckoutError(data.error || "Ã–deme baÅŸlatÄ±lamadÄ±. LÃ¼tfen tekrar deneyin.");
      }
    } catch (err) {
      setCheckoutError("BaÄŸlantÄ± hatasÄ±. LÃ¼tfen tekrar deneyin.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmManualPayment = async () => {
    if (!senderName || senderName.trim().length < 3) {
      alert("LÃ¼tfen kart Ã¼zerindeki isminizi giriniz.");
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
        alert(data.error || "Onay iÅŸlemi baÅŸarÄ±sÄ±z oldu. LÃ¼tfen tekrar deneyin.");
      }
    } catch (err) {
      alert("BaÄŸlantÄ± hatasÄ±.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) return setCheckoutError("LÃ¼tfen bir sunucu seÃ§in.");
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
        setCheckoutError(data.error || "Ã–deme oluÅŸturulamadÄ±.");
      }
    } catch (err) {
      setCheckoutError("BaÄŸlantÄ± hatasÄ±.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 min-h-screen pb-20 px-2 md:px-0">
        <section className="relative max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-container/5 blur-[120px] pointer-events-none rounded-full"></div>
          
          <h1 className="font-headline-xl text-4xl md:text-5xl text-on-surface mb-2 font-bold tracking-tight z-10">
            {t.premiumTitle}
          </h1>
          
          <p className="font-body-md text-on-surface-variant max-w-lg mx-auto mb-3 z-10">
            {t.premiumSubtitle}
          </p>

          <div className="w-full space-y-4 z-10 text-left">
            
            {/* Accordion 1: Voting */}
            <div className={`glass-panel border rounded-lg transition-all duration-300 overflow-hidden ${openAccordion === 'vote' ? 'border-[#5865F2] shadow-[0_0_20px_rgba(88,101,242,0.15)] bg-surface-container-high' : 'border-outline-variant bg-surface-container-low hover:border-outline-variant/80 hover:bg-surface-container-high'}`}>
              <button 
                className="w-full p-3 flex items-center justify-between focus:outline-none group"
                onClick={() => toggleAccordion('vote')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 rounded-md bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center transition-transform group-hover:scale-105">
                    <Settings className="text-[#5865F2]" size={14} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-headline-md text-[10px] text-on-surface font-bold">{t.premiumVoteTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{t.premiumVoteSubtitle}</p>
                  </div>
                </div>
                {openAccordion === 'vote' ? <ChevronUp className="text-on-surface-variant" /> : <ChevronDown className="text-on-surface-variant" />}
              </button>
              
              <div className={`px-3 transition-all duration-300 ease-in-out ${openAccordion === 'vote' ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-4 border-t border-outline-variant/50">
                  <p className="text-[10px] text-on-surface-variant mb-2">{t.premiumVoteDesc1}</p>
                  <p className="text-[10px] text-on-surface-variant mb-3">{t.premiumVoteDesc2}</p>
                  
                  <h4 className="font-bold text-on-surface mb-2">{t.premiumVoteHowTo}</h4>
                  <p className="text-[10px] text-on-surface-variant mb-2">{t.premiumVoteHowToDesc}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <a href="https://top.gg/bot/1082239904169336902/vote" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md font-bold text-[10px] transition-all shadow-lg hover:shadow-xl active:scale-95">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.3 14h-1.6l-.3-1.6h-2.8L10.3 16H8.7L11 6.5h2l2.3 9.5zm-3.5-3.2h2l-1-4.1-1 4.1z" />
                      </svg>
                      top.gg
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion 2: Individual Packages */}
            <div className={`glass-panel border rounded-lg transition-all duration-300 overflow-hidden ${openAccordion === 'individual' ? 'border-[#009cde] shadow-[0_0_20px_rgba(0,156,222,0.15)] bg-surface-container-high' : 'border-outline-variant bg-surface-container-low hover:border-outline-variant/80 hover:bg-surface-container-high'}`}>
              <button 
                className="w-full p-3 flex items-center justify-between focus:outline-none group"
                onClick={() => toggleAccordion('individual')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 rounded-md bg-[#009cde]/10 border border-[#009cde]/30 flex items-center justify-center transition-transform group-hover:scale-105">
                    <Wallet className="text-[#009cde]" size={14} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-headline-md text-[10px] text-on-surface font-bold">{t.premiumIndividualTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{t.premiumIndividualSubtitle}</p>
                  </div>
                </div>
                {openAccordion === 'individual' ? <ChevronUp className="text-on-surface-variant" /> : <ChevronDown className="text-on-surface-variant" />}
              </button>
              
              <div className={`px-3 transition-all duration-300 ease-in-out ${openAccordion === 'individual' ? 'max-h-[1500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-4 border-t border-outline-variant/50">
                  {loadingPlans ? (
                    <div className="w-full flex flex-col items-center justify-center py-1 text-primary-container">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <span className="font-label-bold text-xs uppercase tracking-widest">YÃ¼kleniyor...</span>
                    </div>
                  ) : plans.filter(p => p.plan_type === 'user').length === 0 ? (
                    <div className="w-full text-center py-1 text-on-surface-variant font-body-sm border border-dashed border-outline-variant rounded-md bg-surface/30">
                      Åžu anda aktif paket bulunmamaktadÄ±r.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {plans.filter(p => p.plan_type === 'user').map((plan) => {
                        const features = lang === 'tr' ? (plan.features_tr || []) : (plan.features_en || []);
                        return (
                          <div key={plan.id} className={`w-full flex flex-col p-2 rounded-md relative overflow-hidden border ${plan.is_featured ? 'border-primary-container shadow-[0_0_15px_rgba(255,215,0,0.05)] bg-primary-container/5' : 'border-outline-variant bg-surface-container-low'} transition-all hover:border-primary-container/30`}>
                            {plan.is_featured && (
                              <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-bl">
                                {t.bestSeller}
                              </div>
                            )}
                            
                            <h3 className="font-headline-md text-xs text-on-surface mb-1 uppercase">{lang === 'tr' ? plan.name_tr : plan.name_en}</h3>
                            <div className="font-headline-md text-primary-container mb-2 flex items-baseline gap-1">
                              {plan.amount} <span className="font-label-bold text-[10px] text-on-surface-variant">USDT</span>
                            </div>
                            
                            <ul className="flex-grow space-y-2 mb-3">
                              {features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 font-body-md text-xs text-on-surface-variant">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0 mt-1.5 shadow-[0_0_5px_rgba(255,215,0,0.5)]"></div> 
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <button 
                              className={`w-full py-1.5 rounded font-label-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.is_featured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface-container-highest border border-outline text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                              onClick={() => handleBuyClick(plan)}
                            >
                              {t.buyNow}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Accordion 3: Server Packages */}
            <div className={`glass-panel border rounded-lg transition-all duration-300 overflow-hidden ${openAccordion === 'server' ? 'border-[#ffbd2e] shadow-[0_0_20px_rgba(255,189,46,0.15)] bg-surface-container-high' : 'border-outline-variant bg-surface-container-low hover:border-outline-variant/80 hover:bg-surface-container-high'}`}>
              <button 
                className="w-full p-3 flex items-center justify-between focus:outline-none group"
                onClick={() => toggleAccordion('server')}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 rounded-md bg-[#ffbd2e]/10 border border-[#ffbd2e]/30 flex items-center justify-center transition-transform group-hover:scale-105">
                    <Server className="text-[#ffbd2e]" size={14} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-headline-md text-[10px] text-on-surface font-bold">{t.premiumServerTitle}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{t.premiumServerSubtitle}</p>
                  </div>
                </div>
                {openAccordion === 'server' ? <ChevronUp className="text-on-surface-variant" /> : <ChevronDown className="text-on-surface-variant" />}
              </button>
              
              <div className={`px-3 transition-all duration-300 ease-in-out ${openAccordion === 'server' ? 'max-h-[1500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="pt-4 border-t border-outline-variant/50">
                  {loadingPlans ? (
                    <div className="w-full flex flex-col items-center justify-center py-1 text-primary-container">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <span className="font-label-bold text-xs uppercase tracking-widest">YÃ¼kleniyor...</span>
                    </div>
                  ) : plans.filter(p => p.plan_type === 'server' || !p.plan_type).length === 0 ? (
                    <div className="w-full text-center py-1 text-on-surface-variant font-body-sm border border-dashed border-outline-variant rounded-md bg-surface/30">
                      Åžu anda aktif paket bulunmamaktadÄ±r.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {plans.filter(p => p.plan_type === 'server' || !p.plan_type).map((plan) => {
                        const features = lang === 'tr' ? (plan.features_tr || []) : (plan.features_en || []);
                        return (
                          <div key={plan.id} className={`w-full flex flex-col p-2 rounded-md relative overflow-hidden border ${plan.is_featured ? 'border-primary-container shadow-[0_0_15px_rgba(255,215,0,0.05)] bg-primary-container/5' : 'border-outline-variant bg-surface-container-low'} transition-all hover:border-primary-container/30`}>
                            {plan.is_featured && (
                              <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-bl">
                                {t.bestSeller}
                              </div>
                            )}
                            
                            <h3 className="font-headline-md text-xs text-on-surface mb-1 uppercase">{lang === 'tr' ? plan.name_tr : plan.name_en}</h3>
                            <div className="font-headline-md text-primary-container mb-2 flex items-baseline gap-1">
                              {plan.amount} <span className="font-label-bold text-[10px] text-on-surface-variant">USDT</span>
                            </div>
                            
                            <ul className="flex-grow space-y-2 mb-3">
                              {features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2 font-body-md text-xs text-on-surface-variant">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container shrink-0 mt-1.5 shadow-[0_0_5px_rgba(255,215,0,0.5)]"></div> 
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <button 
                              className={`w-full py-1.5 rounded font-label-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.is_featured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface-container-highest border border-outline text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                              onClick={() => handleBuyClick(plan)}
                            >
                              {t.buyNow}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-2 overflow-y-auto">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowCheckout(false)}></div>
          
          <div className="relative z-10 w-full max-w-4xl my-auto py-1.5">
            <div className="glass-panel glow-gold flex flex-col p-2 md:p-2 relative border border-primary-container/20">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-transparent via-primary-container to-transparent opacity-50"></div>
              
              <button 
                className="absolute top-6 right-6 text-on-surface-variant hover:text-error transition-colors"
                onClick={() => setShowCheckout(false)}
              >
                <X size={16} />
              </button>

              {finalSuccess ? (
                <div className="flex flex-col items-center justify-center py-1 px-2 text-center animate-slide-up">
                     <div className="relative mb-2 mt-2">
                       <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-full scale-150"></div>
                       <CheckCircle size={80} className="text-primary-container relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
                     </div>
                     <h3 className="font-headline-xl text-lg md:text-4xl text-on-surface uppercase tracking-tight mb-2">Talebini AldÄ±k!</h3>
                     <p className="text-on-surface-variant font-body-lg mb-2 max-w-md">Ã–deme bildiriminiz baÅŸarÄ±yla admin paneline ulaÅŸtÄ±. Ekiplerimiz kontrol edip onayladÄ±ÄŸÄ±nda paketiniz otomatik olarak hesabÄ±nÄ±za tanÄ±mlanacaktÄ±r.</p>
                     
                     <button 
                       onClick={() => setShowCheckout(false)}
                       className="px-2 py-1 bg-primary-container text-on-primary rounded-lg font-label-bold uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(255,215,0,0.2)] hover:brightness-110 active:scale-95"
                     >
                       Kapat
                     </button>
                </div>
              ) : manualSuccess ? (
                <div className="animate-slide-up w-full">
                  <div className="text-center mb-3">
                    <h3 className="font-headline-xl text-xs md:text-[10px] text-on-surface uppercase tracking-tight mb-2">GÃ¼venli Havale / EFT AkÄ±ÅŸÄ±</h3>
                    <p className="text-on-surface-variant font-body-md text-xs">LÃ¼tfen Ã¶demenizi tamamlamak iÃ§in aÅŸaÄŸÄ±daki adÄ±mlarÄ± izleyin.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div className="space-y-4">
                      <div className="bg-surface-container p-2 rounded-xl border border-outline-variant text-left">
                         <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-[10px] text-on-surface">{selectedPlan?.name_tr || "Premium Paket"}</span>
                            <span className="text-primary-container font-headline-md text-[10px]">
                               {(selectedPlan?.amount * (parseFloat(process.env.NEXT_PUBLIC_USDT_TRY_RATE) || 40)).toLocaleString('tr-TR')} TL
                            </span>
                         </div>
                         <div className="text-xs text-on-surface-variant space-y-2 border-t border-outline-variant/50 pt-3">
                            <div className="flex justify-between"><span>Banka:</span> <span className="font-semibold text-on-surface">{selectedBank?.bank_name}</span></div>
                            <div className="flex justify-between"><span>AlÄ±cÄ±:</span> <span className="font-semibold text-on-surface">{selectedBank?.account_holder}</span></div>
                            <div className="pt-1">
                               <div className="mb-1">IBAN Adresi:</div>
                               <div className="font-mono bg-[#0B0F19] p-2 rounded border border-outline-variant text-on-surface flex justify-between items-center">
                                  <span>{selectedBank?.iban}</span>
                                  <button onClick={() => navigator.clipboard.writeText(selectedBank?.iban || "")} className="text-primary-container hover:underline uppercase font-bold">Kopyala</button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-[#0B0F19]/30 border border-outline-variant/20 p-3 rounded-xl text-left text-xs text-on-surface-variant space-y-1">
                         <p>âš¡ <strong>Onay SÃ¼resi:</strong> 5-15 dakika (gece saatlerinde 1 saat).</p>
                         <p>ðŸ’¬ Destek iÃ§in <a href={supportServer} target="_blank" rel="noopener noreferrer" className="text-primary-container hover:underline">Discord&apos;a katÄ±lÄ±n</a>.</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="bg-[#0B0F19] p-2 border border-primary-container/40 rounded-xl shadow-lg">
                         <div className="font-label-bold text-xs text-primary-container uppercase mb-2">AÃ§Ä±klama Kodu (Zorunlu)</div>
                         <div className="flex items-center justify-between gap-2 mb-2">
                           <div className="font-mono text-[10px] md:text-[10px] font-bold text-on-surface tracking-widest break-all">{generatedCode}</div>
                           <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="px-3 py-1 bg-primary-container/10 hover:bg-primary-container text-primary-container hover:text-on-primary border border-primary-container/30 rounded-lg shrink-0 text-xs font-bold uppercase transition-colors">
                              Kopyala
                           </button>
                         </div>
                         <p className="text-[10px] text-error font-semibold">Bu kod dÄ±ÅŸÄ±nda aÃ§Ä±klama kÄ±smÄ±na HÄ°Ã‡BÄ°R ÅžEY yazmayÄ±nÄ±z!</p>
                      </div>

                      <div>
                         <label className="font-label-bold text-xs text-on-surface uppercase opacity-70 mb-1 block">Ã–demeyi Yapan (Ad Soyad)</label>
                         <input type="text" placeholder="Ã–rn: Ahmet YÄ±lmaz" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full bg-[#0B0F19] border border-outline-variant p-3 text-on-surface text-[10px] focus:border-primary-container outline-none rounded-lg" />
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer select-none">
                         <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 text-primary-container shrink-0" />
                         <span className="text-xs text-on-surface-variant leading-tight">
                           SÃ¶zleÅŸmeleri kabul ediyorum.
                         </span>
                      </label>

                      <div className="flex gap-1">
                        <button onClick={() => setShowCheckout(false)} className="flex-1 py-1.5 border border-outline-variant text-on-surface-variant hover:text-on-surface rounded-lg text-xs uppercase font-bold transition-colors">Ä°ptal</button>
                        <button onClick={handleConfirmManualPayment} disabled={isProcessing || senderName.trim().length < 3 || !termsAccepted} className="flex-[2] py-1.5 bg-primary-container text-on-primary rounded-lg text-xs uppercase font-bold disabled:opacity-40 transition-colors">
                          {isProcessing ? "Ä°ÅŸleniyor..." : "Ã–demeyi YaptÄ±m"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              
              ) : (
                <>
                  <div className="mb-2 text-center mt-2">
                    <span className="inline-block py-0.5 px-2 mb-2 bg-primary-container text-on-primary font-label-bold text-[10px] tracking-widest uppercase">Premium Deployment</span>
                    <h2 className="font-headline-xl text-[10px] md:text-lg text-on-surface mb-1 uppercase tracking-tight">Upgrade Infrastructure</h2>
                    <p className="font-body-md text-[10px] text-on-surface-variant">Select the strategic asset for {lang === 'tr' ? selectedPlan.name_tr : selectedPlan.name_en} integration.</p>
                  </div>

                  {checkoutError && (
                    <div className="mb-2 p-2 bg-error/10 border border-error text-error font-body-md text-[10px]">
                      {checkoutError}
                    </div>
                  )}

                  <div className={selectedPlan?.plan_type !== 'user' ? "grid grid-cols-1 md:grid-cols-2 gap-1 items-stretch" : "space-y-4"}>
                    {selectedPlan?.plan_type !== 'user' && (
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex justify-between items-end flex-wrap gap-2">
                        <h2 className="font-label-bold text-label-bold text-primary-container uppercase tracking-widest">Target Servers</h2>
                        <a className="font-label-sm text-label-sm text-secondary-fixed hover:text-primary-fixed-dim transition-colors flex items-center gap-1" href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands" target="_blank" rel="noopener noreferrer">
                          <PlusCircle size={16} />
                          Add Bot to New Server
                        </a>
                      </div>
                      
                      <div className="space-y-2 max-h-64 md:max-h-full overflow-y-auto pr-2 custom-scrollbar flex-grow bg-surface/30 p-2 rounded border border-outline-variant/30">
                        {status !== "authenticated" ? (
                          <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                            <p className="text-on-surface-variant font-body-md mb-2 text-[10px]">SunucularÄ±nÄ±zÄ± gÃ¶rmek iÃ§in giriÅŸ yapmalÄ±sÄ±nÄ±z.</p>
                            <button onClick={() => signIn("discord")} className="py-1 px-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded transition-colors text-[10px] uppercase">Discord ile GiriÅŸ Yap</button>
                          </div>
                        ) : isLoadingServers ? (
                          <div className="flex items-center justify-center h-full p-2 text-primary-container">
                            <Loader2 className="animate-spin mr-3" size={16} />
                            <span className="font-label-bold tracking-widest uppercase">Scanning Assets...</span>
                          </div>
                        ) : userServers.length === 0 ? (
                          <div className="p-2 text-center h-full flex items-center justify-center border border-dashed border-outline-variant text-on-surface-variant">
                            {t.checkoutNoServerText || "No active servers found. Add bot to a server first."}
                          </div>
                        ) : (
                          userServers.map(s => (
                            <label key={s.guild_id} className={`server-row flex items-center justify-between p-3 border cursor-pointer transition-all ${selectedServer === s.guild_id ? 'border-primary-container/50 bg-primary-container/10' : 'border-outline-variant hover:border-outline'}`}>
                              <div className="flex items-center gap-1">
                                <div className="w-10 h-7 bg-surface-container-high border border-outline flex items-center justify-center overflow-hidden rounded-md">
                                  {s.icon ? (
                                    <img alt={s.guild_name} className="w-full h-full object-cover" src={`https://cdn.discordapp.com/icons/${s.guild_id}/${s.icon}.png`} />
                                  ) : (
                                    <Server size={14} className="text-on-surface-variant" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-body-md text-[10px] font-bold text-on-surface">{s.guild_name}</div>
                                  <div className="font-label-sm text-xs text-on-surface-variant">ID: {s.guild_id}</div>
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
                    )}

                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="bg-surface-container p-2 border-l-4 border-primary-container mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-label-bold text-[10px] text-on-surface mb-1 uppercase tracking-tight">{lang === 'tr' ? selectedPlan.name_tr : `${selectedPlan.name_en} Package`}</h3>
                          <p className="font-label-sm text-xs text-on-surface-variant">Tactical Deployment Tier</p>
                        </div>
                        <div className="text-right">
                          <div className="font-headline-md text-headline-md text-primary-container">
                            {paymentMethod === 'havale' ? (selectedPlan.amount * (parseFloat(process.env.NEXT_PUBLIC_USDT_TRY_RATE) || 40)).toLocaleString('tr-TR') : selectedPlan.amount}
                          </div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">
                            {paymentMethod === 'havale' ? 'TL' : 'USDT'}
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {(lang === 'tr' ? (selectedPlan.features_tr || []) : (selectedPlan.features_en || [])).slice(0,3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                            <CheckCircle size={14} className="text-primary-container shrink-0" /> {feat}
                          </li>
                        ))}
                      </ul>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-4">
                        <div className="flex gap-2">
                      <button 
                        onClick={() => setPaymentMethod('crypto')} 
                        className={`flex-1 py-1.5 font-label-bold text-[10px] uppercase transition-all rounded-md ${paymentMethod === 'crypto' ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-surface border border-outline text-on-surface hover:border-primary-container/50'}`}
                      >
                        Kripto Ä°le Ã–de
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('havale')} 
                        className={`flex-1 py-1.5 font-label-bold text-[10px] uppercase transition-all rounded-md ${paymentMethod === 'havale' ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-surface border border-outline text-on-surface hover:border-primary-container/50'}`}
                      >
                        Havale / EFT
                      </button>
                    </div>

                    <div className="space-y-4">
                      {status !== "authenticated" ? (
                        <button 
                          onClick={() => signIn("discord")}
                          className="w-full py-1 px-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-label-bold text-body-md flex items-center justify-center gap-1 transition-all duration-300 shadow-[0_10px_20px_rgba(88,101,242,0.2)] uppercase text-center rounded-md"
                        >
                          <span>Discord Ä°le GiriÅŸ Yap</span>
                        </button>
                      ) : paymentMethod === 'crypto' ? (
                        <button 
                          onClick={handleConfirmPurchase}
                          disabled={isProcessing || (selectedPlan?.plan_type !== 'user' && !selectedServer)}
                          className="w-full py-1 px-2 bg-primary-container text-on-primary font-label-bold text-body-md flex items-center justify-center gap-1 transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-[0_10px_20px_rgba(255,215,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-center rounded-md"
                        >
                          {isProcessing ? (
                            <><Loader2 className="animate-spin shrink-0" size={16} /> INITIALIZING DEPLOYMENT...</>
                          ) : (
                            <><Wallet size={16} className="shrink-0" /> <span>PAY WITH USDT (CRYPTOMUS)</span></>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-4 bg-surface p-3 border border-outline-variant rounded-md">
                           {bankAccounts.length === 0 ? (
                             <div className="text-[10px] font-body-md text-error mb-2">Åžu anda havale ile Ã¶deme kabul edilmiyor. LÃ¼tfen kripto Ã¶demesini kullanÄ±n.</div>
                           ) : (
                             <>
                               <div className="text-[10px] font-body-md text-on-surface-variant mb-2">Ã–deme adÄ±mÄ±na geÃ§mek iÃ§in iÅŸlem yapacaÄŸÄ±nÄ±z bankayÄ± seÃ§in ve aÅŸaÄŸÄ±daki butona tÄ±klayÄ±n. Havale/EFT bilgileri bir sonraki adÄ±mda gÃ¶sterilecektir.</div>
                               
                               <div className="space-y-2 mb-2">
                                  <label className="font-label-bold text-xs text-on-surface uppercase tracking-widest opacity-70">Ã–deme YapÄ±lacak Banka</label>
                                  <select 
                                    className="w-full bg-[#0B0F19] border border-outline-variant rounded-md p-2 text-on-surface font-body-md focus:border-primary-container outline-none transition-colors"
                                    value={selectedBank?.id || ""}
                                    onChange={(e) => setSelectedBank(bankAccounts.find(b => b.id === e.target.value))}
                                  >
                                    {bankAccounts.map(b => (
                                      <option key={b.id} value={b.id}>{b.bank_name}</option>
                                    ))}
                                  </select>
                               </div>

                               <button 
                                 onClick={handleManualPurchase}
                                 disabled={isProcessing || (selectedPlan?.plan_type !== 'user' && !selectedServer) || !selectedBank}
                                 className="w-full py-1 px-2 bg-primary-container text-on-primary font-label-bold text-body-md flex items-center justify-center gap-1 transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-[0_10px_20px_rgba(255,215,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed uppercase text-center mt-2 rounded-md"
                               >
                                 {isProcessing ? (
                                   <><Loader2 className="animate-spin shrink-0" size={16} /> Ä°ÅžLENÄ°YOR...</>
                                 ) : (
                                   <><span>Ã–DEME SAYFASINA GEÃ‡</span></>
                                 )}
                               </button>
                             </>
                           )}
                        </div>
                      )}
                      {paymentMethod === 'crypto' && (
                        <p className="text-center font-label-sm text-label-sm text-on-tertiary-container mt-2">
                          Secure cryptographic transaction processed via Cryptomus Terminal.
                        </p>
                      )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center gap-2 opacity-60 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-on-surface-variant" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Military-Grade Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-on-surface-variant" />
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

