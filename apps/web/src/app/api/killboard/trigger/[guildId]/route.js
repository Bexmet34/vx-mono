import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/utils/supabase';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // Check current state before triggering
    const { data: currentSettings, error: fetchError } = await supabase
      .from('guild_settings')
      .select('trigger_killboard, last_killboard_date')
      .eq('guild_id', guildId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (currentSettings?.trigger_killboard) {
      return NextResponse.json({ error: "İşlem devam ediyor. Lütfen botun tamamlamasını bekleyin." }, { status: 429 });
    }

    const isBypassedUser = session.user.id === '407234961582587916';

    if (!isBypassedUser && currentSettings?.last_killboard_date) {
      const lastTrigger = new Date(currentSettings.last_killboard_date).getTime();
      const diffMins = (Date.now() - lastTrigger) / (1000 * 60);
      
      if (diffMins < 30) {
        return NextResponse.json({ 
          error: `KillBoard özelliğini 30 dakikada bir kullanabilirsiniz. Lütfen ${Math.ceil(30 - diffMins)} dakika daha bekleyin.` 
        }, { status: 429 });
      }
    }

    // Set a trigger flag and clear the last_killboard_date so the bot sees it as "due"
    const { data, error } = await supabase
      .from('guild_settings')
      .update({ 
        trigger_killboard: true,
        last_killboard_date: null 
      })
      .eq('guild_id', guildId)
      .select();

    if (error) {
      console.error('[KillBoard Trigger API] Supabase Error:', error);
      return NextResponse.json({ error: error.message, detail: error.details }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Guild settings not found in database for this ID." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[KillBoard Trigger API] Crash:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
