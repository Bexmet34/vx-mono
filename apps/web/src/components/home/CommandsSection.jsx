"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
      <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-1 bg-surface-container-high border border-outline-variant z-50 shadow-2xl rounded">
        <Image 
          src={`/gif/${cmdName}.gif`} 
          alt={`${cmdName} command`} 
          width={250} 
          height={150} 
          className="w-full h-auto rounded"
          unoptimized
        />
      </div>
    );
  };

  return (
    <section id="commands" className="px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Text & Interactive Command Items */}
        <div className="space-y-8">
          <h2 className="font-headline-xl text-3xl md:text-5xl text-on-surface uppercase tracking-tight">
            {lang === 'tr' ? 'Komuta Merkezi Emrinizde' : 'Command Center at your Command'}
          </h2>
          <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed">
            {lang === 'tr' 
              ? 'Basit ama güçlü slash komutlarıyla sunucunuzu bir savaş odasına dönüştürün. Karmaşık bot ayarlarıyla uğraşmayın.' 
              : 'Transform your server into a war room with simple yet powerful slash commands. No need to mess with complex bot settings.'}
          </p>
          <ul className="space-y-6">
            <li className="flex items-center gap-4 group relative cursor-pointer" onClick={() => openGifModal('help')}>
              <div className="w-6 h-6 border border-primary-container flex items-center justify-center text-primary-container shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-body-md text-on-surface">
                <strong className="text-primary-container font-headline-md uppercase tracking-widest">/help</strong> – {lang === 'tr' ? 'Tüm yeteneklerin listesi' : 'List of all abilities'}
              </span>
              {renderGifHoverOrModal('help')}
            </li>

            <li className="flex items-center gap-4 group relative cursor-pointer" onClick={() => openGifModal('createparty')}>
              <div className="w-6 h-6 border border-primary-container flex items-center justify-center text-primary-container shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-body-md text-on-surface">
                <strong className="text-primary-container font-headline-md uppercase tracking-widest">/createparty</strong> – {lang === 'tr' ? 'Anında savaşa hazırlık' : 'Instant battle preparation'}
              </span>
              {renderGifHoverOrModal('createparty')}
            </li>

            <li className="flex items-center gap-4 group relative cursor-pointer" onClick={() => openGifModal('settings')}>
              <div className="w-6 h-6 border border-primary-container flex items-center justify-center text-primary-container shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-body-md text-on-surface">
                <strong className="text-primary-container font-headline-md uppercase tracking-widest">/settings</strong> – {lang === 'tr' ? 'Guild ayarlarınızı özelleştirin' : 'Customize your guild settings'}
              </span>
              {renderGifHoverOrModal('settings')}
            </li>
          </ul>
        </div>

        {/* Right Column: Terminal Mockup */}
        <div className="glass-panel border border-outline-variant p-0 overflow-hidden shadow-[0_0_40px_rgba(255,215,0,0.05)]">
          {/* Terminal Header */}
          <div className="bg-surface-container-highest px-4 py-3 flex items-center gap-2 border-b border-outline-variant/50">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          {/* Terminal Body */}
          <div className="p-6 md:p-8 font-mono text-sm md:text-base space-y-6 bg-[#0B0F19]">
            <div className="flex gap-4 text-on-surface-variant">
              <span className="text-on-surface-variant/50 shrink-0">09:12:45</span>
              <div>
                <span className="text-on-surface">@Commander:</span> <span className="text-primary-container">/createparty</span> type:ZvZ time:20:00
              </div>
            </div>
            
            {/* Bot Response Box */}
            <div className="ml-12 md:ml-[4.5rem] bg-surface-container-high border-l-2 border-primary-container p-4 space-y-2">
              <div className="font-label-bold text-on-surface tracking-widest uppercase">{lang === 'tr' ? 'PARTİ OLUŞTURULDU' : 'PARTY CREATED'}</div>
              <div className="text-on-surface-variant">{lang === 'tr' ? 'Hedef' : 'Objective'}: Red Zone Castle Fight</div>
              <div className="text-on-surface-variant">{lang === 'tr' ? 'Durum' : 'Status'}: {lang === 'tr' ? 'Bekleniyor' : 'Waiting'} (0/20)</div>
            </div>

            <div className="flex gap-4 text-on-surface-variant">
              <span className="text-on-surface-variant/50 shrink-0">09:12:58</span>
              <div>
                <span className="text-on-surface">@WarriorX:</span> <span className="text-primary-container">/join</span> slot:Tank
              </div>
            </div>

            <div className="flex gap-4 text-on-surface-variant">
              <span className="text-on-surface-variant/50 shrink-0">09:13:02</span>
              <div>
                <span className="text-primary-container">Veyronix:</span> @WarriorX {lang === 'tr' ? 'sisteme kayıt edildi.' : 'registered to the system.'}
              </div>
            </div>
            
            <div className="text-on-surface-variant/50 animate-pulse">_</div>
          </div>
        </div>
      </div>

      {/* Mobile Modal for GIF Preview */}
      {activeGifModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveGifModal(null)}>
          <div className="bg-surface-container-high border border-outline-variant p-4 max-w-lg w-full relative rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveGifModal(null)} 
              className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-md mb-3 uppercase text-primary-container">/{activeGifModal} Önizleme</h3>
            <Image 
              src={`/gif/${activeGifModal}.gif`} 
              alt={`${activeGifModal} command demo`} 
              width={500} 
              height={300} 
              className="w-full h-auto rounded border border-outline-variant"
              unoptimized
            />
          </div>
        </div>
      )}
    </section>
  );
}
