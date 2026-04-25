"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { Gavel, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function TermsPage() {
  const { lang, t } = useLanguage();

  const content = {
    tr: {
      h1: "Kullanım Şartları",
      p1: "Veyronix hizmetlerini kullanarak, bu şartları kabul etmiş sayılırsınız. Botun sunduğu özellikleri kötüye kullanmak, tersine mühendislik yapmak veya servisleri aksatacak faaliyetlerde bulunmak yasaktır.",
      h2: "Hizmet Değişiklikleri",
      p2: "Veyronix, sunduğu hizmetlerin kapsamını, özelliklerini ve abonelik paketlerini önceden bildirim yaparak değiştirme hakkını saklı tutar. Teknik güncellemeler veya zorunlu hallerde geçici kesintiler yaşanabilir.",
      h3: "Sorumluluk Sınırları",
      p3: "Veyronix \"olduğu gibi\" sunulmaktadır. Discord veya Albion Online API kaynaklı teknik sorunlardan veya kesintilerden dolayı oluşabilecek aksaklıklardan Veyronix sorumlu tutulamaz.",
      footer: "Bu şartların ihlali durumunda, ilgili sunucunun Veyronix servislerine erişimi kalıcı veya geçici olarak kısıtlanabilir."
    },
    en: {
      h1: "Acceptable Use",
      p1: "By using Veyronix services, you agree to these terms. Misusing the features offered by the bot, reverse engineering, or engaging in activities that disrupt the services is prohibited.",
      h2: "Service Modifications",
      p2: "Veyronix reserves the right to change the scope of the services it offers, its features, and subscription packages with prior notice. Temporary interruptions may occur in case of technical updates or mandatory situations.",
      h3: "Liability",
      p3: "Veyronix is provided \"as is\". Veyronix cannot be held responsible for malfunctions or interruptions caused by Discord or Albion Online API.",
      footer: "Violation of these terms may result in your server being permanently or temporarily restricted from accessing Veyronix services."
    }
  };

  const active = content[lang] || content.en;

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Gavel size={64} color="var(--accent-color)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>{t.terms}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{lang === 'tr' ? 'Son güncelleme: Nisan 2026' : 'Last updated: April 2026'}</p>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} /> {active.h1}
            </h2>
            <p>{active.p1}</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={24} /> {active.h2}
            </h2>
            <p>{active.p2}</p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={24} /> {active.h3}
            </h2>
            <p>{active.p3}</p>
          </section>
          
          <p style={{ marginTop: '3rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            {active.footer}
          </p>
        </div>
      </main>

      </main>
    </>
  );
}
