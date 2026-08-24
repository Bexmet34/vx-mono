"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { LogIn, LogOut, LayoutDashboard, Globe, Menu, X, ChevronRight, ChevronDown, Shield, CreditCard, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Sparkles, Swords, Check, Home, Compass, BookOpen, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import GlobalSearch from "@/components/GlobalSearch";

export default function Navbar({ isStatic = false }) {
  const { data: session } = useSession();
  const { lang, toggleLanguage, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) {
      // eslint-disable-next-line
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleOpenMenu = () => setIsMenuOpen(true);
    window.addEventListener("open-mobile-menu", handleOpenMenu);
    return () => window.removeEventListener("open-mobile-menu", handleOpenMenu);
  }, []);

  // #14 — Ödeme geçmişi state
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isAdmin = session?.user?.id && (session.user.id === process.env.NEXT_PUBLIC_ADMIN_ID || session.user.id === (process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916"));

  const fetchPaymentHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/payment/history');
      const data = await res.json();
      if (res.ok) setPaymentHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openPaymentHistory = () => {
    setIsProfileOpen(false);
    setShowPaymentHistory(true);
    fetchPaymentHistory();
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isMenuOpen]);

  const profileRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: lang === 'tr' ? 'Onaylandi' : 'Approved', color: '#2ecc71' };
    if (status === 'pending') return { label: lang === 'tr' ? 'Bekliyor' : 'Pending', color: '#fca311' };
    if (status === 'rejected' || status === 'cancel') return { label: lang === 'tr' ? 'Reddedildi' : 'Rejected', color: '#e74c3c' };
    return { label: status, color: '#888' };
  };

  return (
    <>
      <nav className={`${isStatic ? 'absolute' : 'fixed'} top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-on-surface/10 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all`}>
        <div className="flex justify-between items-center px-3 md:px-margin-desktop py-2 max-w-container-max mx-auto">
          <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2.5 font-headline-md text-headline-md font-bold tracking-tighter text-primary-container group">
              <Logo className="w-9 h-7 transition-transform group-hover:scale-105" />
              <span className="bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">Veyronix</span>
            </Link>
            
            <div className="hidden md:flex space-x-6 lg:space-x-8 items-center border-l border-on-surface/10 pl-6 ml-2">
              
              <Link href="/killboard" className="flex items-center gap-1.5 font-body-md text-body-md text-primary-container font-bold hover:brightness-110 transition-all py-1">
                <Swords size={16} />
                Killboard
              </Link>

              {/* Dropdown for Page Sections */}
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-1">
                  {lang === 'tr' ? 'Keşfet' : 'Explore'}
                  <ChevronDown size={14} className="text-on-surface-variant group-hover:text-primary-container transition-transform group-hover:rotate-180" />
                </div>
                <div className="absolute top-[100%] left-0 mt-2 w-52 bg-[#081425]/95 backdrop-blur-2xl border border-outline-variant/50 p-2 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,215,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <Link href="/killboard" className="px-3 py-1.5 text-xs text-primary-container font-bold hover:bg-primary-container/10 transition-colors rounded-lg flex items-center gap-2">
                      <Swords size={14} /> Killboard
                    </Link>
                    <Link href="/#features" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      {lang === 'tr' ? '✨ Özellikler (Bento)' : '✨ Features (Bento)'}
                    </Link>
                    <Link href="/#comparison" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      {lang === 'tr' ? '⚡ Neden Veyronix?' : '⚡ Why Veyronix?'}
                    </Link>
                    <Link href="/#stats" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      {lang === 'tr' ? '📊 İstatistikler' : '📊 Statistics'}
                    </Link>
                    <Link href="/#faq" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      {lang === 'tr' ? '❓ SSS' : '❓ FAQ'}
                    </Link>
                    <div className="h-[1px] bg-outline-variant/30 my-1"></div>
                    <Link href="/blog" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      {t.blog}
                    </Link>
                    <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      Wiki
                    </a>
                    <Link href="/changelog" className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-lg">
                      {t.changelog}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Premium Button */}
            <Link 
              href="/premium" 
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary-container/40 bg-primary-container/10 text-primary-container hover:bg-primary-container hover:text-on-primary transition-all font-label-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]"
            >
              <span>{t.premiumBtnNavbar}</span>
              <Sparkles size={15} />
            </Link>

            {/* Language Select Dropdown */}
            <div ref={langRef} className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)} 
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container/80 border border-outline-variant/30 text-on-surface hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/10 transition-all font-label-bold shadow-sm"
                title={lang === 'tr' ? 'Dili Değiştir' : 'Change Language'}
                aria-expanded={isLangOpen}
              >
                <Globe size={15} className="text-primary-container" />
                <span className="text-xs uppercase tracking-wider font-bold">
                  {lang === 'tr' ? 'TR' : 'EN'}
                </span>
                <ChevronDown size={13} className={`text-on-surface-variant transition-transform duration-200 ${isLangOpen ? 'rotate-180 text-primary-container' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-[#081425]/95 border border-primary-container/30 backdrop-blur-2xl rounded-xl p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,215,0,0.15)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { setLanguage('tr'); setIsLangOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        lang === 'tr'
                          ? 'bg-primary-container/15 text-primary-container border border-primary-container/30 font-bold'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">🇹🇷</span> Türkçe (TR)
                      </span>
                      {lang === 'tr' && <Check size={14} className="text-primary-container stroke-[2.5]" />}
                    </button>

                    <button
                      onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        lang === 'en'
                          ? 'bg-primary-container/15 text-primary-container border border-primary-container/30 font-bold'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">🇬🇧</span> English (EN)
                      </span>
                      {lang === 'en' && <Check size={14} className="text-primary-container stroke-[2.5]" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth & Profile (Desktop & Mobile) */}
            <div className="flex items-center gap-2">
              {session ? (
                <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-on-surface/10">
                  <Link href="/dashboard" className="group relative hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-container text-on-primary font-headline-md text-xs uppercase tracking-wider hover:brightness-110 transition-all duration-300 rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]">
                    <LayoutDashboard size={15} strokeWidth={2.5} />
                    {t.dashboard}
                  </Link>

                  <div ref={profileRef} className="relative md:border-l md:border-on-surface/10 md:pl-4 md:ml-1">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1 group focus:outline-none touch-manipulation active:scale-95"
                    >
                      <div className="hidden md:flex flex-col items-end">
                        <span className="font-label-bold text-[10px] text-on-surface group-hover:text-primary-container transition-colors">
                          {session.user?.name || 'Commander'}
                        </span>
                        {isAdmin && (
                          <span className="text-[10px] text-[#ffb4ab] font-headline-md uppercase tracking-widest">Admin Access</span>
                        )}
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary-container/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img 
                          src={session.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                          alt="Avatar" 
                          width="32"
                          height="32"
                          onError={(e) => { e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-outline-variant group-hover:border-primary-container relative z-10 transition-colors duration-300 object-cover shadow-sm" 
                        />
                      </div>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 md:w-64 bg-surface-container border border-outline-variant/50 p-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 rounded-2xl">
                          <div className="flex flex-col gap-1">
                            <div className="px-2 py-1 md:hidden border-b border-outline-variant/30 mb-1">
                              <div className="text-xs font-bold text-on-surface truncate">{session.user?.name}</div>
                              {isAdmin && <span className="text-[9px] text-[#ffb4ab] uppercase font-bold">Admin</span>}
                            </div>

                            <Link 
                              href="/dashboard" 
                              className="flex items-center gap-2 px-2.5 py-2 text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-xl text-xs font-label-bold"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <LayoutDashboard size={15} />
                              <span className="uppercase tracking-wider">{t.dashboard}</span>
                            </Link>

                            {/* #14 — Odeme Gecmisi Butonu */}
                            <button
                              onClick={openPaymentHistory}
                              className="flex items-center gap-2 px-2.5 py-2 text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-xl w-full text-left text-xs font-label-bold"
                            >
                              <CreditCard size={15} />
                              <span className="uppercase tracking-wider">
                                {lang === 'tr' ? 'Ödeme Geçmişim' : 'Payment History'}
                              </span>
                            </button>
                            
                            {isAdmin && (
                              <Link 
                                href="/admin" 
                                className="flex items-center gap-2 px-2.5 py-2 text-[#ffb4ab]/90 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors rounded-xl text-xs font-label-bold"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Shield size={15} />
                                <span className="uppercase tracking-wider">Admin Panel</span>
                              </Link>
                            )}
                            
                            <div className="h-[1px] bg-outline-variant/30 my-1"></div>
                            
                            <button 
                              onClick={() => { signOut(); setIsProfileOpen(false); }} 
                              className="flex items-center gap-2 px-2.5 py-2 text-error/90 hover:text-error hover:bg-error/10 transition-colors rounded-xl w-full text-left text-xs font-label-bold"
                            >
                              <LogOut size={15} />
                              <span className="uppercase tracking-wider">{t.logout}</span>
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => signIn("discord")} 
                  className="bg-primary-container text-on-primary px-3 py-1.5 font-label-bold text-xs uppercase tracking-wider transition-all duration-300 ease-in-out active:scale-95 hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] rounded-xl"
                  aria-label="Discord Login"
                >
                  <span className="flex items-center gap-1.5">
                    <LogIn size={13} className="shrink-0" />
                    <span className="sm:hidden font-bold">{lang === 'tr' ? 'Giriş' : 'Login'}</span>
                    <span className="hidden sm:inline">{t.login}</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* #14 — Odeme Gecmisi Full-Screen Modal */}
      {showPaymentHistory && (
        <div 
          style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',overflowY:'auto'}}
          onClick={() => setShowPaymentHistory(false)}
        >
          <div 
            style={{position:'relative',width:'100%',maxWidth:'760px',margin:'auto'}}
            onClick={e => e.stopPropagation()}
          >
            <div style={{background:'#0f1117',border:'1px solid rgba(255,215,0,0.15)',borderRadius:'20px',padding:'2rem',maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
              
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',paddingBottom:'1rem',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div style={{width:44,height:44,borderRadius:'12px',background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <CreditCard size={22} color="#fca311" />
                  </div>
                  <div>
                    <h2 style={{fontSize:'1.3rem',fontWeight:'800',color:'#fff',margin:0}}>
                      {lang === 'tr' ? 'Odeme Gecmisim' : 'Payment History'}
                    </h2>
                    <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',margin:0}}>
                      {lang === 'tr' ? 'Tum kripto ve havale/EFT islemleriniz' : 'All your crypto & bank transfer transactions'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPaymentHistory(false)} 
                  style={{padding:'0.5rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.6)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div style={{overflowY:'auto',flex:1,paddingRight:'4px'}}>
                {historyLoading ? (
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'4rem',gap:'1rem',color:'#fca311'}}>
                    <Loader2 size={40} style={{animation:'spin 1s linear infinite'}} />
                    <span style={{fontWeight:'600',letterSpacing:'2px',fontSize:'0.85rem',textTransform:'uppercase',opacity:0.7}}>
                      {lang === 'tr' ? 'Yukleniyor...' : 'Loading...'}
                    </span>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div style={{textAlign:'center',padding:'4rem',color:'rgba(255,255,255,0.3)'}}>
                    <AlertCircle size={48} style={{margin:'0 auto 1rem',opacity:0.4}} />
                    <p style={{fontSize:'1rem',fontWeight:'600'}}>
                      {lang === 'tr' ? 'Henuz islem gecmisiniz bulunmuyor.' : 'No payment history found.'}
                    </p>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                    {paymentHistory.map((p) => {
                      const badge = getStatusBadge(p.status);
                      const date = new Date(p.created_at).toLocaleDateString(
                        lang === 'tr' ? 'tr-TR' : 'en-US', 
                        { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }
                      );
                      const isHavale = p.payment_method === 'havale';

                      return (
                        <div key={p.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'1.2rem 1.5rem',display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                          {/* Icon */}
                          <div style={{width:40,height:40,borderRadius:'10px',background:isHavale?'rgba(46,204,113,0.1)':'rgba(252,163,17,0.1)',border:`1px solid ${isHavale?'rgba(46,204,113,0.3)':'rgba(252,163,17,0.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <CreditCard size={14} color={isHavale?'#2ecc71':'#fca311'} />
                          </div>

                          {/* Info */}
                          <div style={{flex:1,minWidth:'180px'}}>
                            <div style={{fontWeight:'700',fontSize:'0.95rem',color:'#fff',marginBottom:'0.2rem'}}>
                              {p.guild_name || (lang === 'tr' ? 'Bilinmeyen Sunucu' : 'Unknown Server')}
                            </div>
                            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center'}}>
                              <span style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                                <Clock size={12} /> {date}
                              </span>
                              <span style={{background:isHavale?'rgba(46,204,113,0.1)':'rgba(252,163,17,0.1)',color:isHavale?'#2ecc71':'#fca311',padding:'0.1rem 0.5rem',borderRadius:'4px',fontSize:'0.65rem',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px'}}>
                                {isHavale ? (lang === 'tr' ? 'Havale/EFT' : 'Bank Transfer') : 'Crypto'}
                              </span>
                              {p.description_code && (
                                <span style={{fontFamily:'monospace',fontSize:'0.7rem',letterSpacing:'2px',color:'rgba(255,255,255,0.45)'}}>
                                  #{p.description_code}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontWeight:'800',color:'#fca311',fontSize:'1rem'}}>
                              {p.amount} <span style={{fontSize:'0.7rem',fontWeight:'600',color:'rgba(255,215,0,0.6)'}}>{p.currency}</span>
                            </div>
                            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)'}}>
                              {p.duration_days} {lang === 'tr' ? 'Gun' : 'Days'}
                            </div>
                          </div>

                          {/* Status */}
                          <div style={{flexShrink:0}}>
                            <span style={{background:`${badge.color}18`,color:badge.color,border:`1px solid ${badge.color}44`,padding:'0.3rem 0.8rem',borderRadius:'20px',fontSize:'0.7rem',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',display:'flex',alignItems:'center',gap:'0.4rem',whiteSpace:'nowrap'}}>
                              {p.status === 'paid' ? <CheckCircle size={13}/> : p.status === 'pending' ? <Clock size={13}/> : <XCircle size={13}/>}
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 z-[120] transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-out flex`}>
        {/* Backdrop */}
        <div 
          className={`flex-grow bg-black/85 backdrop-blur-md transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* Sliding Content Area */}
        <div className="w-[88%] sm:w-[380px] max-w-sm bg-[#060812] border-l border-outline-variant/30 flex flex-col relative h-full shadow-2xl z-50">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>
          
          {/* Drawer Top Header */}
          <div className="flex justify-between items-center px-4 py-3.5 border-b border-outline-variant/20 bg-surface-container-lowest/60">
            <span className="flex items-center gap-2.5 font-headline-md text-base font-bold tracking-tight text-on-surface">
              <Logo className="w-7 h-7" />
              <span>Veyronix</span>
            </span>
            <button 
              className="p-2 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant hover:text-primary-container hover:bg-surface-container-high transition-colors" 
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Drawer Navigation List */}
          <nav className="flex-grow px-3.5 py-4 flex flex-col gap-y-5 overflow-y-auto custom-scrollbar relative z-10">
            
            {/* SECTION 1: ANA NAVİGASYON */}
            <div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-lg bg-primary-container/10 border border-primary-container/20 w-fit">
                <span className="text-[10px] font-label-bold text-primary-container uppercase tracking-[0.2em]">
                  {lang === 'tr' ? '📍 Ana Menü' : '📍 Navigation'}
                </span>
              </div>

              <div className="space-y-2">
                <Link 
                  href="/" 
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-container-high/50 hover:bg-primary-container/15 border border-outline-variant/30 hover:border-primary-container/50 transition-all group touch-manipulation active:scale-[0.98]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                      <Home size={16} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface group-hover:text-primary-container transition-colors">
                      {lang === 'tr' ? 'Ana Sayfa' : 'Home'}
                    </span>
                  </div>
                  <ChevronRight size={15} className="text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all" />
                </Link>

                <Link 
                  href="/dashboard" 
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-container-high/50 hover:bg-primary-container/15 border border-outline-variant/30 hover:border-primary-container/50 transition-all group touch-manipulation active:scale-[0.98]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <LayoutDashboard size={16} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface group-hover:text-primary-container transition-colors">
                      {t.dashboard}
                    </span>
                  </div>
                  <ChevronRight size={15} className="text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all" />
                </Link>

                <Link 
                  href="/premium" 
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-primary-container/10 via-surface-container-high/60 to-surface-container-high/60 border border-primary-container/40 shadow-[0_0_20px_rgba(255,215,0,0.1)] group touch-manipulation active:scale-[0.98]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                      <Sparkles size={16} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primary-container">
                        {t.premiumBtnNavbar}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-container text-on-primary">
                        PRO
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-primary-container group-hover:translate-x-1 transition-all" />
                </Link>

                {session && (
                  <button
                    onClick={() => { setIsMenuOpen(false); openPaymentHistory(); }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-container-high/50 hover:bg-primary-container/15 border border-outline-variant/30 hover:border-primary-container/50 transition-all group touch-manipulation active:scale-[0.98] text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <CreditCard size={16} />
                      </div>
                      <span className="text-xs font-semibold text-on-surface group-hover:text-primary-container transition-colors">
                        {lang === 'tr' ? 'Ödeme Geçmişim' : 'Payment History'}
                      </span>
                    </div>
                    <ChevronRight size={15} className="text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 2: KEŞFET & SAYFALAR (ACCORDION) */}
            <div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-lg bg-white/[0.04] border border-white/10 w-fit">
                <span className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-[0.2em]">
                  {lang === 'tr' ? '🧭 Keşfet & Kaynaklar' : '🧭 Resources'}
                </span>
              </div>

              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 overflow-hidden">
                <button 
                  className="w-full p-3 flex items-center justify-between hover:bg-surface-container-high/40 transition-colors text-left"
                  onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass size={16} className="text-primary-container" />
                    <span className="text-xs font-semibold text-on-surface">
                      {lang === 'tr' ? 'Sayfa Bölümleri & Wiki' : 'Explore Sections'}
                    </span>
                  </div>
                  <ChevronDown className={`text-on-surface-variant transition-transform duration-300 ${isMobileExploreOpen ? 'rotate-180 text-primary-container' : ''}`} size={16} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out px-3 pb-2 flex flex-col gap-1 ${isMobileExploreOpen ? 'max-h-[500px] border-t border-outline-variant/20 pt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <Link href="/#features" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>{lang === 'tr' ? '✨ Özellikler' : '✨ Features'}</span>
                    <ChevronRight size={13} className="opacity-50" />
                  </Link>
                  <Link href="/#comparison" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>{lang === 'tr' ? '⚡ Neden Veyronix?' : '⚡ Why Veyronix?'}</span>
                    <ChevronRight size={13} className="opacity-50" />
                  </Link>
                  <Link href="/#stats" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>{lang === 'tr' ? '📊 İstatistikler' : '📊 Stats'}</span>
                    <ChevronRight size={13} className="opacity-50" />
                  </Link>
                  <Link href="/#faq" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>{lang === 'tr' ? '❓ SSS' : '❓ FAQ'}</span>
                    <ChevronRight size={13} className="opacity-50" />
                  </Link>
                  <Link href="/blog" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>{t.blog}</span>
                    <ChevronRight size={13} className="opacity-50" />
                  </Link>
                  <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>📚 Wiki & Dokümantasyon</span>
                    <ExternalLink size={12} className="opacity-50" />
                  </a>
                  <Link href="/changelog" className="py-2 px-3 rounded-xl text-xs text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    <span>{t.changelog}</span>
                    <ChevronRight size={13} className="opacity-50" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* SECTION 3: DİL SEÇİMİ */}
            <div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-lg bg-white/[0.04] border border-white/10 w-fit">
                <span className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-[0.2em]">
                  {lang === 'tr' ? '🌐 Dil Seçimi' : '🌐 Language'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage('tr')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-label-bold flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-95 ${
                    lang === 'tr'
                      ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.25)] font-bold'
                      : 'bg-surface-container-high/50 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="text-base">🇹🇷</span> Türkçe
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-label-bold flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-95 ${
                    lang === 'en'
                      ? 'bg-primary-container text-on-primary shadow-[0_0_15px_rgba(255,215,0,0.25)] font-bold'
                      : 'bg-surface-container-high/50 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="text-base">🇬🇧</span> English
                </button>
              </div>
            </div>

            {/* SECTION 4: ADMIN (IF ADMIN) */}
            {isAdmin && (
              <div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-lg bg-error/10 border border-error/20 w-fit">
                  <span className="text-[10px] font-label-bold text-error uppercase tracking-[0.2em]">
                    🛡️ Admin
                  </span>
                </div>
                <Link 
                  href="/admin" 
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-error/10 hover:bg-error/20 border border-error/30 transition-all text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-error" />
                    <span className="text-xs font-bold text-error">Admin Panel</span>
                  </div>
                  <ChevronRight size={15} className="text-error" />
                </Link>
              </div>
            )}
          </nav>
          
          {/* Drawer Bottom Actions */}
          <div className="p-4 pb-24 sm:pb-6 bg-[#060812] border-t border-outline-variant/20 space-y-3 relative z-10">
            {session ? (
              <button 
                onClick={() => { signOut(); setIsMenuOpen(false); }} 
                className="w-full py-2.5 px-4 border border-error/40 text-error hover:bg-error/10 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={15} />
                <span>{t.logout}</span>
              </button>
            ) : (
              <button 
                onClick={() => { signIn("discord"); setIsMenuOpen(false); }} 
                className="w-full py-2.5 px-4 bg-primary-container text-on-primary rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 tactical-glow"
              >
                <LogIn size={15} />
                <span>{lang === 'tr' ? 'Discord ile Giriş' : 'Login with Discord'}</span>
              </button>
            )}
            
            <div className="text-center">
              <p className="text-[10px] text-on-surface-variant/40 font-mono">
                &copy; 2026 Veyronix Platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
