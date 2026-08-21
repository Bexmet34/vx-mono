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
import { supabase } from "@veyronix/database";

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
  authors: [{ name: "Veyronix Team", url: LINKS.WEBSITE }],
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
    canonical: LINKS.WEBSITE,
    languages: {
      "tr-TR": LINKS.WEBSITE,
      "en-US": LINKS.WEBSITE,
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
    url: LINKS.WEBSITE,
    siteName: "Veyronix",
    images: [
      {
        url: LINKS.OG_IMAGE_URL,
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
    name: 'Veyronix - Albion Online Discord Bot',
    operatingSystem: 'Discord, Web, iOS, Android',
    applicationCategory: 'GameApplication',
    applicationSubCategory: 'Discord Bot',
    url: LINKS.WEBSITE,
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

  // Destek sunucu linkini canlı olarak Supabase'den çek
  let liveSupportServer = LINKS.SUPPORT_SERVER;
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'discord_invite_url')
      .single();
    if (data?.value) liveSupportServer = data.value;
  } catch (e) { /* fallback */ }

  // jsonLdOrg'da canlı linki kullan
  const jsonLdOrgLive = { ...jsonLdOrg, sameAs: [liveSupportServer, 'https://top.gg/bot/1082239904169336902'] };

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrgLive) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body>
        {/* Google AdSense Script (placed in body to prevent data-nscript head tag warning & hydration mismatch #418) */}
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1315540294941790"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
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
