"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardShowcase() {
  const { lang } = useLanguage();

  const items = [
    { title: "Genel Bakış (Overview)", src: "/mockups/overview.svg", desc: "Abonelik ve sistem durumunuzu tek ekrandan izleyin." },
    { title: "Albion Entegrasyonu (General)", src: "/mockups/general.svg", desc: "Loncanızı saniyeler içinde bağlayıp anında senkronize edin." },
    { title: "Kayıt Sistemi (Registration)", src: "/mockups/registration.svg", desc: "API bağlantılı, otomatik rol veren kayıt ve temizlik sistemi." },
    { title: "Rol Menüsü (Roles)", src: "/mockups/roles.svg", desc: "ZvZ, PvE, Toplayıcı gibi rolleri kategoriler halinde otomatik dağıtın." },
    { title: "Parti Şablonları (Templates)", src: "/mockups/templates.svg", desc: "Sürekli kurduğunuz partilerin kompozisyonunu kaydedip tek tıkla oluşturun." },
    { title: "Özel Erişim (Access/Whitelist)", src: "/mockups/access.svg", desc: "Sadece güvendiğiniz kişilere veya rollere bot komut yetkisi verin." },
    { title: "Otomatik Killboard", src: "/mockups/killboard.svg", desc: "Günlük Kill, Death ve Fame raporlarınızı otomatik olarak Discord'a çekin." },
    { title: "Markalaşma (Branding)", src: "/mockups/visual.svg", desc: "Botun karşılama mesajlarını ve görsellerini sunucunuza göre özelleştirin." }
  ];

  return (
    <section id="dashboard" className="px-margin-mobile md:px-margin-desktop py-24 bg-surface-container-lowest border-t border-on-surface/20">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-2">
            {lang === 'tr' ? 'Kontrol Paneli (Dashboard)' : 'Dashboard Control Panel'}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            {lang === 'tr' 
              ? 'Gelişmiş web panelimizle loncanızı kusursuz yönetin. Her özellik ihtiyaçlarınıza göre özel olarak tasarlandı.' 
              : 'Manage your guild flawlessly with our advanced web panel. Every feature is tailored to your needs.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-1">
          {items.map((item, idx) => (
            <div key={idx} className="glass-panel overflow-hidden group border border-outline-variant hover:border-primary-container/50 transition-all p-0">
              <div className="bg-surface-container px-3 py-1 border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-headline-md text-[10px] text-on-surface uppercase tracking-tight">{item.title}</h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-50"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-50"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-50"></div>
                </div>
              </div>
              <div className="p-3 bg-[#0B0F19] relative">
                <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <Image 
                  src={item.src} 
                  alt={item.title} 
                  width={600} 
                  height={350} 
                  className="w-full h-auto rounded-md shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 border border-outline-variant/30"
                />
                <p className="mt-3 font-body-md text-on-surface-variant text-center">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
