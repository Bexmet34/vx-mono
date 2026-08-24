"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, MessageCircle, Book, Shield, FileText, LayoutDashboard, Code, History, Phone, Mail, MapPin, Info } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const { t } = useLanguage();

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
            {t.footerDesc}
          </p>
        </div>

        {/* Mobile: 2-column Grid for Resources & Legal, with Contact Centered Below */}
        {/* Desktop: 3-column or 4-column wide grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. Resources Section (Solda - Left) */}
          <div className="text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Book size={14} className="shrink-0" />
              <span>{t.footerResources}</span>
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/blog" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.blog}
                </Link>
              </li>
              <li>
                <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.wiki}
                </a>
              </li>
              <li>
                <Link href="/#features" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.features}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.dashboard}
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.changelog}
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Legal Section (Sağda - Right) */}
          <div className="text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield size={14} className="shrink-0" />
              <span>{t.footerLegal}</span>
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/privacy" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.privacy} & KVKK
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.terms}
                </Link>
              </li>
              <li>
                <Link href="/mesafeli-satis-sozlesmesi" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.mesafeliSatis}
                </Link>
              </li>
              <li>
                <Link href="/iptal-ve-iade-kosullari" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.iptalIade}
                </Link>
              </li>
              <li>
                <Link href="/teslimat-kosullari" className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                  <span className="text-on-surface-variant/50">•</span> {t.teslimatKosullari}
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Contact Section (Mobilde Altta ve Tam Ortada, Masaüstünde 3. Sütun) */}
          <div className="col-span-2 md:col-span-1 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/20 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-label-bold text-xs text-primary-container uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center md:justify-start">
              <MessageCircle size={14} className="shrink-0" />
              <span>{t.contact}</span>
            </h4>
            <ul className="flex flex-col gap-2 items-center md:items-start">
              <li>
                <Link href="/hakkimizda" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary-container transition-colors font-medium">
                  <Info size={13} className="text-primary-container" />
                  <span>{t.hakkimizda}</span>
                </Link>
              </li>
              <li className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Phone size={13} className="text-emerald-400" />
                <span>{t.phone}: 0551 078 82 61</span>
              </li>
              <li className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Mail size={13} className="text-blue-400" />
                <span>{t.email}: info@veyronix.com.tr</span>
              </li>
              <li className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                <MapPin size={13} className="text-red-400" />
                <span>{t.address}: İzmir, Türkiye</span>
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

          <p className="text-[10px] text-on-surface-variant/70 text-center uppercase tracking-wider font-light">
            {t.securePayment}
          </p>
        </div>

        {/* Bottom Bar: Copyright & Links */}
        <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-[11px] text-on-surface-variant/70">
            © {new Date().getFullYear()} Veyronix. {t.allRights}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/" className="text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-wider font-medium">Home</Link>
            <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-wider font-medium">Wiki</a>
            <Link href="/changelog" className="text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-wider font-medium">{t.changelog}</Link>
            <a href="https://top.gg/bot/1082239904169336902" target="_blank" rel="noopener noreferrer" className="text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-wider font-medium">Top.gg</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
