"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function FaqSection() {
  const { t } = useLanguage();

  return (
    <>
      {/* --- HOW IT WORKS & FAQ SECTION --- */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-low border-y border-on-surface/10">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-2">{t.faqMainTitle}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">{t.faqMainDesc}</p>
          </div>

          {/* 3-Step Onboarding */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-3">
            <div className="glass-panel p-2 text-center border border-outline-variant">
              <div className="w-16 h-7 mx-auto bg-surface-container-highest border border-outline flex items-center justify-center text-primary-container mb-3">
                <span className="font-headline-md">1</span>
              </div>
              <h3 className="font-headline-md text-xs text-on-surface mb-3 uppercase">{t.step1Title}</h3>
              <p className="font-body-md text-[10px] text-on-surface-variant">{t.step1Desc}</p>
            </div>

            <div className="glass-panel p-2 text-center border border-primary-container/30 bg-primary-container/5 relative overflow-hidden">
              <div className="scanline"></div>
              <div className="w-16 h-7 mx-auto bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary-container mb-3 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <span className="font-headline-md">2</span>
              </div>
              <h3 className="font-headline-md text-xs text-on-surface mb-3 uppercase">{t.step2Title}</h3>
              <p className="font-body-md text-[10px] text-on-surface-variant">{t.step2Desc}</p>
            </div>

            <div className="glass-panel p-2 text-center border border-outline-variant">
              <div className="w-16 h-7 mx-auto bg-surface-container-highest border border-outline flex items-center justify-center text-primary-container mb-3">
                <span className="font-headline-md">3</span>
              </div>
              <h3 className="font-headline-md text-xs text-on-surface mb-3 uppercase">{t.step3Title}</h3>
              <p className="font-body-md text-[10px] text-on-surface-variant">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ QUESTIONS --- */}
      <section id="faq" className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-low border-y border-on-surface/10">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-3">
            <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{t.faqTitle2}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {[
              { q: t.faqQ1, a: t.faqA1, num: 1 },
              { q: t.faqQ2, a: t.faqA2, num: 2 },
              { q: t.faqQ3, a: t.faqA3, num: 3 },
              { q: t.faqQ4, a: t.faqA4, num: 4 }
            ].map((item, idx) => (
              <div key={idx} className="bg-surface border border-outline-variant p-2 relative overflow-hidden group hover:border-primary-container/30 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-outline-variant group-hover:bg-primary-container transition-colors"></div>
                <h3 className="font-headline-md text-[10px] text-on-surface mb-2 flex items-center gap-2">
                  <span className="text-primary-container font-label-bold opacity-50">0{item.num}</span>
                  {item.q}
                </h3>
                <p className="font-body-md text-[10px] text-on-surface-variant pl-9 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
