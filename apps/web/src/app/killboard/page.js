import Link from 'next/link';
import KillboardHubClient from './KillboardHubClient';

export const metadata = {
  title: 'Albion Online Canlı Killboard & Oyuncu Takip Portalı | Veyronix',
  description: 'Albion Online Avrupa (Europe), Amerika (Americas) ve Asya (Asia) sunucularındaki en güncel PvP killboard verilerini, oyuncu ve lonca istatistiklerini canlı inceleyin.',
  keywords: 'Albion Online Killboard, Albion Europe Killboard, Albion Americas Killboard, Albion Asia Killboard, Albion PvP Tracker, Albion Player Search, Veyronix Killboard',
  openGraph: {
    title: 'Albion Online Canlı Killboard & Oyuncu Takip Portalı | Veyronix',
    description: 'Albion Online Avrupa, Amerika ve Asya sunucularındaki canlı PvP savaşlarını, düşen envanter lootlarını ve oyuncu istatistiklerini takip edin.',
    siteName: 'Veyronix',
    url: 'https://veyronix.com.tr/killboard',
    type: 'website',
    images: [
      {
        url: 'https://veyronix.com.tr/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Veyronix Albion Online Killboard Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Albion Online Canlı Killboard Portalı | Veyronix',
    description: 'Avrupa, Amerika ve Asya sunucularında canlı PvP killboard takibi.',
  },
  alternates: {
    canonical: 'https://veyronix.com.tr/killboard',
  },
};

export default function KillboardMainPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Albion Online Canlı Killboard Portalı',
    description: 'Albion Online canlı PvP killboard, oyuncu ve lonca arama portalı.',
    url: 'https://veyronix.com.tr/killboard',
    publisher: {
      '@type': 'Organization',
      name: 'Veyronix',
      url: 'https://veyronix.com.tr',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: 'https://veyronix.com.tr',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Killboard',
          item: 'https://veyronix.com.tr/killboard',
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KillboardHubClient />
    </>
  );
}
