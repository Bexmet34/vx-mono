import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'discord_invite_url')
      .single();

    if (!error && data?.value) {
      return NextResponse.redirect(data.value, { status: 307 });
    }
  } catch (err) {
    console.error('Support redirect error:', err);
  }

  // Fallback direct Discord invite if setting not in DB
  return NextResponse.redirect('https://discord.gg/invite', { status: 307 });
}
