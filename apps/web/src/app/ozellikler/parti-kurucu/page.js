import Link from "next/link";
import { LINKS } from "@veyronix/config";
import { Swords, Shield, Heart, Zap, Crosshair, Users, ArrowRight, Sparkles, CheckCircle2, ChevronRight, HelpCircle, Terminal, FileCode } from "lucide-react";

export const metadata = {
  title: "Albion Online Parti Kurucu (Party Finder) & ZvZ Botu – Veyronix",
  description: "Albion Online loncaları için #1 Discord parti kurucu botu: Dinamik Tank/Healer/DPS/Support kompozisyonları, butonlu anlık katılım, web panel şablonları ve yedek sistemi. Ücretsiz deneyin!",
  keywords: [
    "Albion Online Parti Kurucu",
    "Albion Online Party Finder",
    "Albion Online ZvZ Botu",
    "Albion Online ZvZ Builder",
    "Albion Online parti şablonu",
    "Albion Online Discord parti botu",
    "Albion Online PvE parti kurma",
    "Albion Online Static Dungeon botu"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
  },
  openGraph: {
    title: "Albion Online Parti Kurucu & ZvZ Botu – Veyronix",
    description: "Discord üzerinden tek tıkla ZvZ, Roaming, Gank ve PvE partileri kurun. Butonlu rol seçimi ve anlık katılım takibi.",
    url: `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Albion Online Parti Kurucu - Veyronix" }],
  }
};

export default function PartyFinderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix Albion Online Parti Kurucu & ZvZ Sistemi",
        "operatingSystem": "Discord, Web",
        "applicationCategory": "GameApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
        "description": "Albion Online loncaları için ZvZ ve PvE parti kurma, butonlu rol seçimi ve kompozisyon yönetim botu.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Dinamik Tank, Healer, DPS ve Support Rol Şablonları",
          "Discord Butonları ile Tek Tıkla Katılma / Ayrılma",
          "Web Dashboard Üzerinden Özel Parti Şablonu Oluşturma",
          "Yedek (Bench) Oyuncu ve Bekleme Listesi",
          "Otomatik Parti Kapatma ve Süre Yönetimi"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Parti Kurucu", "item": `${LINKS.WEBSITE}/ozellikler/parti-kurucu` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Discord'da Albion Online Partisi Nasıl Kurulur?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Discord sunucunuzda /createparty komutunu yazabilir veya /temp komutuyla web panelinizde önceden kaydettiğiniz ZvZ / PvE şablonunu seçerek saniyeler içinde parti duyurusu oluşturabilirsiniz."
            }
          },
          {
            "@type": "Question",
            "name": "Üyeler Rollere Nasıl Kayıt Olur?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Parti mesajının altındaki Tank, Healer, DPS, Support veya Yedek butonlarına tıklayan üyeler ilgili role anında atanır. Kontenjan dolduğunda bot otomatik olarak yeni katılımları yedek sırasına alır."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary-container transition-colors">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link href="/#features" className="hover:text-primary-container transition-colors">Özellikler</Link>
          <ChevronRight size={12} />
          <span className="text-primary-container font-semibold">Parti Kurucu & ZvZ Builder</span>
        </nav>

        {/* Hero */}
        <section className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Swords size={15} />
            <span>ZvZ & PvE Kompozisyon Motoru</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
            Albion Online <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">Parti Kurucu</span> Botu
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Lonca liderleri ve parti yöneticileri için geliştirilmiş en hızlı ZvZ parti kurucu. Tank, Healer, Ranged DPS ve Destek rollerini belirleyin, üyeler tek tıkla butondan katılsın.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={LINKS.BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)] flex items-center gap-2"
            >
              <span>Botu Sunucuna Ekle</span>
              <ArrowRight size={16} />
            </a>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary-container/50 hover:bg-primary-container/10 transition-all font-semibold text-sm flex items-center gap-2"
            >
              <Sparkles size={16} className="text-primary-container" />
              <span>Şablonları Web Panelden Oluştur</span>
            </Link>
          </div>
        </section>

        {/* Party Composition Mockup */}
        <section className="mb-20">
          <div className="bg-[#0b1322] border border-blue-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">🗡️ ZvZ Castle Fight (20v20)</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Etkinlik Saati: 18:00 UTC • Lider: @CallerBexmet</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">18/20 Dolu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-2">
                  <Shield size={16} /> 🛡️ Main Tank (2/2)
                </div>
                <div className="text-xs text-gray-300 space-y-1 font-mono">
                  <div>1. @Arthur (Grailseeker)</div>
                  <div>2. @Lancelot (Heavy Mace)</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                  <Heart size={16} /> 💚 Healer (4/4)
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
                  <Zap size={16} /> ⚔️ Ranged DPS (8/8)
                </div>
                <div className="text-xs text-gray-300 space-y-1 font-mono">
                  <div>1. @PermaFrost</div>
                  <div>2. @Mistpiercer</div>
                  <div>3. @Spirithunter</div>
                  <div>4. +5 Oyuncu Daha</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-2">
                  <Crosshair size={16} /> 🔮 Support & Enigmatic (4/4)
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
              <span className="text-xs text-on-surface-variant self-center mr-2 font-semibold">Butonlar:</span>
              <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5">
                <Shield size={14} /> Tank Ol
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <Heart size={14} /> Healer Ol
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5">
                <Zap size={14} /> DPS Ol
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs font-bold flex items-center gap-1.5">
                <Users size={14} /> Yedek Ol
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                Ayrıl
              </button>
            </div>
          </div>
        </section>

        {/* Commands */}
        <section className="mb-20 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Terminal className="text-blue-400" size={22} />
            <span>Parti Komutları</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-blue-400 mb-1">/createparty</div>
              <p className="text-xs text-on-surface-variant">Sıfırdan özel parti adı, rol sayıları ve etkinlik saati belirleyerek parti kurar.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-blue-400 mb-1">/temp [şablon]</div>
              <p className="text-xs text-on-surface-variant">Web panelde kaydettiğiniz hazır kompozisyon şablonunu tek tıkla Discord'a gönderir.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-blue-400 mb-1">/closeparty</div>
              <p className="text-xs text-on-surface-variant">Aktif partinizi manuel olarak kapatır ve katılım özetini kilitler.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-blue-400 mb-1">/mytemps</div>
              <p className="text-xs text-on-surface-variant">Kayıtlı bireysel ve lonca şablonlarınızı yönetmenizi sağlar.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-blue-500/10 via-surface-container to-surface-container-lowest border border-blue-500/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Loncanızın ZvZ Organizasyonunu Güçlendirin</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
            Parti toplamayı saniyelere indirin, lonca savaşlarında bir adım önde olun.
          </p>
          <a
            href={LINKS.BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            <span>Hemen Botu Ekle</span>
            <ArrowRight size={16} />
          </a>
        </section>

      </main>
    </>
  );
}
