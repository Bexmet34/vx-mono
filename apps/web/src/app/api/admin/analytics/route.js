import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === ADMIN_ID_2;
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { supabase } = require('@/utils/supabase');

    // 1. Top commands
    const { data: commandData, error: cmdError } = await supabase
      .from('bot_analytics')
      .select('event_name')
      .eq('event_type', 'command_used');

    if (cmdError) throw cmdError;

    const commandCounts = {};
    if (commandData) {
      for (const row of commandData) {
        commandCounts[row.event_name] = (commandCounts[row.event_name] || 0) + 1;
      }
    }

    const topCommands = Object.keys(commandCounts)
      .map(name => ({ name, count: commandCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 2. Hourly party activity
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: partyData, error: partyError } = await supabase
      .from('bot_analytics')
      .select('created_at')
      .eq('event_type', 'party_created')
      .gte('created_at', yesterday.toISOString());

    if (partyError) throw partyError;

    const hourlyCounts = {};
    if (partyData) {
      for (const row of partyData) {
        const date = new Date(row.created_at);
        const hour = date.getHours().toString().padStart(2, '0') + ':00';
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
      }
    }

    const hourlyParties = Object.keys(hourlyCounts)
      .map(hour => ({ hour, count: hourlyCounts[hour] }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // 3. Stats
    const totalCommands = commandData ? commandData.length : 0;
    
    // We need total parties overall (not just last 24h)
    const { count: totalParties, error: tpError } = await supabase
      .from('bot_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'party_created');

    return NextResponse.json({
      topCommands,
      hourlyParties,
      stats: {
        totalParties: totalParties || 0,
        totalCommands: totalCommands
      }
    });

  } catch (error) {
    console.error('[API/Analytics] Error reading from Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
