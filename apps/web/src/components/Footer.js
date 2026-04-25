"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, MessageCircle, Book, Shield, FileText, LayoutDashboard, Code, History } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{ 
      marginTop: '5rem',
      borderTop: '1px solid var(--border-color)',
      background: 'rgba(11, 12, 16, 0.95)',
      padding: '4rem 2rem 2rem 2rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
        
        {/* Brand Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Link href="/" className="text-logo" style={{ fontSize: '1.8rem', padding: 0 }}>Veyronix</Link>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1rem' }}>
            {t.footerDesc}
          </p>
        </div>

        {/* Resources Section */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '800' }}>{t.footerResources}</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li>
              <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <Book size={18} /> {t.wiki}
              </a>
            </li>
            <li>
              <Link href="/#commands" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <FileText size={18} /> {t.commands}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <LayoutDashboard size={18} /> {t.dashboard}
              </Link>
            </li>
            <li>
              <Link href="/changelog" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <History size={18} /> {t.changelog}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Section */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '800' }}>{t.footerLegal}</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li>
              <Link href="/privacy" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <Shield size={18} /> {t.privacy} & KVKK
              </Link>
            </li>
            <li>
              <Link href="/terms" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <FileText size={18} /> {t.terms}
              </Link>
            </li>
            <li>
              <Link href="/mesafeli-satis-sozlesmesi" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <FileText size={18} /> Mesafeli Satış Sözleşmesi
              </Link>
            </li>
            <li>
              <Link href="/iptal-ve-iade-kosullari" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                <History size={18} /> İptal ve İade Koşulları
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '800' }}>İletişim</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li>
              <Link href="/hakkimizda" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-accent">
                Hakkımızda & İletişim
              </Link>
            </li>
            <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tel: 0551 078 82 61
            </li>
            <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              E-posta: hakkibsknn@gmail.com
            </li>
          </ul>
        </div>


      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '2rem auto 0 auto', 
        paddingTop: '2rem', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        <p>© {new Date().getFullYear()} Veyronix. {t.allRights}</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/" className="hover-accent">Home</Link>
          <a href="https://docs.veyronix.com.tr/" target="_blank" rel="noopener noreferrer" className="hover-accent">Wiki</a>
          <Link href="/changelog" className="hover-accent">{t.changelog}</Link>
          <a href="https://top.gg/bot/1082239904169336902" target="_blank" rel="noopener noreferrer" className="hover-accent">Top.gg</a>
        </div>
      </div>

      <style jsx>{`
        .hover-accent:hover {
          color: var(--accent-color) !important;
          transition: 0.2s;
        }
      `}</style>
    </footer>
  );
}
