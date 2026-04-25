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
              <CheckCircle size={24} /> Kullanım Şartları
            </h2>
            <p>Veyronix hizmetlerini kullanarak, bu şartları kabul etmiş sayılırsınız. Botun sunduğu özellikleri kötüye kullanmak, tersine mühendislik yapmak veya servisleri aksatacak faaliyetlerde bulunmak yasaktır.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={24} /> Hizmet Değişiklikleri
            </h2>
            <p>Veyronix, sunduğu hizmetlerin kapsamını, özelliklerini ve abonelik paketlerini önceden bildirim yaparak değiştirme hakkını saklı tutar. Teknik güncellemeler veya zorunlu hallerde geçici kesintiler yaşanabilir.</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={24} /> Sorumluluk Sınırları
            </h2>
            <p>Veyronix "olduğu gibi" sunulmaktadır. Discord veya Albion Online API kaynaklı teknik sorunlardan veya kesintilerden dolayı oluşabilecek aksaklıklardan Veyronix sorumlu tutulamaz.</p>
          </section>
          
          <p style={{ marginTop: '3rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            Bu şartların ihlali durumunda, ilgili sunucunun Veyronix servislerine erişimi kalıcı veya geçici olarak kısıtlanabilir.
          </p>
        </div>

      </main>
    </>
  );
}
