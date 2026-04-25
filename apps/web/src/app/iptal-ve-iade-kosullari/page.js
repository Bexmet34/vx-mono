"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundPolicy() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2rem', marginBottom: '2rem' }}>İptal ve İade Koşulları</h1>
          
          <div style={{ lineHeight: '1.6', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>DİJİTAL ÜRÜN VE HİZMET İADESİ</h2>
              <p style={{ marginBottom: '1rem' }}>
                Veyronix tarafından sunulan tüm ürün ve hizmetler (Abonelikler, Premium özellikler vb.) dijital içerik kapsamındadır. 
              </p>
              <p style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '1rem' }}>
                ÖNEMLİ: Satın alınan hizmetler elektronik ortamda anında ifa edildiği için, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği gereği iadesi mümkün değildir.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>İPTAL PROSEDÜRÜ</h2>
              <p>
                Abonelik bazlı hizmetlerimizi dilediğiniz zaman iptal edebilirsiniz. İptal işlemi gerçekleştirildiğinde, mevcut kullanım sürenizin sonuna kadar hizmetten yararlanmaya devam edebilirsiniz. Bir sonraki faturalandırma döneminde kartınızdan herhangi bir çekim yapılmayacaktır.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>HATALI İŞLEMLER</h2>
              <p>
                Sistemden kaynaklı hatalı çekimler veya teknik aksaklıklar nedeniyle hizmetin tanımlanmaması durumunda, durumu bildirmek için hakkibsknn@gmail.com adresi üzerinden bizimle iletişime geçebilirsiniz. İnceleme sonrası haklı bulunan taleplerde gerekli düzeltmeler yapılacaktır.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem' }}>İLETİŞİM</h2>
              <p>İade ve iptal konularındaki tüm sorularınız için:</p>
              <p>E-posta: hakkibsknn@gmail.com</p>
              <p>Discord Destek: <a href="https://discord.gg/D6T3t4beqa" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Destek Sunucusu</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
