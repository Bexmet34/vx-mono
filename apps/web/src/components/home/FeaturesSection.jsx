"use client";

import { Swords, Skull, Mic2, ClipboardList, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

const featureIcons = [Swords, Skull, Mic2, ClipboardList, ShieldCheck, LayoutDashboard];
const featureColors = [
  { border: 'border-blue-500/20', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
  { border: 'border-red-500/20', bg: 'bg-red-500/10', text: 'text-red-400', glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]' },
  { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
  { border: 'border-amber-500/20', bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
  { border: 'border-violet-500/20', bg: 'bg-violet-500/10', text: 'text-violet-400', glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
  { border: 'border-primary-container/20', bg: 'bg-primary-container/10', text: 'text-primary-container', glow: 'group-hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]' },
];

export default function FeaturesSection() {
  const { t, lang } = useLanguage();

  const features = [
    { titleKey: 'feat1Title', descKey: 'feat1Desc', large: true },
    { titleKey: 'feat2Title', descKey: 'feat2Desc', large: false },
    { titleKey: 'feat3Title', descKey: 'feat3Desc', large: false },
    { titleKey: 'feat4Title', descKey: 'feat4Desc', large: false },
    { titleKey: 'feat5Title', descKey: 'feat5Desc', large: false },
    { titleKey: 'feat6Title', descKey: 'feat6Desc', large: true },
  ];

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-12 md:py-16 max-w-container-max mx-auto">
      <div className="text-center mb-10">
        <FadeIn delay={100} direction="up" distance={20}>
          <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl text-on-surface tracking-tight mb-3 font-bold">
            {t.featuresSectionTitle}
          </h2>
        </FadeIn>
        <FadeIn delay={200} direction="up" distance={15}>
          <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto font-light leading-relaxed">
            {t.featuresSectionDesc}
          </p>
        </FadeIn>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {features.map((feat, idx) => {
          const Icon = featureIcons[idx];
          const color = featureColors[idx];
          const isLarge = feat.large;
          
          return (
            <FadeIn key={idx} delay={100 + idx * 80} direction="up" distance={25} className={isLarge ? 'md:col-span-2' : ''}>
              <div className={`group h-full rounded-2xl p-7 md:p-8 flex flex-col justify-end relative overflow-hidden transition-all duration-500 cursor-default
                bg-surface-container/40 border border-outline-variant/20 backdrop-blur-sm
                hover:bg-surface-container-high/60 hover:border-outline-variant/40 hover:-translate-y-1
                ${color.glow}
              `}>
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`}
                  style={{ background: `radial-gradient(ellipse at top left, ${color.bg.includes('blue') ? 'rgba(59,130,246,0.05)' : color.bg.includes('red') ? 'rgba(239,68,68,0.05)' : color.bg.includes('emerald') ? 'rgba(16,185,129,0.05)' : color.bg.includes('amber') ? 'rgba(245,158,11,0.05)' : color.bg.includes('violet') ? 'rgba(139,92,246,0.05)' : 'rgba(255,215,0,0.05)'}, transparent 70%)` }}
                />
                
                {/* Large background icon */}
                {isLarge && (
                  <div className="absolute top-8 right-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                    <Icon size={160} strokeWidth={1} />
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110`}>
                    <Icon size={22} className={color.text} />
                  </div>
                  <h3 className="font-headline-md text-xl md:text-2xl text-on-surface mb-2.5 tracking-tight font-semibold">
                    {t[feat.titleKey]}
                  </h3>
                  <p className={`font-body-md text-on-surface-variant font-light leading-relaxed ${isLarge ? 'max-w-lg' : ''}`}>
                    {t[feat.descKey]}
                  </p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
