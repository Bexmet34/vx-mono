import { LINKS } from "@veyronix/config";
import PartyFinderClient from "./PartyFinderClient";

export const metadata = {
  title: "Albion Online Parti Kurucu (Party Finder) & ZvZ Botu – Veyronix",
  description: "Albion Online loncaları için #1 Discord parti kurucu botu: Dinamik Tank/Healer/DPS/Support kompozisyonları, butonlu anlık katılım, web panel şablonları ve yedek sistemi. Ücretsiz deneyin!",
  keywords: [
    "Albion Online Parti Kurucu",
    "Albion Online Party Finder",
    "Albion Online ZvZ Botu",
    "Albion Online ZvZ Builder",
    "Albion Online parti şablonu",
    "Albion Online Discord parti botu",
    "Albion Online PvE parti kurma"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
  },
  openGraph: {
    title: "Albion Online Parti Kurucu & ZvZ Botu – Veyronix",
    description: "Discord üzerinden tek tıkla ZvZ, Roaming, Gank ve PvE partileri kurun. Butonlu rol seçimi ve anlık katılım takibi.",
    url: `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Albion Online Parti Kurucu - Veyronix" }],
  }
};

export default function PartyFinderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix Albion Online Party Finder & ZvZ Builder",
        "operatingSystem": "Discord, Web",
        "applicationCategory": "GameApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
        "description": "Albion Online guild ZvZ party builder, Tank/Healer/DPS composition templates, and 1-click Discord signups.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Dynamic Tank, Healer, DPS and Support Templates",
          "1-Click Interactive Discord Buttons",
          "Web Dashboard Custom Party Builds",
          "Bench and Waiting List Management"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Parti Kurucu", "item": `${LINKS.WEBSITE}/ozellikler/parti-kurucu` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PartyFinderClient />
    </>
  );
}
