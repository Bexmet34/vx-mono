"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { Mail, Phone, MapPin, MessageSquare, Sparkles, Target, Shield, Users, Award, HelpCircle, Cookie, FileText, History, Package, UserCheck } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const { supportServer } = usePublicConfig();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <Sparkles size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "About Us & Contact" : "Hakkımızda ve İletişim"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn
              ? "Discover the mission, technology, and passionate team behind Veyronix."
              : "Veyronix'in arkasındaki vizyonu, teknolojiyi ve topluluk hikayesini keşfedin."}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-10 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          {/* Mission & Story */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="text-primary" size={22} />
              {isEn ? "Our Mission & Vision" : "Misyonumuz ve Hikayemiz"}
            </h2>
            <p>
              {isEn
                ? "Founded in 2024, Veyronix was born out of a real gaming problem: managing large MMO parties, Discord roles, and guild events manually was chaotic, time-consuming, and prone to errors. We set out to build the fastest, most reliable, and beautifully designed Discord automation ecosystem specifically tailored for Albion Online guilds and competitive gaming communities."
                : "2024 yılında kurulan Veyronix, bizzat oyuncuların yaşadığı büyük bir soruna çözüm üretmek amacıyla doğdu: Geniş çaplı MMO loncalarında parti kurma, ZvZ kompozisyonlarını yönetme, rol dağıtma ve Killboard takibini manuel yapmak hem yorucu hem de karmaşıktı. Veyronix, Albion Online loncaları ve oyun toplulukları için dünyanın en hızlı, en güvenilir ve en gelişmiş Discord otomasyon platformunu inşa etme vizyonuyla yola çıktı."}
            </p>
            <p>
              {isEn
                ? "Today, Veyronix powers hundreds of active Discord servers, handling thousands of automated party setups, real-time killboard tracking, and guild registrations daily with a 99.9% uptime track record."
                : "Bugün Veyronix, yüzlerce aktif Discord sunucusunda on binlerce oyuncunun parti organizasyonunu, canlı killboard bildirimlerini ve otomatik kayıt sistemlerini %99.9 kesintisiz çalışma oranıyla yönetmektedir."}
            </p>
          </section>

          {/* Key Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-surface-container-high rounded-xl border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-white">{isEn ? "100% Secure" : "%100 Güvenli"}</h3>
              <p className="text-xs text-on-surface-variant">{isEn ? "Encrypted data storage and strict permission sandboxing." : "Şifrelenmiş veri tabanı ve yetki korumalı Discord altyapısı."}</p>
            </div>

            <div className="p-5 bg-surface-container-high rounded-xl border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-white">{isEn ? "Pro Gaming Tools" : "Profesyonel Araçlar"}</h3>
              <p className="text-xs text-on-surface-variant">{isEn ? "Direct Albion Online API connection for real-time stats." : "Resmi Albion Online API bağlantısıyla anlık canlı veri."}</p>
            </div>

            <div className="p-5 bg-surface-container-high rounded-xl border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-white">{isEn ? "24/7 Community" : "7/24 Canlı Destek"}</h3>
              <p className="text-xs text-on-surface-variant">{isEn ? "Dedicated Discord support and regular feature updates." : "Uzman destek ekibi ve sürekli geliştirilen yeni özellikler."}</p>
            </div>
          </div>

          {/* Contact Information */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="text-primary" size={22} />
              {isEn ? "Contact & Company Information" : "İletişim ve Şirket Bilgileri"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Support & Inquiries Email" : "Destek & Kurumsal E-Posta"}</span>
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
                  <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Official Discord Support" : "Resmi Discord Destek Sunucusu"}</span>
                  <a
                    href={supportServer || "https://discord.gg/veyronix"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary hover:underline text-sm"
                  >
                    {isEn ? "Join Support Server" : "Destek Sunucusuna Katıl"}
                  </a>
                </div>
              </div>

              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Direct Contact Line" : "İletişim Hattı"}</span>
                  <span className="font-bold text-white text-sm">0551 078 82 61</span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Location" : "Merkez / Konum"}</span>
                  <span className="font-bold text-white text-sm">İstanbul, Türkiye</span>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section className="p-4 bg-surface-container rounded-xl border border-white/5 text-xs text-on-surface-variant">
            <p>
              <strong>{isEn ? "Disclaimer:" : "Yasal Uyarı:"}</strong>{" "}
              {isEn
                ? "Veyronix is an independent Discord bot & web software developed by the Veyronix Team. Veyronix is not affiliated with, endorsed by, or partnered with Sandbox Interactive GmbH or Discord Inc. Albion Online is a registered trademark of Sandbox Interactive GmbH."
                : "Veyronix, Veyronix Ekibi tarafından geliştirilen bağımsız bir Discord botu ve web platformudur. Veyronix'in Sandbox Interactive GmbH veya Discord Inc. ile resmi bir bağı ya da ticari ortaklığı bulunmamaktadır. Albion Online, Sandbox Interactive GmbH'nin tescilli markasıdır."}
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
