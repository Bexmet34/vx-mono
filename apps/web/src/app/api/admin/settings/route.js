import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import Database from 'better-sqlite3';
import path from 'path';

// Bot veritabanı yolu
const DB_PATH = path.join(process.cwd(), '../../apps/bot/src/data/database.sqlite');

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== process.env.NEXT_PUBLIC_ADMIN_ID && session.user.id !== "407234961582587916")) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = new Database(DB_PATH, { fileMustExist: true });
        
        // Fetch settings
        const settings = db.prepare(`SELECT key, value FROM system_settings`).all();
        
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('API Error [admin/settings GET]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== process.env.NEXT_PUBLIC_ADMIN_ID && session.user.id !== "407234961582587916")) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const db = new Database(DB_PATH, { fileMustExist: true });
        
        // Update settings dynamically based on body
        const stmt = db.prepare(`INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)`);
        
        db.transaction(() => {
            for (const [key, value] of Object.entries(body)) {
                stmt.run(key, value.toString());
            }
        })();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error [admin/settings PATCH]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
