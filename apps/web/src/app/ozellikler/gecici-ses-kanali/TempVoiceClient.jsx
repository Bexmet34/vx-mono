"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LINKS } from "@veyronix/config";
import { Mic2, Lock, Unlock, EyeOff, Users, Settings, Volume2, UserPlus, ShieldAlert, Sparkles, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Terminal } from "lucide-react";

export default function TempVoiceClient() {
  const { lang } = useLanguage();

  const isTr = lang === "tr";

  const t = {
    badge: isTr ? "VoiceForge 2.0 • Dinamik Ses Sistemi" : "VoiceForge 2.0 • Dynamic Voice Engine",
    title1: isTr ? "Discord" : "Discord",
    titleHighlight: isTr ? "Geçici Ses Kanalı" : "Temporary Voice Channels",
    title2: isTr ? "Botu" : "Bot (Join to Create)",
    desc: isTr
      ? "Sunucunuzdaki 30+ boş kanal kirliliğine son verin! Üyeleriniz \"➕ Oda Oluştur\" kanalına katıldığında anında onlara özel geçici ses odası açılır. 15 butonlu interaktif panelden tam gizlilik ve oda kontrolü sağlanır."
      : "Eliminate channel clutter forever! When members join the \"➕ Create Room\" channel, a private temporary voice room is instantly generated. Manage everything from a 15-button interactive control panel.",
    addBotBtn: isTr ? "Botu Sunucuna Ekle (Ücretsiz)" : "Add Bot to Server (Free)",
    dashBtn: isTr ? "Web Panelinden Yönet" : "Manage via Dashboard",
    activeRoomTitle: isTr ? "🔊 Veyronix VoiceForge Kontrol Paneli" : "🔊 Veyronix VoiceForge Control Panel",
    activeStatus: isTr ? "Aktif Oda" : "Active Room",
    roomTitle: isTr ? "🎮 Commander's Room (2/5)" : "🎮 Commander's Room (2/5)",
    roomOwner: isTr ? "Oda sahibi" : "Room owner",
    roomBitrate: isTr ? "Bitrate" : "Bitrate",
    roomStatus: isTr ? "Durum" : "Status",
    roomStatusVal: isTr ? "Açık" : "Open",
    
    whyTitle: isTr ? "Neden Geçici Ses Kanalı Kullanmalısınız?" : "Why Use Dynamic Temporary Voice Channels?",
    whySubtitle: isTr ? "Geleneksel sabit odaların yarattığı dağınıklığı bitiren 4 büyük avantaj." : "4 powerful advantages that replace messy static voice channels.",
    
    benefit1Title: isTr ? "Sıfır Kanal Kirliliği" : "Zero Channel Clutter",
    benefit1Desc: isTr
      ? "Sunucunuzda onlarca boş oda yerine yalnızca 1 adet \"Oda Oluştur\" kanalı bulunur. Odalar sadece birisi girdiğinde açılır, boşaldığında saniyeler içinde silinir."
      : "Instead of dozens of empty rooms, only 1 master creator channel exists. Rooms are created on-demand and deleted automatically when empty.",
    
    benefit2Title: isTr ? "Kullanıcıya Tam Özel Alan" : "Full Privacy & Room Control",
    benefit2Desc: isTr
      ? "Üyeleriniz odayı tek tıkla kilitleyebilir, gizleyebilir veya arkadaş listesindekilere özel hale getirebilir. Yetkilileri meşgul etmeden kendi odalarını yönetirler."
      : "Members can lock, hide, or whitelist their room with a single click. Total squad control without troubling server administrators.",
    
    benefit3Title: isTr ? "Maksimum Ses Performansı" : "Maximum Audio Fidelity",
    benefit3Desc: isTr
      ? "Sunucunuzun boost seviyesine göre en yüksek ses kalitesi otomatik ayarlanır. FPS oyunları ve ZvZ taktikleri için kristal netliğinde ses iletimi sağlanır."
      : "Automatically optimizes bitrate based on your server boost level. Crystal-clear communication for competitive FPS matches and ZvZ calls.",
    
    benefit4Title: isTr ? "Otomatik Moderasyon & Güvenlik" : "Built-in Voice Moderation",
    benefit4Desc: isTr
      ? "Troll veya rahatsız edici kullanıcıları oda sahibi tek tıkla odadan atabilir (Kick) veya odaya girmesini kalıcı olarak engelleyebilir (Ban)."
      : "Room owners can instantly kick or ban disruptive users directly from the Discord buttons without needing staff permissions.",
    
    setupTitle: isTr ? "3 Adımda Geçici Ses Kanalı Kurulumu" : "Setup Dynamic Voice in 3 Simple Steps",
    step1Title: isTr ? "Veyronix Botunu Sunucunuza Davet Edin" : "Invite Veyronix to Your Server",
    step1Desc: isTr ? "Resmi davet linki üzerinden botu sunucunuza ekleyin ve gerekli kanal yönetimi izinlerini onaylayın." : "Add Veyronix via the official invite link and authorize channel management permissions.",
    step2Title: isTr ? "Web Panel veya Komut ile Modülü Açın" : "Enable VoiceForge in Web Dashboard or Command",
    step2Desc: isTr ? "Web kontrol panelinden Ses Yönetimi sekmesine girin veya Discord üzerinde /settings komutunu kullanarak ses kategorisini seçin." : "Open Voice Settings in the Web Dashboard or type /settings in Discord to configure your voice category.",
    step3Title: isTr ? "Kullanmaya Başlayın" : "Ready to Talk",
    step3Desc: isTr ? "Oluşturulan \"➕ Oda Oluştur\" kanalına tıklandığı anda geçici odalar ve 15 butonlu yönetim paneli otomatik olarak aktif olacaktır!" : "Click the generated \"➕ Create Room\" channel to instantly test your auto-generated private voice room!",
    
    faqTitle: isTr ? "Sıkça Sorulan Sorular" : "Frequently Asked Questions",
    faqSubtitle: isTr ? "Geçici ses kanalı sistemiyle ilgili merak edilenler" : "Common questions regarding the temporary voice system",
    faq1Q: isTr ? "Bot ses kanalını ne zaman otomatik siliyor?" : "When does the bot automatically delete the voice channel?",
    faq1A: isTr ? "Geçici ses kanalındaki tüm üyeler ayrıldığında ve oda tamamen boş kaldığında bot kanalı 3 saniye içinde otomatik olarak siler." : "As soon as the last member leaves and the room becomes empty, the bot deletes the channel within 3 seconds.",
    faq2Q: isTr ? "Oda sahibi sunucudan çıkarsa ne olur?" : "What happens if the room owner leaves the channel?",
    faq2A: isTr ? "Oda kurucusu odadan ayrıldığında, oda içindeki en aktif üyeye oda sahipliği ve kontrol paneli yetkileri otomatik olarak devredilir." : "If the creator leaves, ownership and control panel permissions are automatically transferred to the next active member.",
    faq3Q: isTr ? "Veyronix VoiceForge modülü kaç sunucuda destekleniyor?" : "How many servers can use Veyronix VoiceForge?",
    faq3A: isTr ? "Botumuz sharded mimarisi ve yüksek hızlı veritabanı altyapısı sayesinde sınırsız sayıda sunucu ve ses kanalını sıfır gecikmeyle yönetir." : "Our sharded infrastructure supports unlimited concurrent servers and channels with zero latency.",
    
    ctaTitle: isTr ? "Sunucunuzun Ses Kanallarını Bugün Otomatize Edin" : "Automate Your Server Voice Channels Today",
    ctaDesc: isTr ? "Hiçbir ücret ödemeden saniyeler içinde kurun, sunucunuza profesyonel bir oyuncu deneyimi kazandırın." : "Set up in seconds for free and provide your community with a studio-grade voice experience.",
    ctaBtn: isTr ? "Hemen Ücretsiz Discord'a Ekle" : "Add to Discord Free",
    
    breadcrumbHome: isTr ? "Ana Sayfa" : "Home",
    breadcrumbFeatures: isTr ? "Özellikler" : "Features",
    breadcrumbCurrent: isTr ? "Geçici Ses Kanalı (VoiceForge)" : "Temporary Voice Channels (VoiceForge)",
  };

  const panelButtons = [
    { icon: Lock, label: isTr ? "Odayı Kilitle" : "Lock Room", desc: isTr ? "Yabancıların girişini engeller" : "Prevents others from joining", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { icon: Unlock, label: isTr ? "Kilidi Aç" : "Unlock Room", desc: isTr ? "Odayı herkese tekrar açar" : "Allows everyone to join again", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { icon: EyeOff, label: isTr ? "Odayı Gizle" : "Hide Room", desc: isTr ? "Odayı görünmez yapar" : "Hides room from other members", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { icon: Users, label: isTr ? "Kişi Limiti" : "User Limit", desc: isTr ? "Maksimum kişi sınırını belirler" : "Caps maximum member capacity", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { icon: Settings, label: isTr ? "Oda İsmi" : "Rename Room", desc: isTr ? "Oda adını modal ile düzenler" : "Instantly renames the room", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
    { icon: Volume2, label: isTr ? "Bitrate Ayarı" : "Bitrate", desc: isTr ? "Ses kalitesini optimize eder" : "Optimizes audio bandwidth", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { icon: UserPlus, label: isTr ? "Oda Devret" : "Transfer", desc: isTr ? "Oda sahipliğini arkadaşa devreder" : "Transfers room ownership", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
    { icon: ShieldAlert, label: isTr ? "Odadan At / Ban" : "Kick / Ban", desc: isTr ? "Rahatsızlık verenleri uzaklaştırır" : "Moderates and bans trolls", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  ];

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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
          <Mic2 size={15} />
          <span>{t.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
          {t.title1} <span className="bg-gradient-to-r from-primary-container via-amber-300 to-primary-container bg-clip-text text-transparent">{t.titleHighlight}</span> {t.title2}
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

      {/* Feature Interactive Showcase Mockup */}
      <section className="mb-20">
        <div className="bg-surface-container-low/60 border border-outline-variant/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-on-surface-variant font-mono ml-2">{t.activeRoomTitle}</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">{t.activeStatus}</span>
          </div>

          <div className="mb-6 bg-[#0c121e] rounded-xl p-5 border border-primary-container/20">
            <div className="flex items-center gap-3 mb-2">
              <Mic2 className="text-primary-container" size={20} />
              <h3 className="font-bold text-base text-white">{t.roomTitle}</h3>
            </div>
            <p className="text-xs text-on-surface-variant">
              {t.roomOwner}: <span className="text-primary-container font-semibold">@Ahmet</span> • {t.roomBitrate}: <span className="text-emerald-400 font-semibold">128kbps</span> • {t.roomStatus}: <span className="text-blue-400 font-semibold">{t.roomStatusVal}</span>
            </p>
          </div>

          {/* 8 Featured Button Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {panelButtons.map((btn, idx) => {
              const Icon = btn.icon;
              return (
                <div key={idx} className={`p-4 rounded-xl border ${btn.color} transition-all hover:scale-[1.02] flex flex-col justify-between`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} />
                    <span className="font-bold text-xs text-white">{btn.label}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-light leading-snug">{btn.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Temp Voice? Benefits Grid */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">{t.whyTitle}</h2>
          <p className="text-sm text-on-surface-variant max-w-xl mx-auto">{t.whySubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1.5">{t.benefit1Title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.benefit1Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1.5">{t.benefit2Title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.benefit2Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1.5">{t.benefit3Title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.benefit3Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1.5">{t.benefit4Title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.benefit4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Guide */}
      <section className="mb-20 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Terminal className="text-primary-container" size={22} />
          <span>{t.setupTitle}</span>
        </h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-container text-black font-extrabold flex items-center justify-center shrink-0">1</div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">{t.step1Title}</h3>
              <p className="text-xs text-on-surface-variant">
                {t.step1Desc}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-container text-black font-extrabold flex items-center justify-center shrink-0">2</div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">{t.step2Title}</h3>
              <p className="text-xs text-on-surface-variant">
                {t.step2Desc}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-container text-black font-extrabold flex items-center justify-center shrink-0">3</div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">{t.step3Title}</h3>
              <p className="text-xs text-on-surface-variant">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="text-primary-container" size={24} />
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

          <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <h3 className="font-bold text-white text-sm mb-2">{t.faq3Q}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t.faq3A}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-primary-container/10 via-surface-container to-surface-container-lowest border border-primary-container/30">
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
