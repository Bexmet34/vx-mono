"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Shield size={64} color="var(--accent-color)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>{t.privacy}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Last updated: April 2026</p>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={24} /> Information Collection
            </h2>
            <p>Veyronix collects minimal data required for functionality. This includes your Discord user ID, server IDs where the bot is present, and basic settings you configure.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={24} /> Data Usage
            </h2>
            <p>Your data is used solely to provide party management services and synchronize your Albion Online guild settings with Discord. We never sell or share your data with third parties.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} /> Security
            </h2>
            <p>We implement industry-standard security measures to protect your information. Database access is restricted and encrypted.</p>
          </section>
          
          <p style={{ marginTop: '3rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            By using Veyronix, you agree to these practices. If you have questions, please contact us via our support server.
          </p>
        </div>
      </main>
    </>
  );
}
