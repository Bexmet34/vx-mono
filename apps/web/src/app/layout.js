import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { cookies } from "next/headers";

import Footer from "@/components/Footer";

export const metadata = {
  title: "Veyronix - Discord Albion Party Finder",
  description: "Veyronix is the ultimate Discord bot to build, manage, and track parties in Albion Online. Automate your guild with killboards, role management, and dynamic party builders directly from your Discord server.",
  openGraph: {
    title: "Veyronix - Discord Albion Party Finder",
    description: "Veyronix is the ultimate Discord bot to build, manage, and track parties in Albion Online. Automate your guild with killboards, role management, and dynamic party builders directly from your Discord server.",
    url: "https://veyronix.com.tr",
    siteName: "Veyronix",
    images: [
      {
        url: "https://veyronix.com.tr/favicon.ico",
        width: 800,
        height: 600,
        alt: "Veyronix - Albion Online Party Finder",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  other: {
    cryptomus: "7e16ba27",
  },
  verification: {
    google: "Sb34R-Xts1_g6mT_DiZvpXlRVD75T_uc-G2qp505mMQ",
  },
};

export default function RootLayout({ children }) {
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

  const cookieStore = cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "tr";

  return (
    <html lang={lang}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <NextAuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <div style={{ flex: 1 }}>
                {children}
              </div>
              <Footer />
            </div>
          </NextAuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
