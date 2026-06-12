"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useLanguage } from "@/context/LanguageContext";

export default function DeliveryPolicy() {
  const { t } = useLanguage();
  const active = t.legal.delivery;

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem', minHeight: '80vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2rem', marginBottom: '2rem' }}>{active.title}</h1>
          
          <div style={{ lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h1}</h2>
              <p style={{ marginBottom: '1rem' }}>{active.p1}</p>
              <p style={{ marginBottom: '1rem' }}>{active.p2}</p>
              <p style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '1rem' }}>
                {active.important}
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h2}</h2>
              <p>{active.p3}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h3}</h2>
              <p>{active.p4}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
