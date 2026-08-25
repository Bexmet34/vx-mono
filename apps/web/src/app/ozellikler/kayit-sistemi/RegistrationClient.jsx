"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LINKS } from "@veyronix/config";
import { UserCheck, ShieldCheck, Tag, Users, Zap, CheckCircle2, ChevronRight, HelpCircle, Terminal, ArrowRight, Sparkles, UserX } from "lucide-react";

export default function RegistrationClient() {
  const { lang } = useLanguage();
  const isTr = lang === "tr";

  const t = {
    badge: isTr ? "Kayıt Motoru • Otomatik Doğrulama" : "Registration Engine • Auto Verification",
    title1: isTr ? "Gelişmiş Discord" : "Advanced Discord",
    titleHighlight: isTr ? "Kayıt Botu" : "Registration Bot",
    title2: isTr ? "& Otomatik Rol" : "& Auto Role System",
    desc: isTr
      ? "Yetkililerin tek tek isim değiştirip rol verme zahmetine son! Butonlu modal kayıt formu, otomatik takma ad düzenleme, oyun içi lonca doğrulaması ve toplu kayıtsız yönetimi tek bir sistemde."
      : "End manual verification fatigue! Modal button registration, automated nickname formatting ([TAG] IGN), guild verification and mass unregistered member cleanup in one unified suite.",
    addBotBtn: isTr ? "Botu Ücretsiz Ekle" : "Add Bot Free",
    dashBtn: isTr ? "Kayıt Şablonunu Ayarla" : "Configure Registration Template",
    
    modalTitle: isTr ? "Sunucu Kayıt Formu" : "Server Registration Form",
    modalBadge: "Modal v2",
    ignLabel: isTr ? "Oyun İçi İsim (IGN) *" : "In-Game Name (IGN) *",
    realNameAgeLabel: isTr ? "Gerçek İsim & Yaş" : "Real Name & Age",
    nameVal: isTr ? "Hakkı" : "John",
    ageVal: "24",
    guildLabel: isTr ? "Lonca / Guild Durumu" : "Guild Verification",
    guildVal: isTr ? "✓ Veyronix Guild (Otomatik Doğrulandı)" : "✓ Veyronix Guild (Auto Verified)",
    completeBtn: isTr ? "Kaydı Tamamla" : "Complete Registration",
    
    benefit1Title: isTr ? "Otomatik Takma Ad & Tag Düzenleme" : "Automatic Nickname & Tag Formatting",
    benefit1Desc: isTr
      ? "Üyenin girdiği bilgiler anında [TAG] Nick | İsim veya sunucunuzun istediği formata dönüştürülür. 32 karakter sınırına akıllıca uyar."
      : "User input is automatically formatted into [TAG] IGN | RealName while strictly complying with Discord's 32-character limit.",
    
    benefit2Title: isTr ? "Otomatik Rol & Yetki Senkronizasyonu" : "Instant Role & Permission Sync",
    benefit2Desc: isTr
      ? "Kayıt tamamlandığında \"Kayıtsız\" rolü otomatik alınır, seçtiğiniz \"Üye\", \"Oyuncu\" veya lonca rolleri anında atanır."
      : "Upon submission, the Unregistered role is removed and configured Member, Gamer or Guild roles are granted in milliseconds.",
    
    benefit3Title: isTr ? "Toplu Kayıtsızları Belirleme" : "Mass Unregistered Member Cleanup",
    benefit3Desc: isTr
      ? "/kayitsizlari-belirle komutuyla sunucudaki tüm kayıtsız üyelerin rollerini sıfırlayıp isimlerini [Kayıt Bekliyor] yapabilirsiniz."
      : "Reset roles and tag all unverified members with [Pending Registration] using the /kayitsizlari-belirle command.",
    
    commandsTitle: isTr ? "Kayıt Sistemi Slash Komutları" : "Registration Slash Commands",
    cmd1: "/setup-registration",
    cmd1Desc: isTr ? "Kayıt kanalına butonlu sabit kayıt mesajını gönderir ve sistemi başlatır." : "Deploys the persistent button registration embed to your welcome channel.",
    cmd2: "/kayitsizlari-belirle [rol]",
    cmd2Desc: isTr ? "Kayıtsız üyelerin tüm rollerini siler ve seçilen kayıtsız rolünü topluca verir." : "Strips all roles from unregistered members and applies the designated unverified role.",
    cmd3: "/rd [kullanici] [rol] [ign] [isim] [yas]",
    cmd3Desc: isTr ? "Kayıtlı bir kullanıcının rolünü, ismini ve yaşını anında tek komutla düzenler." : "Quickly edits a registered member's role, IGN, name and age with auto character truncation.",
    cmd4: "/reg-close [kullanici]",
    cmd4Desc: isTr ? "Devam eden kayıt oturumunu ve özel kanalını manuel olarak sonlandırır." : "Manually terminates an ongoing registration session.",
    
    faqTitle: isTr ? "Kayıt Sistemi Hakkında SSS" : "Registration FAQ",
    faqSubtitle: isTr ? "Kayıt botu kurulumuyla ilgili en çok sorulan sorular" : "Frequently asked questions about registration and auto roles",
    faq1Q: isTr ? "Bot isim değiştirme ve rol verme yetkisine nasıl sahip olur?" : "How does the bot get permission to change nicknames and assign roles?",
    faq1A: isTr
      ? "Discord sunucu ayarlarında Veyronix rolünü üyelere vereceğiniz rollerin en üstüne taşımanız ve \"Kullanıcı Adlarını Yönet\" ile \"Rolleri Yönet\" yetkilerini vermeniz yeterlidir."
      : "In Server Settings > Roles, place the Veyronix bot role above the roles it manages and ensure 'Manage Nicknames' and 'Manage Roles' are enabled.",
    faq2Q: isTr ? "Oyun içi lonca doğrulaması nasıl çalışır?" : "How does in-game guild verification work?",
    faq2A: isTr
      ? "Veyronix, Albion Online resmi API bağlantısı ile oyuncunun yazdığı nickin loncada olup olmadığını anlık kontrol eder. Gerçek üyeyse lonca rolünü otomatik tanımlar."
      : "Veyronix connects directly to the game's official API to verify if the entered IGN belongs to your guild, automatically assigning verified status.",
    
    ctaTitle: isTr ? "Sunucunuza Butonlu Kayıt Sistemini Hemen Kurun" : "Deploy Automated Registration on Your Server",
    ctaDesc: isTr ? "Gelen her yeni üyenin otomatik olarak doğrulanmasını sağlayın, sunucu güvenliğinizi en üst düzeye çıkarın." : "Streamline member onboarding and maximize server security in minutes.",
    ctaBtn: isTr ? "Botu Ücretsiz Discord'a Ekle" : "Add Bot to Discord Free",
    
    breadcrumbHome: isTr ? "Ana Sayfa" : "Home",
    breadcrumbFeatures: isTr ? "Özellikler" : "Features",
    breadcrumbCurrent: isTr ? "Kayıt Sistemi & Otomatik Rol" : "Registration & Auto Role",
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

      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <UserCheck size={15} />
          <span>{t.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
          {t.title1} <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">{t.titleHighlight}</span> {t.title2}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-light leading-relaxed mb-8">
          {t.desc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={LINKS.BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)] flex items-center gap-2"
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

      {/* Modal UI Mockup Showcase */}
      <section className="mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Modal Mockup */}
          <div className="bg-[#111622] border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">📝</div>
                <span className="font-bold text-sm text-white">{t.modalTitle}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">{t.modalBadge}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.ignLabel}</label>
                <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-white font-mono">
                  Bexmet
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.realNameAgeLabel}</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-white font-mono">{t.nameVal}</div>
                  <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-white font-mono">{t.ageVal}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t.guildLabel}</label>
                <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-emerald-400 font-mono">
                  {t.guildVal}
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={15} /> {t.completeBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Benefit Bullets */}
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1">{t.benefit1Title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t.benefit1Desc}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1">{t.benefit2Title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t.benefit2Desc}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <UserX size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1">{t.benefit3Title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t.benefit3Desc}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Commands List */}
      <section className="mb-20 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Terminal className="text-emerald-400" size={22} />
          <span>{t.commandsTitle}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-1">{t.cmd1}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd1Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-1">{t.cmd2}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd2Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-1">{t.cmd3}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd3Desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
            <div className="text-xs font-mono font-bold text-emerald-400 mb-1">{t.cmd4}</div>
            <p className="text-xs text-on-surface-variant">{t.cmd4Desc}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="text-emerald-400" size={24} />
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
      <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-surface-container to-surface-container-lowest border border-emerald-500/30">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">{t.ctaTitle}</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
          {t.ctaDesc}
        </p>
        <a
          href={LINKS.BOT_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <span>{t.ctaBtn}</span>
          <ArrowRight size={16} />
        </a>
      </section>

    </main>
  );
}
