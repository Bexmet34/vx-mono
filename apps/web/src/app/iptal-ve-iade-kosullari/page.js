"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { History, Shield, Cookie, FileText, UserCheck, Package, CheckCircle2, AlertCircle, MessageSquare, Mail } from "lucide-react";
import Link from "next/link";

export default function RefundPolicy() {
  const { lang, t } = useLanguage();
  const isEn = lang === "en";
  const { supportServer } = usePublicConfig();
  const active = t?.legal?.refund || {};

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <History size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "Cancellation & Refund Policy" : "İptal ve İade Koşulları"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn
              ? "Last Updated: August 24, 2026 • Digital Service Refund Terms"
              : "Son Güncelleme: 24 Ağustos 2026 • Dijital Hizmet ve Abonelik İade Şartları"}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={20} />
              {active.h1 || (isEn ? "1. General Refund Principles" : "1. Genel İade Prensipleri")}
            </h2>
            <p>
              {active.p1 || (isEn
                ? "Veyronix provides digital subscription services (Discord Bot Premium features, automated party builders, real-time killboard engines, and server management tools). These digital services are activated and performed instantly upon payment confirmation."
                : "Veyronix üzerinden satın alınan hizmetler, elektronik ortamda anında ifa edilen dijital Discord botu abonelikleridir. Ödemenin onaylanmasıyla birlikte talep edilen sunucuya anında yetki ve süre tanımlanır.")}
            </p>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs sm:text-sm text-yellow-300 flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                {active.important || (isEn
                  ? "Important: Pursuant to Article 15/1-ğ of the Distance Contracts Regulation, the statutory right of withdrawal is not applicable once digital services are activated and used."
                  : "Önemli Not: 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ gereğince, elektronik ortamda anında ifa edilen dijital hizmetlerde cayma hakkı bulunmamaktadır.")}
              </span>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-primary" size={20} />
              {active.h2 || (isEn ? "2. Exceptional Refund Conditions" : "2. İade Yapılabilen İstisnai Durumlar")}
            </h2>
            <p>
              {active.p2 || (isEn
                ? "Customer satisfaction is our highest priority. Refunds are guaranteed under the following circumstances:"
                : "Kullanıcı memnuniyeti bizim için esastır. Aşağıdaki durumlarda kullanıcılarımıza kesintisiz tam veya kısmi iade sağlanır:")}
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm pl-2">
              <li>{isEn ? "Duplicate payments caused by payment gateway glitches." : "Sistem veya ödeme altyapısı kaynaklı mükerrer (çift) tahsilat yapılması durumunda."}</li>
              <li>{isEn ? "Technical failure on Veyronix bot infrastructure preventing feature usage for over 48 consecutive hours." : "Veyronix sunucu altyapısından kaynaklanan teknik bir arıza sebebiyle botun 48 saatten uzun süre kesintiye uğraması."}</li>
              <li>{isEn ? "Payment completed but subscription time not credited due to an automated API error." : "Ödemenin başarılı olmasına rağmen sistem hatası nedeniyle sunucuya sürenin hiç tanımlanamaması."}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <History className="text-primary" size={20} />
              {active.h3 || (isEn ? "3. Refund Request Process" : "3. İade Başvuru Süreci")}
            </h2>
            <p>
              {active.p3 || (isEn
                ? "To request a refund, please contact our support team within 7 days of purchase with your Discord User ID, Server ID, and Payment Transaction ID. Approved refunds are processed back to the original payment method within 3-7 business days."
                : "İade talebinde bulunmak için satın alımdan itibaren 7 gün içerisinde Discord Kullanıcı ID'niz, Sunucu ID'niz ve Ödeme Makbuz Numaranız ile destek ekibimize başvurmanız gerekmektedir. Onaylanan iadeler 3-7 iş günü içerisinde orijinal ödeme yönteminize aktarılır.")}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="text-primary" size={20} />
              {active.h4 || (isEn ? "4. Support & Contact" : "4. Destek ve İletişim")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Support Email" : "Destek E-Postası"}</span>
                  <a href="mailto:support@veyronix.com.tr" className="font-bold text-white hover:text-primary transition-colors text-sm">
                    support@veyronix.com.tr
                  </a>
                </div>
              </div>

              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Discord Support Ticket" : "Discord Destek Bileti"}</span>
                  <a
                    href={supportServer || "https://discord.gg/veyronix"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary hover:underline text-sm"
                  >
                    {isEn ? "Open a Ticket" : "Destek Sunucusu & Talep"}
                  </a>
                </div>
              </div>
            </div>
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
            <Link href="/teslimat-kosullari" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Package size={14} className="text-primary" /> {isEn ? "Delivery Terms" : "Teslimat Koşulları"}
            </Link>
            <Link href="/hakkimizda" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <UserCheck size={14} className="text-primary" /> {isEn ? "About Us & Contact" : "Hakkımızda & İletişim"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
