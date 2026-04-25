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
              <Eye size={24} /> Veri Toplama ve KVKK
            </h2>
            <p>
              Veyronix, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kullanıcılarının verilerini korumayı taahhüt eder. 
              Sadece hizmetin işleyişi için gerekli olan Discord ID, sunucu ID ve temel ayar verileri toplanır.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={24} /> Veri Kullanımı
            </h2>
            <p>
              Toplanan veriler sadece botun sunduğu party yönetim sistemi ve Albion Online entegrasyonu gibi hizmetlerin sağlanması amacıyla kullanılır. 
              Verileriniz kesinlikle üçüncü taraflarla paylaşılmaz veya satılmaz.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} /> Güvenlik
            </h2>
            <p>
              Verileriniz güvenli sunucularda saklanmakta olup, yetkisiz erişime karşı endüstri standardı güvenlik önlemleri uygulanmaktadır.
            </p>
          </section>
          
          <p style={{ marginTop: '3rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            Veyronix hizmetlerini kullanarak bu politikaları kabul etmiş sayılırsınız. KVKK kapsamındaki haklarınız ve diğer sorularınız için hakkibsknn@gmail.com adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>

      </main>
    </>
  );
}
