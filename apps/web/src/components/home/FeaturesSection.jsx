"use client";

import { Shield, Users, Sword, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import VideoSection from "./VideoSection";

export default function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-20 max-w-container-max mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-4">{t.featuresSectionTitle}</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">{t.featuresSectionDesc}</p>
      </div>
      
      {/* Promotional Video */}
      <VideoSection />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:auto-rows-[minmax(220px,auto)] max-w-5xl mx-auto">
        <div className="md:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-end relative overflow-hidden group border border-outline-variant hover:border-primary-container/50 transition-colors">
          <div className="absolute top-8 right-8 text-on-surface-variant/20 group-hover:text-primary-container/20 transition-colors">
            <Users size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-surface border border-outline-variant flex items-center justify-center text-on-surface mb-6">
              <Users size={24} />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{t.feat1Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{t.feat1Desc}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-end relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-surface border border-outline-variant flex items-center justify-center text-on-surface mb-6">
              <Sword size={24} />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{t.feat2Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{t.feat2Desc}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-end relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-surface border border-outline-variant flex items-center justify-center text-on-surface mb-6">
              <Shield size={24} />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{t.feat3Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{t.feat3Desc}</p>
          </div>
        </div>
        
        <div className="md:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-end relative overflow-hidden group border border-primary-container/30 bg-primary-container/5 hover:border-primary-container transition-colors">
          <div className="scanline"></div>
          <div className="absolute top-8 right-8 text-primary-container/10 group-hover:text-primary-container/30 transition-colors">
            <Activity size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary-container mb-6 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <Activity size={24} />
            </div>
            <h3 className="font-headline-md text-headline-md text-primary-container mb-2">{t.feat4Title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{t.feat4Desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
