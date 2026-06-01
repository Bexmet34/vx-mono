"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { useLanguage } from "@/context/LanguageContext";

export default function DistanceSalesAgreement() {
  const { lang } = useLanguage();

  const content = {
    tr: {
      title: "Mesafeli Satış Sözleşmesi",
      h1: "1. TARAFLAR",
      p1: "İşbu Sözleşme aşağıdaki taraflar arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde imzalanmıştır.",
      satici: "SATICI: Veyronix (Bundan sonra \"SATICI\" olarak anılacaktır)",
      alici: "ALICI: Veyronix hizmetlerini web sitesi üzerinden satın alan kullanıcı (Bundan sonra \"ALICI\" olarak anılacaktır)",
      h2: "2. KONU",
      p2: "İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait veyronix.com.tr internet sitesi üzerinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.",
      h3: "3. HİZMET NİTELİĞİ",
      p3: "Sözleşme konusu hizmet, Veyronix Discord botu üzerinden sunulan dijital özellikler, abonelikler veya sunucu geliştirme araçlarıdır. Bu hizmetler tamamen dijital ortamda sunulmakta olup, fiziksel bir teslimat söz konusu değildir.",
      h4: "4. CAYMA HAKKI VE İADE",
      p4: "Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca, \"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler\" kapsamında cayma hakkı kullanılamaz. Satın alınan ürün/hizmet dijital içerik olduğundan iadesi mümkün değildir.",
      h5: "5. GENEL HÜKÜMLER",
      p5_1: "5.1. ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.",
      p5_2: "5.2. Sözleşme konusu hizmet, ALICI'nın ödemeyi gerçekleştirmesini müteakip anında aktive edilir."
    },
    en: {
      title: "Distance Sales Agreement",
      h1: "1. PARTIES",
      p1: "This Agreement has been signed between the following parties within the framework of the terms and conditions specified below.",
      satici: "SELLER: Veyronix (hereinafter referred to as \"SELLER\")",
      alici: "BUYER: The user who purchases Veyronix services through the website (hereinafter referred to as \"BUYER\")",
      h2: "2. SUBJECT",
      p2: "The subject of this Agreement is the determination of the rights and obligations of the parties in accordance with the provisions of the Law on the Protection of the Consumer No. 6502 and the Distance Contracts Regulation regarding the sale and delivery of the product/service whose characteristics and sales price are specified below, which the BUYER has ordered electronically over the veyronix.com.tr website belonging to the SELLER.",
      h3: "3. SERVICE QUALITY",
      p3: "The service subject to the contract is the digital features, subscriptions or server development tools offered through the Veyronix Discord bot. These services are offered entirely in a digital environment and there is no physical delivery.",
      h4: "4. RIGHT OF WITHDRAWAL AND REFUND",
      p4: "Pursuant to article 15 (ğ) of the Distance Contracts Regulation, the right of withdrawal cannot be used within the scope of \"Contracts regarding services performed instantly in the electronic environment or intangible goods delivered instantly to the consumer\". Since the purchased product/service is digital content, its refund is not possible.",
      h5: "5. GENERAL PROVISIONS",
      p5_1: "5.1. The BUYER declares that they have read the preliminary information regarding the basic characteristics of the product subject to the contract, the sales price and the payment method, and the delivery on the website and that they have given the necessary confirmation in the electronic environment.",
      p5_2: "5.2. The service subject to the contract is activated immediately following the BUYER's payment."
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
              <p>{active.p1}</p>
              <p><strong>{active.satici}</strong></p>
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
