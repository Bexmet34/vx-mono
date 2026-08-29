"use client";

import { Construction } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function KillboardHubClient() {
  const { lang } = useLanguage();
  const isTr = lang === 'tr';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-32 text-center text-white min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Construction size={48} className="text-primary-container" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
        {isTr ? "Yapım Aşamasında" : "Under Construction"}
      </h1>
      <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-8 font-light leading-relaxed">
        {isTr 
          ? "Veyronix Killboard altyapısı şu anda tamamen yenileniyor. Yeni ve çok daha gelişmiş sistem yakında sizlerle olacak!"
          : "The Veyronix Killboard infrastructure is currently being completely rebuilt. A new and much more advanced system will be available soon!"}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container text-sm font-label-bold uppercase tracking-widest">
        {isTr ? "YAKINDA" : "COMING SOON"}
      </div>
    </div>
  );
}
