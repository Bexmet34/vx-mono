import Link from "next/link";
import { LINKS } from "@veyronix/config";
import { UserCheck, ShieldCheck, Tag, FileEdit, Users, Zap, CheckCircle2, ChevronRight, HelpCircle, Terminal, ArrowRight, Sparkles, UserX } from "lucide-react";

export const metadata = {
  title: "Discord Kayıt Botu & Butonlu Kayıt Sistemi – Otomatik Rol ve İsim Düzenleme",
  description: "Discord sunucunuz için en gelişmiş butonlu kayıt ve otomatik rol botu: Modal form ile İsim/Yaş/IGN girişi, lonca doğrulaması, kayıtsız belirleme ve otomatik rol atama. Ücretsiz kurun!",
  keywords: [
    "Discord kayıt botu",
    "Discord butonlu kayıt sistemi",
    "Discord otomatik rol botu",
    "Discord modal kayıt",
    "Discord isim yaş kayıt botu",
    "Discord oyuncu kayıt botu",
    "Discord sunucu kayıt sistemi",
    "Discord kayıtsız belirleme botu",
    "Discord verification bot",
    "Discord auto role bot"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
  },
  openGraph: {
    title: "Discord Kayıt Botu & Butonlu Kayıt Sistemi – Veyronix",
    description: "Sunucunuza katılan üyeleri modal formlu butonla saniyeler içinde kaydedin. Otomatik rol atama, lonca kontrolü ve 32 karakter uyumlu takma ad düzenleme.",
    url: `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Discord Kayıt Botu - Veyronix Registration" }],
  }
};

export default function RegistrationFeaturePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix Discord Kayıt & Otomatik Rol Botu",
        "operatingSystem": "Discord",
        "applicationCategory": "UtilitiesApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
        "description": "Discord sunucuları için butonlu modal kayıt, isim/yaş düzenleme, oyun içi nick doğrulaması ve otomatik rol botu.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Butonlu Modal Kayıt Formu (İsim, Yaş, Nick / IGN)",
          "Otomatik Takma Ad & Tag Formatlama ([TAG] Nick)",
          "Anlık Rol Verme & Kayıtsız Rolünü Temizleme",
          "Kayıtsızları Otomatik Belirleme ve Rol Sıfırlama",
          "Albion Online Lonca ve Oyuncu API Doğrulaması",
          "Ekran Görüntüsü / Screenshot Onay Sistemi"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Kayıt Sistemi", "item": `${LINKS.WEBSITE}/ozellikler/kayit-sistemi` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Discord Butonlu Kayıt Sistemi Nasıl Çalışır?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yönetici /setup-registration komutu ile kayıt kanalına şık bir kayıt paneli gönderir. Yeni katılan üyeler 'Kayıt Ol' butonuna basarak açılan modal pencerede bilgilerini girer. Bot anında isimlerini formatlar, kayıtsız rolünü alıp üye/lonca rolünü verir."
            }
          },
          {
            "@type": "Question",
            "name": "Otomatik Takma Ad (Nickname) Nasıl Düzenlenir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Veyronix, kullanıcının girdiği Gerçek İsim, Yaş veya Oyun İçi Nickini sunucunuzun belirlediği şablona göre (Örn: [TAG] Nick (İsim | Yaş)) Discord'un 32 karakter sınırına otomatik uyarlayarak düzenler."
            }
          },
          {
            "@type": "Question",
            "name": "Kayıtsızları Belirleme Komutu (/kayitsizlari-belirle) Ne Yapar?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sunucudaki henüz kayıt olmamış tüm üyelerin rollerini temizler, isimlerini '[Kayıt Bekliyor]' formatına çevirir ve seçtiğiniz kayıtsız rolünü tek tıkla toplu olarak atar."
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
          <span className="text-primary-container font-semibold">Kayıt Sistemi & Otomatik Rol</span>
        </nav>

        {/* Hero Section */}
        <section className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <UserCheck size={15} />
            <span>Kayıt Motoru • Otomatik Doğrulama</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
            Gelişmiş Discord <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Kayıt Botu</span> & Otomatik Rol
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto font-light leading-relaxed mb-8">
            Yetkililerin tek tek isim değiştirip rol verme zahmetine son! <strong>Butonlu modal kayıt formu</strong>, otomatik takma ad düzenleme, oyun içi lonca doğrulaması ve toplu kayıtsız yönetimi tek bir sistemde.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={LINKS.BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)] flex items-center gap-2"
            >
              <span>Botu Ücretsiz Ekle</span>
              <ArrowRight size={16} />
            </a>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface hover:border-primary-container/50 hover:bg-primary-container/10 transition-all font-semibold text-sm flex items-center gap-2"
            >
              <Sparkles size={16} className="text-primary-container" />
              <span>Kayıt Şablonunu Ayarla</span>
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
                  <span className="font-bold text-sm text-white">Sunucu Kayıt Formu</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Modal v2</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Oyun İçi İsim (IGN) *</label>
                  <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-white font-mono">
                    Bexmet
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Gerçek İsim & Yaş</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-white font-mono">Hakkı</div>
                    <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-white font-mono">24</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Lonca / Guild Durumu</label>
                  <div className="bg-[#1a2333] border border-outline-variant/40 rounded-lg p-2.5 text-xs text-emerald-400 font-mono">
                    ✓ Veyronix Guild (Otomatik Doğrulandı)
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={15} /> Kaydı Tamamla
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
                  <h3 className="font-bold text-white text-base mb-1">Otomatik Takma Ad & Tag Düzenleme</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Üyenin girdiği bilgiler anında <code>[TAG] Nick | İsim</code> veya sunucunuzun istediği formata dönüştürülür. 32 karakter sınırına akıllıca uyar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Otomatik Rol & Yetki Senkronizasyonu</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Kayıt tamamlandığında "Kayıtsız" rolü otomatik alınır, seçtiğiniz "Üye", "Oyuncu" veya lonca rolleri anında atanır.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                  <UserX size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">Toplu Kayıtsızları Belirleme</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    <code>/kayitsizlari-belirle</code> komutuyla sunucudaki tüm kayıtsız üyelerin rollerini sıfırlayıp isimlerini <code>[Kayıt Bekliyor]</code> yapabilirsiniz.
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
            <span>Kayıt Sistemi Slash Komutları</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">/setup-registration</div>
              <p className="text-xs text-on-surface-variant">Kayıt kanalına butonlu sabit kayıt mesajını gönderir ve sistemi başlatır.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">/kayitsizlari-belirle [rol]</div>
              <p className="text-xs text-on-surface-variant">Kayıtsız üyelerin tüm rollerini siler ve seçilen kayıtsız rolünü topluca verir.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">/rd [kullanıcı] [rol] [ign] [isim] [yas]</div>
              <p className="text-xs text-on-surface-variant">Kayıtlı bir kullanıcının rolünü, ismini ve yaşını anında tek komutla düzenler.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/20">
              <div className="text-xs font-mono font-bold text-emerald-400 mb-1">/reg-close [kullanıcı]</div>
              <p className="text-xs text-on-surface-variant">Devam eden kayıt oturumunu ve özel kanalını manuel olarak sonlandırır.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="text-emerald-400" size={24} />
              <span>Kayıt Sistemi Hakkında SSS</span>
            </h2>
            <p className="text-xs text-on-surface-variant">Kayıt botu kurulumuyla ilgili en çok sorulan sorular</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
              <h3 className="font-bold text-white text-sm mb-2">Bot isim değiştirme ve rol verme yetkisine nasıl sahip olur?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Discord sunucu ayarlarında Veyronix rolünü üyelere vereceğiniz rollerin en üstüne taşımanız ve "Kullanıcı Adlarını Yönet" ile "Rolleri Yönet" yetkilerini vermeniz yeterlidir.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container/50 border border-outline-variant/20">
              <h3 className="font-bold text-white text-sm mb-2">Oyun içi lonca doğrulaması nasıl çalışır?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Veyronix, Albion Online resmi API bağlantısı ile oyuncunun yazdığı nickin loncada olup olmadığını anlık kontrol eder. Gerçek üyeyse lonca rolünü otomatik tanımlar.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-surface-container to-surface-container-lowest border border-emerald-500/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Sunucunuza Butonlu Kayıt Sistemini Hemen Kurun</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6">
            Gelen her yeni üyenin otomatik olarak doğrulanmasını sağlayın, sunucu güvenliğinizi en üst düzeye çıkarın.
          </p>
          <a
            href={LINKS.BOT_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <span>Botu Ücretsiz Discord'a Ekle</span>
            <ArrowRight size={16} />
          </a>
        </section>

      </main>
    </>
  );
}
