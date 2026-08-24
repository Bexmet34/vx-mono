"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, MessageCircle, Book, Shield, FileText, LayoutDashboard, Code, History } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-10 border-t border-outline-variant/30 bg-surface-container-lowest pt-10 pb-6 relative z-10">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Brand Section */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-container uppercase">
            <Logo className="w-9 h-7" />
            Veyronix
          </Link>
          <p className="font-body-md text-xs text-on-surface-variant max-w-sm leading-relaxed font-light">
            {t.footerDesc}
          </p>
        </div>

        {/* Resources Section */}
        <div>
          <h4 className="font-label-bold text-xs text-on-surface uppercase tracking-widest mb-2.5">{t.footerResources}</h4>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/blog" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <Book size={13} /> {t.blog}
              </Link>
            </li>
            <li>
              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <Book size={13} /> {t.wiki}
              </a>
            </li>
            <li>
              <Link href="/#features" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <FileText size={13} /> {t.features}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <LayoutDashboard size={13} /> {t.dashboard}
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <History size={13} /> {t.changelog}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Section */}
        <div>
          <h4 className="font-label-bold text-xs text-on-surface uppercase tracking-widest mb-2.5">{t.footerLegal}</h4>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/privacy" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <Shield size={13} /> {t.privacy} & KVKK
              </Link>
            </li>
            <li>
              <Link href="/terms" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <FileText size={13} /> {t.terms}
              </Link>
            </li>
            <li>
              <Link href="/mesafeli-satis-sozlesmesi" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <FileText size={13} /> {t.mesafeliSatis}
              </Link>
            </li>
            <li>
              <Link href="/iptal-ve-iade-kosullari" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <History size={13} /> {t.iptalIade}
              </Link>
            </li>
            <li>
              <Link href="/teslimat-kosullari" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                <Shield size={13} /> {t.teslimatKosullari}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h4 className="font-label-bold text-xs text-on-surface uppercase tracking-widest mb-2.5">{t.contact}</h4>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/hakkimizda" className="flex items-center gap-2 font-body-md text-xs text-on-surface-variant hover:text-primary-container transition-colors">
                {t.hakkimizda}
              </Link>
            </li>
            <li className="font-body-md text-xs text-on-surface-variant">
              {t.phone}: 0551 078 82 61
            </li>
            <li className="font-body-md text-xs text-on-surface-variant">
              {t.email}: info@veyronix.com.tr
            </li>
            <li className="font-body-md text-xs text-on-surface-variant">
              {t.address}: İzmir, Türkiye
            </li>
          </ul>
        </div>

      </div>

      {/* Security Logos */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-8 pt-5 border-t border-outline-variant/20 flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center items-center gap-2">
          {/* SSL Logo */}
          <div className="flex items-center gap-1.5 text-primary-container font-label-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-lg border border-primary-container/30 bg-primary-container/10">
            <Shield size={13} /> 256-Bit SSL Güvencesiyle
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-2 border border-outline-variant/30 px-3 py-1 bg-surface-container-high rounded-lg">
            <span className="font-label-bold text-[10px] uppercase text-on-surface">VISA</span>
            <span className="font-label-bold text-[10px] uppercase text-on-surface">MasterCard</span>
            <span className="font-label-bold text-[10px] uppercase text-on-surface">TROY</span>
          </div>
        </div>
        <p className="font-body-md text-[11px] text-on-surface-variant/70 text-center uppercase tracking-widest">
          {t.securePayment}
        </p>
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-4 pt-4 border-t border-outline-variant/20 flex flex-wrap justify-between items-center gap-2">
        <p className="font-body-md text-[11px] text-on-surface-variant/70">
          © {new Date().getFullYear()} Veyronix. {t.allRights}
        </p>
        <div className="flex gap-4">
          <Link href="/" className="font-label-bold text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">Home</Link>
          <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="font-label-bold text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">Wiki</a>
          <Link href="/changelog" className="font-label-bold text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">{t.changelog}</Link>
          <a href="https://top.gg/bot/1082239904169336902" target="_blank" rel="noopener noreferrer" className="font-label-bold text-[11px] text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">Top.gg</a>
        </div>
      </div>
    </footer>
  );
}
