import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { cookies } from "next/headers";

import Footer from "@/components/Footer";
import SystemStatusWidget from "@/components/SystemStatusWidget";
import ScrollToTop from "@/components/ScrollToTop";
import { Sora } from "next/font/google";

import Script from "next/script";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata = {
  metadataBase: new URL("https://veyronix.com.tr"),
  title: "Veyronix | Albion Online Discord Bot & Killboard, Party Finder",
  description: "Veyronix is the ultimate Discord bot to build, manage, and track parties in Albion Online. Automate your guild with killboards, role management, and dynamic party builders directly from your Discord server.",
  keywords: "Albion Online Discord Bot, Albion Party Finder, Albion Killboard Bot, Discord ZvZ Builder, ZvZ Party, Albion Online Guild Management, Albion Discord",
  openGraph: {
    title: "Veyronix | Albion Online Discord Bot & Killboard, Party Finder",
    description: "Veyronix is the ultimate Discord bot to build, manage, and track parties in Albion Online. Automate your guild with killboards, role management, and dynamic party builders directly from your Discord server.",
    url: "https://veyronix.com.tr",
    siteName: "Veyronix",
    images: [
      {
        url: "https://veyronix.com.tr/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veyronix - Discord Albion Party Finder",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyronix | Albion Online Discord Bot & Killboard, Party Finder",
    description: "Veyronix is the ultimate Discord bot to build, manage, and track parties in Albion Online. Automate your guild with killboards, role management, and dynamic party builders directly from your Discord server.",
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Veyronix',
    operatingSystem: 'Discord',
    applicationCategory: 'UtilityApplication',
    url: 'https://veyronix.com.tr',
    description: 'Veyronix is the ultimate Discord bot to build, manage, and track parties in Albion Online. Automate your guild with killboards, role management, and dynamic party builders directly from your Discord server.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Veyronix Nasıl Kurulur?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Veyronix botunu sunucunuza davet etmek için Discorda Ekle butonunu kullanın. Yönetici yetkisine sahip olduğunuz bir sunucuyu seçtikten sonra kurulum tamamlanacaktır.'
        }
      },
      {
        '@type': 'Question',
        name: 'Killboard Özelliği Nasıl Çalışır?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Premium plan satın aldığınızda, sistem her akşam otomatik olarak Albion Online resmi APIsine bağlanarak loncanızın güncel Killboard istatistiklerini çeker ve Discord üzerinden duyurur.'
        }
      },
      {
        '@type': 'Question',
        name: 'Parti Sistemi Yönetimi Neler Sunar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Guild etkinlikleri için özel partiler oluşturabilirsiniz. Üyeler rollerini seçebilir ve parti lideri katılımı yönetebilir. Tüm işlemler Discord üzerinden tamamlanır.'
        }
      }
    ]
  };

  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "tr";

  return (
    <html lang={lang} className={`dark ${sora.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1315540294941790"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body>
        <LanguageProvider initialLang={lang}>
          <NextAuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <div style={{ flex: 1 }}>
                {children}
              </div>
              <Footer />
              <SystemStatusWidget />
              <ScrollToTop />
            </div>
          </NextAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
