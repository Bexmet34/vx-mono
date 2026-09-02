"use client";
import { LINKS } from '@veyronix/config';
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { 
  CreditCard, X, Loader2, CheckCircle, Server, ShieldCheck, Zap, ChevronDown, ChevronUp, Sparkles, Heart
} from "lucide-react";

export default function TestPremiumPage() {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Veritabanındaki Planlar
  const [dbPlans, setDbPlans] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  // Modal States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(false);

  // Accordion State
  const [openAccordion, setOpenAccordion] = useState('server');

  // Ödeme Popup State
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    // Veritabanındaki (Admin Panelinden Eklenen) Gerçek Planları Çek
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbPlans(data);
        } else if (data.data && Array.isArray(data.data)) {
          setDbPlans(data.data);
        } else {
          setDbPlans([]);
          setProductError(data.error || "Paket bulunamadı.");
        }
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error(err);
        setProductError("Paketler yüklenirken hata oluştu.");
        setLoadingProducts(false);
      });
  }, []);

  const serverPlans = dbPlans.filter(p => !p.plan_type || p.plan_type === 'server');
  const userPlans = dbPlans.filter(p => p.plan_type === 'user');

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
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
    if (!selectedServer && selectedProduct.plan_type !== 'user') {
      return setCheckoutError("Lütfen bir sunucu seçin.");
    }
    setCheckoutError("");
    setIsProcessing(true);

    try {
      // Eğer veritabanındaki pakette shopier_url varsa Shopier Popup tetikle
      if (selectedProduct.shopier_url) {
        setShowCheckout(false);
        setPaymentDone(false);
        setPaymentPending(true);

        const popup = window.open(
          selectedProduct.shopier_url,
          'shopier-odeme',
          'width=820,height=720,left=200,top=100,resizable=yes,scrollbars=yes'
        );

        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setPaymentPending(false);
            setPaymentDone(true);
          }
        }, 1000);
      } else {
        setCheckoutError("Bu paket için Shopier ödeme bağlantısı bulunamadı. Lütfen yönetici ile iletişime geçin.");
      }
    } catch (err) {
      setCheckoutError("Bağlantı hatası oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };


  return (
    <main className="min-h-screen pt-24 pb-32 px-4 max-w-4xl mx-auto w-full">
      
      {/* TEST BANNER */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-sm text-emerald-200 uppercase tracking-wide">Shopier Mağaza Ürünleri Canlı Entegrasyonu</h4>
            <p className="text-xs text-emerald-300/80">Shopier mağazanızdaki gerçek ürünler listeleniyor.</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold shrink-0">CANLI</span>
      </div>

      {paymentStatus === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl mb-8 text-center animate-slide-up">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-emerald-200 uppercase">Ödeme Başarıyla Tamamlandı!</h3>
          <p className="text-xs text-emerald-300/80 mt-1">Sunucunuza Premium paketi otomatik olarak tanımlandı.</p>
        </div>
      )}

      {/* Main Section */}
      <section className="relative text-center flex flex-col items-center w-full overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm sm:max-w-md h-[250px] bg-primary-container/10 blur-[90px] pointer-events-none rounded-full"></div>
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-label-bold text-xs uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,215,0,0.15)] relative z-10">
          <Sparkles size={14} />
          <span>Veyronix Premium (Shopier)</span>
        </div>

        <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl text-on-surface mb-3 font-bold tracking-tight relative z-10">
          Sunucunuza Güç Katın
        </h1>
        
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto mb-8 relative z-10 leading-relaxed font-light">
          Shopier altyapısı ile saniyeler içinde premium özelliklerin kilidini açın.
        </p>

        <div className="w-full space-y-4 relative z-10 text-left">
          {/* Accordion 1: Sunucu Paketleri */}
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
                  <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-bold">Sunucu Paketleri</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 font-light">Sunucunuzdaki tüm kullanıcılar için premium özellikler</p>
                </div>
              </div>
              {openAccordion === 'server' ? <ChevronUp className="text-primary-container shrink-0" size={20} /> : <ChevronDown className="text-on-surface-variant shrink-0" size={20} />}
            </button>
            
            <div className={`px-4 transition-all duration-300 ease-in-out ${openAccordion === 'server' ? 'max-h-[2500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="pt-4 border-t border-outline-variant/30">
                {loadingProducts ? (
                  <div className="w-full flex flex-col items-center justify-center py-8 text-primary-container gap-2">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="font-label-bold text-xs uppercase tracking-widest">Shopier Ürünleri Yükleniyor...</span>
                  </div>
                ) : productError ? (
                  <div className="w-full text-center py-6 text-error text-xs border border-dashed border-error/40 rounded-xl bg-error/10">
                    {productError}
                  </div>
                ) : serverPlans.length === 0 ? (
                  <div className="w-full text-center py-6 text-on-surface-variant text-xs border border-dashed border-outline-variant/40 rounded-xl bg-surface/30">
                    Şu anda aktif Sunucu paketi bulunmamaktadır.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {serverPlans.map((product) => {
                      const features = product.features_tr || [];
                      const isFeatured = product.is_featured;
                      
                      return (
                        <div key={product.id} className={`w-full flex flex-col p-5 rounded-2xl relative overflow-hidden border ${isFeatured ? 'border-primary-container/60 shadow-[0_0_30px_rgba(255,215,0,0.12)] bg-gradient-to-b from-primary-container/10 to-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/80'} transition-all hover:border-primary-container/40`}>
                          {isFeatured && (
                            <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl font-black shadow-sm">
                              POPÜLER
                            </div>
                          )}
                          
                          <h3 className="font-headline-md text-base text-on-surface mb-1 font-bold uppercase tracking-tight">{product.name_tr || product.name_en || product.id}</h3>
                          
                          <div className="font-headline-xl text-2xl text-primary-container mb-4 flex items-baseline gap-1.5 font-extrabold">
                            {product.amount} <span className="font-label-bold text-xs text-on-surface-variant font-medium">TL</span>
                          </div>
                          
                          <ul className="flex-grow space-y-2.5 mb-5">
                            {features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                                <CheckCircle size={14} className="text-primary-container shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                            {/* Eğer özellik yoksa Shopier'dan gelen gün süresini yaz */}
                            {features.length === 0 && product.duration_days && (
                               <li className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                                 <CheckCircle size={14} className="text-primary-container shrink-0 mt-0.5" />
                                 <span>{product.duration_days >= 365 ? '1 Yıl Geçerli' : `${Math.round(product.duration_days / 30)} Ay Geçerli`}</span>
                               </li>
                            )}
                          </ul>
                          
                          <button 
                            className={`w-full py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all active:scale-95 touch-manipulation font-bold flex items-center justify-center gap-2 ${isFeatured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface-container-highest border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                            onClick={() => handleBuyClick(product)}
                          >
                            <CreditCard size={14} className="fill-current" />
                            {product.shopier_url ? 'SHOPIER İLE SATIN AL' : 'SATIN AL'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accordion 2: Bireysel Paketler */}
          <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openAccordion === 'user' ? 'border-primary-container/50 shadow-[0_0_25px_rgba(255,215,0,0.15)] bg-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/70 hover:border-outline-variant/60 hover:bg-surface-container-high/60'}`}>
            <button 
              className="w-full p-4 flex items-center justify-between focus:outline-none group touch-manipulation"
              onClick={() => toggleAccordion('user')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary-container/40 flex items-center justify-center text-primary-container shrink-0 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                  <Heart size={18} />
                </div>
                <div className="text-left">
                  <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-bold">Bireysel Paketler</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 font-light">Kendi hesabınıza özel premium ayrıcalıklar</p>
                </div>
              </div>
              {openAccordion === 'user' ? <ChevronUp className="text-primary-container shrink-0" size={20} /> : <ChevronDown className="text-on-surface-variant shrink-0" size={20} />}
            </button>
            
            <div className={`px-4 transition-all duration-300 ease-in-out ${openAccordion === 'user' ? 'max-h-[2500px] pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="pt-4 border-t border-outline-variant/30">
                {loadingProducts ? (
                  <div className="w-full flex flex-col items-center justify-center py-8 text-primary-container gap-2">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="font-label-bold text-xs uppercase tracking-widest">Yükleniyor...</span>
                  </div>
                ) : productError ? (
                  <div className="w-full text-center py-6 text-error text-xs border border-dashed border-error/40 rounded-xl bg-error/10">
                    {productError}
                  </div>
                ) : userPlans.length === 0 ? (
                  <div className="w-full text-center py-6 text-on-surface-variant text-xs border border-dashed border-outline-variant/40 rounded-xl bg-surface/30">
                    Şu anda aktif Bireysel paket bulunmamaktadır.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {userPlans.map((product) => {
                      const features = product.features_tr || [];
                      const isFeatured = product.is_featured;
                      
                      return (
                        <div key={product.id} className={`w-full flex flex-col p-5 rounded-2xl relative overflow-hidden border ${isFeatured ? 'border-primary-container/60 shadow-[0_0_30px_rgba(255,215,0,0.12)] bg-gradient-to-b from-primary-container/10 to-surface-container-high/90' : 'border-outline-variant/30 bg-surface-container-low/80'} transition-all hover:border-primary-container/40`}>
                          {isFeatured && (
                            <div className="absolute top-0 right-0 bg-primary-container text-on-primary font-label-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl font-black shadow-sm">
                              POPÜLER
                            </div>
                          )}
                          
                          <h3 className="font-headline-md text-base text-on-surface mb-1 font-bold uppercase tracking-tight">{product.name_tr || product.name_en || product.id}</h3>
                          
                          <div className="font-headline-xl text-2xl text-primary-container mb-4 flex items-baseline gap-1.5 font-extrabold">
                            {product.amount} <span className="font-label-bold text-xs text-on-surface-variant font-medium">TL</span>
                          </div>
                          
                          <ul className="flex-grow space-y-2.5 mb-5">
                            {features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                                <CheckCircle size={14} className="text-primary-container shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                            {/* Eğer özellik yoksa Shopier'dan gelen gün süresini yaz */}
                            {features.length === 0 && product.duration_days && (
                               <li className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                                 <CheckCircle size={14} className="text-primary-container shrink-0 mt-0.5" />
                                 <span>{product.duration_days >= 365 ? '1 Yıl Geçerli' : `${Math.round(product.duration_days / 30)} Ay Geçerli`}</span>
                               </li>
                            )}
                          </ul>
                          
                          <button 
                            className={`w-full py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all active:scale-95 touch-manipulation font-bold flex items-center justify-center gap-2 ${isFeatured ? 'bg-primary-container text-on-primary tactical-glow hover:brightness-110' : 'bg-surface-container-highest border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                            onClick={() => handleBuyClick(product)}
                          >
                            <CreditCard size={14} className="fill-current" />
                            {product.shopier_url ? 'SHOPIER İLE SATIN AL' : 'SATIN AL'}
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

      {/* CHECKOUT MODAL */}
      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCheckout(false)}></div>
          
          <div className="relative z-10 w-full max-w-lg bg-[#080C18] border border-primary-container/30 rounded-3xl p-6 shadow-2xl">
            <button className="absolute top-5 right-5 p-2 text-on-surface-variant hover:text-error" onClick={() => setShowCheckout(false)}>
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-on-surface uppercase mb-1">{selectedProduct.name_tr || selectedProduct.name_en || selectedProduct.id}</h3>
            <p className="text-xs text-on-surface-variant mb-4">{selectedProduct.shopier_url ? 'Shopier güvenli kart ödemesi popup pencerede açılacak.' : 'Ödeme bağlantısı bulunamadı.'}</p>

            {checkoutError && <div className="p-3 mb-3 bg-error/10 border border-error/40 text-error text-xs rounded-xl">{checkoutError}</div>}

            {/* Server Selection (Only for Server Plans) */}
            {selectedProduct.plan_type !== 'user' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-primary-container uppercase block mb-2">Hedef Sunucu</label>
                <div className="space-y-2 max-h-36 overflow-y-auto bg-[#060913] p-2 rounded-xl border border-outline-variant/30">
                  {status !== "authenticated" ? (
                    <button onClick={() => signIn("discord")} className="w-full py-2 bg-[#5865F2] text-white text-xs font-bold rounded-xl">Discord ile Giriş Yap</button>
                  ) : isLoadingServers ? (
                    <div className="flex items-center justify-center py-3 gap-2 text-on-surface-variant text-xs">
                      <Loader2 className="animate-spin" size={14} /> Sunucular yükleniyor...
                    </div>
                  ) : userServers.length === 0 ? (
                    <p className="text-xs text-on-surface-variant text-center py-2">Yönetici olduğunuz sunucu bulunamadı.</p>
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
              <span className="text-xs font-bold text-on-surface">Tutar</span>
              <span className="text-lg font-bold text-primary-container">{selectedProduct.amount} TL</span>
            </div>

            <button 
              onClick={handleShopierPay}
              disabled={isProcessing || (!selectedServer && selectedProduct.plan_type !== 'user')}
              className="w-full py-3 bg-primary-container text-on-primary font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16} /> <span>{selectedProduct.shopier_url ? 'SHOPIER İLE ÖDE' : 'ÖDE'}</span></>}
            </button>
          </div>
        </div>
      )}

      {/* Ödeme Popup Durum Banner */}
      {paymentPending && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#080C18] border border-primary-container/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-xs">
          <Loader2 className="animate-spin text-primary-container shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-on-surface">Shopier Ödeme Sayfası Açık</p>
            <p className="text-xs text-on-surface-variant">Ödemeyi tamamlayın, pencereyi kapatmayın.</p>
          </div>
        </div>
      )}

      {paymentDone && (
        <div className="fixed bottom-6 right-6 z-[200] bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-xs">
          <CheckCircle className="text-emerald-400 shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-emerald-200">Ödeme tamamlandı mı?</p>
            <p className="text-xs text-emerald-300/80">Premium paketiniz kısa sürede aktif olacak.</p>
          </div>
          <button onClick={() => setPaymentDone(false)} className="ml-auto text-on-surface-variant hover:text-error">
            <X size={16} />
          </button>
        </div>
      )}

    </main>
  );
}
