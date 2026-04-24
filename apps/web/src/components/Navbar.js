"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { LogIn, LogOut, LayoutDashboard, Globe, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { lang, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar" style={{ padding: '0 1.5rem', height: 'var(--nav-height)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="navbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className="navbar-brand text-logo">
            Veyronix
          </Link>
          <Link href="/wiki" style={{ color: 'var(--text-muted)', fontWeight: '600', transition: '0.2s' }} className="nav-link desktop-only">
            Wiki
          </Link>
          <Link href="/changelog" style={{ color: 'var(--text-muted)', fontWeight: '600', transition: '0.2s' }} className="nav-link desktop-only">
            {t.changelog}
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-only">
          <button onClick={toggleLanguage} className="signout-btn" style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: '8px' }}>
            <Globe size={18} />
            {lang === 'en' ? 'TR' : 'EN'}
          </button>
          {session ? (
            <div className="auth-user">
              <Link href="/dashboard" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>
                <LayoutDashboard size={18} />
                {t.dashboard}
              </Link>
              <button onClick={() => signOut()} className="signout-btn">
                <LogOut size={16} />
                {t.logout}
              </button>
              {session.user?.image && (
                <img src={session.user.image} alt="Avatar" className="avatar" />
              )}
            </div>
          ) : (
            <button onClick={() => signIn("discord")} className="btn-primary">
              <LogIn size={18} />
              {t.login}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '0.5rem' }}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{ 
          position: 'fixed', 
          top: 'var(--nav-height)', 
          left: 0, 
          right: 0, 
          background: 'var(--bg-color)', 
          padding: '2rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 100,
          animation: 'fadeIn 0.3s ease'
        }}>
          <Link href="/wiki" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t.wiki}</Link>
          <Link href="/changelog" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t.changelog}</Link>
          <div style={{ height: '1px', background: 'var(--border-color)' }}></div>
          {session ? (
            <>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="btn-primary" style={{ justifyContent: 'center' }}>
                <LayoutDashboard size={18} />
                {t.dashboard}
              </Link>
              <button onClick={() => signOut()} className="signout-btn" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem' }}>
                <LogOut size={16} />
                {t.logout}
              </button>
            </>
          ) : (
            <button onClick={() => signIn("discord")} className="btn-primary" style={{ justifyContent: 'center' }}>
              <LogIn size={18} />
              {t.login}
            </button>
          )}
          <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="signout-btn" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem' }}>
            <Globe size={18} />
            {lang === 'en' ? 'Bahasa TR' : 'Language EN'}
          </button>
        </div>
      )}

      <style jsx>{`
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
        }
      `}</style>
    </nav>
  );
}
