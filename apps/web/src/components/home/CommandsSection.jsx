"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

export default function CommandsSection({ gifs = [] }) {
  const { lang } = useLanguage();
  const [activeGifModal, setActiveGifModal] = useState(null);

  const openGifModal = (cmdName) => {
    if (gifs.includes(cmdName)) {
      setActiveGifModal(cmdName);
    }
  };

  const renderGifHoverOrModal = (cmdName) => {
    if (!gifs.includes(cmdName)) return null;
    return (
      <div className="absolute hidden group-hover:block bottom-full left-0 md:left-1/2 md:-translate-x-1/2 mb-4 w-72 p-1.5 bg-surface-container-high border border-outline-variant/30 z-50 shadow-2xl rounded-xl">
        <Image 
          src={`/gif/${cmdName}.gif`} 
          alt={`${cmdName} command`} 
          width={300} 
          height={200} 
          className="w-full h-auto rounded-lg border border-outline-variant/20"
          unoptimized
        />
      </div>
    );
  };

  return (
    <section id="commands" className="px-margin-mobile md:px-margin-desktop py-32 max-w-container-max mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
        
        {/* Left Column: Text & Interactive Command Items */}
        <div className="space-y-10">
          <FadeIn delay={100} direction="up" distance={30}>
            <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface uppercase tracking-tight">
              {lang === 'tr' ? 'Komuta Merkezi' : 'Command Center'}
            </h2>
          </FadeIn>
          
          <FadeIn delay={200} direction="up" distance={30}>
            <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed font-light">
              {lang === 'tr' 
                ? 'Basit ama güçlü slash komutlarıyla sunucunuzu bir savaş odasına dönüştürün. Karmaşık bot ayarlarıyla uğraşmayın.' 
                : 'Transform your server into a war room with simple yet powerful slash commands. No need to mess with complex bot settings.'}
            </p>
          </FadeIn>
          
          <ul className="space-y-6">
            <FadeIn delay={300} direction="up" distance={20}>
              <li className="flex items-start gap-4 group relative cursor-pointer" onClick={() => openGifModal('help')}>
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container shrink-0 group-hover:bg-primary-container group-hover:text-on-primary transition-colors duration-300 mt-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-primary-container text-lg tracking-widest uppercase">/help</span>
                  <span className="font-body-md text-on-surface-variant font-light mt-1">
                    {lang === 'tr' ? 'Botun tüm yeteneklerinin ve ayarlarının listesini görüntüleyin.' : 'View a list of all bot abilities and settings.'}
                  </span>
                </div>
                {renderGifHoverOrModal('help')}
              </li>
            </FadeIn>

            <FadeIn delay={400} direction="up" distance={20}>
              <li className="flex items-start gap-4 group relative cursor-pointer" onClick={() => openGifModal('createparty')}>
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container shrink-0 group-hover:bg-primary-container group-hover:text-on-primary transition-colors duration-300 mt-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-primary-container text-lg tracking-widest uppercase">/createparty</span>
                  <span className="font-body-md text-on-surface-variant font-light mt-1">
                    {lang === 'tr' ? 'Dakikalar içinde detaylı bir etkinlik hazırlığı başlatın.' : 'Start a detailed event preparation in minutes.'}
                  </span>
                </div>
                {renderGifHoverOrModal('createparty')}
              </li>
            </FadeIn>

            <FadeIn delay={500} direction="up" distance={20}>
              <li className="flex items-start gap-4 group relative cursor-pointer" onClick={() => openGifModal('settings')}>
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container shrink-0 group-hover:bg-primary-container group-hover:text-on-primary transition-colors duration-300 mt-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-primary-container text-lg tracking-widest uppercase">/settings</span>
                  <span className="font-body-md text-on-surface-variant font-light mt-1">
                    {lang === 'tr' ? 'Guild ayarlarınızı anında Discord üzerinden özelleştirin.' : 'Customize your guild settings instantly on Discord.'}
                  </span>
                </div>
                {renderGifHoverOrModal('settings')}
              </li>
            </FadeIn>
          </ul>
        </div>

        {/* Right Column: Terminal Mockup */}
        <FadeIn delay={300} direction="up" distance={40}>
          <div className="glass-panel border border-outline-variant/30 p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl group hover:border-primary-container/40 transition-colors duration-500">
            {/* Terminal Header */}
            <div className="bg-surface-container-highest px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error/80"></div>
                <div className="w-3 h-3 rounded-full bg-warning/80"></div>
                <div className="w-3 h-3 rounded-full bg-success/80"></div>
              </div>
              <div className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase">Terminal</div>
            </div>
            {/* Terminal Body */}
            <div className="p-6 font-mono text-xs md:text-sm space-y-6 bg-[#090b14] h-[320px] flex flex-col justify-center">
              <div className="flex gap-3 text-on-surface-variant">
                <span className="text-on-surface-variant/40 shrink-0 select-none">09:12:45</span>
                <div>
                  <span className="text-on-surface">@Commander:</span> <span className="text-primary-container font-bold">/createparty</span> type:ZvZ time:20:00
                </div>
              </div>
              
              {/* Bot Response Box */}
              <div className="ml-14 bg-surface-container-high/40 border-l-2 border-primary-container p-4 rounded-r-lg space-y-3 shadow-lg">
                <div className="font-label-bold text-on-surface tracking-widest uppercase text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                  {lang === 'tr' ? 'PARTİ OLUŞTURULDU' : 'PARTY CREATED'}
                </div>
                <div className="text-on-surface-variant text-xs space-y-1.5">
                  <div><span className="text-on-surface opacity-60">{lang === 'tr' ? 'Tür' : 'Type'}:</span> <span className="text-primary-container">Zerg vs Zerg</span></div>
                  <div><span className="text-on-surface opacity-60">{lang === 'tr' ? 'Zaman' : 'Time'}:</span> 20:00 UTC</div>
                  <div><span className="text-on-surface opacity-60">{lang === 'tr' ? 'Hedef' : 'Objective'}:</span> Red Zone Castle Fight</div>
                </div>
                <div className="text-[10px] text-on-surface-variant/50 pt-2 border-t border-outline-variant/10">
                  {lang === 'tr' ? 'Üyeler artık /join yazarak katılabilir.' : 'Members can now type /join to participate.'}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
