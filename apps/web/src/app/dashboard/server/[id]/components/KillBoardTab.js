"use client";

import { Construction } from "lucide-react";

export default function KillBoardTab({ lang }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-slide-up bg-surface-container-low rounded-xl border border-outline-variant/30">
      <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
        <Construction size={32} className="text-primary-container" />
      </div>
      <h2 className="text-2xl font-headline-xl text-on-surface mb-2 font-bold tracking-tight">
        {lang === 'en' ? 'Under Construction' : 'Yapım Aşamasında'}
      </h2>
      <p className="text-on-surface-variant font-body-md max-w-md mx-auto">
        {lang === 'en' 
          ? 'We are developing a brand new KillBoard system. This feature will be available soon!' 
          : 'Yepyeni bir KillBoard sistemi geliştiriyoruz. Bu özellik çok yakında burada aktif olacak!'}
      </p>
    </div>
  );
}
