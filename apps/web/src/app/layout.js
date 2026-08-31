import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { PublicConfigProvider } from "@/context/PublicConfigContext";
import { cookies } from "next/headers";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SystemStatusWidget from "@/components/SystemStatusWidget";
import ScrollToTop from "@/components/ScrollToTop";
import { Sora } from "next/font/google";

import Script from "next/script";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LINKS } from "@veyronix/config";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export const metadata = {
  metadataBase: new URL(LINKS.WEBSITE),
  title: {
    default: "Veyronix – Discord Kayıt, Geçici Ses Kanalı & Albion Online Botu",
    template: "%s | Veyronix Discord Bot",
  },
  description: "Discord sunucunuzu tek bir güçlü botla yönetin: 15 butonlu geçici ses kanalları (VoiceForge), butonlu kayıt & otomatik rol, Albion Online ZvZ parti kurucu, canlı Killboard ve Türkçe/İngilizce web panel desteği!",
  keywords: [
    "Discord Kayıt Botu",
    "Discord Geçici Ses Kanalı",
    "Discord Geçici Oda Botu",
    "Discord Butonlu Kayıt",
    "Discord Otomatik Rol Botu",
    "Discord Ses Kanalı Açma Botu",
    "Discord Join to Create",
    "Discord VoiceForge",
    "Discord Ticket Botu",
    "Discord Destek Sistemi",
    "Discord Çekiliş Drop Botu",
    "Discord Sunucu Otomasyonu",
    "Albion Online Discord Bot",
    "Albion Online Bot",
    "Albion Online Killboard Bot",
    "Albion Online Party Finder",
    "Albion Online ZvZ Builder",
    "Albion ZvZ Party Maker",
    "Albion Online Guild Management",
    "Albion Discord Botu",
    "Albion Online Türkçe Bot",
    "Albion Online Otomatik Rol",
    "Albion Online Discord Kayıt",
    "Albion Online Player Tracker",
    "Albion Online PvP Stats Bot",
    "Veyronix Discord Bot",
    "Veyronix Albion Bot"
  ].join(", "),
  authors: [{ name: "Veyronix Team", url: LINKS.WEBSITE }],
  creator: "Veyronix",
  publisher: "Veyronix",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(LINKS.WEBSITE),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/icon.svg",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Veyronix",
  },
  openGraph: {
    title: "Veyronix – Discord Automation, VoiceForge & Community Platform",
    description: "Empower your Discord server with all-in-one automation: 15-button temporary voice channels (VoiceForge), modal registration & auto-roles, Albion Online ZvZ party finder, live Killboard & web dashboard!",
    url: LINKS.WEBSITE,
    siteName: "Veyronix",
    images: [
      {
        url: LINKS.OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Veyronix - Discord Automation & Community Management Platform",
      },
    ],
    locale: "en_US",
    alternateLocale: ["tr_TR"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyronix – Discord Automation, VoiceForge & Community Platform",
    description: "Empower your Discord server with all-in-one automation: 15-button temporary voice channels (VoiceForge), modal registration & auto-roles, ZvZ party finder, live Killboard & web dashboard!",
    images: [LINKS.OG_IMAGE_URL],
  },
  other: {
    cryptomus: "7e16ba27",
    "google-adsense-account": "ca-pub-1315540294941790",
  },
  verification: {
    google: "Sb34R-Xts1_g6mT_DiZvpXlRVD75T_uc-G2qp505mMQ",
  },
};

export default async function RootLayout({ children }) {
  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Veyronix - All-In-One Discord Bot & Albion Online Platform',
    operatingSystem: 'Discord, Web, iOS, Android',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Discord Bot',
    url: LINKS.WEBSITE,
    description: 'Discord sunucuları için hepsi bir arada otomasyon: Dinamik geçici ses kanalları (VoiceForge), butonlu kayıt ve otomatik rol, Albion Online ZvZ parti kurucu, Killboard takibi ve web paneli.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '154',
    },
    featureList: [
      'Dinamik Geçici Ses Kanalları & VoiceForge (Join to Create, Oda Kilitleme, Kişi Limiti)',
      'Butonlu Modal Discord Kayıt Sistemi & Otomatik Rol / İsim Formatlama',
      'Albion Online ZvZ & PvE Parti Kurucu (Party Finder)',
      'Otomatik Canlı Killboard Takibi & Günlük Grafik Raporlama',
      'Butonlu Ticket & Lonca Başvuru Sistemi',
      'Çekiliş & Drop Puanı Topluluk Etkinlik Motoru',
      'Türkçe ve İngilizce Destekli Web Kontrol Paneli'
    ]
  };

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Veyronix',
    url: LINKS.WEBSITE,
    logo: LINKS.OG_IMAGE_URL,
    sameAs: [
      LINKS.SUPPORT_SERVER,
      'https://top.gg/bot/1082239904169336902'
    ]
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Veyronix Discord Botu Nasıl Kurulur ve Eklenir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Veyronix botunu Discord sunucunuza davet etmek için "Discord\'a Ekle" butonuna tıklayın. Yönetici yetkisine sahip olduğunuz sunucuyu seçerek saniyeler içinde tamamen ücretsiz kurulum yapabilirsiniz.'
        }
      },
      {
        '@type': 'Question',
        name: 'Discord Geçici Ses Kanalı (VoiceForge) Sistemi Nasıl Çalışır?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Üyeler tek bir "Oda Oluştur" ana kanalına katıldıklarında bot anında onlara özel bir geçici ses odası açar ve üyeyi oraya taşır. Oda sahibi 15 butonlu interaktif panelden odayı kilitleyebilir, isim değiştirebilir, kişi limiti koyabilir veya odayı gizleyebilir. Oda boşaldığında otomatik olarak silinir.'
        }
      },
      {
        '@type': 'Question',
        name: 'Discord Butonlu Kayıt ve Otomatik Rol Sistemi Nedir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sunucunuza yeni katılan üyeler /setup-registration komutuyla oluşturulan butona tıklar ve açılan formda bilgilerini (İsim, Yaş, Oyun İçi Nick veya Lonca) girer. Bot anında kurallara uygun rolü verir, takma adı otomatik düzenler ve kayıtsız rolünü temizler.'
        }
      },
      {
        '@type': 'Question',
        name: 'Albion Online Killboard ve ZvZ Parti Kurucu Özellikleri Nelerdir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Veyronix, resmi Albion Online API\'si ile loncanızın anlık Kill/Death/Fame istatistiklerini kanala görsel olarak aktarır. Ayrıca Tank, Healer, DPS ve Destek rollerinden oluşan ZvZ parti kompozisyonlarını tek tıkla kurup yönetmenizi sağlar.'
        }
      }
    ]
  };

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "tr";

  return (
    <html lang={lang} className={`dark ${sora.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RZJEDGLGQY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RZJEDGLGQY');
          `}
        </Script>
        {/* Google AdSense Account Verification Meta */}
        <meta name="google-adsense-account" content="ca-pub-1315540294941790" />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1315540294941790"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <LanguageProvider initialLang={lang}>
          <NextAuthProvider>
            <PublicConfigProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </PublicConfigProvider>
          </NextAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
