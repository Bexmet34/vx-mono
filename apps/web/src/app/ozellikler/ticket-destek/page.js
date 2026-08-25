import Link from "next/link";
import { LINKS } from "@veyronix/config";
import { MessageSquare, ShieldCheck, FileCheck, CheckCircle2, ChevronRight, HelpCircle, Terminal, ArrowRight, Sparkles, Lock, Headphones } from "lucide-react";

export const metadata = {
  title: "Discord Ticket & Destek Botu – Butonlu Bilet ve Lonca Başvuru Sistemi",
  description: "Discord sunucunuz için gelişmiş butonlu ticket ve başvuru botu: Özel bilet kanalları, yetkili rolleri, lonca başvuru formları, transkript loglama ve otomatik bilet kapatma. Ücretsiz kurun!",
  keywords: [
    "Discord ticket botu",
    "Discord destek sistemi botu",
    "Discord butonlu ticket",
    "Discord başvuru botu",
    "Discord lonca başvuru sistemi",
    "Discord özel destek kanalı",
    "Discord bilet sistemi botu"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
  },
  openGraph: {
    title: "Discord Ticket & Destek Botu – Veyronix",
    description: "Sunucunuza butonlu modern bilet ve lonca başvuru sistemi ekleyin. Güvenli, hızlı ve tamamen ücretsiz.",
    url: `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Discord Ticket Botu - Veyronix Support" }],
  }
};

export default function TicketSupportPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix Discord Ticket & Destek Sistemi",
        "operatingSystem": "Discord",
        "applicationCategory": "UtilitiesApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
        "description": "Discord sunucuları için butonlu ticket, lonca başvurusu, özel kanal yönetimi ve destek loglama botu.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Butonlu Sabit Ticket & Başvuru Mesajı",
          "Kullanıcıya Özel Gizli Destek Odası Açma",
          "Yetkili Rolleri ve Departman Atama",
          "Bilet Kapatma, Kilitleme ve Transkript Alma"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Ticket & Destek", "item": `${LINKS.WEBSITE}/ozellikler/ticket-destek` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Discord Butonlu Ticket Sistemi Nasıl Kurulur?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Veyronix botunu sunucunuza ekledikten sonra web panelinden veya Discord üzerindeki ayar menüsünden Ticket kategorisini ve yetkili rollerini seçerek bilet sistemini saniyeler içinde başlatabilirsiniz."
            }
          },
          {
            "@type": "Question",
            "name": "Açılan Biletleri Kimler Görebilir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oluşturulan bilet kanalı tamamen gizlidir; kanalı yalnızca bileti açan kullanıcı ve belirlediğiniz destek/yetkili rolüne sahip kişiler görebilir."
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
          <span className="text-primary-container font-semibold">Ticket & Destek Sistemi</span>
        </nav>

        {/* Hero */}
        <section className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Headphones size={15} />
            <span>Destek & Başvuru Motoru</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
            Discord <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-violet-400 bg-clip-text text-transparent">Ticket & Destek</span> Botu
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Üyelerinizin soru, şikayet ve lonca başvurularını karmaşa olmadan yönetin. Butonlu tek tıkla bilet açma, yetkili bildirimleri ve güvenli transkript kaydı.
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
              <span>Web Panelden Yapılandır</span>
            </Link>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Butonlu Tek Tık Bilet</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Üyeler tek komut yazmadan butona basarak özel destek kanalı açar. Yetkililere anında bildirim düşer.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <FileCheck size={20} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Lonca Başvuru Formları</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Oyun içi loncanıza yeni üye alımlarında oyuncunun item seti, PvP tecrübesi ve mikrofon durumu gibi bilgileri formla toplayın.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Lock size={20} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">%100 Gizlilik & Güvenlik</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Her bilet kanalının izinleri izole edilir. Yalnızca bilet sahibi ve atanmış yetkili rolü yazışmaları görebilir.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-violet-500/10 via-surface-container to-surface-container-lowest border border-violet-500/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Topluluk Destek Yönetiminizi Hemen Profesyonelleştirin</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
            Ayrı bir ticket botuna ihtiyaç duymadan, Veyronix'in hepsi bir arada altyapısıyla destek kanallarınızı yönetin.
          </p>
          <a
            href={LINKS.BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            <span>Botu Ücretsiz Discord'a Ekle</span>
            <ArrowRight size={16} />
          </a>
        </section>

      </main>
    </>
  );
}
