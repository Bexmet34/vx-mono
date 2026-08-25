"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LINKS } from "@veyronix/config";
import { MessageSquare, ShieldCheck, FileCheck, CheckCircle2, ChevronRight, HelpCircle, Terminal, ArrowRight, Sparkles, Lock, Headphones } from "lucide-react";

export default function TicketSupportClient() {
  const { lang } = useLanguage();
  const isTr = lang === "tr";

  const t = {
    badge: isTr ? "Destek & Başvuru Motoru" : "Support & Application Engine",
    title1: isTr ? "Discord" : "Discord",
    titleHighlight: isTr ? "Ticket & Destek" : "Ticket & Support",
    title2: isTr ? "Botu" : "Bot",
    desc: isTr
      ? "Üyelerinizin soru, şikayet ve lonca başvurularını karmaşa olmadan yönetin. Butonlu tek tıkla bilet açma, yetkili bildirimleri ve güvenli transkript kaydı."
      : "Streamline player inquiries, support tickets, and guild applications with zero clutter. 1-click button tickets, staff pinging, and automated transcript archives.",
    addBotBtn: isTr ? "Botu Sunucuna Ekle" : "Add Bot to Server",
    dashBtn: isTr ? "Web Panelden Yapılandır" : "Configure via Dashboard",
    
    benefit1Title: isTr ? "Butonlu Tek Tık Bilet" : "1-Click Button Tickets",
    benefit1Desc: isTr
      ? "Üyeler tek komut yazmadan butona basarak özel destek kanalı açar. Yetkililere anında bildirim düşer."
      : "Members spawn private support channels instantly with a single button click, notifying staff without spamming public chat.",
    
    benefit2Title: isTr ? "Lonca Başvuru Formları" : "Guild Application Forms",
    benefit2Desc: isTr
      ? "Oyun içi loncanıza yeni üye alımlarında oyuncunun item seti, PvP tecrübesi ve mikrofon durumu gibi bilgileri formla toplayın."
      : "Collect Item Power (IP), PvP stats, mic availability, and playtime info automatically from new guild applicants.",
    
    benefit3Title: isTr ? "%100 Gizlilik & Güvenlik" : "100% Privacy & Security",
    benefit3Desc: isTr
      ? "Her bilet kanalının izinleri izole edilir. Yalnızca bilet sahibi ve atanmış yetkili rolü yazışmaları görebilir."
      : "Each ticket channel is strictly isolated. Only the ticket creator and designated staff roles can view the discussion.",
    
    faqTitle: isTr ? "Ticket Sistemi Hakkında SSS" : "Ticket System FAQ",
    faqSubtitle: isTr ? "Bilet ve destek sistemiyle ilgili sıkça sorulan sorular" : "Common questions regarding the support system",
    faq1Q: isTr ? "Discord Butonlu Ticket Sistemi Nasıl Kurulur?" : "How to set up the button ticket system?",
    faq1A: isTr
      ? "Veyronix botunu sunucunuza ekledikten sonra web panelinden veya Discord üzerindeki ayar menüsünden Ticket kategorisini ve yetkili rollerini seçerek bilet sistemini saniyeler içinde başlatabilirsiniz."
      : "Invite Veyronix, select your target ticket category and staff roles in the web dashboard, and deploy the persistent button panel.",
    faq2Q: isTr ? "Açılan Biletleri Kimler Görebilir?" : "Who can see opened tickets?",
    faq2A: isTr
      ? "Oluşturulan bilet kanalı tamamen gizlidir; kanalı yalnızca bileti açan kullanıcı ve belirlediğiniz destek/yetkili rolüne sahip kişiler görebilir."
      : "The generated channel is private to the ticket author and assigned support roles only.",
    
    ctaTitle: isTr ? "Topluluk Destek Yönetiminizi Hemen Profesyonelleştirin" : "Professionalize Your Community Support Today",
    ctaDesc: isTr ? "Ayrı bir ticket botuna ihtiyaç duymadan, Veyronix'in hepsi bir arada altyapısıyla destek kanallarınızı yönetin." : "Manage support and guild applications seamlessly without needing external ticket bots.",
    ctaBtn: isTr ? "Botu Ücretsiz Discord'a Ekle" : "Add Bot to Discord Free",
    
    breadcrumbHome: isTr ? "Ana Sayfa" : "Home",
    breadcrumbFeatures: isTr ? "Özellikler" : "Features",
    breadcrumbCurrent: isTr ? "Ticket & Destek Sistemi" : "Ticket & Support System",
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
          <Headphones size={15} />
          <span>{t.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
          {t.title1} <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-violet-400 bg-clip-text text-transparent">{t.titleHighlight}</span> {t.title2}
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

      {/* Benefits Grid */}
      <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
            <MessageSquare size={20} />
          </div>
          <h3 className="font-bold text-lg text-white mb-2">{t.benefit1Title}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t.benefit1Desc}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            <FileCheck size={20} />
          </div>
          <h3 className="font-bold text-lg text-white mb-2">{t.benefit2Title}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t.benefit2Desc}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <Lock size={20} />
          </div>
          <h3 className="font-bold text-lg text-white mb-2">{t.benefit3Title}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t.benefit3Desc}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="text-violet-400" size={24} />
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
      <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-violet-500/10 via-surface-container to-surface-container-lowest border border-violet-500/30">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{t.ctaTitle}</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
          {t.ctaDesc}
        </p>
        <a
          href={LINKS.BOT_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
        >
          <span>{t.ctaBtn}</span>
          <ArrowRight size={16} />
        </a>
      </section>

    </main>
  );
}
