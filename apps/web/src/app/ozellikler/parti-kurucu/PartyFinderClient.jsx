"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LINKS } from "@veyronix/config";
import { Swords, Shield, Heart, Zap, Crosshair, Users, ArrowRight, Sparkles, CheckCircle2, ChevronRight, HelpCircle, Terminal } from "lucide-react";

export default function PartyFinderClient() {
  const { lang } = useLanguage();
  const isTr = lang === "tr";

  const t = {
    badge: isTr ? "ZvZ & PvE Kompozisyon Motoru" : "ZvZ & PvE Composition Engine",
    title1: isTr ? "Albion Online" : "Albion Online",
    titleHighlight: isTr ? "Parti Kurucu" : "Party Finder",
    title2: isTr ? "Botu" : "& ZvZ Bot",
    desc: isTr
      ? "Lonca liderleri ve parti yöneticileri için geliştirilmiş en hızlı ZvZ parti kurucu. Tank, Healer, Ranged DPS ve Destek rollerini belirleyin, üyeler tek tıkla butondan katılsın."
      : "The ultimate ZvZ party builder for Albion Online guild commanders. Configure Tank, Healer, Ranged DPS, and Support compositions with 1-click Discord button signups.",
    addBotBtn: isTr ? "Botu Sunucuna Ekle" : "Add Bot to Server",
    dashBtn: isTr ? "Şablonları Web Panelden Oluştur" : "Create Templates via Dashboard",
    
    mockupCategory: isTr ? "🗡️ ZvZ Castle Fight (20v20)" : "🗡️ ZvZ Castle Fight (20v20)",
    mockupHeader: isTr ? "Etkinlik Saati: 18:00 UTC • Lider: @CallerBexmet" : "Event Time: 18:00 UTC • Leader: @CallerBexmet",
    mockupStatus: isTr ? "18/20 Dolu" : "18/20 Full",
    
    tankTitle: isTr ? "🛡️ Main Tank (2/2)" : "🛡️ Main Tank (2/2)",
    healerTitle: isTr ? "💚 Healer (4/4)" : "💚 Healer (4/4)",
    dpsTitle: isTr ? "⚔️ Ranged DPS (8/8)" : "⚔️ Ranged DPS (8/8)",
    supportTitle: isTr ? "🔮 Support & Arcane (4/4)" : "🔮 Support & Arcane (4/4)",
    morePlayers: isTr ? "+5 Oyuncu Daha" : "+5 More Players",
    
    buttonsLabel: isTr ? "Butonlar:" : "Buttons:",
    btnTank: isTr ? "Tank Ol" : "Join Tank",
    btnHealer: isTr ? "Healer Ol" : "Join Healer",
    btnDPS: isTr ? "DPS Ol" : "Join DPS",
    btnBench: isTr ? "Yedek Ol" : "Join Bench",
    btnLeave: isTr ? "Ayrıl" : "Leave",
    
    commandsTitle: isTr ? "Parti Komutları" : "Party Commands",
    cmd1: "/createparty",
    cmd1Desc: isTr ? "Sıfırdan özel parti adı, rol sayıları ve etkinlik saati belirleyerek parti kurar." : "Creates a new custom party with specified roles, headcount, and event schedule.",
    cmd2: "/temp [şablon]",
    cmd2Desc: isTr ? "Web panelde kaydettiğiniz hazır kompozisyon şablonunu tek tıkla Discord'a gönderir." : "Instantly launches a saved composition template created in your web dashboard.",
    cmd3: "/closeparty",
    cmd3Desc: isTr ? "Aktif partinizi manuel olarak kapatır ve katılım özetini kilitler." : "Manually concludes the active party and locks the attendance roster.",
    cmd4: "/mytemps",
    cmd4Desc: isTr ? "Kayıtlı bireysel ve lonca şablonlarınızı yönetmenizi sağlar." : "Manage and organize your custom party build templates.",
    
    faqTitle: isTr ? "Parti Kurucu Hakkında SSS" : "Party Finder FAQ",
    faqSubtitle: isTr ? "Parti sistemiyle ilgili sıkça sorulan sorular" : "Frequently asked questions about party compositions",
    faq1Q: isTr ? "Discord'da Albion Online Partisi Nasıl Kurulur?" : "How to create an Albion Online party on Discord?",
    faq1A: isTr
      ? "Discord sunucunuzda /createparty komutunu yazabilir veya /temp komutuyla web panelinizde önceden kaydettiğiniz ZvZ / PvE şablonunu seçerek saniyeler içinde parti duyurusu oluşturabilirsiniz."
      : "Type /createparty in Discord or use /temp with your pre-saved web dashboard templates to launch full compositions in seconds.",
    faq2Q: isTr ? "Üyeler Rollere Nasıl Kayıt Olur?" : "How do members register for roles?",
    faq2A: isTr
      ? "Parti mesajının altındaki Tank, Healer, DPS, Support veya Yedek butonlarına tıklayan üyeler ilgili role anında atanır. Kontenjan dolduğunda bot otomatik olarak yeni katılımları yedek sırasına alır."
      : "Members click interactive Tank, Healer, DPS, Support, or Bench buttons to reserve slots. Overflow signups are queued on the bench list.",
    
    ctaTitle: isTr ? "Loncanızın ZvZ Organizasyonunu Güçlendirin" : "Supercharge Your Guild ZvZ Organization",
    ctaDesc: isTr ? "Parti toplamayı saniyelere indirin, lonca savaşlarında bir adım önde olun." : "Gather armies in seconds and dominate Albion Online guild battles.",
    ctaBtn: isTr ? "Hemen Botu Ekle" : "Add Bot Now",
    
    breadcrumbHome: isTr ? "Ana Sayfa" : "Home",
    breadcrumbFeatures: isTr ? "Özellikler" : "Features",
    breadcrumbCurrent: isTr ? "Parti Kurucu & ZvZ Builder" : "Party Finder & ZvZ Builder",
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary-container transition-colors">{t.breadcrumbHome}</Link>
        <ChevronRight size={12} />
        <Link href="/#features" className="hover:text-primary-container transition-colors">{t.breadcrumbFeatures}</Link>
        <ChevronRight size={12} />
        <span className="text-primary-container font-semibold">{t.breadcrumbCurrent}</span>
      </nav>

      {/* Hero */}
      <section className="text-center mb-16 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <Swords size={15} />
          <span>{t.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
          {t.title1} <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">{t.titleHighlight}</span> {t.title2}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-light leading-relaxed mb-8">
          {t.desc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={LINKS.BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-primary-container text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)] flex items-center gap-2"
          >
            <span>{t.addBotBtn}</span>
            <ArrowRight size={16} />
          </a>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary-container/50 hover:bg-primary-container/10 transition-all font-semibold text-sm flex items-center gap-2"
          >
            <Sparkles size={16} className="text-primary-container" />
            <span>{t.dashBtn}</span>
          </Link>
        </div>
      </section>

      {/* Party Composition Mockup */}
      <section className="mb-20">
        <div className="bg-[#0b1322] border border-blue-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
            <div>
              <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">{t.mockupCategory}</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{t.mockupHeader}</h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">{t.mockupStatus}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-2">
                <Shield size={16} /> {t.tankTitle}
              </div>
              <div className="text-xs text-gray-300 space-y-1 font-mono">
                <div>1. @Arthur (Grailseeker)</div>
                <div>2. @Lancelot (Heavy Mace)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                <Heart size={16} /> {t.healerTitle}
              </div>
              <div className="text-xs text-gray-300 space-y-1 font-mono">
                <div>1. @Hallowfall_Pro</div>
                <div>2. @Fallen_Heal</div>
                <div>3. @Blight_Main</div>
                <div>4. @Redemption</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-2">
                <Zap size={16} /> {t.dpsTitle}
              </div>
              <div className="text-xs text-gray-300 space-y-1 font-mono">
                <div>1. @PermaFrost</div>
                <div>2. @Mistpiercer</div>
                <div>3. @Spirithunter</div>
                <div>4. {t.morePlayers}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-2">
                <Crosshair size={16} /> {t.supportTitle}
              </div>
              <div className="text-xs text-gray-300 space-y-1 font-mono">
                <div>1. @Arcane_Main</div>
                <div>2. @Locus_King</div>
                <div>3. @Enigmatic</div>
                <div>4. @Lifecurse</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/20">
            <span className="text-xs text-on-surface-variant self-center mr-2 font-semibold">{t.buttonsLabel}</span>
            <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5">
              <Shield size={14} /> {t.btnTank}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
              <Heart size={14} /> {t.btnHealer}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5">
              <Zap size={14} /> {t.btnDPS}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold flex items-center gap-1.5">
              <Users size={14} /> {t.btnBench}
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
              {t.btnLeave}
            </button>
          </div>
        </div>
      </section>

      {/* Commands */}
      <section className="mb-20 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Terminal className="text-blue-400" size={22} />
          <span>{t.commandsTitle}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-blue-400 mb-1">{t.cmd1}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd1Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-blue-400 mb-1">{t.cmd2}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd2Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-blue-400 mb-1">{t.cmd3}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd3Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-blue-400 mb-1">{t.cmd4}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd4Desc}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="text-blue-400" size={24} />
            <span>{t.faqTitle}</span>
          </h2>
          <p className="text-xs text-on-surface-variant">{t.faqSubtitle}</p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <h3 className="font-bold text-white text-sm mb-2">{t.faq1Q}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t.faq1A}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <h3 className="font-bold text-white text-sm mb-2">{t.faq2Q}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t.faq2A}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-blue-500/10 via-surface-container to-surface-container-lowest border border-blue-500/30">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{t.ctaTitle}</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
          {t.ctaDesc}
        </p>
        <a
          href={LINKS.BOT_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
        >
          <span>{t.ctaBtn}</span>
          <ArrowRight size={16} />
        </a>
      </section>

    </main>
  );
}
