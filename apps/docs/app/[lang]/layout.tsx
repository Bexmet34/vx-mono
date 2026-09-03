import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import '../globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Veyronix Dokümantasyon',
  description: 'Veyronix resmi dokümantasyon sayfası',
};

import { I18nProvider } from 'fumadocs-ui/i18n';

export default function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <I18nProvider locale={params.lang} locales={[
          { locale: 'tr', name: 'Türkçe' },
          { locale: 'en', name: 'English' }
        ]}>
          <RootProvider>{children}</RootProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
