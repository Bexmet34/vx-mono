import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/context/LanguageContext";

import Footer from "@/components/Footer";

export const metadata = {
  title: "Veyronix - Discord Albion Party Finder",
  description: "The ultimate tool to build and manage parties in Albion Online directly from your Discord server.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
