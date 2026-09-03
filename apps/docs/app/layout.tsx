import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Veyronix Dokümantasyon',
  description: 'Veyronix resmi dokümantasyon sayfası',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
