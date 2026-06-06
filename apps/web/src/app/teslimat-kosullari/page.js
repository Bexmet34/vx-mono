"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useLanguage } from "@/context/LanguageContext";

export default function DeliveryPolicy() {
  const { lang } = useLanguage();

  const content = {
    tr: {
      title: "Teslimat Koşulları",
      h1: "DİJİTAL TESLİMAT SÜRECİ",
      p1: "Veyronix üzerinden satın alınan tüm hizmetler (abonelikler, premium özellikler vb.) tamamen dijital ortamda gerçekleştirilmektedir.",
      p2: "Siparişinizin ödemesi PayTR güvenli ödeme altyapısı üzerinden başarıyla tamamlandığı anda, satın almış olduğunuz hizmet Discord hesabınıza veya belirttiğiniz Discord sunucusuna otomatik ve anında tanımlanır.",
      important: "ÖNEMLİ: Herhangi bir fiziksel kargo veya posta teslimatı yapılmamaktadır. Hizmet ifası anında dijital olarak başlar.",
      h2: "TESLİMAT SÜRESİ",
      p3: "Ödeme onayı alındıktan sonra teslimat (hizmetin aktifleşmesi) ortalama 1-5 dakika içerisinde sistem tarafından otomatik olarak gerçekleştirilir.",
      h3: "OLASI GECİKMELER",
      p4: "Discord API kaynaklı gecikmeler veya sistem yoğunlukları sebebiyle teslimatta olağan dışı bir gecikme yaşanması durumunda, destek sunucumuz üzerinden veya hakkibsknn@gmail.com adresinden bize ulaşarak anında destek alabilirsiniz."
    },
    en: {
      title: "Delivery Policy",
      h1: "DIGITAL DELIVERY PROCESS",
      p1: "All services purchased through Veyronix (subscriptions, premium features, etc.) are carried out entirely in a digital environment.",
      p2: "As soon as the payment for your order is successfully completed via the PayTR secure payment infrastructure, the service you have purchased is automatically and instantly assigned to your Discord account or the Discord server you specified.",
      important: "IMPORTANT: There is no physical cargo or mail delivery. The execution of the service starts digitally instantly.",
      h2: "DELIVERY TIME",
      p3: "After payment confirmation, delivery (activation of the service) is automatically carried out by the system within an average of 1-5 minutes.",
      h3: "POSSIBLE DELAYS",
      p4: "In the event of an unusual delay in delivery due to delays originating from the Discord API or system congestion, you can get instant support by contacting us via our support server or at hakkibsknn@gmail.com."
    }
  };

  const active = content[lang] || content.en;

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
