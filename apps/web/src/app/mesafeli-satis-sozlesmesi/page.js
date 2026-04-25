"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DistanceSalesAgreement() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Mesafeli Satış Sözleşmesi</h1>
          
          <div style={{ lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>1. TARAFLAR</h2>
              <p>İşbu Sözleşme aşağıdaki taraflar arasında aşağıda belirtilen hüküm ve şartlar çerçevesinde imzalanmıştır.</p>
              <p><strong>SATICI:</strong> Veyronix (Bundan sonra "SATICI" olarak anılacaktır)</p>
              <p><strong>ALICI:</strong> Veyronix hizmetlerini web sitesi üzerinden satın alan kullanıcı (Bundan sonra "ALICI" olarak anılacaktır)</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>2. KONU</h2>
              <p>İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait veyronix.com.tr internet sitesi üzerinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>3. HİZMET NİTELİĞİ</h2>
              <p>Sözleşme konusu hizmet, Veyronix Discord botu üzerinden sunulan dijital özellikler, abonelikler veya sunucu geliştirme araçlarıdır. Bu hizmetler tamamen dijital ortamda sunulmakta olup, fiziksel bir teslimat söz konusu değildir.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>4. CAYMA HAKKI VE İADE</h2>
              <p>Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca, "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler" kapsamında cayma hakkı kullanılamaz. Satın alınan ürün/hizmet dijital içerik olduğundan iadesi mümkün değildir.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>5. GENEL HÜKÜMLER</h2>
              <p>5.1. ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</p>
              <p>5.2. Sözleşme konusu hizmet, ALICI'nın ödemeyi gerçekleştirmesini müteakip anında aktive edilir.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
