"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Package, Shield, Cookie, FileText, UserCheck, History, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DeliveryPolicy() {
  const { lang, t } = useLanguage();
  const isEn = lang === "en";
  const active = t?.legal?.delivery || {};

  return (
    <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <Package size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "Delivery & Execution Policy" : "Teslimat ve İfa Koşulları"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn
              ? "Last Updated: August 24, 2026 • Instant Electronic Delivery Principles"
              : "Son Güncelleme: 24 Ağustos 2026 • Anlık Elektronik Hizmet Teslimat İlkeleri"}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Zap className="text-primary" size={20} />
              {active.h1 || (isEn ? "1. Electronic Instant Delivery" : "1. Elektronik Anlık Teslimat")}
            </h2>
            <p>
              {active.p1 || (isEn
                ? "All products and services offered on Veyronix (veyronix.com.tr) are 100% digital goods and cloud-hosted bot subscriptions. No physical delivery, courier service, or shipping fees are involved."
                : "Veyronix (veyronix.com.tr) üzerinden sunulan tüm ürün ve hizmetler %100 dijital servislerdir. Herhangi bir fiziki ürün gönderimi, kargo veya kurye teslimatı söz konusu değildir.")}
            </p>
            <p>
              {active.p2 || (isEn
                ? "Upon payment confirmation by our secure payment gateway, your server subscription is activated in real time (within 1 to 60 seconds) via our automated backend API systems."
                : "Ödeme işlemi güvenli ödeme sağlayıcımız tarafından onaylandığı anda, bot lisansı ve abonelik süresi belirttiğiniz Discord sunucu ID'sine otomatik olarak 1 ila 60 saniye içinde tanımlanır.")}
            </p>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-xs sm:text-sm text-primary flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>
                {active.important || (isEn
                  ? "Instant Activation: Your invoice/receipt is sent to your registered email, and features become accessible on Discord and the Web Dashboard immediately."
                  : "Anında Aktivasyon: Fatura ve sipariş makbuzunuz e-posta adresinize gönderilir; Discord bot özellikleri ve web yönetim paneli derhal kullanıma açılır.")}
              </span>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-primary" size={20} />
              {active.h2 || (isEn ? "2. Delivery Issues & Troubleshooting" : "2. Teslimat Gecikmeleri ve Çözüm")}
            </h2>
            <p>
              {active.p3 || (isEn
                ? "If your subscription status is not updated within 5 minutes of completing payment, please verify that you provided the correct Discord Server ID and that the Veyronix Bot is present in your server. If the issue persists, our 24/7 support team will manually verify and credit your account immediately."
                : "Ödemeniz onaylandığı halde 5 dakika içinde sunucunuzda süre tanımlanmadıysa; ödeme formunda girdiğiniz Sunucu ID'sinin doğruluğunu ve Veyronix Botunun sunucunuzda ekli olduğunu kontrol ediniz. Sorun devam ederse 7/24 destek ekibimiz ödemenizi manuel teyit ederek sürenizi anında başlatır.")}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              {active.h3 || (isEn ? "3. Service Period & Renewal" : "3. Hizmet Süresi ve Yenileme")}
            </h2>
            <p>
              {active.p4 || (isEn
                ? "Your subscription begins immediately upon delivery and remains active for the exact purchased duration (7 Days, 30 Days, or Lifetime VIP). You can track your remaining subscription days in real time from the /subscription command or the Web Dashboard."
                : "Abonelik süresi teslimat anından itibaren başlar ve satın alınan süre boyunca (7 Gün, 30 Gün veya Sınırsız VIP) kesintisiz devam eder. Kalan sürenizi dilediğiniz an /subscription komutuyla veya web panelinden canlı görüntüleyebilirsiniz.")}
            </p>
          </section>

          {/* Legal Navigation Cross-Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-3 text-xs">
            <Link href="/privacy" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Shield size={14} className="text-primary" /> {isEn ? "Privacy Policy" : "Gizlilik Politikası"}
            </Link>
            <Link href="/cerez-politikasi" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Cookie size={14} className="text-primary" /> {isEn ? "Cookie Policy" : "Çerez Politikası"}
            </Link>
            <Link href="/terms" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText size={14} className="text-primary" /> {isEn ? "Terms of Service" : "Kullanım Şartları"}
            </Link>
            <Link href="/mesafeli-satis-sozlesmesi" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText size={14} className="text-primary" /> {isEn ? "Distance Sales" : "Mesafeli Satış Sözleşmesi"}
            </Link>
            <Link href="/iptal-ve-iade-kosullari" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <History size={14} className="text-primary" /> {isEn ? "Cancellation & Refund" : "İptal ve İade Koşulları"}
            </Link>
            <Link href="/hakkimizda" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <UserCheck size={14} className="text-primary" /> {isEn ? "About Us & Contact" : "Hakkımızda & İletişim"}
            </Link>
          </div>
        </div>
      </main>
  );
}
