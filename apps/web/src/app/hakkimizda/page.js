"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, lang } = useLanguage();
  
  const content = {
    tr: {
      title: "Hakkımızda",
      p1: "Veyronix, Discord sunucularınızın yönetimini ve etkileşimini artırmak için tasarlanmış profesyonel bir bot hizmetidir. Amacımız, topluluk sahiplerine ve yöneticilere, sunucularını daha verimli bir şekilde yönetebilecekleri, üyeleriyle daha iyi etkileşim kurabilecekleri gelişmiş araçlar sunmaktır.",
      p2: "Gelişmiş parti sistemi, moderasyon araçları ve kullanıcı dostu arayüzümüzle, Discord ekosisteminde fark yaratmaya devam ediyoruz.",
      infoTitle: "İletişim Bilgileri",
      addressVal: "Türkiye",
      supportVal: "Discord Sunucumuz"
    },
    en: {
      title: "About Us",
      p1: "Veyronix is a professional bot service designed to enhance the management and interaction of your Discord servers. Our goal is to provide community owners and managers with advanced tools to manage their servers more efficiently and interact better with their members.",
      p2: "With our advanced party system, moderation tools, and user-friendly interface, we continue to make a difference in the Discord ecosystem.",
      infoTitle: "Contact Information",
      addressVal: "Turkey",
      supportVal: "Our Discord Server"
    }
  };

  const activeContent = content[lang] || content.en;

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem', minHeight: '80vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{activeContent.title}</h1>
          
          <div style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {activeContent.p1}
            </p>
            <p>
              {activeContent.p2}
            </p>
          </div>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{activeContent.infoTitle}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <Phone size={20} />
                <span style={{ fontWeight: '600' }}>{t.phone}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>0551 078 82 61</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <Mail size={20} />
                <span style={{ fontWeight: '600' }}>{t.email}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>hakkibsknn@gmail.com</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <MapPin size={20} />
                <span style={{ fontWeight: '600' }}>{t.address}</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>{activeContent.addressVal}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <MessageSquare size={20} />
                <span style={{ fontWeight: '600' }}>{t.support}</span>
              </div>
              <a href="https://discord.gg/D6T3t4beqa" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>{activeContent.supportVal}</a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
