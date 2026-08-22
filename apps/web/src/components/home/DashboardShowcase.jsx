"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

export default function DashboardShowcase() {
  const { lang } = useLanguage();

  const items = [
    { title: "Genel Bakış (Overview)", src: "/mockups/overview.svg", desc: "Abonelik ve sistem durumunuzu tek ekrandan izleyin." },
    { title: "Albion Entegrasyonu", src: "/mockups/general.svg", desc: "Loncanızı saniyeler içinde bağlayıp anında senkronize edin." },
    { title: "Kayıt Sistemi", src: "/mockups/registration.svg", desc: "API bağlantılı, otomatik rol veren kayıt sistemi." },
    { title: "Rol Menüsü", src: "/mockups/roles.svg", desc: "Rolleri kategoriler halinde otomatik dağıtın." },
    { title: "Parti Şablonları", src: "/mockups/templates.svg", desc: "Sık kurulan parti kompozisyonlarını tek tıkla oluşturun." },
    { title: "Özel Erişim", src: "/mockups/access.svg", desc: "Güvendiğiniz kişilere bot komut yetkisi verin." },
    { title: "Otomatik Killboard", src: "/mockups/killboard.svg", desc: "Günlük Kill, Death raporlarını otomatik çekin." },
    { title: "Markalaşma", src: "/mockups/visual.svg", desc: "Görselleri kendi sunucunuza göre özelleştirin." }
  ];

  return (
    <section id="dashboard" className="px-margin-mobile md:px-margin-desktop py-32 bg-surface-container-lowest border-t border-outline-variant/10">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-24">
          <FadeIn delay={100} direction="up" distance={30}>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface uppercase tracking-tight mb-4">
              {lang === 'tr' ? 'Kontrol Paneli' : 'Dashboard'}
            </h2>
          </FadeIn>
          <FadeIn delay={200} direction="up" distance={30}>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
              {lang === 'tr' 
                ? 'Gelişmiş web panelimizle loncanızı kusursuz yönetin. Her modül, pratiklik ve hız odaklı tasarlandı.' 
                : 'Manage your guild flawlessly with our advanced web panel. Every module is tailored for speed.'}
            </p>
          </FadeIn>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {items.map((item, idx) => (
            <FadeIn key={idx} delay={(idx % 2) * 150} direction="up" distance={20}>
              <div className="glass-panel overflow-hidden group border border-outline-variant/30 hover:border-primary-container/40 hover:shadow-2xl hover:shadow-primary-container/5 transition-all duration-500 rounded-3xl p-0 h-full flex flex-col bg-surface-container-high/50">
                <div className="bg-surface-container px-4 py-3 border-b border-outline-variant/30 flex justify-between items-center">
                  <h3 className="font-headline-md text-xs text-on-surface uppercase tracking-widest">{item.title}</h3>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error/70"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/70"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-success/70"></div>
                  </div>
                </div>
                <div className="p-6 relative flex-grow flex flex-col justify-center items-center">
                  <div className="absolute inset-0 bg-primary-container/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <Image 
                    src={item.src} 
                    alt={item.title} 
                    width={600} 
                    height={350} 
                    className="w-full h-auto rounded-xl shadow-xl group-hover:scale-[1.03] transition-transform duration-700 border border-outline-variant/20 mb-6"
                  />
                  <p className="font-body-md text-on-surface-variant text-center font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
