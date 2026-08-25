import Link from "next/link";
import { LINKS } from "@veyronix/config";
import { Mic2, Lock, Unlock, EyeOff, Users, Settings, Volume2, UserPlus, ShieldAlert, Sparkles, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Terminal } from "lucide-react";

export const metadata = {
  title: "Discord Geçici Ses Kanalı Botu (VoiceForge) – Otomatik Dinamik Oda & Kilitleme",
  description: "Discord sunucunuz için gelişmiş geçici ses kanalı botu: Join to create (Oda Oluştur), 15 butonlu interaktif yönetim paneli, oda kilitleme, kişi limiti, gizli oda ve bitrate kontrolü. Ücretsiz ekleyin!",
  keywords: [
    "Discord geçici ses kanalı botu",
    "Discord geçici oda botu",
    "Discord dinamik ses kanalı",
    "Discord join to create bot",
    "Discord ses kanalı kilitleme botu",
    "Discord VoiceForge",
    "Discord geçici ses odası açma",
    "Discord özel ses kanalı botu",
    "Discord ses odası yönetim botu"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
  },
  openGraph: {
    title: "Discord Geçici Ses Kanalı Botu (VoiceForge) – Veyronix",
    description: "Sunucunuzdaki kanal kirliliğine son verin! Join-to-Create geçici ses odaları, oda kilitleme, kişi limiti ve 15 butonlu özel panel.",
    url: `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Discord Geçici Ses Kanalı Botu - Veyronix VoiceForge" }],
  }
};

export default function TempVoicePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix VoiceForge - Discord Geçici Ses Kanalı Botu",
        "operatingSystem": "Discord",
        "applicationCategory": "UtilitiesApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
        "description": "Discord sunucuları için dinamik geçici ses odası (Join-to-Create), oda kilitleme, limit ve ses paneli botu.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Join to Create (Tek tıkla otomatik oda açma)",
          "15 Butonlu İnteraktif Discord Yönetim Paneli",
          "Oda Kilitleme & Gizleme (Privacy Shield)",
          "Anlık Kullanıcı Limiti Ayarlama (1-99 Kişi)",
          "Oda İsim Değiştirme ve Bitrate Kontrolü",
          "Oda Sahibi Devretme ve Kullanıcı Kick/Ban"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Geçici Ses Kanalı", "item": `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Discord Geçici Ses Kanalı (Join to Create) Nedir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Geçici ses kanalı, sunucunuzda tek bir ana oda üzerinden çalışan dinamik bir sistemdir. Bir üye ana odaya katıldığında bot anında o üyeye özel geçici bir ses kanalı açar. Odadaki son kişi çıktığında kanal otomatik silinir, böylece sunucunuzda kanal kirliliği oluşmaz."
            }
          },
          {
            "@type": "Question",
            "name": "Oda Sahibi Odayı Nasıl Yönetir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oda oluşturan kullanıcıya özel 15 butonlu interaktif bir kontrol paneli sunulur. Bu panelden tek tıkla oda kilitlenebilir, gizlenebilir, isim veya kişi limiti değiştirilebilir ve istenmeyen kişiler odadan atılabilir."
            }
          },
          {
            "@type": "Question",
            "name": "Veyronix Geçici Ses Kanalı Modülü Ücretsiz mi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Evet! Veyronix botunu sunucunuza ekleyerek geçici ses kanalı sistemini tamamen ücretsiz olarak kullanmaya başlayabilirsiniz."
            }
          }
        ]
      }
    ]
  };

  const panelButtons = [
    { icon: Lock, label: "Odayı Kilitle", desc: "Odaya yabancıların girişini engeller", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { icon: Unlock, label: "Kilidi Aç", desc: "Odayı herkese tekrar açık hale getirir", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { icon: EyeOff, label: "Odayı Gizle", desc: "Odayı diğer üyelere tamamen görünmez yapar", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { icon: Users, label: "Kişi Limiti", desc: "Odaya girebilecek maksimum kişi sayısını belirler", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { icon: Settings, label: "Oda İsmi", desc: "Oda adını anlık olarak modal üzerinden düzenler", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
    { icon: Volume2, label: "Bitrate Ayarı", desc: "Oyun ve müzik için ses kalitesini optimize eder", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    { icon: UserPlus, label: "Oda Devret", desc: "Oda sahipliğini odadaki başka bir arkadaşa devreder", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
    { icon: ShieldAlert, label: "Odadan At / Yasakla", desc: "Rahatsızlık veren kullanıcıları odadan uzaklaştırır", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  ];

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
          <span className="text-primary-container font-semibold">Geçici Ses Kanalı (VoiceForge)</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
            <Mic2 size={15} />
            <span>VoiceForge 2.0 • Dinamik Ses Sistemi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
            Discord <span className="bg-gradient-to-r from-primary-container via-amber-300 to-primary-container bg-clip-text text-transparent">Geçici Ses Kanalı</span> Botu
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Sunucunuzdaki 30+ boş kanal kirliliğine son verin! Üyeleriniz <strong>"➕ Oda Oluştur"</strong> kanalına katıldığında anında onlara özel geçici ses odası açılır. 15 butonlu interaktif panelden tam gizlilik ve oda kontrolü sağlanır.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={LINKS.BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)] flex items-center gap-2"
            >
              <span>Botu Sunucuna Ekle (Ücretsiz)</span>
              <ArrowRight size={16} />
            </a>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary-container/50 hover:bg-primary-container/10 transition-all font-semibold text-sm flex items-center gap-2"
            >
              <Sparkles size={16} className="text-primary-container" />
              <span>Web Panelinden Yönet</span>
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
                <span className="text-xs text-on-surface-variant font-mono ml-2">🔊 Veyronix VoiceForge Kontrol Paneli</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">Aktif Oda</span>
            </div>

            <div className="mb-6 bg-[#0c121e] rounded-xl p-5 border border-primary-container/20">
              <div className="flex items-center gap-3 mb-2">
                <Mic2 className="text-primary-container" size={20} />
                <h3 className="font-bold text-base text-white">🎮 Commander's Room (2/5)</h3>
              </div>
              <p className="text-xs text-on-surface-variant">
                Oda sahibi: <span className="text-primary-container font-semibold">@Ahmet</span> • Bitrate: <span className="text-emerald-400 font-semibold">128kbps</span> • Durum: <span className="text-blue-400 font-semibold">Açık</span>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">Neden Geçici Ses Kanalı Kullanmalısınız?</h2>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto">Geleneksel sabit odaların yarattığı dağınıklığı bitiren 4 büyük avantaj.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1.5">Sıfır Kanal Kirliliği</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Sunucunuzda onlarca boş oda yerine yalnızca 1 adet "Oda Oluştur" kanalı bulunur. Odalar sadece birisi girdiğinde açılır, boşaldığında saniyeler içinde silinir.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1.5">Kullanıcıya Tam Özel Alan</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Üyeleriniz odayı tek tıkla kilitleyebilir, gizleyebilir veya arkadaş listesindekilere özel hale getirebilir. Yetkilileri meşgul etmeden kendi odalarını yönetirler.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1.5">Maksimum Ses Performansı</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Sunucunuzun boost seviyesine göre en yüksek ses kalitesi otomatik ayarlanır. FPS oyunları ve ZvZ taktikleri için kristal netliğinde ses iletimi sağlanır.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container/40 border border-outline-variant/20 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1.5">Otomatik Moderasyon & Güvenlik</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Troll veya rahatsız edici kullanıcıları oda sahibi tek tıkla odadan atabilir (Kick) veya odaya girmesini kalıcı olarak engelleyebilir (Ban).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Setup Guide */}
        <section className="mb-20 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Terminal className="text-primary-container" size={22} />
            <span>3 Adımda Geçici Ses Kanalı Kurulumu</span>
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Veyronix Botunu Sunucunuza Davet Edin</h3>
                <p className="text-xs text-on-surface-variant">
                  <a href={LINKS.BOT_INVITE} target="_blank" rel="noopener noreferrer" className="text-primary-container underline font-semibold">Resmi Davet Linki</a> üzerinden botu sunucunuza ekleyin ve gerekli kanal yönetimi izinlerini onaylayın.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Web Panel veya Komut ile Modülü Açın</h3>
                <p className="text-xs text-on-surface-variant">
                  Web kontrol panelinden <strong>Ses Yönetimi</strong> sekmesine girin veya Discord üzerinde <code>/settings</code> komutunu kullanarak geçici ses kategorisini seçin.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Kullanmaya Başlayın</h3>
                <p className="text-xs text-on-surface-variant">
                  Oluşturulan <strong>"➕ Oda Oluştur"</strong> kanalına tıklandığı anda geçici odalar ve 15 butonlu yönetim paneli otomatik olarak aktif olacaktır!
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
              <span>Sıkça Sorulan Sorular</span>
            </h2>
            <p className="text-xs text-on-surface-variant">Geçici ses kanalı sistemiyle ilgili merak edilenler</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
              <h3 className="font-bold text-white text-sm mb-2">Bot ses kanalını ne zaman otomatik siliyor?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Geçici ses kanalındaki tüm üyeler ayrıldığında ve oda tamamen boş kaldığında bot kanalı 3 saniye içinde otomatik olarak siler.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
              <h3 className="font-bold text-white text-sm mb-2">Oda sahibi sunucudan çıkarsa ne olur?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Oda kurucusu odadan ayrıldığında, oda içindeki en kıdemli veya aktif üyeye oda sahipliği ve kontrol yetkileri otomatik olarak devredilir.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
              <h3 className="font-bold text-white text-sm mb-2">Veyronix TempVoice modülü kaç sunucuda destekleniyor?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Botumuz sharded mimarisi ve yüksek hızlı veritabanı altyapısı sayesinde sınırsız sayıda sunucu ve ses kanalını sıfır gecikmeyle yönetir.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-primary-container/10 via-surface-container to-surface-container-lowest border border-primary-container/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Sunucunuzun Ses Kanallarını Bugün Otomatize Edin</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
            Hiçbir ücret ödemeden saniyeler içinde kurun, sunucunuza profesyonel bir oyuncu deneyimi kazandırın.
          </p>
          <a
            href={LINKS.BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            <span>Hemen Ücretsiz Discord'a Ekle</span>
            <ArrowRight size={16} />
          </a>
        </section>

      </main>
    </>
  );
}
