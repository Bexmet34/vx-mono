"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

function AccordionItem({ question, answer, num, isOpen, onClick }) {
  return (
    <div 
      className={`border border-outline-variant/20 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-surface-container/50 border-primary-container/20' : 'bg-surface/30 hover:bg-surface-container/30'}`}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-primary-container/40 font-label-bold text-xs tabular-nums">0{num}</span>
          <h3 className="font-headline-md text-sm md:text-base text-on-surface font-semibold">{question}</h3>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-on-surface-variant flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-container' : ''}`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-6 pb-5 text-sm text-on-surface-variant font-light leading-relaxed pl-[52px]">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 },
  ];

  return (
    <section id="faq" className="px-margin-mobile md:px-margin-desktop py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <FadeIn delay={100} direction="up" distance={20}>
          <div className="text-center mb-8">
            <h2 className="font-headline-xl text-2xl md:text-3xl text-on-surface tracking-tight mb-2.5 font-bold">
              {t.faqTitle2}
            </h2>
            <p className="font-body-lg text-sm text-on-surface-variant max-w-lg mx-auto font-light">
              {t.faqMainDesc}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={200} direction="up" distance={20}>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                question={faq.q}
                answer={faq.a}
                num={idx + 1}
                isOpen={openIndex === idx}
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
