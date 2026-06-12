"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useLanguage } from "@/context/LanguageContext";

export default function DistanceSalesAgreement() {
  const { lang } = useLanguage();

  const active = t.legal.sales;

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2rem', marginBottom: '2rem' }}>{active.title}</h1>
          
          <div style={{ lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h1}</h2>
              <p>{active.p1}</p>
              <p style={{ whiteSpace: 'pre-wrap' }}><strong>{active.satici}</strong></p>
              <p><strong>{active.alici}</strong></p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h2}</h2>
              <p>{active.p2}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h3}</h2>
              <p>{active.p3}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h4}</h2>
              <p>{active.p4}</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h5}</h2>
              <p>{active.p5_1}</p>
              <p>{active.p5_2}</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
