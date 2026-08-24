"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Cookie, CheckCircle2, Shield, Settings, Info, ExternalLink, FileText, UserCheck, History, Package } from "lucide-react";
import Link from "next/link";

export default function CookiePolicyPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <Cookie size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "Cookie Policy" : "Çerez (Cookie) Politikası"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn ? "Last Updated: August 24, 2026 • Compliant with Google AdSense, GDPR & KVKK" : "Son Güncelleme: 24 Ağustos 2026 • Google AdSense, KVKK ve GDPR Uyumlu"}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Info className="text-primary" size={20} />
              {isEn ? "1. What Are Cookies?" : "1. Çerez (Cookie) Nedir?"}
            </h2>
            <p>
              {isEn
                ? "Cookies are small text files that are stored on your browser or device when you visit websites. They are widely used to make websites work more efficiently, provide customized web experiences, and provide reporting information to site owners and advertising networks such as Google AdSense."
                : "Çerezler (cookies), ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza veya cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler web sitelerinin düzgün ve verimli çalışmasını sağlamak, kullanıcı tercihlerini hatırlamak ve Google AdSense gibi reklam ağları aracılığıyla ilgi alanlarınıza uygun içerik/reklam sunmak amacıyla kullanılır."}
            </p>
          </section>

          {/* Cookie Categories Table */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Settings className="text-primary" size={20} />
              {isEn ? "2. Types of Cookies We Use" : "2. Sitemizde Kullanılan Çerez Türleri"}
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Category 1 */}
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span>{isEn ? "Strictly Necessary (Mandatory) Cookies" : "Zorunlu ve Teknik Çerezler"}</span>
                </div>
                <p>
                  {isEn
                    ? "Essential for website navigation, user sessions (NextAuth / Discord OAuth2), and security functions. Without these cookies, the site and dashboard cannot function properly."
                    : "Web sitesinin temel işlevleri, güvenli oturum açma (Discord OAuth2 / NextAuth) ve dil tercihleri için zorunludur. Bu çerezler kapatılamaz."}
                </p>
                <span className="text-[11px] text-on-surface-variant block font-mono">Örnek: next-auth.session-token, NEXT_LOCALE, vx_cookie_consent</span>
              </div>

              {/* Category 2 */}
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Shield size={16} className="text-blue-400" />
                  <span>{isEn ? "Performance & Analytics Cookies (Google Analytics GA4)" : "Performans ve Analitik Çerezleri (Google Analytics GA4)"}</span>
                </div>
                <p>
                  {isEn
                    ? "Collect anonymous statistical data on how visitors interact with the site (e.g. page visits, loading speed, bounce rates) to improve user experience."
                    : "Ziyaretçilerin siteyi nasıl kullandığını (en çok ziyaret edilen sayfalar, oturum süresi, hata raporları) anonim olarak ölçümlemek ve kullanıcı deneyimini iyileştirmek için kullanılır."}
                </p>
                <span className="text-[11px] text-on-surface-variant block font-mono">Örnek: _ga, _ga_*, _gid</span>
              </div>

              {/* Category 3: Advertising Cookies */}
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-yellow-300">
                  <Cookie size={16} className="text-yellow-400" />
                  <span>{isEn ? "Targeting & Advertising Cookies (Google AdSense & DoubleClick)" : "Hedefleme ve Reklam Çerezleri (Google AdSense & DoubleClick)"}</span>
                </div>
                <p className="text-on-surface">
                  {isEn
                    ? "Used by Google AdSense and third-party advertising partners to deliver relevant advertisements tailored to your interests. Google uses the DoubleClick DART cookie to serve personalized ads based on your visits to this and other websites across the Internet."
                    : "Google AdSense ve yetkili reklam ortakları tarafından ziyaretçilere ilgi alanlarına uygun reklamlar sunmak amacıyla kullanılır. Google, DART çerezleri aracılığıyla bu siteye ve internetteki diğer sitelere yaptığınız ziyaretlere dayalı kişiselleştirilmiş reklamlar yayınlar."}
                </p>
                <span className="text-[11px] text-yellow-400/80 block font-mono">Örnek: __gads, __gpi, IDE, DSID, test_cookie</span>
              </div>
            </div>
          </section>

          {/* Section 3: Managing Cookies */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              {isEn ? "3. How to Control & Opt-Out of Cookies" : "3. Çerezleri Nasıl Yönetebilir ve Kapatabilirsiniz?"}
            </h2>
            <p>
              {isEn
                ? "You have full control over cookies. You can modify your browser settings to accept, reject, or delete cookies at any time. Furthermore, you can opt out of Google's personalized advertising cookies via:"
                : "Çerez tercihlerinizi dilediğiniz zaman tarayıcı ayarlarınızdan değiştirebilir veya silebilirsiniz. Ayrıca Google'ın kişiselleştirilmiş reklam çerezlerini şu bağlantılardan kolayca kapatabilirsiniz:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-1"
                >
                  {isEn ? "Google Ads Settings (Personalization Opt-out)" : "Google Reklam Ayarları (Kişiselleştirme Kapatma)"}
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-1"
                >
                  {isEn ? "Digital Advertising Alliance (DAA) Opt-Out Choice Tool" : "Dijital Reklamcılık Birliği (DAA) Çerez Tercih Aracı"}
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youronlinechoices.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-medium inline-flex items-center gap-1"
                >
                  {isEn ? "Your Online Choices (EU Advertising Opt-out)" : "Your Online Choices (Avrupa Çerez Tercih Portalı)"}
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </section>

          {/* Legal Navigation Cross-Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-3 text-xs">
            <Link href="/privacy" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Shield size={14} className="text-primary" /> {isEn ? "Privacy Policy" : "Gizlilik Politikası"}
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
            <Link href="/teslimat-kosullari" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Package size={14} className="text-primary" /> {isEn ? "Delivery Terms" : "Teslimat Koşulları"}
            </Link>
            <Link href="/hakkimizda" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <UserCheck size={14} className="text-primary" /> {isEn ? "About Us & Contact" : "Hakkımızda & İletişim"}
            </Link>
          </div>
        </div>
      </main>
  );
}
