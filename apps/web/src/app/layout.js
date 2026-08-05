import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { cookies } from "next/headers";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SystemStatusWidget from "@/components/SystemStatusWidget";
import ScrollToTop from "@/components/ScrollToTop";
import { Sora } from "next/font/google";

import Script from "next/script";

import MobileAppDock from "@/components/MobileAppDock";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export const metadata = {
  metadataBase: new URL("https://veyronix.com.tr"),
  title: {
    default: "Veyronix – #1 Albion Online Discord Botu | Otomatik Killboard & Parti Kurucu",
    template: "%s | Veyronix Albion Online Discord Bot",
  },
  description: "Albion Online loncanızı otomatize edin! Gelişmiş ZvZ parti kurucu, canlı Killboard takibi, otomatik rol yönetimi, oyuncu istatistikleri ve Türkçe/İngilizce web panel desteği sunan #1 Discord botu. Hemen ücretsiz deneyin!",
  keywords: [
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
    "Veyronix Albion Bot",
    "Veyronix Discord Bot",
    "Albion Guild Bot",
    "Albion Online Loot Split Bot",
    "Albion Event Manager",
    "Albion Discord Verification",
    "Albion Online Kill Log"
  ].join(", "),
  authors: [{ name: "Veyronix Team", url: "https://veyronix.com.tr" }],
  creator: "Veyronix",
  publisher: "Veyronix",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://veyronix.com.tr",
    languages: {
      "tr-TR": "https://veyronix.com.tr",
      "en-US": "https://veyronix.com.tr",
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Veyronix",
  },
  openGraph: {
    title: "Veyronix – #1 Albion Online Discord Botu | Otomatik Killboard & Parti Kurucu",
    description: "Albion Online loncanızı otomatize edin! Gelişmiş ZvZ parti kurucu, canlı Killboard takibi, otomatik rol yönetimi ve Türkçe/İngilizce web panel desteği sunan #1 Discord botu. Hemen ücretsiz deneyin!",
    url: "https://veyronix.com.tr",
    siteName: "Veyronix",
    images: [
      {
        url: "https://veyronix.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veyronix - Discord Albion Party Finder & Killboard",
      },
    ],
    locale: "tr_TR",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyronix – #1 Albion Online Discord Botu | Otomatik Killboard & Parti Kurucu",
    description: "Albion Online loncanızı otomatize edin! Gelişmiş ZvZ parti kurucu, canlı Killboard takibi, otomatik rol yönetimi ve Türkçe/İngilizce web panel desteği sunan #1 Discord botu.",
    images: ["https://veyronix.com.tr/og-image.png"],
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
    name: 'Veyronix - Albion Online Discord Bot',
    operatingSystem: 'Discord, Web, iOS, Android',
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Discord Bot',
    url: 'https://veyronix.com.tr',
    description: 'Albion Online loncanızı otomatize edin! Gelişmiş ZvZ parti kurucu, canlı Killboard takibi, otomatik rol yönetimi ve Türkçe/İngilizce web panel desteği sunan #1 Discord botu.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
    featureList: [
      'Otomatik Killboard Takibi & Duyuru',
      'ZvZ & PvE Parti Kurucu (Party Finder)',
      'Otomatik Discord Rol Yönetimi & API Kayıt',
      'Türkçe & İngilizce Web Kontrol Paneli',
      'Lonca Başvuru & Ticket Yönetimi'
    ]
  };

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Veyronix',
    url: 'https://veyronix.com.tr',
    logo: 'https://veyronix.com.tr/og-image.png',
    sameAs: [
      'https://discord.gg/D6T3t4beqa',
      'https://top.gg/bot/1082239904169336902'
    ]
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Veyronix Albion Online Botu Nasıl Kurulur?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Veyronix botunu Discord sunucunuza davet etmek için "Discord\'a Ekle" butonuna tıklayın. Yönetici yetkisine sahip olduğunuz sunucuyu seçerek saniyeler içinde ücretsiz kurulum yapabilirsiniz.'
        }
      },
      {
        '@type': 'Question',
        name: 'Otomatik Killboard Özelliği Nedir ve Nasıl Çalışır?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Veyronix, Albion Online resmi API bağlantısı ile loncanızın anlık Kill, Death ve Fame istatistiklerini çeker, otomatik olarak Discord kanalınızda görsel raporlar halinde duyurur.'
        }
      },
      {
        '@type': 'Question',
        name: 'ZvZ ve Parti Yönetim Sistemi Neler Sunar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Guild etkinlikleriniz için özel parti kompozisyonları (Tank, Healer, DPS, Support) oluşturabilirsiniz. Üyeler tek tıkla rollerini seçer, katılım durumunu yönetici web panelinden canlı izleyebilirsiniz.'
        }
      }
    ]
  };

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "tr";

  return (
    <html lang={lang} className={`dark ${sora.variable}`}>
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
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1315540294941790"
          crossOrigin="anonymous"
        />
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
      </head>
      <body>
        <LanguageProvider initialLang={lang}>
          <NextAuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '70px' }}>
              <Navbar />
              <div style={{ flex: 1, paddingTop: '80px' }}>
                {children}
              </div>
              <Footer />
              <SystemStatusWidget />
              <ScrollToTop />
              <MobileAppDock />
            </div>
          </NextAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
