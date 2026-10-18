import { NextResponse } from 'next/server';
import { supabase } from "@veyronix/database";

export const revalidate = 18000; // 5 saat önbellek

let cachedServerNames = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 60 * 1000; // 5 saat

export async function GET() {
  const now = Date.now();
  if (cachedServerNames && (now - lastFetchTime < CACHE_TTL_MS)) {
    return NextResponse.json(cachedServerNames, {
      headers: {
        'Cache-Control': 'public, max-age=18000, s-maxage=18000, stale-while-revalidate=86400',
      },
    });
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
       return NextResponse.json(cachedServerNames || [], { status: 200 });
    }

    // Fetch up to 50 active subscriptions to display their names (excluding specific test owner)
    const { data: guilds, error } = await supabase
      .from('subscriptions')
      .select('guild_name')
      .neq('owner_id', '407234961582587916')
      .limit(50);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(cachedServerNames || [], { status: 200 });
    }

    // Extract names and filter out empty ones
    const serverNames = guilds
      .map(g => g.guild_name)
      .filter(name => name && name.trim() !== '' && name.toLowerCase() !== 'unknown');

    cachedServerNames = serverNames;
    lastFetchTime = now;

    return NextResponse.json(serverNames, {
      headers: {
        'Cache-Control': 'public, max-age=18000, s-maxage=18000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(cachedServerNames || [], { status: 200 });
  }
}
