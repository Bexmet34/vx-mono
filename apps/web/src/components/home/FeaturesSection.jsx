"use client";

import { Shield, Users, Sword, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import VideoSection from "./VideoSection";
import FadeIn from "@/components/ui/FadeIn";

export default function FeaturesSection() {
  const { t, lang } = useLanguage();

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-32 max-w-container-max mx-auto">
      <div className="text-center mb-24">
        <FadeIn delay={100} direction="up" distance={30}>
          <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface uppercase tracking-tight mb-4">
            {t.featuresSectionTitle || (lang === 'tr' ? 'Neden Veyronix?' : 'Why Veyronix?')}
          </h2>
        </FadeIn>
        <FadeIn delay={200} direction="up" distance={30}>
          <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
            {t.featuresSectionDesc || (lang === 'tr' ? 'Topluluğunuzu yönetmek, korumak ve büyütmek için ihtiyacınız olan tüm profesyonel araçlar tek bir platformda.' : 'All the professional tools you need to manage, protect, and grow your community in one platform.')}
          </p>
        </FadeIn>
      </div>
      
      {/* Promotional Video */}
      <FadeIn delay={300} direction="up" distance={40}>
        <div className="mb-24">
          <VideoSection />
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[minmax(260px,auto)] max-w-6xl mx-auto">
        
        <FadeIn delay={100} direction="up" distance={20} className="md:col-span-2">
          <div className="h-full glass-panel p-8 flex flex-col justify-end relative overflow-hidden group border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-high transition-all duration-500 rounded-3xl">
            <div className="absolute top-10 right-10 text-on-surface-variant/5 group-hover:text-primary-container/10 transition-colors duration-500 transform group-hover:scale-110">
              <Users size={160} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-outline-variant/50 flex items-center justify-center text-on-surface mb-6 group-hover:bg-primary-container/10 group-hover:text-primary-container group-hover:border-primary-container/30 transition-all duration-500">
                <Users size={24} />
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface mb-3 tracking-tight">{t.feat1Title}</h3>
              <p className="font-body-md text-on-surface-variant max-w-md font-light leading-relaxed">{t.feat1Desc}</p>
            </div>
          </div>
        </FadeIn>
        
        <FadeIn delay={200} direction="up" distance={20} className="col-span-1">
          <div className="h-full glass-panel p-8 flex flex-col justify-end relative overflow-hidden group border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-high transition-all duration-500 rounded-3xl">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-outline-variant/50 flex items-center justify-center text-on-surface mb-6 group-hover:bg-primary-container/10 group-hover:text-primary-container group-hover:border-primary-container/30 transition-all duration-500">
                <Sword size={24} />
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface mb-3 tracking-tight">{t.feat2Title}</h3>
              <p className="font-body-md text-on-surface-variant font-light leading-relaxed">{t.feat2Desc}</p>
            </div>
          </div>
        </FadeIn>
        
        <FadeIn delay={300} direction="up" distance={20} className="col-span-1">
          <div className="h-full glass-panel p-8 flex flex-col justify-end relative overflow-hidden group border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-high transition-all duration-500 rounded-3xl">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-outline-variant/50 flex items-center justify-center text-on-surface mb-6 group-hover:bg-primary-container/10 group-hover:text-primary-container group-hover:border-primary-container/30 transition-all duration-500">
                <Shield size={24} />
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface mb-3 tracking-tight">{t.feat3Title}</h3>
              <p className="font-body-md text-on-surface-variant font-light leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </FadeIn>
        
        <FadeIn delay={400} direction="up" distance={20} className="md:col-span-2">
          <div className="h-full glass-panel p-8 flex flex-col justify-end relative overflow-hidden group border border-primary-container/20 bg-primary-container/[0.03] hover:bg-primary-container/[0.08] hover:border-primary-container/50 transition-all duration-500 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="scanline opacity-20"></div>
            <div className="absolute top-10 right-10 text-primary-container/5 group-hover:text-primary-container/20 transition-colors duration-500 transform group-hover:scale-110">
              <Activity size={160} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-6 shadow-[0_0_20px_rgba(255,215,0,0.1)] group-hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all duration-500">
                <Activity size={24} />
              </div>
              <h3 className="font-headline-md text-2xl text-primary-container mb-3 tracking-tight">{t.feat4Title}</h3>
              <p className="font-body-md text-on-surface-variant max-w-md font-light leading-relaxed">{t.feat4Desc}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
