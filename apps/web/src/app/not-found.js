"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const { t, lang } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Glows */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(252, 163, 17, 0.08) 0%, transparent 70%)',
          zIndex: -1,
          filter: 'blur(50px)'
        }}></div>

        <div className="glass-panel animate-fade-in" style={{ 
          maxWidth: '450px', 
          width: '100%', 
          padding: '2.5rem 1.5rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            background: 'rgba(252, 163, 17, 0.08)',
            padding: '1.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(252, 163, 17, 0.15)',
            marginBottom: '0.5rem',
            animation: 'float 6s ease-in-out infinite'
          }}>
            <FileQuestion size={60} color="var(--accent-color)" strokeWidth={1.5} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h1 className="text-logo" style={{ fontSize: '2.5rem', margin: 0 }}>
              404
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {t.error404Title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5', maxWidth: '350px', margin: '0 auto' }}>
              {t.error404Desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              <Home size={18} />
              {t.backToHome}
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="signout-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
            >
              <ArrowLeft size={18} />
              {lang === 'en' ? 'Go Back' : 'Geri Dön'}
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}

