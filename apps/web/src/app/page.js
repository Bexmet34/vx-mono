// Veyronix Web - Ana Sayfa ve Topluluk Vitrini
import { supabase } from "@veyronix/database";

import HeroSection from "@/components/home/HeroSection";
import PublicServersSection from "@/components/home/PublicServersSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ComparisonSection from "@/components/home/ComparisonSection";
import StatsBanner from "@/components/home/StatsBanner";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/home/CtaBanner";

// Günde maksimum 4-5 sorgu: 5 saatte bir ISR yenilemesi (5 * 3600 = 18000 saniye)
export const revalidate = 18000;

// Bellek içi önbellek (In-Memory Cache): Node süreci boyunca günde max 5 sorguyu garanti eder
let cachedServers = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 60 * 1000; // 5 saat

async function getPublicServers() {
  const now = Date.now();
  if (cachedServers && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedServers;
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return cachedServers || [];
    }
    const { data: guilds, error } = await supabase
      .from('subscriptions')
      .select('guild_id, guild_name')
      .neq('owner_id', '407234961582587916')
      .limit(50);

    if (error || !guilds) return cachedServers || [];

    // Bot API'sinden ikon bilgisini çek
    let botGuildMap = {};
    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://127.0.0.1:3005';
      const botRes = await fetch(`${botApiUrl}/api/bot-guilds`, { 
        next: { revalidate: 18000 },
        signal: AbortSignal.timeout(3000)
      });
      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData?.success && Array.isArray(botData.guilds)) {
          for (const g of botData.guilds) {
            botGuildMap[g.id] = g;
          }
        }
      }
    } catch (e) {
      // Bot API erişilemez olsa bile devam et, ikonlar olmadan göster
    }

    const result = guilds
      .filter(g => g.guild_name && g.guild_name.trim() !== '' && g.guild_name.toLowerCase() !== 'unknown')
      .map(g => {
        const botGuild = botGuildMap[g.guild_id];
        return {
          name: g.guild_name,
          icon: botGuild?.icon
            ? `https://cdn.discordapp.com/icons/${g.guild_id}/${botGuild.icon}.${botGuild.icon.startsWith('a_') ? 'gif' : 'png'}?size=64`
            : null,
        };
      });

    cachedServers = result;
    lastFetchTime = now;
    return result;
  } catch (error) {
    return cachedServers || [];
  }
}

export default async function Home() {
  const publicServers = await getPublicServers();

  return (
    <main className="min-h-screen">
      {/* HERO — Full screen impact */}
      <HeroSection />

      {/* TRUSTED BY — Scrolling server marquee */}
      <PublicServersSection publicServers={publicServers} />

      {/* FEATURES — 6-card Bento Grid */}
      <FeaturesSection />

      {/* COMPARISON — Diğer Botlar vs Veyronix (All-In-One Powerhouse) */}
      <ComparisonSection />

      {/* STATS — Animated counter banner */}
      <StatsBanner />

      {/* FAQ — Accordion style */}
      <FaqSection />

      {/* CTA — Final call to action */}
      <CtaBanner />
    </main>
  );
}

