"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '10rem', paddingBottom: '5rem', minHeight: '80vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="text-logo" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Hakkımızda</h1>
          
          <div style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '3rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Veyronix, Discord sunucularınızın yönetimini ve etkileşimini artırmak için tasarlanmış profesyonel bir bot hizmetidir. 
              Amacımız, topluluk sahiplerine ve yöneticilere, sunucularını daha verimli bir şekilde yönetebilecekleri, 
              üyeleriyle daha iyi etkileşim kurabilecekleri gelişmiş araçlar sunmaktır.
            </p>
            <p>
              Gelişmiş parti sistemi, moderasyon araçları ve kullanıcı dostu arayüzümüzle, Discord ekosisteminde fark yaratmaya devam ediyoruz.
            </p>
          </div>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>İletişim Bilgileri</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <Phone size={20} />
                <span style={{ fontWeight: '600' }}>Telefon</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>0551 078 82 61</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <Mail size={20} />
                <span style={{ fontWeight: '600' }}>E-posta</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>hakkibsknn@gmail.com</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <MapPin size={20} />
                <span style={{ fontWeight: '600' }}>Adres</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Türkiye</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
                <MessageSquare size={20} />
                <span style={{ fontWeight: '600' }}>Destek</span>
              </div>
              <a href="https://discord.gg/D6T3t4beqa" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>Discord Sunucumuz</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
