"use client";

import { Zap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

export default function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-28 md:py-36">
      <FadeIn delay={100} direction="up" distance={30}>
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">
          {/* Multi-layer gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-surface-container to-secondary/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-container/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-[80px]" />
          
          {/* Content */}
          <div className="relative z-10 text-center py-16 md:py-20 px-8 md:px-16">
            <h2 className="font-headline-xl text-3xl md:text-4xl lg:text-5xl text-on-surface tracking-tight mb-4 font-bold">
              {t.ctaTitle}
            </h2>
            <p className="font-body-lg text-lg text-on-surface-variant max-w-lg mx-auto mb-10 font-light">
              {t.ctaDesc}
            </p>
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 bg-primary-container text-on-primary px-10 py-4 rounded-xl font-label-bold uppercase tracking-widest transition-all hover:shadow-[0_0_50px_rgba(255,215,0,0.35)] hover:-translate-y-1 active:scale-95 text-sm"
            >
              <Zap size={18} className="fill-current" />
              {t.ctaBtn}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
