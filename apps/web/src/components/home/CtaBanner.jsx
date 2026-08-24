"use client";

import { Zap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

export default function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-12 md:py-16">
      <FadeIn delay={100} direction="up" distance={20}>
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">
          {/* Multi-layer gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-surface-container to-secondary/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-container/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-[80px]" />
          
          {/* Content */}
          <div className="relative z-10 text-center py-10 md:py-12 px-6 md:px-12">
            <h2 className="font-headline-xl text-2xl md:text-3xl lg:text-4xl text-on-surface tracking-tight mb-3 font-bold">
              {t.ctaTitle}
            </h2>
            <p className="font-body-lg text-sm md:text-base text-on-surface-variant max-w-lg mx-auto mb-6 font-light">
              {t.ctaDesc}
            </p>
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 bg-primary-container text-on-primary px-8 py-3.5 rounded-xl font-label-bold uppercase tracking-wider transition-all hover:shadow-[0_0_40px_rgba(255,215,0,0.35)] hover:-translate-y-0.5 active:scale-95 text-xs sm:text-sm"
            >
              <Zap size={16} className="fill-current" />
              {t.ctaBtn}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
