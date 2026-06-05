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

  const isAdmin = session?.user?.id && (session.user.id === process.env.NEXT_PUBLIC_ADMIN_ID || session.user.id === "407234961582587916");

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/" className="navbar-brand text-logo">
              Veyronix
            </Link>
            <div className="desktop-links">
              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="nav-link">
                Wiki
              </a>
              <Link href="/changelog" className="nav-link">
                {t.changelog}
              </Link>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="desktop-menu">
            <button onClick={toggleLanguage} className="lang-toggle">
              <Globe size={18} />
              {lang === 'en' ? 'TR' : 'EN'}
            </button>

            {session ? (
              <div className="auth-user">
                {isAdmin && (
                  <Link href="/admin" className="admin-pill">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: '0.9rem' }}>
                  <LayoutDashboard size={18} />
                  {t.dashboard}
                </Link>
                <button onClick={() => signOut()} className="icon-btn" title={t.logout}>
                  <LogOut size={20} />
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
          <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-links">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</Link>
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>{t.dashboard}</Link>
            <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>{t.wiki}</a>
            <Link href="/changelog" onClick={() => setIsMenuOpen(false)}>{t.changelog}</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--accent-color)' }}>Admin Panel</Link>
            )}
          </div>

          <div className="mobile-footer">
            <button onClick={toggleLanguage} className="signout-btn" style={{ width: '100%', justifyContent: 'center' }}>
              <Globe size={18} />
              {lang === 'en' ? 'Türkçe\'ye Geç' : 'Switch to English'}
            </button>
            
            {session ? (
              <button onClick={() => signOut()} className="signout-btn" style={{ width: '100%', justifyContent: 'center', background: 'rgba(231, 76, 60, 0.1)', color: '#ff4d4f', borderColor: 'rgba(231, 76, 60, 0.2)' }}>
                <LogOut size={18} />
                {t.logout}
              </button>
            ) : (
              <button onClick={() => signIn("discord")} className="btn-primary" style={{ width: '100%' }}>
                <LogIn size={20} />
                {t.login}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .desktop-links {
          display: flex;
          gap: 1.5rem;
        }
        .nav-link {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.95rem;
        }
        .nav-link:hover {
          color: var(--text-main);
        }
        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .lang-toggle {
          background: transparent;
          color: var(--text-muted);
          font-weight: 700;
          padding: 0.5rem;
          border: 1px solid transparent;
        }
        .lang-toggle:hover {
          color: var(--accent-color);
        }
        .admin-pill {
          background: var(--accent-color);
          color: var(--bg-color);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .icon-btn {
          background: transparent;
          color: var(--text-muted);
          padding: 0.5rem;
        }
        .icon-btn:hover {
          color: #ff4d4f;
        }
        .mobile-toggle {
          display: none;
          background: transparent;
          color: var(--text-main);
          padding: 0.5rem;
        }
        
        .mobile-overlay {
          position: fixed;
          top: var(--nav-height);
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-color);
          z-index: 999;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          padding: 2rem;
        }
        .mobile-overlay.open {
          transform: translateX(0);
        }
        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }
        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .mobile-links a {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .mobile-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 2rem;
        }

        @media (max-width: 960px) {
          .desktop-links, .desktop-menu { display: none; }
          .mobile-toggle { display: flex; }
        }
      `}</style>
    </nav>
  );
}

