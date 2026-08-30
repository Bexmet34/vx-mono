import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Fetch all guilds from the bot API
    const botApiUrl = process.env.BOT_API_URL || "http://localhost:3005";
    const botRes = await fetch(`${botApiUrl}/api/bot-guilds`);
    if (!botRes.ok) throw new Error("Bot API'ye ulaşılamadı.");
    
    const botData = await botRes.json();
    if (!botData.success || !botData.guilds) throw new Error("Bot verileri alınamadı.");
    
    const botGuildIds = botData.guilds.map(g => g.id);
    
    const supabase = require('@veyronix/database').getClient();

    // 2. Fetch all subscriptions from the database
    let allSubs = [];
    let from = 0;
    while (true) {
        const { data, error } = await supabase.from('subscriptions').select('guild_id').range(from, from + 1000);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allSubs = allSubs.concat(data);
        if (data.length < 1000) break;
        from += 1000;
    }

    // 3. Fetch all guild_settings from the database
    let allSettings = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase.from('guild_settings').select('guild_id').range(from, from + 1000);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allSettings = allSettings.concat(data);
        if (data.length < 1000) break;
        from += 1000;
    }

    // 4. Find which ones to delete
    const subGuildIds = allSubs.map(s => s.guild_id);
    const settingsGuildIds = allSettings.map(s => s.guild_id);
    
    // Find IDs that are in DB but NOT in bot
    const subsToDelete = subGuildIds.filter(id => !botGuildIds.includes(id));
    const settingsToDelete = settingsGuildIds.filter(id => !botGuildIds.includes(id));

    // 5. Delete them from DB
    let deletedCount = 0;

    // Delete subscriptions
    if (subsToDelete.length > 0) {
        const { error: subErr } = await supabase
            .from('subscriptions')
            .delete()
            .in('guild_id', subsToDelete);
        if (subErr) console.error("Error deleting subs:", subErr);
    }

    // Delete guild_settings
    if (settingsToDelete.length > 0) {
        const { error: setErr } = await supabase
            .from('guild_settings')
            .delete()
            .in('guild_id', settingsToDelete);
        if (setErr) console.error("Error deleting settings:", setErr);
    }

    // Determine total distinct deleted
    const totalDeletedSet = new Set([...subsToDelete, ...settingsToDelete]);
    deletedCount = totalDeletedSet.size;

    return NextResponse.json({ success: true, deletedCount });

  } catch (err) {
    console.error("[AdminAPI] Clean Servers Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
