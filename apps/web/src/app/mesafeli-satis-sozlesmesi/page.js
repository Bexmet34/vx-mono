"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FileText, Shield, Cookie, UserCheck, History, Package, Scale, Building2, User, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function DistanceSalesAgreement() {
  const { lang, t } = useLanguage();
  const isEn = lang === "en";
  const active = t?.legal?.sales || {};

  return (
    <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
            <Scale size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {isEn ? "Distance Sales Agreement" : "Mesafeli Satış Sözleşmesi"}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {isEn
              ? "Last Updated: August 24, 2026 • In accordance with Distance Contracts Regulation"
              : "Son Güncelleme: 24 Ağustos 2026 • 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca"}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          
          {/* Madde 1: Taraflar */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="text-primary" size={20} />
              {active.h1 || (isEn ? "1. Parties to the Agreement" : "1. Taraflar")}
            </h2>
            <p>
              {active.p1 || (isEn
                ? "This Distance Sales Agreement ('Agreement') is concluded between the Service Provider (Seller) and the Customer (Buyer) who purchases digital subscription services via veyronix.com.tr."
                : "İşbu sözleşme, veyronix.com.tr internet sitesi üzerinden dijital hizmet veya abonelik satın alan Kullanıcı (Alıcı) ile aşağıda bilgileri bulunan Hizmet Sağlayıcı (Satıcı) arasında elektronik ortamda akdedilmiştir.")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <Building2 size={16} className="text-primary" /> {isEn ? "SELLER (Service Provider)" : "SATICI BİLGİLERİ"}
                </span>
                <p className="text-on-surface-variant"><strong>Platform:</strong> Veyronix Digital Services</p>
                <p className="text-on-surface-variant"><strong>E-Posta:</strong> support@veyronix.com.tr</p>
                <p className="text-on-surface-variant"><strong>İletişim:</strong> 0551 078 82 61</p>
                <p className="text-on-surface-variant"><strong>Konum:</strong> İstanbul, Türkiye</p>
              </div>

              <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <User size={16} className="text-primary" /> {isEn ? "BUYER (Customer)" : "ALICI BİLGİLERİ"}
                </span>
                <p className="text-on-surface-variant">
                  {isEn
                    ? "The Discord user/server owner who places an order and makes a payment via the website."
                    : "Siteden sipariş veren, Discord OAuth2 ile giriş yapan veya ödeme formunu dolduran gerçek/tüzel kişi."}
                </p>
              </div>
            </div>
          </section>

          {/* Madde 2: Konu */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              {active.h2 || (isEn ? "2. Subject of the Agreement" : "2. Sözleşmenin Konusu")}
            </h2>
            <p>
              {active.p2 || (isEn
                ? "The subject of this agreement is the determination of the rights and obligations of the parties in accordance with the Law on Consumer Protection regarding the sale and electronic delivery of digital Discord bot premium services, guild management tools, and automated killboard features ordered by the Buyer."
                : "İşbu sözleşmenin konusu, Alıcı'nın Satıcı'ya ait veyronix.com.tr web sitesinden elektronik ortamda siparişini verdiği Veyronix Discord Botu Premium Aboneliği ve dijital servislerin satışı ve anında ifası ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.")}
            </p>
          </section>

          {/* Madde 3: Hizmet Teslimatı */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Package className="text-primary" size={20} />
              {active.h3 || (isEn ? "3. Service Delivery & Execution" : "3. Hizmetin İfası ve Teslimat")}
            </h2>
            <p>
              {active.p3 || (isEn
                ? "The purchased digital service is delivered electronically without physical shipping. Upon successful payment verification, premium features are instantly and automatically activated on the designated Discord server ID."
                : "Satın alınan hizmet, dijital ortamda ifa edilen anlık bir abonelik hizmetidir. Ödeme onaylandığı anda ilgili Discord sunucusuna otomatik olarak tanımlanır ve herhangi bir fiziki kargo veya teslimat gerektirmez.")}
            </p>
          </section>

          {/* Madde 4: Cayma Hakkı */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <History className="text-primary" size={20} />
              {active.h4 || (isEn ? "4. Right of Withdrawal & Exceptions" : "4. Cayma Hakkı ve İstisnaları")}
            </h2>
            <p>
              {active.p4 || (isEn
                ? "In accordance with Article 15 of the Distance Contracts Regulation, the right of withdrawal cannot be exercised for contracts relating to services performed instantly in the electronic environment or intangible goods delivered instantly to the consumer. However, if a technical malfunction on Veyronix servers prevents service delivery for more than 48 consecutive hours, a pro-rata refund will be issued upon request."
                : "Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca; 'Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde' cayma hakkı kullanılamaz. Ancak sistem kaynaklı teknik bir sorun nedeniyle hizmetin 48 saatten uzun süre verilememesi durumunda kullanıcıya koşulsuz iade sağlanır.")}
            </p>
          </section>

          {/* Madde 5: Uyuşmazlıkların Çözümü */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Scale className="text-primary" size={20} />
              {active.h5 || (isEn ? "5. Dispute Resolution & Jurisdiction" : "5. Yetkili Mahkeme ve Uyuşmazlıklar")}
            </h2>
            <p>
              {active.p5_1 || (isEn
                ? "In disputes arising from this agreement, Turkish Law shall apply and Istanbul Consumer Arbitration Committees and Consumer Courts are authorized within monetary limits determined by law."
                : "İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile Alıcı'nın veya Satıcı'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.")}
            </p>
          </section>

          {/* Legal Navigation Cross-Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-3 text-xs">
            <Link href="/privacy" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Shield size={14} className="text-primary" /> {isEn ? "Privacy Policy" : "Gizlilik Politikası"}
            </Link>
            <Link href="/cerez-politikasi" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Cookie size={14} className="text-primary" /> {isEn ? "Cookie Policy" : "Çerez Politikası"}
            </Link>
            <Link href="/terms" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText size={14} className="text-primary" /> {isEn ? "Terms of Service" : "Kullanım Şartları"}
            </Link>
            <Link href="/iptal-ve-iade-kosullari" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <History size={14} className="text-primary" /> {isEn ? "Cancellation & Refund" : "İptal ve İade Koşulları"}
            </Link>
            <Link href="/teslimat-kosullari" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <Package size={14} className="text-primary" /> {isEn ? "Delivery Terms" : "Teslimat Koşulları"}
            </Link>
            <Link href="/hakkimizda" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5">
              <UserCheck size={14} className="text-primary" /> {isEn ? "About Us & Contact" : "Hakkımızda & İletişim"}
            </Link>
          </div>
        </div>
      </main>
  );
}
