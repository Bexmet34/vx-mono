import fs from 'fs';
import path from 'path';
import { supabase } from "@veyronix/database";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CommandsSection from "@/components/home/CommandsSection";
import PublicServersSection from "@/components/home/PublicServersSection";
import ActiveCampaignsSection from "@/components/home/ActiveCampaignsSection";
import DashboardShowcase from "@/components/home/DashboardShowcase";
import HomeBlogSection from "@/components/home/HomeBlogSection";
import FaqSection from "@/components/home/FaqSection";

export const revalidate = 300; // Revalidate home page every 5 minutes (ISR)

function getGifs() {
  try {
    const gifDir = path.join(process.cwd(), 'public', 'gif');
    if (!fs.existsSync(gifDir)) return [];
    return fs.readdirSync(gifDir)
      .filter(file => file.endsWith('.gif'))
      .map(file => file.replace('.gif', ''));
  } catch (error) {
    return [];
  }
}

function getBlogs() {
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    if (!fs.existsSync(blogDir)) return [];
    const files = fs.readdirSync(blogDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const titleMatch = content.match(/title:\s*['"](.*?)['"]/);
        const descMatch = content.match(/description:\s*['"](.*?)['"]/);
        const langMatch = file.endsWith('-en.md') ? 'en' : 'tr';
        
        return {
          slug: file.replace('.md', ''),
          title: titleMatch ? titleMatch[1] : file.replace('.md', ''),
          description: descMatch ? descMatch[1] : 'Rehber ve ipuçları...',
          lang: langMatch
        };
      });
  } catch (error) {
    return [];
  }
}

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

async function getActiveCampaigns() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return [];
    }
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !campaigns) return [];

    return campaigns.filter(c => c.show_on_home);
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const gifs = getGifs();
  const blogs = getBlogs();
  const publicServers = await getPublicServers();
  const activeCampaigns = await getActiveCampaigns();

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        {/* HERO SECTION */}
        <HeroSection />

        {/* MARQUEE SOCIAL PROOF */}
        <PublicServersSection publicServers={publicServers} />

        {/* ACTIVE CAMPAIGNS */}
        <ActiveCampaignsSection activeCampaigns={activeCampaigns} />

        {/* BENTO GRID FEATURES & VIDEO */}
        <FeaturesSection />

        {/* BLOG SECTION */}
        <HomeBlogSection blogs={blogs} />

        {/* DASHBOARD SHOWCASE */}
        <DashboardShowcase />

        {/* COMMANDS SECTION */}
        <CommandsSection gifs={gifs} />

        {/* HOW IT WORKS & FAQ */}
        <FaqSection />
      </main>
    </>
  );
}
