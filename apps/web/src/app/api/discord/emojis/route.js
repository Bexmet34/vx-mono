import { NextResponse } from 'next/server';
import { getApplicationEmojis } from '@/lib/discordApi';

export async function GET() {
  try {
    const emojis = await getApplicationEmojis();
    return NextResponse.json({ emojis });
  } catch (error) {
    console.error('Error in /api/discord/emojis:', error);
    return NextResponse.json({ emojis: {} }, { status: 500 });
  }
}
