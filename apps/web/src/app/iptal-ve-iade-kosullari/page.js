"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useLanguage } from "@/context/LanguageContext";

export default function RefundPolicy() {
  const { lang } = useLanguage();

  const content = {
    tr: {
      title: "İptal ve İade Koşulları",
      h1: "DİJİTAL ÜRÜN VE HİZMET İADESİ",
      p1: "Veyronix tarafından sunulan tüm ürün ve hizmetler (Abonelikler, Premium özellikler vb.) dijital içerik kapsamındadır.",
      important: "ÖNEMLİ: Satın alınan hizmetler elektronik ortamda anında ifa edildiği için, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği gereği iadesi mümkün değildir.",
      h2: "İPTAL PROSEDÜRÜ",
      p2: "Abonelik bazlı hizmetlerimizi dilediğiniz zaman iptal edebilirsiniz. İptal işlemi gerçekleştirildiğinde, mevcut kullanım sürenizin sonuna kadar hizmetten yararlanmaya devam edebilirsiniz. Bir sonraki faturalandırma döneminde kartınızdan herhangi bir çekim yapılmayacaktır.",
      h3: "HATALI İŞLEMLER",
      p3: "Sistemden kaynaklı hatalı çekimler veya teknik aksaklıklar nedeniyle hizmetin tanımlanmaması durumunda, durumu bildirmek için hakkibsknn@gmail.com adresi üzerinden bizimle iletişime geçebilirsiniz. İnceleme sonrası haklı bulunan taleplerde gerekli düzeltmeler yapılacaktır.",
      h4: "İLETİŞİM",
      p4: "İade ve iptal konularındaki tüm sorularınız için:",
      email: "E-posta",
      support: "Discord Destek"
    },
    en: {
      title: "Cancellation & Refund Policy",
      h1: "DIGITAL PRODUCT AND SERVICE REFUND",
      p1: "All products and services offered by Veyronix (Subscriptions, Premium features, etc.) are within the scope of digital content.",
      important: "IMPORTANT: Since the purchased services are performed instantly in the electronic environment, no refund is possible in accordance with the Law on Consumer Protection No. 6502 and the Distance Contracts Regulation.",
      h2: "CANCELLATION PROCEDURE",
      p2: "You can cancel our subscription-based services at any time. When the cancellation is performed, you can continue to benefit from the service until the end of your current usage period. No deduction will be made from your card in the next billing period.",
      h3: "ERRONEOUS TRANSACTIONS",
      p3: "In case the service is not defined due to erroneous deductions or technical failures caused by the system, you can contact us at hakkibsknn@gmail.com to report the situation. Necessary corrections will be made in the requests found justified after the examination.",
      h4: "CONTACT",
      p4: "For all your questions about refund and cancellation issues:",
      email: "Email",
      support: "Discord Support"
    }
  };

  const active = content[lang] || content.en;

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2rem', marginBottom: '2rem' }}>{active.title}</h1>
          
          <div style={{ lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h1}</h2>
              <p style={{ marginBottom: '1rem' }}>
                {active.p1}
              </p>
              <p style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '1rem' }}>
                {active.important}
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h2}</h2>
              <p>
                {active.p2}
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h3}</h2>
              <p>
                {active.p3}
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>{active.h4}</h2>
              <p>{active.p4}</p>
              <p>{active.email}: hakkibsknn@gmail.com</p>
              <p>{active.support}: <a href="https://discord.gg/D6T3t4beqa" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Destek Sunucusu</a></p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
