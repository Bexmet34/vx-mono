"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Lock, Eye, FileText, Cookie, ExternalLink, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "Privacy & Data Protection Policy" : "Gizlilik ve Kişisel Verilerin Korunması Politikası"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn ? "Last Updated: August 24, 2026 • Compliant with Google AdSense, GDPR & KVKK" : "Son Güncelleme: 24 Ağustos 2026 • Google AdSense, KVKK ve GDPR Uyumlu"}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Eye className="text-primary" size={20} />
              {isEn ? "1. General Information & Scope" : "1. Genel Bilgilendirme ve Kapsam"}
            </h2>
            <p>
              {isEn
                ? "Veyronix ('we', 'our', or 'us') values the privacy and security of your personal data. This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you visit our website (veyronix.com.tr), use our Discord bot applications, control panels, and related digital services."
                : "Veyronix ('biz', 'tarafımız' veya 'platform'), web sitemizi (veyronix.com.tr), Discord bot uygulamalarımızı, web yönetim panellerimizi ve bağlı dijital servislerimizi kullanan tüm ziyaretçi ve kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına azami önemi vermektedir. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), Avrupa Genel Veri Koruma Yönetmeliği (GDPR) ve Google AdSense Yayıncı Politikaları uyarınca hazırlanmıştır."}
            </p>
          </section>

          {/* Section 2: Google AdSense & Advertising Cookies (MANDATORY FOR ADSENSE) */}
          <section className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-3 text-on-surface">
            <h2 className="text-lg sm:text-xl font-bold text-yellow-400 flex items-center gap-2">
              <Cookie className="text-yellow-400" size={20} />
              {isEn ? "2. Google AdSense & Third-Party Advertising Cookies" : "2. Google AdSense ve Üçüncü Taraf Reklam Çerezleri"}
            </h2>
            <p className="text-xs sm:text-sm">
              {isEn
                ? "We use Google AdSense and third-party advertising partners to display advertisements when you visit our website. These companies may use cookies and web beacons to collect non-personally identifiable information (such as your browser type, device info, IP address, clickstream info, and time of visits) in order to provide advertisements about goods and services of interest to you."
                : "Web sitemizde ziyaretçilerimize ilgi alanlarına uygun reklamlar sunabilmek ve platformun sürdürülebilirliğini sağlamak amacıyla Google AdSense ve yetkili üçüncü taraf reklam ağları kullanılmaktadır. Bu reklam hizmetleri kapsamında çerezler (cookies) ve web işaretçileri kullanılabilir."}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <strong>{isEn ? "DoubleClick DART Cookie:" : "DoubleClick DART Çerezi:"}</strong>{" "}
                {isEn
                  ? "Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on their visit to our sites and other sites on the Internet."
                  : "Google, üçüncü taraf bir satıcı olarak sitemizde reklam yayınlamak için çerezlerden yararlanır. Google'ın DART çerezlerini kullanması, kullanıcılarımızın sitemize ve İnternet'teki diğer sitelere yaptıkları ziyaretlere dayalı olarak reklam sunmasını sağlar."}
              </li>
              <li>
                <strong>{isEn ? "Personalized Ads Opt-Out:" : "Kişiselleştirilmiş Reklamları Devre Dışı Bırakma:"}</strong>{" "}
                {isEn
                  ? "Users may opt out of personalized advertising by visiting Google's "
                  : "Ziyaretçiler, istedikleri zaman Google'ın "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-1"
                >
                  {isEn ? "Google Ads Settings" : "Google Reklam Ayarları (Ads Settings)"}
                  <ExternalLink size={12} />
                </a>{" "}
                {isEn
                  ? "page or through the Digital Advertising Alliance at "
                  : "sayfasını ziyaret ederek veya "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-1"
                >
                  www.aboutads.info/choices
                  <ExternalLink size={12} />
                </a>{" "}
                {isEn
                  ? "to manage third-party advertising cookies."
                  : "üzerinden üçüncü taraf çerez tercihlerini yönetebilir ve kişiselleştirilmiş reklamları kapatabilir."}
              </li>
            </ul>
          </section>

          {/* Section 3: Data We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Lock className="text-primary" size={20} />
              {isEn ? "3. Data We Collect & Usage Purposes" : "3. Toplanan Veriler ve Kullanım Amaçları"}
            </h2>
            <p>
              {isEn
                ? "When you authenticate via Discord OAuth2 or browse our site, we process minimum necessary data solely to provide our service:"
                : "Veyronix hizmetlerini kullandığınızda, yalnızca hizmetin eksiksiz çalışabilmesi için asgari düzeyde veri işlenmektedir:"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-white block">{isEn ? "Discord Account Information" : "Discord Hesap Bilgileri"}</span>
                <p className="text-on-surface-variant">{isEn ? "Discord User ID, Username, Avatar Hash, and Managed Server IDs (Guilds) for authentication and role permission checks." : "Discord Kullanıcı ID, Kullanıcı Adı, Avatarı ve Yönetici olduğunuz Sunucu ID'leri (yetkilendirme amacıyla)."}</p>
              </div>
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-white block">{isEn ? "Public Gaming Data (Albion Online)" : "Herkese Açık Oyun Verileri (Albion Online)"}</span>
                <p className="text-on-surface-variant">{isEn ? "Public character names, guild stats, and killboard events queried directly from public game APIs." : "Karakter adları, lonca istatistikleri ve herkese açık oyun API'lerinden alınan Killboard verileri."}</p>
              </div>
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-white block">{isEn ? "Analytics & Technical Logs" : "Analitik ve Teknik Günlükler"}</span>
                <p className="text-on-surface-variant">{isEn ? "Aggregated anonymous traffic metrics via Google Analytics (GA4) such as browser type, country, and page views." : "Google Analytics (GA4) aracılığıyla toplanan anonim sayfa görüntülemeleri, tarayıcı türü ve oturum süreleri."}</p>
              </div>
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-white block">{isEn ? "Payment & Subscription Data" : "Ödeme ve Abonelik Kayıtları"}</span>
                <p className="text-on-surface-variant">{isEn ? "Encrypted transaction IDs and subscription start/end dates. We DO NOT store any credit card or banking details." : "Şifrelenmiş sipariş kodları ve abonelik süreleri. Kredi kartı veya banka bilgileri sunucularımızda ASLA tutulmaz."}</p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Sharing & Security */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              {isEn ? "4. Data Sharing & Security Measures" : "4. Veri Güvenliği ve Paylaşım Politikası"}
            </h2>
            <p>
              {isEn
                ? "We do NOT sell, rent, or trade your personal data to any third parties. Data is only shared with trusted infrastructure providers (Supabase Database, Vercel/Cloudflare CDN, Google Analytics/AdSense) strictly to provide and maintain our platform services."
                : "Toplanan kişisel veriler hiçbir koşulda üçüncü şahıslara satılmaz, kiralanmaz veya ticari amaçla devredilmez. Veriler yalnızca altyapı sağlayıcılarımız (Supabase Veritabanı, Cloudflare CDN, Google Analytics ve AdSense) ile platformun teknik işleyişi kapsamında işlenir."}
            </p>
          </section>

          {/* Section 5: User Rights (GDPR & KVKK) */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="text-primary" size={20} />
              {isEn ? "5. Your Rights (GDPR & KVKK)" : "5. Haklarınız (KVKK & GDPR Kapsamında)"}
            </h2>
            <p>
              {isEn
                ? "Under data protection regulations, you have the right to request access to your personal data, rectify inaccuracies, request deletion of your account/bot data, or restrict processing. To exercise these rights, please contact our Data Protection Officer via support@veyronix.com.tr."
                : "KVKK'nın 11. maddesi ve GDPR uyarınca; verilerinizin işlenip işlenmediğini öğrenme, yanlış verilerin düzeltilmesini isteme, verilerinizin silinmesini (unutulma hakkı) talep etme hakkına sahipsiniz. Talepleriniz için bizimle support@veyronix.com.tr adresinden irtibata geçebilirsiniz."}
            </p>
          </section>

          {/* Section 6: Links to Other Policies */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 text-xs">
            <Link href="/cerez-politikasi" className="text-primary hover:underline flex items-center gap-1">
              <Cookie size={14} /> {isEn ? "Cookie Policy" : "Çerez Politikası"}
            </Link>
            <Link href="/terms" className="text-primary hover:underline flex items-center gap-1">
              <FileText size={14} /> {isEn ? "Terms of Service" : "Kullanım Şartları"}
            </Link>
            <Link href="/hakkimizda" className="text-primary hover:underline flex items-center gap-1">
              <UserCheck size={14} /> {isEn ? "About Us & Contact" : "Hakkımızda & İletişim"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
