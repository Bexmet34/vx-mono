import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';

export const revalidate = 3600; // 1 saat önbellek

let cachedCount = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

export async function GET() {
  const now = Date.now();
  if (cachedCount !== null && (now - lastFetchTime < CACHE_TTL_MS)) {
    return NextResponse.json(
      { count: cachedCount },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } }
    );
  }

  try {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Supabase count error:", error);
      return NextResponse.json({ count: cachedCount || 0 }, { status: 200 });
    }

    cachedCount = count || 0;
    lastFetchTime = now;

    return NextResponse.json(
      { count: cachedCount },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ count: cachedCount || 0 }, { status: 200 });
  }
}
