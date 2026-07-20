"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { LogIn, LogOut, LayoutDashboard, Globe, Menu, X, ChevronRight, ChevronDown, Shield, CreditCard, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import GlobalSearch from "@/components/GlobalSearch";

export default function Navbar({ isStatic = false }) {
  const { data: session } = useSession();
  const { lang, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

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
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
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
      <nav className={`${isStatic ? 'absolute' : 'fixed'} top-0 w-full z-40 bg-surface/80 backdrop-blur-md border-b border-on-surface/10 shadow-[0_0_15px_rgba(255,215,0,0.15)] transition-all`}>
        <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-headline-md text-headline-md font-bold tracking-tighter text-primary-container">
              <Logo className="w-10 h-10" />
              Veyronix
            </Link>
            
            <div className="hidden md:flex space-x-6 lg:space-x-8 items-center border-l border-on-surface/10 pl-6">
              
              {/* Dropdown for Page Sections */}
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-1 font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors py-2">
                  {lang === 'tr' ? 'Keşfet' : 'Explore'}
                  <ChevronDown size={14} className="text-on-surface-variant group-hover:text-primary transition-transform group-hover:rotate-180" />
                </div>
                <div className="absolute top-[100%] left-0 mt-0 w-48 bg-surface-container border border-outline-variant/50 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-md">
                  <div className="flex flex-col gap-1">
                    <Link href="/#features" className="px-4 py-2 text-sm text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm">
                      {lang === 'tr' ? 'Özellikler' : 'Features'}
                    </Link>
                    <Link href="/#dashboard" className="px-4 py-2 text-sm text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm">
                      Dashboard
                    </Link>
                    <Link href="/#commands" className="px-4 py-2 text-sm text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm">
                      {lang === 'tr' ? 'Komuta Merkezi' : 'Commands'}
                    </Link>
                    <Link href="/#pricing" className="px-4 py-2 text-sm text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm">
                      {lang === 'tr' ? 'Fiyatlar' : 'Pricing'}
                    </Link>
                    <Link href="/#faq" className="px-4 py-2 text-sm text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm">
                      {lang === 'tr' ? 'SSS' : 'FAQ'}
                    </Link>
                  </div>
                </div>
              </div>

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
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* Premium Button */}
            <Link 
              href="/premium" 
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-container/50 bg-primary-container/10 text-primary-container hover:bg-primary-container hover:text-on-primary transition-all font-label-bold shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              <span>{t.premiumBtnNavbar}</span>
              <Sparkles size={16} />
            </Link>

            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 border border-outline-variant/30 text-on-surface-variant hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/10 transition-all font-label-bold shadow-sm"
              title="Change Language"
            >
              <Globe size={16} className={lang === 'en' ? 'text-[#ffb4ab]' : 'text-primary-container'} />
              <span className="text-xs uppercase tracking-wider">{lang === 'en' ? 'TR' : 'EN'}</span>
            </button>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <div className="flex items-center gap-4 pl-4 border-l border-on-surface/10">
                  <Link href="/dashboard" className="group relative hidden md:flex items-center gap-2 px-5 py-2 bg-primary-container text-on-primary font-headline-md text-sm uppercase tracking-wider hover:brightness-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]">
                    <div className="absolute inset-0 border border-primary-container group-hover:scale-[1.04] transition-transform duration-300"></div>
                    <LayoutDashboard size={16} strokeWidth={2.5} />
                    {t.dashboard}
                  </Link>

                  <div ref={profileRef} className="relative border-l border-on-surface/10 pl-4 md:pl-6 ml-1 md:ml-2">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 group focus:outline-none"
                    >
                      <div className="hidden md:flex flex-col items-end">
                        <span className="font-label-bold text-sm text-on-surface group-hover:text-primary-container transition-colors">
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
                          width="40"
                          height="40"
                          className="w-10 h-10 rounded-full border-2 border-outline-variant group-hover:border-primary-container relative z-10 transition-colors duration-300 object-cover" 
                        />
                      </div>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-4 w-64 bg-surface-container border border-outline-variant/50 p-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 rounded-sm">
                          <div className="flex flex-col gap-1">
                            <Link 
                              href="/dashboard" 
                              className="md:hidden flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <LayoutDashboard size={16} />
                              <span className="font-label-bold text-xs uppercase tracking-wider">{t.dashboard}</span>
                            </Link>

                            {/* #14 — Odeme Gecmisi Butonu */}
                            <button
                              onClick={openPaymentHistory}
                              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-colors rounded-sm w-full text-left"
                            >
                              <CreditCard size={16} />
                              <span className="font-label-bold text-xs uppercase tracking-wider">
                                {lang === 'tr' ? 'Odeme Gecmisim' : 'Payment History'}
                              </span>
                            </button>
                            
                            {isAdmin && (
                              <Link 
                                href="/admin" 
                                className="flex items-center gap-3 px-4 py-3 text-[#ffb4ab]/80 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors rounded-sm"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Shield size={16} />
                                <span className="font-label-bold text-xs uppercase tracking-wider">Admin Panel</span>
                              </Link>
                            )}
                            
                            <div className="h-[1px] bg-outline-variant/30 my-1"></div>
                            
                            <button 
                              onClick={() => { signOut(); setIsProfileOpen(false); }} 
                              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors rounded-sm w-full text-left"
                            >
                              <LogOut size={16} />
                              <span className="font-label-bold text-xs uppercase tracking-wider">{t.logout}</span>
                            </button>
                          </div>
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
              aria-label="Open menu"
            >
              <Menu size={32} />
            </button>
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
                  <X size={20} />
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
                            <CreditCard size={18} color={isHavale?'#2ecc71':'#fca311'} />
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
      <div className={`fixed inset-0 z-50 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-out flex`}>
        {/* Backdrop */}
        <div 
          className={`flex-grow bg-background/50 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        {/* Sliding Content Area */}
        <div className="w-[85%] max-w-sm glass-panel flex flex-col relative h-full">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-right from-transparent via-primary-container/30 to-transparent"></div>
          
          <div className="flex justify-between items-center px-6 py-6 border-b border-on-surface/10">
            <span className="flex items-center gap-2 font-headline-md text-headline-md font-bold tracking-tighter text-primary-container">
              <Logo className="w-8 h-8" />
              Veyronix
            </span>
            <button 
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors" 
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-grow px-6 py-8 flex flex-col gap-y-6 overflow-y-auto relative z-10">
            <div className="menu-item-group">
              <span className="text-[10px] font-label-bold text-outline uppercase tracking-[0.2em] mb-4 block">Central Hub</span>
              <Link href="/" className="menu-item-hover group flex items-center justify-between py-2 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-container transition-transform group-active:translate-x-2 pointer-events-none">{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</span>
                <ChevronRight className="text-primary-container/20 group-hover:text-primary-container transition-colors pointer-events-none" />
              </Link>
              <div className="indicator"></div>
              
              <Link href="/dashboard" className="menu-item-hover group flex items-center justify-between py-2 mt-4 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2 pointer-events-none">{t.dashboard}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors pointer-events-none" />
              </Link>
              <div className="indicator"></div>

              {/* Premium Button Mobile */}
              <Link href="/premium" className="menu-item-hover group flex items-center justify-between py-2 mt-4 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-container hover:brightness-110 transition-all group-active:translate-x-2 pointer-events-none flex items-center gap-2">
                  {t.premiumBtnNavbar} <Sparkles size={18} />
                </span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors pointer-events-none" />
              </Link>
              <div className="indicator"></div>

              {/* #14 Mobile - Payment History */}
              {session && (
                <>
                  <button
                    className="menu-item-hover group flex items-center justify-between py-2 mt-4 w-full text-left"
                    onClick={() => { setIsMenuOpen(false); openPaymentHistory(); }}
                  >
                    <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2 pointer-events-none">
                      {lang === 'tr' ? 'Odeme Gecmisim' : 'Payment History'}
                    </span>
                    <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors pointer-events-none" />
                  </button>
                  <div className="indicator"></div>
                </>
              )}
            </div>

            <div className="menu-item-group">
              <span className="text-[10px] font-label-bold text-outline uppercase tracking-[0.2em] mb-4 block">Resources</span>
              
              {/* Mobile Accordion for Page Sections */}
              <button 
                className="menu-item-hover w-full group flex items-center justify-between py-2 cursor-pointer" 
                onClick={() => setIsMobileExploreOpen(!isMobileExploreOpen)}
              >
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant group-hover:text-primary-container transition-all">
                  {lang === 'tr' ? 'Sayfa Bölümleri' : 'Page Sections'}
                </span>
                <ChevronDown className={`text-primary-container/50 transition-transform duration-300 ${isMobileExploreOpen ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-2 ${isMobileExploreOpen ? 'max-h-[350px] mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link href="/#features" className="pl-4 py-2 text-sm text-on-surface-variant hover:text-primary-container border-l-2 border-primary-container/20 hover:border-primary-container transition-all" onClick={() => setIsMenuOpen(false)}>
                  {lang === 'tr' ? 'Özellikler' : 'Features'}
                </Link>
                <Link href="/#dashboard" className="pl-4 py-2 text-sm text-on-surface-variant hover:text-primary-container border-l-2 border-primary-container/20 hover:border-primary-container transition-all" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/#commands" className="pl-4 py-2 text-sm text-on-surface-variant hover:text-primary-container border-l-2 border-primary-container/20 hover:border-primary-container transition-all" onClick={() => setIsMenuOpen(false)}>
                  {lang === 'tr' ? 'Komuta Merkezi' : 'Command Center'}
                </Link>
                <Link href="/#pricing" className="pl-4 py-2 text-sm text-on-surface-variant hover:text-primary-container border-l-2 border-primary-container/20 hover:border-primary-container transition-all" onClick={() => setIsMenuOpen(false)}>
                  {lang === 'tr' ? 'Fiyatlandırma' : 'Pricing'}
                </Link>
                <Link href="/#faq" className="pl-4 py-2 text-sm text-on-surface-variant hover:text-primary-container border-l-2 border-primary-container/20 hover:border-primary-container transition-all" onClick={() => setIsMenuOpen(false)}>
                  {lang === 'tr' ? 'SSS' : 'FAQ'}
                </Link>
              </div>
              <div className="indicator mt-2"></div>

              <Link href="/blog" className="menu-item-hover group flex items-center justify-between py-2 mt-4 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2 pointer-events-none">{t.blog}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors pointer-events-none" />
              </Link>
              <div className="indicator"></div>

              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="menu-item-hover group flex items-center justify-between py-2 mt-4 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2 pointer-events-none">{t.wiki}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors pointer-events-none" />
              </a>
              <div className="indicator"></div>

              <Link href="/changelog" className="menu-item-hover group flex items-center justify-between py-2 mt-4 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant hover:text-primary-container transition-all group-active:translate-x-2 pointer-events-none">{t.changelog}</span>
                <ChevronRight className="text-primary-container/0 group-hover:text-primary-container transition-colors pointer-events-none" />
              </Link>
              <div className="indicator"></div>
            </div>
            
            {isAdmin && (
              <div className="menu-item-group">
                <span className="text-[10px] font-label-bold text-error uppercase tracking-[0.2em] mb-4 block">Admin</span>
                <Link href="/admin" className="menu-item-hover group flex items-center justify-between py-2 cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-error hover:text-error-container transition-all group-active:translate-x-2 pointer-events-none">Admin Panel</span>
                  <ChevronRight className="text-error/0 group-hover:text-error transition-colors pointer-events-none" />
                </Link>
                <div className="indicator !bg-error"></div>
              </div>
            )}
          </nav>
          
          <div className="px-6 py-10 bg-surface-container-low border-t border-on-surface/10 space-y-8 relative z-10">
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
                &copy; 2024 Veyronix Tactical Command. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="scanline"></div>
          </div>
        </div>
      </div>
    </>
  );
}
