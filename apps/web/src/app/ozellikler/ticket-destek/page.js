import { LINKS } from "@veyronix/config";
import TicketSupportClient from "./TicketSupportClient";

export const metadata = {
  title: "Discord Ticket & Destek Botu – Butonlu Bilet ve Lonca Başvuru Sistemi",
  description: "Discord sunucunuz için gelişmiş butonlu ticket ve başvuru botu: Özel bilet kanalları, yetkili rolleri, lonca başvuru formları, transkript loglama ve otomatik bilet kapatma. Ücretsiz kurun!",
  keywords: [
    "Discord ticket botu",
    "Discord destek sistemi botu",
    "Discord butonlu ticket",
    "Discord başvuru botu",
    "Discord ticket bot"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
  },
  openGraph: {
    title: "Discord Ticket & Destek Botu – Veyronix",
    description: "Sunucunuza butonlu modern bilet ve lonca başvuru sistemi ekleyin. Güvenli, hızlı ve tamamen ücretsiz.",
    url: `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Discord Ticket Botu - Veyronix Support" }],
  }
};

export default function TicketSupportPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix Discord Ticket & Support Bot",
        "operatingSystem": "Discord",
        "applicationCategory": "UtilitiesApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
        "description": "Discord button tickets, guild application forms, private channel isolation, and staff transcript archives.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "1-Click Interactive Button Tickets",
          "Private Channel Isolation & Staff Mentions",
          "Guild Application Questionnaire",
          "Ticket Transcripts and Archive Logging"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Ticket & Destek", "item": `${LINKS.WEBSITE}/ozellikler/ticket-destek` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TicketSupportClient />
    </>
  );
}
