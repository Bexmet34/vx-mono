"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, MessageCircle, Book, Shield, FileText, LayoutDashboard, Code, History, Phone, Mail, MapPin, Info, Sparkles, Mic2, UserCheck, Swords, Headphones } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="mt-12 border-t border-outline-variant/30 bg-surface-container-lowest pt-10 pb-8 relative z-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mb-8 pb-6 border-b border-outline-variant/20">
          <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-primary-container uppercase">
            <Logo className="w-8 h-8" />
            <span>Veyronix</span>
          </Link>
          <p className="text-xs text-on-surface-variant max-w-md mt-2 leading-relaxed font-light">
            {lang === 'tr' 
              ? "Discord geçici ses kanalları, butonlu kayıt sistemi, Albion Online ZvZ parti kurucu ve canlı Killboard takibi sunan hepsi bir arada Discord botu."
              : "All-in-one Discord bot featuring temporary voice channels, button registration, Albion Online ZvZ party finder and live Killboard."}
          </p>
        </div>

        {/* 4-column Grid for Features, Resources, Legal, and Contact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">

          {/* 1. Features & Systems (Özellikler & Sistemler) */}
          <div className="text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="shrink-0" />
              <span>{lang === 'tr' ? 'Özellikler' : 'Features'}</span>
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/ozellikler/gecici-ses-kanali" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Geçici Ses Kanalı' : 'Temp Voice'}
                </Link>
              </li>
              <li>
                <Link href="/ozellikler/kayit-sistemi" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Kayıt & Oto Rol' : 'Registration'}
                </Link>
              </li>
              <li>
                <Link href="/ozellikler/parti-kurucu" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'ZvZ Parti Kurucu' : 'Party Finder'}
                </Link>
              </li>
              <li>
                <Link href="/ozellikler/ticket-destek" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Ticket & Destek' : 'Ticket System'}
                </Link>
              </li>
              <li>
                <Link href="/killboard" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> Killboard
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Resources Section */}
          <div className="text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Book size={14} className="shrink-0" />
              <span>{lang === 'tr' ? 'Kaynaklar' : 'Resources'}</span>
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/blog" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Blog & Rehberler' : 'Blog'}
                </Link>
              </li>
              <li>
                <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> Wiki & Doküman
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Kontrol Paneli' : 'Dashboard'}
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Sürüm Notları' : 'Changelog'}
                </Link>
              </li>
              <li>
                <Link href="/vote" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Oy Ver (Top.gg)' : 'Vote'}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Legal Section */}
          <div className="text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield size={14} className="shrink-0" />
              <span>{lang === 'tr' ? 'Yasal' : 'Legal'}</span>
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/privacy" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Gizlilik & KVKK' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Kullanım Şartları' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Mesafeli Satış' : 'Sales Agreement'}
                </Link>
              </li>
              <li>
                <Link href="/iptal-ve-iade-kosullari" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'İptal ve İade' : 'Refund Policy'}
                </Link>
              </li>
              <li>
                <Link href="/teslimat-kosullari" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {lang === 'tr' ? 'Teslimat Koşulları' : 'Delivery Terms'}
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact Section */}
          <div className="text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageCircle size={14} className="shrink-0" />
              <span>{lang === 'tr' ? 'İletişim' : 'Contact'}</span>
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/hakkimizda" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary-container transition-colors font-medium">
                  <Info size={13} className="text-primary-container" />
                  <span>{lang === 'tr' ? 'Hakkımızda' : 'About Us'}</span>
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary-container transition-colors font-medium">
                  <MessageCircle size={13} className="text-primary-container" />
                  <span>{lang === 'tr' ? 'İletişim' : 'Contact'}</span>
                </Link>
              </li>
              <li className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Phone size={13} className="text-emerald-400" />
                <span>0551 078 82 61</span>
              </li>
              <li className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Mail size={13} className="text-blue-400" />
                <span>info@veyronix.com.tr</span>
              </li>
              <li className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                <MapPin size={13} className="text-red-400" />
                <span>İzmir, Türkiye</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Security & Payment Badges */}
        <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col items-center gap-2.5">
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            {/* SSL Logo */}
            <div className="inline-flex items-center gap-1.5 text-primary-container font-bold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-primary-container/30 bg-primary-container/10">
              <Shield size={13} />
              <span>256-Bit SSL Güvencesiyle</span>
            </div>

            {/* Payment Methods */}
            <div className="inline-flex items-center gap-2 border border-outline-variant/30 px-3 py-1 bg-surface-container-high rounded-full">
              <span className="font-extrabold text-[10px] text-white">VISA</span>
              <span className="font-extrabold text-[10px] text-white">MasterCard</span>
              <span className="font-extrabold text-[10px] text-white">TROY</span>
            </div>
          </div>
          <p className="text-[10px] text-on-surface-variant/40 font-mono text-center">
            &copy; {new Date().getFullYear()} Veyronix. Tüm hakları saklıdır.
          </p>
        </div>

      </div>
    </footer>
  );
}
