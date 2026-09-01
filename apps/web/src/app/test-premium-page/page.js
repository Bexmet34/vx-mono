"use client";
import { LINKS } from '@veyronix/config';
import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { useEffect, useState, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { 
  CreditCard, ChevronDown, ChevronUp, X, Loader2, CheckCircle, 
  PlusCircle, Server, Zap, Wallet, Sparkles, AlertCircle, ShieldCheck
} from "lucide-react";

export default function TestPremiumPage() {
  const { lang, t } = useLanguage();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [openAccordion, setOpenAccordion] = useState('server');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Modal & Shopier States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  
  // Custom PAT Test input
  const [shopierPat, setShopierPat] = useState("");
  
  // Frame Modal State
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [frameData, setFrameData] = useState(null);
  const formRef = useRef(null);

  // Status from URL
  const paymentStatus = searchParams.get('payment');

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
    setShowCheckout(true);
    setCheckoutError("");
    fetchUserServers();
  };

  const fetchUserServers = async () => {
    setIsLoadingServers(true);
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) setUserServers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingServers(false);
    }
  };

  const handleShopierPay = async () => {
    if (selectedPlan?.plan_type !== 'user' && !selectedServer) {
      return setCheckoutError("Lütfen bir sunucu seçin.");
    }
    setCheckoutError("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/shopier-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedServer,
          planId: selectedPlan.id,
          shopierPat: shopierPat.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFrameData(data);
        setShowCheckout(false);
        setShowFrameModal(true);

        // Auto submit form into iframe
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.submit();
          }
        }, 300);

      } else {
        setCheckoutError(data.error || "Shopier oturumu başlatılamadı.");
      }
    } catch (err) {
      setCheckoutError("Bağlantı hatası oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-32 px-4 max-w-4xl mx-auto w-full">
      
      {/* TEST BANNER */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-amber-400 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-sm text-amber-200 uppercase tracking-wide">Shopier Siteden Ayrılmadan Ödeme Test Sayfası</h4>
            <p className="text-xs text-amber-300/80">Bu sayfa Shopier Kredi Kartı iFrame ve Otomatik Aktivasyon testi için özel açılmıştır.</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold shrink-0">TEST MODE</span>
      </div>

      {paymentStatus === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl mb-8 text-center animate-slide-up">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-emerald-200 uppercase">Ödeme Başarıyla Tamamlandı!</h3>
          <p className="text-xs text-emerald-300/80 mt-1">Sunucunuza Premium paketi otomatik olarak tanımlandı ve Discord botuna aktarıldı.</p>
        </div>
      )}

      {/* Main Section */}
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface mb-3">Shopier Kart İle Ödeme Testi</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mb-8 max-w-lg mx-auto">
          Aşağıdaki paketlerden birini seçip sitemizden **hiç ayrılmadan** Shopier Kredi Kartı ödemesini test edebilirsiniz.
        </p>

        {/* Server Packages Accordion */}
        <div className="rounded-2xl border border-primary-container/40 bg-surface-container-high/90 p-5 text-left mb-6">
          <h3 className="font-bold text-base text-on-surface mb-4 flex items-center gap-2">
            <Server className="text-primary-container" size={20} />
            <span>Sunucu Premium Paketleri</span>
          </h3>

          {loadingPlans ? (
            <div className="flex items-center justify-center py-8 text-primary-container gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Paketler yükleniyor...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.filter(p => p.plan_type === 'server' || !p.plan_type).map((plan) => (
                <div key={plan.id} className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/80 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-base text-on-surface uppercase mb-1">{plan.name_tr}</h4>
                    <div className="text-2xl font-extrabold text-primary-container mb-3">
                      {((plan.amount || 0) * 40).toLocaleString('tr-TR')} TL <span className="text-xs text-on-surface-variant font-normal">({plan.amount} USDT)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleBuyClick(plan)}
                    className="w-full py-2.5 bg-primary-container text-on-primary font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all mt-4"
                  >
                    <CreditCard size={16} />
                    <span>Shopier Kart İle Öde</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CHECKOUT MODAL */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCheckout(false)}></div>
          
          <div className="relative z-10 w-full max-w-lg bg-[#080C18] border border-primary-container/30 rounded-3xl p-6 shadow-2xl">
            <button className="absolute top-5 right-5 p-2 text-on-surface-variant hover:text-error" onClick={() => setShowCheckout(false)}>
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-on-surface uppercase mb-1">{selectedPlan.name_tr}</h3>
            <p className="text-xs text-on-surface-variant mb-4">Shopier kart ödemesi başlatılacak.</p>

            {checkoutError && <div className="p-3 mb-3 bg-error/10 border border-error/40 text-error text-xs rounded-xl">{checkoutError}</div>}

            {/* Server Selection */}
            {selectedPlan?.plan_type !== 'user' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-primary-container uppercase block mb-2">Hedef Sunucu</label>
                <div className="space-y-2 max-h-36 overflow-y-auto bg-[#060913] p-2 rounded-xl border border-outline-variant/30">
                  {status !== "authenticated" ? (
                    <button onClick={() => signIn("discord")} className="w-full py-2 bg-[#5865F2] text-white text-xs font-bold rounded-xl">Discord ile Giriş Yap</button>
                  ) : userServers.map(s => (
                    <label key={s.guild_id} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${selectedServer === s.guild_id ? 'border-primary-container bg-primary-container/10' : 'border-outline-variant/30'}`}>
                      <span className="text-xs font-bold text-on-surface">{s.guild_name}</span>
                      <input type="radio" name="server" checked={selectedServer === s.guild_id} onChange={() => setSelectedServer(s.guild_id)} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Box */}
            <div className="bg-surface-container-high p-3 rounded-xl border border-outline-variant/30 flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-on-surface">Ödenecek Tutar</span>
              <span className="text-lg font-bold text-primary-container">{((selectedPlan?.amount || 0) * 40).toLocaleString('tr-TR')} TL</span>
            </div>

            <button 
              onClick={handleShopierPay}
              disabled={isProcessing || (selectedPlan?.plan_type !== 'user' && !selectedServer)}
              className="w-full py-3 bg-primary-container text-on-primary font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16} /> <span>SİTEDEN AYRILMADAN ÖDEMEYİ BAŞLAT</span></>}
            </button>
          </div>
        </div>
      )}

      {/* SHOPIER IFRAME MODAL (SİTEDEN AYRILMADAN ÖDEME FORMU) */}
      {showFrameModal && frameData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowFrameModal(false)}></div>

          <div className="relative z-10 w-full max-w-xl bg-[#080C18] border border-primary-container/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
            <div className="p-4 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary-container" size={20} />
                <span className="font-bold text-xs text-on-surface uppercase tracking-wider">Shopier 256-bit SSL Güvenli Kart Ödemesi</span>
              </div>
              <button onClick={() => setShowFrameModal(false)} className="p-1.5 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-error">
                <X size={18} />
              </button>
            </div>

            {/* Hidden Auto-Submit Form */}
            <form 
              ref={formRef} 
              action={frameData.action_url} 
              method="POST" 
              target="shopier_iframe"
              className="hidden"
            >
              {Object.entries(frameData.fields).map(([key, val]) => (
                <input key={key} type="hidden" name={key} value={val} />
              ))}
            </form>

            {/* Shopier iFrame */}
            <div className="flex-grow w-full h-full relative bg-white">
              <iframe 
                name="shopier_iframe" 
                className="w-full h-full border-0"
                title="Shopier Ödeme Formu"
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
