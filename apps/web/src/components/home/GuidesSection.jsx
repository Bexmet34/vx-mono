"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeIn from "@/components/ui/FadeIn";

const FEATURED_GUIDES = {
  tr: [
    {
      slug: "discord-gecici-ses-kanali-botu-nasil-kurulur",
      tag: "VoiceForge",
      title: "Discord Geçici Ses Kanalı Botu Nasıl Kurulur? (Join to Create)",
      desc: "Sunucunuzda otomatik oda açma, oda kilitleme, kişi limiti ve 15 butonlu Türkçe ses panelini 2 dakikada aktif edin."
    },
    {
      slug: "discord-kayit-botu-ve-butonlu-kayit-sistemi-rehberi",
      tag: "Kayıt & Oto Rol",
      title: "En İyi Discord Kayıt Botu ve Butonlu Kayıt Sistemi Rehberi",
      desc: "Modal formlu butonlu kayıt, otomatik rol atama, isim/yaş şablonu ve Albion Online lonca doğrulama kurulumu."
    },
    {
      slug: "albion-online-turkce-discord-botu-zvz-parti-ve-canli-killboard",
      tag: "Albion Online",
      title: "Albion Online Türkçe Discord Botu: ZvZ Parti & Canlı Killboard",
      desc: "Loncanız için tek tıkla ZvZ/PvE parti kurma, hazır kompozisyon şablonları ve Europe/Americas canlı killboard takibi."
    },
    {
      slug: "albion-online-twitch-drops-otomatik-toplama-rehberi-2026",
      tag: "Twitch Drops",
      title: "Albion Online Twitch Drops Otomatik Nasıl Toplanır? (7/24 Bulut)",
      desc: "Bilgisayarınız kapalıyken bile Twitch yayınlarını bulutta 7/24 otomatik izleyerek tüm sandıkları envanterinize toplayın."
    }
  ],
  en: [
    {
      slug: "discord-temporary-voice-channels-join-to-create-en",
      tag: "VoiceForge",
      title: "How to Set Up Discord Temporary Voice Channels (Join to Create)",
      desc: "Eliminate channel clutter with instant dynamic rooms, privacy locks, user limits, and a 15-button interactive panel."
    },
    {
      slug: "discord-registration-verification-bot-guide-en",
      tag: "Registration",
      title: "Discord Registration & Button Verification System Guide",
      desc: "Automate member onboarding with interactive modal forms, auto-roles, and Albion Online guild verification."
    },
    {
      slug: "albion-online-party-management-tips-en",
      tag: "Albion Online",
      title: "Albion Online ZvZ Party Finder & Live Killboard Integration",
      desc: "Organize ZvZ, Avalonian raids, and small-scale PvP rosters effortlessly with role buttons and real-time killboards."
    },
    {
      slug: "best-discord-gaming-bots-2026-en",
      tag: "Guides",
      title: "Best All-in-One Discord Bot for Gaming Communities (2026)",
      desc: "Replace 5 separate bots with a single unified dashboard for voice rooms, tickets, registration, and guild tools."
    }
  ]
};

export default function GuidesSection() {
  const { lang } = useLanguage();
  const isTr = lang === "tr";
  const guides = isTr ? FEATURED_GUIDES.tr : FEATURED_GUIDES.en;

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-12 md:py-16 max-w-container-max mx-auto">
      <div className="max-w-6xl mx-auto">
        <FadeIn delay={100} direction="up" distance={20}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/25 text-primary-container text-xs font-semibold mb-3">
                <BookOpen size={13} />
                <span>{isTr ? "Kurulum & Strateji Rehberleri" : "Setup & Strategy Guides"}</span>
              </div>
              <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl text-on-surface tracking-tight font-bold">
                {isTr ? "Popüler Rehberler & Blog" : "Popular Guides & Blog"}
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-container hover:underline"
            >
              <span>{isTr ? "Tüm Rehberleri Gör" : "View All Guides"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guides.map((g, idx) => (
            <FadeIn key={g.slug} delay={100 + idx * 70} direction="up" distance={20}>
              <Link
                href={`/blog/${g.slug}`}
                className="group h-full rounded-2xl p-6 bg-surface-container/35 border border-outline-variant/20 hover:border-primary-container/40 hover:bg-surface-container/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-primary-container/15 border border-primary-container/30 text-primary-container text-[11px] font-bold uppercase tracking-wider">
                      {g.tag}
                    </span>
                    <Sparkles size={14} className="text-primary-container/50 group-hover:text-primary-container transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary-container transition-colors mb-2 leading-snug">
                    {g.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                    {g.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant/15 flex items-center justify-between text-xs font-semibold text-primary-container">
                  <span>{isTr ? "Rehberi Oku" : "Read Guide"}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
