"use client";
import { LINKS } from '@veyronix/config';
import { usePublicConfig } from "@/context/PublicConfigContext";
import { Zap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const { supportServer } = usePublicConfig();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-[150px]" />
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto py-32">
        <FadeIn delay={100} direction="up" distance={20}>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-high/80 border border-outline-variant/30 backdrop-blur-md mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-on-surface-variant text-xs font-label-bold uppercase tracking-widest">
              {lang === 'tr' ? '6 Sistem · Tek Bot · Sıfır Kurulum' : '6 Systems · One Bot · Zero Setup'}
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={200} direction="up" distance={30}>
          <h1 className="font-headline-xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-on-surface mb-6 tracking-tight leading-[1.05] font-extrabold">
            {t.heroTitle1} <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary-container via-yellow-400 to-secondary bg-clip-text text-transparent">{t.heroTitle2}</span>
          </h1>
        </FadeIn>
        
        <FadeIn delay={350} direction="up" distance={25}>
          <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {t.heroDesc}
          </p>
        </FadeIn>
        
        <FadeIn delay={500} direction="up" distance={20}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full sm:w-auto bg-primary-container text-on-primary px-8 py-4 rounded-xl font-label-bold uppercase tracking-widest transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 text-sm"
            >
              <Zap size={18} className="fill-current" />
              {t.heroBtn}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={supportServer}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-surface-container-high/80 backdrop-blur border border-outline-variant/50 text-on-surface px-8 py-4 rounded-xl font-label-bold uppercase tracking-widest transition-all hover:bg-surface-container-highest hover:border-primary-container/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              {t.supportBtn}
            </a>
          </div>
        </FadeIn>

        {/* Floating badge */}
        <FadeIn delay={700} direction="up" distance={15}>
          <div className="mt-16 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-container/60 border border-outline-variant/20 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {['🏰', '⚔️', '🛡️'].map((emoji, i) => (
                <span key={i} className="w-7 h-7 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-xs">
                  {emoji}
                </span>
              ))}
            </div>
            <span className="text-on-surface-variant text-xs">
              {lang === 'tr' ? '50+ lonca tarafından tercih ediliyor' : 'Trusted by 50+ guilds'}
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
