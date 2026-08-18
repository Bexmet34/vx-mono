"use client";
import { LINKS } from '@veyronix/config';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, lang } = useLanguage();
  
  const activeContent = t.legal.about;

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem', minHeight: '80vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{t.hakkimizda}</h1>
          
          <div style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {activeContent.p1}
            </p>
            <p>
              {activeContent.p2}
            </p>
          </div>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{activeContent.infoTitle}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <Phone size={14} />
                <span style={{ fontWeight: '600' }}>{t.phone}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>0551 078 82 61</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <Mail size={14} />
                <span style={{ fontWeight: '600' }}>{t.email}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>${LINKS.SUPPORT_EMAIL}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <MapPin size={14} />
                <span style={{ fontWeight: '600' }}>{t.address}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>{activeContent.addressVal}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <MessageSquare size={14} />
                <span style={{ fontWeight: '600' }}>{t.support}</span>
              </div>
              <a href="${LINKS.SUPPORT_SERVER}" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>{activeContent.supportVal}</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
