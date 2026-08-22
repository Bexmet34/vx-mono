"use client";
import { LINKS } from '@veyronix/config';
import { usePublicConfig } from "@/context/PublicConfigContext";

import { Zap, Star, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const { supportServer } = usePublicConfig();

  return (
    <section className="relative px-margin-mobile md:px-margin-desktop pt-32 pb-24 max-w-container-max mx-auto text-center flex flex-col items-center">
      {/* Subdued ambient glow for minimalist look */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary-container/5 blur-[120px] pointer-events-none rounded-full"></div>
      
      <FadeIn delay={100} direction="up" distance={20}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-primary-container text-[11px] font-label-bold uppercase tracking-widest mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
          </span>
          {lang === 'tr' ? 'Veyronix v2.0 Aktif' : 'Veyronix v2.0 Live'}
        </div>
      </FadeIn>

      <FadeIn delay={200} direction="up" distance={30}>
        <h1 className="font-headline-xl text-5xl md:text-7xl text-on-surface mb-6 max-w-5xl mx-auto tracking-tight leading-[1.1]">
          {t.heroTitle1} <br className="hidden md:block" />
          <span className="text-primary-container">{t.heroTitle2}</span>
        </h1>
      </FadeIn>
      
      <FadeIn delay={300} direction="up" distance={30}>
        <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {t.heroDesc}
        </p>
      </FadeIn>
      
      <FadeIn delay={400} direction="up" distance={20} className="w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <a 
            href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-primary-container text-on-primary px-8 py-4 rounded-xl font-label-bold uppercase tracking-widest transition-all hover:bg-primary-container/90 hover:shadow-lg hover:shadow-primary-container/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap size={18} className="fill-current" />
            {t.heroBtn}
          </a>
          <a
            href={supportServer}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-surface-container-high border border-outline-variant/50 text-on-surface px-8 py-4 rounded-xl font-label-bold uppercase tracking-widest transition-all hover:bg-surface-container-highest hover:border-outline-variant hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            {t.supportBtn}
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
