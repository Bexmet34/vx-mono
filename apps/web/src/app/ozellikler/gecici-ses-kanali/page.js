import { LINKS } from "@veyronix/config";
import TempVoiceClient from "./TempVoiceClient";

export const metadata = {
  title: "Discord Geçici Ses Kanalı Botu (VoiceForge) – Otomatik Dinamik Oda & Kilitleme",
  description: "Discord sunucunuz için gelişmiş geçici ses kanalı botu: Join to create (Oda Oluştur), 15 butonlu interaktif yönetim paneli, oda kilitleme, kişi limiti, gizli oda ve bitrate kontrolü. Ücretsiz ekleyin!",
  keywords: [
    "Discord geçici ses kanalı botu",
    "Discord geçici oda botu",
    "Discord dinamik ses kanalı",
    "Discord join to create bot",
    "Discord ses kanalı kilitleme botu",
    "Discord VoiceForge",
    "Discord temporary voice channel bot",
    "Discord join to create"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
  },
  openGraph: {
    title: "Discord Geçici Ses Kanalı Botu (VoiceForge) – Veyronix",
    description: "Sunucunuzdaki kanal kirliliğine son verin! Join-to-Create geçici ses odaları, oda kilitleme, kişi limiti ve 15 butonlu özel panel.",
    url: `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Discord Geçici Ses Kanalı Botu - Veyronix VoiceForge" }],
  }
};

export default function TempVoicePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix VoiceForge - Discord Temporary Voice Channels",
        "operatingSystem": "Discord",
        "applicationCategory": "UtilitiesApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
        "description": "Discord temporary voice channels (Join-to-Create), room lock, privacy shield, user limits and interactive 15-button management.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Join to Create (Instant room generation)",
          "15-Button Interactive Discord Control Panel",
          "Room Lock & Hide (Privacy Shield)",
          "Real-time User Limits (1-99 Players)",
          "Room Renaming & Bitrate Optimization",
          "Transfer Ownership & Kick/Ban Disruptive Users"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Geçici Ses Kanalı", "item": `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TempVoiceClient />
    </>
  );
}
