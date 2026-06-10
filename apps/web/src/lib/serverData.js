/**
 * serverData.js — Server-only data fetching utilities.
 * Import ONLY from Server Components (no "use client").
 * These functions run at build/request time on the server,
 * so the HTML Google receives is fully populated.
 */

import { supabase, getActiveCampaigns } from '@veyronix/database';
import fs from 'fs';
import path from 'path';

/** Fetch active pricing plans */
export async function getPlans() {
  try {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

/** Fetch active campaigns */
export async function getCampaigns() {
  try {
    const campaigns = await getActiveCampaigns();
    return (campaigns ?? []).filter((c) => c.show_on_home);
  } catch {
    return [];
  }
}

/** Fetch public server count */
export async function getServerCount() {
  try {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Fetch public guild names for marquee */
export async function getPublicServers() {
  try {
    const { data: guilds, error } = await supabase
      .from('subscriptions')
      .select('guild_name')
      .limit(50);
    if (error) throw error;
    return (guilds ?? [])
      .map((g) => g.guild_name)
      .filter((name) => name && name.trim() !== '' && name.toLowerCase() !== 'unknown');
  } catch {
    return [];
  }
}

/** Read available gif command names from /public/gif/ */
export function getGifs() {
  try {
    const gifDir = path.join(process.cwd(), 'public', 'gif');
    if (!fs.existsSync(gifDir)) return [];
    return fs
      .readdirSync(gifDir)
      .filter((f) => f.endsWith('.gif'))
      .map((f) => f.replace('.gif', ''));
  } catch {
    return [];
  }
}

/** Read blog post list from /src/content/blog/ */
export function getBlogs() {
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    if (!fs.existsSync(blogDir)) return [];
    return fs
      .readdirSync(blogDir)
      .filter((f) => f.endsWith('.md'))
      .map((file) => {
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const titleMatch = content.match(/title:\s*['"]?(.*?)['"]?\s*\n/);
        const descMatch = content.match(/description:\s*['"]?(.*?)['"]?\s*\n/);
        return {
          slug: file.replace('.md', ''),
          title: titleMatch ? titleMatch[1] : file.replace('.md', ''),
          description: descMatch ? descMatch[1] : 'Rehber ve ipuçları...',
          lang: file.endsWith('-en.md') ? 'en' : 'tr',
        };
      });
  } catch {
    return [];
  }
}
