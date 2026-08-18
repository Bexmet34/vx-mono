"use client";
import { LINKS } from '@veyronix/config';

import { Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ActiveCampaignsSection({ activeCampaigns = [] }) {
  const { lang, t } = useLanguage();

  if (!activeCampaigns || activeCampaigns.length === 0) return null;

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {activeCampaigns.map((camp) => (
          <div key={camp.id} className="glass-panel p-2 relative overflow-hidden group hover:border-primary-container transition-colors duration-500">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-container/10 blur-3xl rounded-full group-hover:bg-primary-container/20 transition-all"></div>
            <div className="w-12 h-8 bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container mb-3">
              <Star size={16} className="fill-current" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-3">{lang === 'tr' ? camp.title_tr : camp.title_en}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-3">{lang === 'tr' ? camp.description_tr : camp.description_en}</p>
            <a 
              href={LINKS.SUPPORT_SERVER} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 bg-transparent border border-primary-container text-primary-container px-3 py-1 font-label-bold text-label-bold uppercase tracking-widest transition-all hover:bg-primary-container hover:text-on-primary"
            >
              {t.promoBtn}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
