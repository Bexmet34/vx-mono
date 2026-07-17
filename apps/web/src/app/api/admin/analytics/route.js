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

  // NOTE: better-sqlite3 caused Vercel build failures. 
  // Analytics data must be migrated to Supabase or fetched via an external bot API.
  return NextResponse.json({
    topCommands: [],
    hourlyParties: [],
    stats: {
      totalParties: 0,
      totalCommands: 0
    },
    warning: "Analytics is temporarily disconnected. The local SQLite database cannot be accessed from Vercel Serverless Functions. Please migrate analytics to Supabase."
  });
}
