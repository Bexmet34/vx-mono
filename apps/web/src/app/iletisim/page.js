"use client";

import { useLanguage } from "@/context/LanguageContext";
import { usePublicConfig } from "@/context/PublicConfigContext";
import { Mail, Phone, MapPin, MessageSquare, HelpCircle } from "lucide-react";

export default function ContactPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";
  const { supportServer } = usePublicConfig();

  return (
    <main className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-primary-container/20 rounded-2xl border border-primary-container/30 text-primary mb-4">
          <MessageSquare size={40} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          {isEn ? "Contact Us" : "İletişim"}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          {isEn
            ? "Get in touch with the Veyronix team for support, business inquiries, or questions."
            : "Destek, işbirliği veya sorularınız için Veyronix ekibiyle iletişime geçin."}
        </p>
      </div>

      {/* Content Container */}
      <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-10 space-y-10 text-on-surface-variant text-sm sm:text-base leading-relaxed">
        
        {/* Contact Information */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="text-primary" size={22} />
            {isEn ? "Contact Information" : "İletişim Bilgilerimiz"}
          </h2>
          <p>
            {isEn 
              ? "We are here to assist you. You can reach out to us through the following channels:" 
              : "Size yardımcı olmak için buradayız. Aşağıdaki kanallar üzerinden bize ulaşabilirsiniz:"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Support & Inquiries Email" : "Destek & Kurumsal E-Posta"}</span>
                <a href="mailto:support@veyronix.com.tr" className="font-bold text-white hover:text-primary transition-colors text-sm">
                  support@veyronix.com.tr
                </a>
              </div>
            </div>

            <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <MessageSquare size={18} />
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Official Discord Support" : "Resmi Discord Destek Sunucusu"}</span>
                <a
                  href={supportServer || "https://veyronix.com.tr/support"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline text-sm"
                >
                  {isEn ? "Join Support Server" : "Destek Sunucusuna Katıl"}
                </a>
              </div>
            </div>

            <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Direct Contact Line" : "İletişim Hattı"}</span>
                <span className="font-bold text-white text-sm">0551 078 82 61</span>
              </div>
            </div>

            <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block font-medium">{isEn ? "Location" : "Merkez / Konum"}</span>
                <span className="font-bold text-white text-sm">İzmir, Türkiye</span>
              </div>
            </div>
          </div>
        </section>

        <section className="p-4 bg-surface-container rounded-xl border border-white/5 text-sm text-on-surface-variant">
          <p>
            <strong>{isEn ? "Company Information:" : "Firma Bilgileri:"}</strong><br />
            {isEn ? "Company Name: Veyronix Yazılım ve Bilişim Hizmetleri" : "Firma Adı: Veyronix Yazılım ve Bilişim Hizmetleri"}<br />
            {isEn ? "Address: İzmir, Turkey" : "Adres: İzmir, Türkiye"}<br />
            {isEn ? "Email: info@veyronix.com.tr" : "E-Posta: info@veyronix.com.tr"}
          </p>
        </section>

      </div>
    </main>
  );
}
