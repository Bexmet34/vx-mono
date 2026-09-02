"use client";
import { LINKS } from '@veyronix/config';
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { 
  CreditCard, X, Loader2, CheckCircle, Server, ShieldCheck, ShoppingBag, ExternalLink
} from "lucide-react";

export default function TestPremiumPage() {
  const { lang } = useLanguage();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Shopier'deki Mağaza Ürünleri
  const [shopierProducts, setShopierProducts] = useState([]);
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

  // Ödeme Popup State
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    // Shopier Mağazasındaki Gerçek Ürünleri API ile Çek
    fetch('/api/payment/shopier-products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setShopierProducts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setShopierProducts(data.data);
        } else {
          setShopierProducts([]);
          setProductError(data.error || "Mağazada ürün bulunamadı.");
        }
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error(err);
        setProductError("Shopier ürünleri yüklenirken hata oluştu.");
        setLoadingProducts(false);
      });
  }, []);

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
    if (!selectedServer) {
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
          guildName: userServers.find(s => s.guild_id === selectedServer)?.guild_name || null,
          productId: selectedProduct.id || selectedProduct.productId,
          productName: selectedProduct.title || selectedProduct.name,
          productPrice: selectedProduct.price,
          productUrl: selectedProduct.url || null,
          durationDays: selectedProduct.duration_days || 30
        })
      });

      const data = await res.json();

      if (res.ok && data.payment_url) {
        setShowCheckout(false);
        setPaymentDone(false);
        setPaymentPending(true);

        // Shopier ödeme sayfasını popup'ta aç
        const popup = window.open(
          data.payment_url,
          'shopier-odeme',
          'width=820,height=720,left=200,top=100,resizable=yes,scrollbars=yes'
        );

        // Popup kapandığında kontrol et
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setPaymentPending(false);
            setPaymentDone(true);
          }
        }, 1000);
      } else {
        setCheckoutError(data.error || "Shopier ödeme oturumu açılamadı.");
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
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface mb-3">Shopier Mağaza Ürünleriniz</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mb-8 max-w-lg mx-auto">
          Shopier mağazanızda bulunan ürünler aşağıda listelenmiştir. Ödeme popup penceresinde güvenle tamamlanır.
        </p>

        {/* Shopier Real Products List */}
        <div className="rounded-2xl border border-primary-container/40 bg-surface-container-high/90 p-5 text-left mb-6">
          <h3 className="font-bold text-base text-on-surface mb-4 flex items-center gap-2">
            <ShoppingBag className="text-primary-container" size={20} />
            <span>Shopier Mağaza Ürünleriniz</span>
          </h3>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-8 text-primary-container gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Shopier mağazanızdaki ürünler çekiliyor...</span>
            </div>
          ) : productError ? (
            <div className="p-4 bg-error/10 border border-error/30 text-error text-xs rounded-xl text-center">
              {productError}
            </div>
          ) : shopierProducts.length === 0 ? (
            <div className="p-4 bg-surface/40 border border-dashed border-outline-variant/40 text-on-surface-variant text-xs rounded-xl text-center">
              Shopier mağazanızda henüz kayıtlı ürün bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopierProducts.map((product, idx) => (
                <div key={product.id || idx} className="p-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/80 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-base text-on-surface uppercase mb-1">{product.title || product.name || "Shopier Ürünü"}</h4>
                    {product.duration_days && (
                      <p className="text-xs text-on-surface-variant mb-2">
                        {product.duration_days >= 365 
                          ? `${Math.round(product.duration_days / 365)} Yıl Süre` 
                          : `${Math.round(product.duration_days / 30)} Ay Süre`}
                      </p>
                    )}
                    <div className="text-2xl font-extrabold text-primary-container mb-3">
                      {product.price} TL
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={() => handleBuyClick(product)}
                      className="w-full py-2.5 bg-primary-container text-on-primary font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <CreditCard size={16} />
                      <span>Satın Al</span>
                    </button>
                    {product.url && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 text-center text-xs text-on-surface-variant hover:text-primary-container flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Shopier'de Görüntüle
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

            <h3 className="text-lg font-bold text-on-surface uppercase mb-1">{selectedProduct.title || selectedProduct.name}</h3>
            <p className="text-xs text-on-surface-variant mb-4">Shopier güvenli kart ödemesi popup pencerede açılacak.</p>

            {checkoutError && <div className="p-3 mb-3 bg-error/10 border border-error/40 text-error text-xs rounded-xl">{checkoutError}</div>}

            {/* Server Selection */}
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

            {/* Price Box */}
            <div className="bg-surface-container-high p-3 rounded-xl border border-outline-variant/30 flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-on-surface">Tutar</span>
              <span className="text-lg font-bold text-primary-container">{selectedProduct.price} TL</span>
            </div>

            <button 
              onClick={handleShopierPay}
              disabled={isProcessing || !selectedServer}
              className="w-full py-3 bg-primary-container text-on-primary font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16} /> <span>SHOPIER İLE ÖDE</span></>}
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
