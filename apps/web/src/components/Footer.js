"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, MessageCircle, Book, Shield, FileText, LayoutDashboard, Code, History } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-outline-variant bg-surface-container-lowest pt-16 pb-8 relative z-10">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-container uppercase">
            Veyronix
          </Link>
          <p className="font-body-md text-on-surface-variant max-w-sm">
            {t.footerDesc}
          </p>
        </div>

        {/* Resources Section */}
        <div>
          <h4 className="font-label-bold text-label-bold text-on-surface uppercase tracking-widest mb-6">{t.footerResources}</h4>
          <ul className="flex flex-col gap-4">
            <li>
              <Link href="/blog" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <Book size={18} /> {t.blog}
              </Link>
            </li>
            <li>
              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <Book size={18} /> {t.wiki}
              </a>
            </li>
            <li>
              <Link href="/#commands" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <FileText size={18} /> {t.commands}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <LayoutDashboard size={18} /> {t.dashboard}
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <History size={18} /> {t.changelog}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Section */}
        <div>
          <h4 className="font-label-bold text-label-bold text-on-surface uppercase tracking-widest mb-6">{t.footerLegal}</h4>
          <ul className="flex flex-col gap-4">
            <li>
              <Link href="/privacy" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <Shield size={18} /> {t.privacy} & KVKK
              </Link>
            </li>
            <li>
              <Link href="/terms" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <FileText size={18} /> {t.terms}
              </Link>
            </li>
            <li>
              <Link href="/mesafeli-satis-sozlesmesi" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <FileText size={18} /> {t.mesafeliSatis}
              </Link>
            </li>
            <li>
              <Link href="/iptal-ve-iade-kosullari" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <History size={18} /> {t.iptalIade}
              </Link>
            </li>
            <li>
              <Link href="/teslimat-kosullari" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                <Shield size={18} /> {t.teslimatKosullari}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h4 className="font-label-bold text-label-bold text-on-surface uppercase tracking-widest mb-6">{t.contact}</h4>
          <ul className="flex flex-col gap-4">
            <li>
              <Link href="/hakkimizda" className="flex items-center gap-2 font-body-md text-sm text-on-surface-variant hover:text-primary-container transition-colors">
                {t.hakkimizda}
              </Link>
            </li>
            <li className="font-body-md text-sm text-on-surface-variant">
              {t.phone}: 0551 078 82 61
            </li>
            <li className="font-body-md text-sm text-on-surface-variant">
              {t.email}: hakkibsknn@gmail.com
            </li>
            <li className="font-body-md text-sm text-on-surface-variant">
              Adres: [AÇIK_ADRESİNİZİ_BURAYA_GİRİN]
            </li>
          </ul>
        </div>

      </div>

      {/* Security Logos */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-16 pt-8 border-t border-outline-variant flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center items-center gap-6">
          {/* SSL Logo */}
          <div className="flex items-center gap-2 text-primary-fixed-dim font-label-bold text-label-sm uppercase tracking-widest px-4 py-2 border border-primary-fixed-dim bg-primary-fixed-dim/10">
            <Shield size={20} /> 256-Bit SSL Güvencesiyle
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-4 border border-outline-variant px-4 py-2 bg-surface-container-high">
            <span className="font-label-bold text-label-sm uppercase text-on-surface">VISA</span>
            <span className="font-label-bold text-label-sm uppercase text-on-surface">MasterCard</span>
            <span className="font-label-bold text-label-sm uppercase text-on-surface">TROY</span>
          </div>
        </div>
        <p className="font-body-md text-xs text-on-surface-variant/70 text-center uppercase tracking-widest">
          Ödemeleriniz %100 güvenli bir şekilde gerçekleştirilmektedir.
        </p>
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-8 pt-8 border-t border-outline-variant flex flex-wrap justify-between items-center gap-6">
        <p className="font-body-md text-sm text-on-surface-variant">
          © {new Date().getFullYear()} Veyronix. {t.allRights}
        </p>
        <div className="flex gap-6">
          <Link href="/" className="font-label-bold text-sm text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">Home</Link>
          <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="font-label-bold text-sm text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">Wiki</a>
          <Link href="/changelog" className="font-label-bold text-sm text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">{t.changelog}</Link>
          <a href="https://top.gg/bot/1082239904169336902" target="_blank" rel="noopener noreferrer" className="font-label-bold text-sm text-on-surface-variant hover:text-primary-container transition-colors uppercase tracking-widest">Top.gg</a>
        </div>
      </div>
    </footer>
  );
}
