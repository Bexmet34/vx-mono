import { LINKS } from "@veyronix/config";
import RegistrationClient from "./RegistrationClient";

export const metadata = {
  title: "Discord Kayıt Botu & Butonlu Kayıt Sistemi – Otomatik Rol ve İsim Düzenleme",
  description: "Discord sunucunuz için en gelişmiş butonlu kayıt ve otomatik rol botu: Modal form ile İsim/Yaş/IGN girişi, lonca doğrulaması, kayıtsız belirleme ve otomatik rol atama. Ücretsiz kurun!",
  keywords: [
    "Discord kayıt botu",
    "Discord butonlu kayıt sistemi",
    "Discord otomatik rol botu",
    "Discord modal kayıt",
    "Discord isim yaş kayıt botu",
    "Discord registration bot",
    "Discord auto role bot"
  ].join(", "),
  alternates: {
    canonical: `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
  },
  openGraph: {
    title: "Discord Kayıt Botu & Butonlu Kayıt Sistemi – Veyronix",
    description: "Sunucunuza katılan üyeleri modal formlu butonla saniyeler içinde kaydedin. Otomatik rol atama, lonca kontrolü ve 32 karakter uyumlu takma ad düzenleme.",
    url: `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
    images: [{ url: LINKS.OG_IMAGE_URL, width: 1200, height: 630, alt: "Discord Kayıt Botu - Veyronix Registration" }],
  }
};

export default function RegistrationPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Veyronix Discord Registration & Auto Role Bot",
        "operatingSystem": "Discord",
        "applicationCategory": "UtilitiesApplication",
        "url": `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
        "description": "Interactive button modal registration, automated nickname formatting, auto roles and guild verification.",
        "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "USD" },
        "featureList": [
          "Interactive Modal Registration Form (Name, Age, IGN)",
          "Automatic Tag & Nickname Formatting ([TAG] Nick)",
          "Instant Role Assignment & Unregistered Role Stripping",
          "Mass Unregistered Member Cleanup",
          "Albion Online API Guild Verification"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": LINKS.WEBSITE },
          { "@type": "ListItem", "position": 2, "name": "Özellikler", "item": `${LINKS.WEBSITE}/#features` },
          { "@type": "ListItem", "position": 3, "name": "Kayıt Sistemi", "item": `${LINKS.WEBSITE}/ozellikler/kayit-sistemi` }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RegistrationClient />
    </>
  );
}
