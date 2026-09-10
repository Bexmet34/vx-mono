"use client";
import { LINKS } from '@veyronix/config';
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { 
  CreditCard, X, Loader2, CheckCircle, Server, ShieldCheck, Zap, Sparkles, Heart, Crown, ArrowRight
} from "lucide-react";

export default function PremiumPage() {
  const { lang, t } = useLanguage();
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

  // Tab State (sunucu vs bireysel)
  const [activeTab, setActiveTab] = useState('server'); // 'server' | 'user'
  
  // Checkout Steps
  const [step, setStep] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  // Ödeme Popup State
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbPlans(data);
        } else if (data.data && Array.isArray(data.data)) {
          setDbPlans(data.data);
        } else {
          setDbPlans([]);
          setProductError(data.error || (lang === 'tr' ? "Paket bulunamadı." : "No packages found."));
        }
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error(err);
        setProductError(lang === 'tr' ? "Paketler yüklenirken hata oluştu." : "Error loading packages.");
        setLoadingProducts(false);
      });
  }, [lang]);

  const serverPlans = dbPlans.filter(p => !p.plan_type || p.plan_type === 'server');
  const userPlans = dbPlans.filter(p => p.plan_type === 'user');
  const activePlans = activeTab === 'server' ? serverPlans : userPlans;

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setStep(1);
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
      return setCheckoutError(lang === 'tr' ? "Lütfen bir sunucu seçin." : "Please select a server.");
    }
    setCheckoutError("");
    setIsProcessing(true);

    try {
      if (selectedProduct.shopier_url) {
        setStep(2); // Kopya kod adımına geç
      } else {
        setCheckoutError(lang === 'tr' ? "Bağlantı bulunamadı." : "Link not found.");
      }
    } catch (err) {
      setCheckoutError(lang === 'tr' ? "Bağlantı hatası oluştu." : "Connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenShopier = () => {
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
  };

  const copyToClipboard = () => {
    const code = selectedProduct.plan_type === 'user' ? `U-${session?.user?.id}` : `S-${selectedServer}`;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-32 px-4 md:px-8 w-full max-w-6xl mx-auto flex flex-col items-center">
      
      {paymentStatus === 'success' && (
        <div className="w-full max-w-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl mb-12 text-center animate-slide-up shadow-lg">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-emerald-200 uppercase tracking-widest">{lang === 'tr' ? 'Ödeme Başarıyla Tamamlandı!' : 'Payment Completed!'}</h3>
          <p className="text-sm text-emerald-300/80 mt-2">{lang === 'tr' ? 'Premium paketiniz otomatik olarak tanımlandı.' : 'Your premium package has been applied automatically.'}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center w-full relative mb-16">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[300px] bg-primary-container/20 blur-[120px] pointer-events-none rounded-full"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container font-label-bold text-xs uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(255,215,0,0.2)] relative z-10">
          <Crown size={16} />
          <span>{lang === 'tr' ? 'VEYRONIX PREMIUM' : 'VEYRONIX PREMIUM'}</span>
        </div>

        <h1 className="font-headline-xl text-4xl sm:text-5xl md:text-6xl text-on-surface mb-6 font-bold tracking-tighter relative z-10 leading-tight">
          {lang === 'tr' ? 'Deneyiminizi ' : 'Upgrade Your '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-yellow-200">
             {lang === 'tr' ? 'Zirveye Taşıyın' : 'Experience'}
          </span>
        </h1>
        
        <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto relative z-10 leading-relaxed font-light">
          {lang === 'tr' 
            ? 'İster bireysel kullanım için, isterseniz tüm sunucunuz için benzersiz özelliklerin kilidini hemen açın. Modern altyapımız ile ödemeniz anında sistemimize yansır.' 
            : 'Unlock unique features for individual use or your entire server instantly. With our modern infrastructure, your payment is reflected immediately.'}
        </p>
      </section>

      {/* Custom Tabs (Toggle) */}
      <div className="relative z-10 flex p-1.5 bg-surface-container-highest border border-outline-variant/30 rounded-full mb-12 shadow-xl backdrop-blur-sm max-w-sm w-full mx-auto">
        <button 
          onClick={() => setActiveTab('server')}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10 ${activeTab === 'server' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <Server size={18} />
          <span>{lang === 'tr' ? 'Sunucu' : 'Server'}</span>
        </button>
        <button 
          onClick={() => setActiveTab('user')}
          className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 z-10 ${activeTab === 'user' ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          <Heart size={18} />
          <span>{lang === 'tr' ? 'Bireysel' : 'User'}</span>
        </button>
        
        {/* Animated Background Pill */}
        <div 
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary-container rounded-full transition-transform duration-300 shadow-[0_0_15px_rgba(255,215,0,0.4)] z-0"
          style={{ transform: activeTab === 'server' ? 'translateX(0)' : 'translateX(100%)' }}
        ></div>
      </div>

      {/* Packages Grid */}
      <section className="w-full relative z-10">
        {loadingProducts ? (
          <div className="w-full flex flex-col items-center justify-center py-20 text-primary-container gap-4">
            <Loader2 className="animate-spin" size={48} />
            <span className="font-label-bold text-sm uppercase tracking-widest">{lang === 'tr' ? 'Paketler Yükleniyor...' : 'Loading Packages...'}</span>
          </div>
        ) : productError ? (
          <div className="w-full max-w-2xl mx-auto text-center py-12 text-error text-sm border border-dashed border-error/40 rounded-2xl bg-error/10">
            {productError}
          </div>
        ) : activePlans.length === 0 ? (
          <div className="w-full max-w-2xl mx-auto text-center py-12 text-on-surface-variant text-sm border border-dashed border-outline-variant/40 rounded-2xl bg-surface/30">
            {lang === 'tr' ? 'Şu anda aktif paket bulunmamaktadır.' : 'No active packages at the moment.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {activePlans.map((product) => {
              const features = (lang === 'tr' ? product.features_tr : product.features_en) || [];
              const isFeatured = product.is_featured;
              const name = (lang === 'tr' ? product.name_tr : product.name_en) || product.id;
              
              return (
                <div key={product.id} className={`group flex flex-col p-6 sm:p-8 rounded-[2rem] relative overflow-hidden border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 ${isFeatured ? 'border-primary-container/50 shadow-[0_15px_40px_-10px_rgba(255,215,0,0.2)] bg-gradient-to-b from-primary-container/10 to-surface-container-high/90 z-10' : 'border-outline-variant/20 bg-surface-container-low/60 hover:bg-surface-container-high/80 hover:border-primary-container/30 hover:shadow-2xl'}`}>
                  {isFeatured && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
                  )}
                  {isFeatured && (
                    <div className="absolute top-6 right-6 bg-primary-container/20 text-primary-container font-label-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-black flex items-center gap-1.5">
                      <Sparkles size={12} className="animate-pulse" /> {lang === 'tr' ? 'POPÜLER' : 'POPULAR'}
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="font-headline-md text-xl md:text-2xl text-on-surface mb-2 font-bold uppercase tracking-tight">{name}</h3>
                    <div className="font-headline-xl text-3xl md:text-4xl text-primary-container flex items-baseline gap-1.5 font-extrabold">
                      {product.amount} <span className="text-base text-on-surface-variant font-medium">TL</span>
                    </div>
                  </div>
                  
                  <ul className="flex-grow space-y-4 mb-8">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-on-surface-variant leading-relaxed">
                        <CheckCircle size={18} className="text-primary-container shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </li>
                    ))}
                    {features.length === 0 && product.duration_days && (
                       <li className="flex items-start gap-3 text-sm text-on-surface-variant leading-relaxed">
                         <CheckCircle size={18} className="text-primary-container shrink-0 mt-0.5" />
                         <span className="font-medium">{product.duration_days >= 365 ? (lang === 'tr' ? '1 Yıl Geçerli' : 'Valid for 1 Year') : `${Math.round(product.duration_days / 30)} ${lang === 'tr' ? 'Ay Geçerli' : 'Months Valid'}`}</span>
                       </li>
                    )}
                  </ul>
                  
                  <button 
                    className={`w-full py-4 rounded-2xl font-label-bold text-sm uppercase tracking-wider transition-all duration-300 font-bold flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] ${
                      status !== "authenticated" 
                        ? 'bg-[#5865F2] text-white hover:bg-[#4752C4] shadow-[0_0_20px_rgba(88,101,242,0.3)] hover:shadow-[0_0_30px_rgba(88,101,242,0.5)] border border-transparent'
                        : isFeatured 
                          ? 'bg-primary-container text-on-primary shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)] border border-transparent' 
                          : 'bg-surface-container-highest border border-outline-variant text-on-surface hover:border-primary-container/50 hover:bg-primary-container/10'
                    }`}
                    onClick={() => status !== "authenticated" ? signIn("discord") : handleBuyClick(product)}
                  >
                    {status !== "authenticated" ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                        {lang === 'tr' ? 'GİRİŞ YAP' : 'LOGIN'}
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} className={isFeatured ? '' : 'text-primary-container'} />
                        {product.shopier_url ? (lang === 'tr' ? 'SHOPIER İLE AL' : 'BUY VIA SHOPIER') : (lang === 'tr' ? 'SATIN AL' : 'PURCHASE')}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CHECKOUT MODAL */}
      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => {
            setShowCheckout(false);
            setStep(1);
          }}></div>
          
          <div className="relative z-10 w-full max-w-lg bg-[#080C18] border border-primary-container/30 rounded-[2rem] p-6 md:p-8 shadow-2xl animate-scale-up">
            <button className="absolute top-6 right-6 p-2 rounded-full bg-surface-container-high text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors" onClick={() => {
              setShowCheckout(false);
              setStep(1);
            }}>
              <X size={20} />
            </button>

            {step === 1 ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
                    {selectedProduct.plan_type === 'user' ? <Heart size={20} /> : <Server size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight">{lang === 'tr' ? selectedProduct.name_tr : selectedProduct.name_en}</h3>
                    <p className="text-sm text-primary-container font-bold">{selectedProduct.amount} TL</p>
                  </div>
                </div>

                {checkoutError && <div className="p-3 mb-4 bg-error/10 border border-error/30 text-error text-xs rounded-xl flex items-center gap-2"><X size={14} />{checkoutError}</div>}

                {/* Server Selection */}
                {selectedProduct.plan_type !== 'user' && (
                  <div className="mb-6">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">{lang === 'tr' ? 'Hedef Sunucuyu Seçin' : 'Select Target Server'}</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/20 custom-scrollbar">
                      {status !== "authenticated" ? (
                        <div className="p-2 text-center">
                          <button onClick={() => signIn("discord")} className="w-full py-2.5 bg-[#5865F2] text-white text-xs font-bold rounded-lg hover:bg-[#4752C4] transition-colors">
                            {lang === 'tr' ? 'Discord ile Giriş Yap' : 'Login with Discord'}
                          </button>
                        </div>
                      ) : isLoadingServers ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-primary-container text-xs font-medium">
                          <Loader2 className="animate-spin" size={16} /> {lang === 'tr' ? 'Sunucular yükleniyor...' : 'Loading servers...'}
                        </div>
                      ) : userServers.length === 0 ? (
                        <p className="text-xs text-on-surface-variant text-center py-4">{lang === 'tr' ? 'Yönetici olduğunuz sunucu bulunamadı.' : 'No servers found.'}</p>
                      ) : userServers.map(s => (
                        <label key={s.guild_id} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${selectedServer === s.guild_id ? 'bg-primary-container/15 border border-primary-container/40' : 'bg-transparent border border-transparent hover:bg-surface-container-highest hover:border-outline-variant/30'}`}>
                          <div className="flex items-center gap-3">
                            {s.guild_icon ? (
                              <img src={`https://cdn.discordapp.com/icons/${s.guild_id}/${s.guild_icon}.png`} className="w-7 h-7 rounded-full" alt="" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-[10px] font-bold">
                                {s.guild_name?.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs font-bold text-on-surface">{s.guild_name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedServer === s.guild_id ? 'border-primary-container bg-primary-container/20' : 'border-outline-variant/50'}`}>
                            {selectedServer === s.guild_id && <div className="w-2 h-2 rounded-full bg-primary-container"></div>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleShopierPay}
                  disabled={isProcessing || (!selectedServer && selectedProduct.plan_type !== 'user')}
                  className="w-full py-3 bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:shadow-none"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16} /> <span>{lang === 'tr' ? 'DEVAM ET' : 'CONTINUE'}</span> <ArrowRight size={16} /></>}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <h3 className="text-lg font-bold text-on-surface tracking-tight mb-1">
                    {lang === 'tr' ? 'Son Bir Adım!' : 'One Last Step!'}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed px-2">
                    {lang === 'tr' ? 'Ödemenizin otomatik tanımlanması için profil kodunuzu kopyalayın ve Shopier\'deki' : 'To activate your premium automatically, copy your profile code and paste it into the'} 
                    <strong className="text-primary-container mx-1">{lang === 'tr' ? '"Sipariş Notu (Açıklama)"' : '"Order Note"'}</strong> 
                    {lang === 'tr' ? 'kısmına yapıştırın.' : 'field on Shopier.'}
                  </p>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl mb-4 text-center relative overflow-hidden flex flex-col items-center">
                  {/* Dynamic Avatar - Smaller size */}
                  <div className="flex items-center gap-3 mb-4 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/30">
                    {selectedProduct.plan_type === 'user' ? (
                      <>
                        <img src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-6 h-6 rounded-full" alt="User Avatar" />
                        <span className="text-xs font-bold text-on-surface">{session?.user?.name || 'Discord Kullanıcısı'}</span>
                      </>
                    ) : (
                      <>
                        {userServers.find(s => s.guild_id === selectedServer)?.guild_icon ? (
                          <img src={`https://cdn.discordapp.com/icons/${selectedServer}/${userServers.find(s => s.guild_id === selectedServer)?.guild_icon}.png`} className="w-6 h-6 rounded-full" alt="Server Icon" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface">
                            {userServers.find(s => s.guild_id === selectedServer)?.guild_name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <span className="text-xs font-bold text-on-surface">{userServers.find(s => s.guild_id === selectedServer)?.guild_name || 'Seçili Sunucu'}</span>
                      </>
                    )}
                  </div>

                  <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-2">{lang === 'tr' ? 'BU KODU KOPYALAYIN' : 'COPY THIS CODE'}</p>
                  
                  {/* Compact Code Box */}
                  <div className="w-full bg-[#060913] border border-primary-container/30 rounded-lg p-3 flex items-center justify-between gap-3 mb-2 shadow-inner">
                    <span className="font-mono text-sm sm:text-base font-bold text-primary-container tracking-widest truncate">
                      {selectedProduct.plan_type === 'user' ? `U-${session?.user?.id}` : `S-${selectedServer}`}
                    </span>
                    <button 
                      onClick={copyToClipboard}
                      className={`px-4 py-2 rounded-md font-bold text-[10px] uppercase transition-all whitespace-nowrap ${isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-container text-on-primary hover:brightness-110'}`}
                    >
                      {isCopied ? (lang === 'tr' ? 'KOPYALANDI ✓' : 'COPIED ✓') : (lang === 'tr' ? 'KOPYALA' : 'COPY')}
                    </button>
                  </div>
                </div>
                
                {/* Warning - More compact but distinct */}
                <div className="bg-error/10 border border-error/30 p-3 rounded-lg mb-5 flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">⚠️</span>
                  <div>
                    <h4 className="text-error font-bold text-[11px] mb-0.5 uppercase tracking-wider">{lang === 'tr' ? 'DİKKAT EDİN!' : 'WARNING!'}</h4>
                    <p className="text-[10px] text-error/90 font-medium leading-relaxed">
                      {lang === 'tr' ? 'Kodu kopyalayıp ödeme sayfasındaki "Sipariş Notu" alanına yapıştırmazsanız, Premium özelliğiniz otomatik olarak AKTİF EDİLEMEZ!' : 'If you do not paste the code into the "Order Note" field, your premium will NOT be activated automatically!'}
                    </p>
                  </div>
                </div>

                {isCopied && (
                  <button 
                    onClick={handleOpenShopier}
                    className="w-full py-3 bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] active:scale-[0.98] transition-all animate-slide-up"
                  >
                    <CreditCard size={16} /> <span>{lang === 'tr' ? 'ÖDEMEYE DEVAM ET' : 'CONTINUE TO PAYMENT'}</span> <ArrowRight size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Ödeme Popup Durum Banner */}
      {paymentPending && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto z-[200] bg-surface-container-high border-2 border-primary-container/40 rounded-2xl p-5 shadow-2xl flex items-center gap-4 animate-slide-up">
          <Loader2 className="animate-spin text-primary-container shrink-0" size={24} />
          <div>
            <p className="text-sm font-bold text-on-surface">{lang === 'tr' ? 'Shopier Ödeme Sayfası Açık' : 'Shopier Checkout Opened'}</p>
            <p className="text-xs text-on-surface-variant font-medium mt-1">{lang === 'tr' ? 'Kodu not kısmına yapıştırıp ödemeyi tamamlayın.' : 'Paste the code in the note section and complete payment.'}</p>
          </div>
        </div>
      )}

      {paymentDone && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto z-[200] bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex items-center gap-4 animate-slide-up">
          <CheckCircle className="text-emerald-400 shrink-0" size={24} />
          <div className="flex-grow">
            <p className="text-sm font-bold text-emerald-300">{lang === 'tr' ? 'İşlem bekleniyor...' : 'Awaiting process...'}</p>
            <p className="text-xs text-emerald-200/80 font-medium mt-1">{lang === 'tr' ? 'Eğer kodu yapıştırdıysanız premium birazdan aktif olur.' : 'If you pasted the code, premium will activate shortly.'}</p>
          </div>
          <button onClick={() => setPaymentDone(false)} className="p-2 bg-emerald-500/20 rounded-full text-emerald-300 hover:bg-emerald-500/40 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

    </main>
  );
}
