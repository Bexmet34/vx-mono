"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { Gavel, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Gavel size={64} color="var(--accent-color)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>{t.terms}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Last updated: April 2026</p>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} /> Acceptable Use
            </h2>
            <p>You agree to use Veyronix only for its intended purpose: managing Albion Online parties. Any attempt to exploit or misuse the bot's features is prohibited.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={24} /> Service Modifications
            </h2>
            <p>We reserve the right to modify or discontinue any part of the service at any time. Subscription terms are subject to change with prior notice.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={24} /> Liability
            </h2>
            <p>Veyronix is provided "as is". While we strive for 100% uptime, we are not responsible for any impact caused by service interruptions or Albion Online API changes.</p>
          </section>
          
          <p style={{ marginTop: '3rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            Violation of these terms may result in your server being restricted from using Veyronix services.
          </p>
        </div>
      </main>
    </>
  );
}
