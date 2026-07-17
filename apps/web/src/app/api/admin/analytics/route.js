import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Database from 'better-sqlite3';
import path from 'path';

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
    // Determine path to the bot's sqlite database
    const dbPath = path.resolve(process.cwd(), '../bot/partikur.db');
    const db = new Database(dbPath, { readonly: true });

    // 1. Top commands
    const topCommands = db.prepare(`
      SELECT event_name as name, COUNT(*) as count 
      FROM bot_analytics 
      WHERE event_type = 'command_used' 
      GROUP BY event_name 
      ORDER BY count DESC 
      LIMIT 10
    `).all();

    // 2. Hourly party activity (last 24 hours)
    const hourlyParties = db.prepare(`
      SELECT strftime('%H:00', created_at) as hour, COUNT(*) as count
      FROM bot_analytics
      WHERE event_type = 'party_created' 
        AND created_at >= datetime('now', '-1 day')
      GROUP BY hour
      ORDER BY hour ASC
    `).all();

    // 3. Overall stats
    const totalParties = db.prepare(`SELECT COUNT(*) as count FROM bot_analytics WHERE event_type = 'party_created'`).get();
    const totalCommands = db.prepare(`SELECT COUNT(*) as count FROM bot_analytics WHERE event_type = 'command_used'`).get();

    db.close();

    return NextResponse.json({
      topCommands,
      hourlyParties,
      stats: {
        totalParties: totalParties.count,
        totalCommands: totalCommands.count
      }
    });
  } catch (error) {
    console.error('[API/Analytics] Error reading bot db:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
