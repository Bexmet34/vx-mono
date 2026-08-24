"use client";

import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";
import { 
  XCircle, 
  CheckCircle2, 
  Ticket, 
  UserCheck, 
  Gift, 
  Skull, 
  Mic2, 
  Swords, 
  LayoutDashboard,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";

export default function ComparisonSection() {
  const { t, lang } = useLanguage();

  const comparisonItems = [
    {
      icon: Swords,
      title: t.compItemParty,
      others: t.compItemPartyDescOthers,
      veyronix: t.compItemPartyDescVeyronix,
    },
    {
      icon: Skull,
      title: t.compItemKillboard,
      others: t.compItemKillboardDescOthers,
      veyronix: t.compItemKillboardDescVeyronix,
    },
    {
      icon: Mic2,
      title: t.compItemTempVoice,
      others: t.compItemTempVoiceDescOthers,
      veyronix: t.compItemTempVoiceDescVeyronix,
    },
    {
      icon: Ticket,
      title: t.compItemTicket,
      others: t.compItemTicketDescOthers,
      veyronix: t.compItemTicketDescVeyronix,
    },
    {
      icon: UserCheck,
      title: t.compItemRegister,
      others: t.compItemRegisterDescOthers,
      veyronix: t.compItemRegisterDescVeyronix,
    },
    {
      icon: Gift,
      title: t.compItemGiveaway,
      others: t.compItemGiveawayDescOthers,
      veyronix: t.compItemGiveawayDescVeyronix,
    },
    {
      icon: LayoutDashboard,
      title: t.compItemDashboard,
      others: t.compItemDashboardDescOthers,
      veyronix: t.compItemDashboardDescVeyronix,
    },
  ];

  return (
    <section id="comparison" className="px-margin-mobile md:px-margin-desktop py-12 md:py-16 max-w-container-max mx-auto relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-container/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="text-center mb-10 relative z-10">
        <FadeIn delay={100} direction="up" distance={20}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-label-bold uppercase tracking-widest mb-3">
            <Layers size={14} />
            {lang === 'tr' ? '6+ Bot Yerine Tek Çözüm' : '1 Bot Replaces 6+ Tools'}
          </div>
          <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl text-on-surface tracking-tight mb-3 font-bold">
            {t.compTitle}
          </h2>
        </FadeIn>
        <FadeIn delay={200} direction="up" distance={15}>
          <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
            {t.compSubtitle}
          </p>
        </FadeIn>
      </div>

      {/* 2-Column Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto relative z-10 items-stretch">
        
        {/* LEFT COLUMN: DIĞER BOTLAR */}
        <FadeIn delay={250} direction="up" distance={30} className="h-full">
          <div className="h-full rounded-3xl p-6 sm:p-8 md:p-10 bg-surface-container-low/70 border border-outline-variant/30 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
            {/* Top Tag */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                <div>
                  <span className="text-[11px] font-label-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                    {t.compBadgeOthers}
                  </span>
                  <h3 className="font-headline-xl text-2xl text-on-surface mt-3 font-bold">
                    {t.compOthersTitle}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t.compOthersDesc}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                  <XCircle size={26} />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {comparisonItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface/50 border border-outline-variant/20 flex items-start gap-3 transition-colors hover:bg-surface/80"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                        <item.icon size={13} className="text-on-surface-variant" />
                        {item.title}
                      </div>
                      <p className="text-[11px] text-on-surface-variant/80 font-light mt-0.5 leading-normal">
                        {item.others}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 pt-4 border-t border-outline-variant/20 text-center">
              <span className="text-xs text-on-surface-variant/70 italic">
                {lang === 'tr' ? '⚠️ Yüksek toplam maliyet, birden fazla bot yetkisi ve sunucu kargaşası' : '⚠️ Multiple bot fees, permissions nightmare and server clutter'}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* RIGHT COLUMN: VEYRONIX (ALL-IN-ONE) */}
        <FadeIn delay={350} direction="up" distance={30} className="h-full">
          <div className="h-full rounded-3xl p-6 sm:p-8 md:p-10 bg-gradient-to-b from-surface-container-high/90 via-surface-container/90 to-surface-container-high/90 border-2 border-primary-container/50 shadow-[0_0_50px_rgba(255,215,0,0.15)] backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
            {/* Ambient gold glow inside */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Top Tag */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-primary-container/20 relative z-10">
                <div>
                  <span className="text-[11px] font-label-bold uppercase tracking-widest text-primary-container bg-primary-container/15 border border-primary-container/40 px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                    ⭐ {t.compBadgeVeyronix}
                  </span>
                  <h3 className="font-headline-xl text-2xl text-on-surface mt-3 font-bold flex items-center gap-2">
                    {t.compVeyronixTitle}
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t.compVeyronixDesc}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary-container/50 flex items-center justify-center text-primary-container flex-shrink-0 shadow-[0_0_20px_rgba(255,215,0,0.25)]">
                  <CheckCircle2 size={26} />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 relative z-10">
                {comparisonItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-container-highest/60 border border-primary-container/25 flex items-start gap-3 transition-all duration-300 hover:bg-surface-container-highest hover:border-primary-container/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary-container flex items-center gap-1.5">
                        <item.icon size={13} className="text-primary-container" />
                        {item.title}
                      </div>
                      <p className="text-[11px] text-on-surface font-light mt-0.5 leading-normal">
                        {item.veyronix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Call to Action inside the card */}
            <div className="mt-8 pt-4 border-t border-primary-container/20 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-label-bold text-primary-container">
                {lang === 'tr' ? '✨ Hepsi tek botta, sıfır kargaşa!' : '✨ All in one verified bot, zero bloat!'}
              </div>
              <a
                href="https://discord.com/oauth2/authorize?client_id=1082239904169336902&permissions=510977&scope=bot+applications.commands"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.35)] hover:-translate-y-0.5 active:scale-95"
              >
                <Zap size={14} className="fill-current" />
                {t.heroBtn}
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
