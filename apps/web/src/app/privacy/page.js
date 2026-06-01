"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  const { lang, t } = useLanguage();

  const content = {
    tr: {
      h1: "Veri Toplama ve KVKK",
      p1: "Veyronix, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, kullanıcılarının verilerini korumayı taahhüt eder. Sadece hizmetin işleyişi için gerekli olan Discord ID, sunucu ID ve temel ayar verileri toplanır.",
      h2: "Veri Kullanımı",
      p2: "Toplanan veriler sadece botun sunduğu party yönetim sistemi ve Albion Online entegrasyonu gibi hizmetlerin sağlanması amacıyla kullanılır. Verileriniz kesinlikle üçüncü taraflarla paylaşılmaz veya satılmaz.",
      h3: "Güvenlik",
      p3: "Verileriniz güvenli sunucularda saklanmakta olup, yetkisiz erişime karşı endüstri standardı güvenlik önlemleri uygulanmaktadır.",
      footer: "Veyronix hizmetlerini kullanarak bu politikaları kabul etmiş sayılırsınız. KVKK kapsamındaki haklarınız ve diğer sorularınız için hakkibsknn@gmail.com adresinden bizimle iletişime geçebilirsiniz."
    },
    en: {
      h1: "Information Collection & GDPR",
      p1: "Veyronix collects minimal data required for functionality. This includes your Discord user ID, server IDs where the bot is present, and basic settings you configure. We are committed to protecting user data.",
      h2: "Data Usage",
      p2: "Your data is used solely to provide party management services and Albion Online integration. We never sell or share your data with third parties.",
      h3: "Security",
      p3: "We implement industry-standard security measures to protect your information. Data is stored on secure servers with restricted access.",
      footer: "By using Veyronix services, you agree to these policies. If you have questions about your data rights, please contact us at hakkibsknn@gmail.com."
    }
  };

  const active = content[lang] || content.en;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Shield size={64} color="var(--accent-color)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>{t.privacy}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{lang === 'tr' ? 'Son güncelleme: Nisan 2026' : 'Last updated: April 2026'}</p>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={24} /> {active.h1}
            </h2>
            <p>
              {active.p1}
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={24} /> {active.h2}
            </h2>
            <p>
              {active.p2}
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} /> {active.h3}
            </h2>
            <p>
              {active.p3}
            </p>
          </section>
          
          <p style={{ marginTop: '3rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            {active.footer}
          </p>
        </div>
      </main>
    </>
  );
}
