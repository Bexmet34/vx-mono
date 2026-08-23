import { supabase } from "@veyronix/database";

import HeroSection from "@/components/home/HeroSection";
import PublicServersSection from "@/components/home/PublicServersSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ComparisonSection from "@/components/home/ComparisonSection";
import StatsBanner from "@/components/home/StatsBanner";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/home/CtaBanner";

export const revalidate = 300; // Revalidate home page every 5 minutes (ISR)

async function getPublicServers() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
    }
    const { data: guilds, error } = await supabase
      .from('subscriptions')
      .select('guild_name')
      .neq('owner_id', '407234961582587916')
      .limit(50);

    if (error || !guilds) return [];

    return guilds
      .map(g => g.guild_name)
      .filter(name => name && name.trim() !== '' && name.toLowerCase() !== 'unknown');
  } catch (error) {
    return [];
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
