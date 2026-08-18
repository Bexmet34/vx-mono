import { LINKS } from '@veyronix/config';
"use client";

import { Zap, Star, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative px-margin-mobile md:px-margin-desktop py-20 max-w-container-max mx-auto text-center flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary-container/5 blur-[120px] pointer-events-none rounded-full"></div>
      
      <h1 className="font-headline-xl text-4xl md:text-6xl text-on-surface mb-3 max-w-4xl mx-auto uppercase tracking-tight leading-tight">
        {t.heroTitle1} <br className="hidden md:block" />
        <span className="text-primary-container drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">{t.heroTitle2}</span>
      </h1>
      
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-3">
        {t.heroDesc}
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <a 
          href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-primary-container text-on-primary px-2 py-1 font-label-bold text-label-bold uppercase tracking-widest transition-all duration-300 active:scale-95 hover:brightness-110 tactical-glow rounded-sm flex items-center justify-center gap-2"
        >
          <Zap size={14} className="fill-current" />
          {t.heroBtn}
        </a>
        <a
          href="https://top.gg/bot/1082239904169336902"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-surface-container-high border border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container px-2 py-1 font-label-bold text-label-bold uppercase tracking-widest transition-all duration-300 active:scale-95 rounded-sm flex items-center justify-center gap-2"
        >
          <Star size={14} className="fill-current" />
          {t.topggBtn ?? ("top.gg'de Oyla")}
        </a>
        <a
          href="${LINKS.SUPPORT_SERVER}"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-transparent border border-on-surface/20 text-on-surface hover:bg-on-surface/10 px-2 py-1 font-label-bold text-label-bold uppercase tracking-widest transition-all duration-300 active:scale-95 rounded-sm flex items-center justify-center gap-2"
        >
          <MessageCircle size={14} />
          {t.supportBtn}
        </a>
      </div>
    </section>
  );
}
