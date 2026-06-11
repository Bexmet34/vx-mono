"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { LogIn, LogOut, LayoutDashboard, Globe, Menu, X, ChevronRight, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { lang, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = session?.user?.id && (session.user.id === process.env.NEXT_PUBLIC_ADMIN_ID || session.user.id === "407234961582587916");

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-md border-b border-on-surface/ shadow-[0_0_15px_rgba(255,215,0,0.15)] transition-all">
        <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-headline-md text-headline-md font-bold tracking-tighter text-primary-container">
              Veyronix
            </Link>
            
            <div className="hidden md:flex space-x-6 lg:space-x-8 items-center border-l border-on-surface/ pl-6">
              <Link href="/blog" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                {t.blog}
              </Link>
              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                Wiki
              </a>
              <Link href="/changelog" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
                {t.changelog}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={toggleLanguage} 
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors font-label-bold"
              >
                <Globe size={18} />
                <span>{lang === 'en' ? 'TR' : 'EN'}</span>
              </button>

              {session ? (
                <div className="flex items-center gap-5 pl-4 ml-2 border-l border-on-surface/10">
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffb4ab]/5 border border-[#ffb4ab]/30 text-[#ffb4ab] font-headline-md text-[11px] uppercase tracking-[0.15em] hover:bg-[#ffb4ab]/15 hover:border-[#ffb4ab] transition-all shadow-[0_0_10px_rgba(255,180,171,0.05)]">
                      <Shield size={14} strokeWidth={2.5} />
                      ADMIN
                    </Link>
                  )}
                  
                  <Link href="/dashboard" className="group relative flex items-center gap-2 px-5 py-2 bg-primary-container text-on-primary font-headline-md text-sm uppercase tracking-wider hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]">
                    <div className="absolute inset-0 border border-primary-container group-hover:scale-[1.04] transition-transform duration-300"></div>
                    <LayoutDashboard size={16} strokeWidth={2.5} />
                    {t.dashboard}
                  </Link>

                  <div className="flex items-center gap-4 border-l border-on-surface/10 pl-5">
                    <button onClick={() => signOut()} title={t.logout} className="text-on-surface-variant hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-all p-2 border border-transparent hover:border-[#ffb4ab]/30 flex items-center justify-center group/logout">
                      <LogOut size={18} className="group-hover/logout:-translate-x-0.5 transition-transform" />
                    </button>
                    
                    {session.user?.image && (
                      <div className="relative group cursor-pointer w-10 h-10">
                        {/* Offset frame background */}
                        <div className="absolute inset-0 bg-primary-container/20 translate-x-1.5 translate-y-1.5 border border-primary-container/30 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                        {/* Avatar */}
                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover border border-outline-variant group-hover:border-primary-container relative z-10 transition-colors duration-300" />
                        
                        {/* Optional user name tooltip/popover space */}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => signIn("discord")} 
                  className="bg-primary-container text-on-primary px-6 py-2 font-label-bold text-label-bold transition-all duration-300 ease-in-out active:scale-95 hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] rounded"
                >
                  <span className="flex items-center gap-2">
                    <LogIn size={18} />
                    {t.login}
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-primary-container active:scale-95 transition-transform" 
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={32} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 z-50 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-out flex`}>
        {/* Backdrop */}
        <div 
          className={`flex-grow bg-background/ backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* Sliding Content Area */}
        <div className="w-[85%] max-w-sm glass-panel flex flex-col relative h-full">
          {/* Decorative Glow Top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-right from-transparent via-primary-container/30 to-transparent"></div>
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-6 border-b border-on-surface/">
            <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary-container">Veyronix</span>
            <button 
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors" 
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-grow px-6 py-8 flex flex-col gap-y-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b border-on-surface/ pb-4 mb-2">
              <span className="text-[10px] font-label-bold text-outline uppercase tracking-[0.2em]">Language</span>
              <button onClick={toggleLanguage} className="flex items-center gap-2 text-primary-container font-label-bold">
                <Globe size={18} />
                <span>{lang === 'en' ? 'TR' : 'EN'}</span>
              </button>
            </div>

            <div className="menu-item-group">
              <span className="text-[10px] font-label-bold text-outline uppercase tracking-[0.2em] mb-4 block">Central Hub</span>
              <Link href="/" className="menu-item-hover group flex items-center justify-between py-2" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-container transition-transform group-active:translate-x-2">{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                <ChevronRight className="text-primary-container/20 group-hover:text-primary-container transition-colors" />
              </Link>
              <div className="indicator"></div>
              
              <Link href="/dashboard" className="menu-item-hover group flex items-center justify-between py-2 mt-4" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2">{t.dashboard}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors" />
              </Link>
              <div className="indicator"></div>
            </div>

            <div className="menu-item-group">
              <span className="text-[10px] font-label-bold text-outline uppercase tracking-[0.2em] mb-4 block">Resources</span>
              <Link href="/blog" className="menu-item-hover group flex items-center justify-between py-2" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2">{t.blog}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors" />
              </Link>
              <div className="indicator"></div>

              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="menu-item-hover group flex items-center justify-between py-2 mt-4" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2">{t.wiki}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors" />
              </a>
              <div className="indicator"></div>

              <Link href="/changelog" className="menu-item-hover group flex items-center justify-between py-2 mt-4" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2">{t.changelog}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors" />
              </Link>
              <div className="indicator"></div>
            </div>
            
            {isAdmin && (
              <div className="menu-item-group">
                <span className="text-[10px] font-label-bold text-error uppercase tracking-[0.2em] mb-4 block">Admin</span>
                <Link href="/admin" className="menu-item-hover group flex items-center justify-between py-2" onClick={() => setIsMenuOpen(false)}>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-error hover:text-error-container transition-all group-active:translate-x-2">Admin Panel</span>
                  <ChevronRight className="text-error/0 group-hover:text-error transition-colors" />
                </Link>
                <div className="indicator !bg-error"></div>
              </div>
            )}
          </nav>
          
          {/* Bottom Action */}
          <div className="px-6 py-10 bg-surface-container-low border-t border-on-surface/ space-y-8">
            {session ? (
              <button 
                onClick={() => { signOut(); setIsMenuOpen(false); }} 
                className="w-full h-14 border border-error/30 text-error hover:bg-error/10 font-label-bold text-label-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <LogOut size={20} />
                {t.logout}
              </button>
            ) : (
              <button 
                onClick={() => { signIn("discord"); setIsMenuOpen(false); }} 
                className="w-full h-14 bg-primary-container text-on-primary font-label-bold text-label-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 tactical-glow"
              >
                <LogIn size={20} />
                {t.login}
              </button>
            )}
            
            <div className="flex flex-col gap-6">
              <p className="font-label-sm text-label-sm text-on-surface-variant/40 max-w-[200px]">
                © 2024 Veyronix Tactical Command. All rights reserved.
              </p>
            </div>
          </div>
          
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="scanline"></div>
          </div>
        </div>
      </div>
    </>
  );
}
