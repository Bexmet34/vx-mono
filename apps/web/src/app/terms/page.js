"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Gavel, CheckCircle, AlertCircle, Info, Shield, Users, Cookie, FileText, UserCheck, History, Package } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <Gavel size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "Terms of Service" : "Kullanım Şartları ve Hizmet Sözleşmesi"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn ? "Last Updated: August 24, 2026 • Effective for all Veyronix users & visitors" : "Son Güncelleme: 24 Ağustos 2026 • Tüm Veyronix kullanıcıları ve ziyaretçileri için geçerlidir"}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="text-primary" size={20} />
              {isEn ? "1. Acceptance of Terms" : "1. Şartların Kabulü ve Hizmet Tanımı"}
            </h2>
            <p>
              {isEn
                ? "By accessing or using Veyronix website (veyronix.com.tr), inviting the Veyronix Discord Bot to your server, or using our web dashboard, you agree to be bound by these Terms of Service, our Privacy Policy, and Discord's Terms of Service. If you do not agree with any part of these terms, you must discontinue using our services immediately."
                : "Veyronix web sitesine (veyronix.com.tr) erişerek, Veyronix Discord Botunu sunucunuza ekleyerek veya web kontrol panelimizi kullanarak bu Kullanım Şartlarını, Gizlilik Politikamızı ve Discord Hizmet Koşullarını peşinen kabul etmiş sayılırsınız. Bu şartların herhangi birini kabul etmiyorsanız platformu ve botu kullanmayı derhal sonlandırmalısınız."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-primary" size={20} />
              {isEn ? "2. Acceptable Use & Fair Play" : "2. Kabul Edilebilir Kullanım ve Sorumluluklar"}
            </h2>
            <p>
              {isEn
                ? "You agree not to misuse Veyronix services. Prohibited actions include: attempting to bypass rate limits, exploiting vulnerabilities, using automated scripts to spam bot commands, using the bot for illegal activities, harassment, or distributing malicious content."
                : "Kullanıcılar platformu ve bot komutlarını kötüye kullanmayacağını taahhüt eder. API limitlerini aşmaya çalışmak, güvenlik açığı aramak/istismar etmek, spam komut göndermek, zararlı yazılım dağıtmak veya botu yasa dışı faaliyetler için kullanmak kesinlikle yasaktır."}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              {isEn ? "3. Intellectual Property & Disclaimer" : "3. Fikri Mülkiyet ve Yasal Sorumluluk Reddi (Disclaimer)"}
            </h2>
            <p>
              {isEn
                ? "Veyronix is an independent Discord automation, statistics and party management platform. Veyronix is NOT affiliated with, endorsed by, or sponsored by Discord Inc. or Sandbox Interactive GmbH (developers of Albion Online). All trademarks, game assets, and logos belong to their respective owners."
                : "Veyronix, bağımsız bir topluluk yönetimi, parti organizasyonu ve istatistik takip platformudur. Veyronix'in Discord Inc. veya Albion Online yapımcısı Sandbox Interactive GmbH ile doğrudan veya dolaylı hiçbir resmi bağı, sponsorluğu veya ortaklığı bulunmamaktadır. Tüm oyun içi telifler ve ticari markalar hak sahiplerine aittir."}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-primary" size={20} />
              {isEn ? "4. Premium Subscriptions & Uptime" : "4. Premium Abonelikler ve Hizmet Sürekliliği (SLA)"}
            </h2>
            <p>
              {isEn
                ? "We strive to provide 99.9% uptime for all bot and web services. However, maintenance, API changes by Discord or Albion Online, or third-party network issues may cause temporary interruptions. Premium features are provided on an 'as-is' and 'as-available' basis."
                : "Platformun 7/24 kesintisiz çalışması için gerekli tüm teknik önlemler alınmaktadır. Ancak Discord API güncellemeleri, Albion Online sunucu bakımları veya internet omurga arızaları gibi mücbir sebeplerden kaynaklanan geçici kesintilerden dolayı Veyronix sorumlu tutulamaz."}
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
