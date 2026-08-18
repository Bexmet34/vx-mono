import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabase } from '@veyronix/database';

export const dynamic = "force-dynamic";
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== process.env.NEXT_PUBLIC_ADMIN_ID && session.user.id !== "407234961582587916")) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*');
            
        if (error) throw error;
        
        const settingsMap = {};
        if (data) {
            data.forEach(s => {
                settingsMap[s.key] = s.value;
            });
        }

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('API Error [admin/settings GET]:', error.message);
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
        
        const updates = Object.entries(body).map(([key, value]) => ({
            key, 
            value: value.toString()
        }));

        const { error } = await supabase
            .from('system_settings')
            .upsert(updates, { onConflict: 'key' });

        if (error) throw error;

        // If discord_invite_url was changed, update the static config file
        if (body.discord_invite_url) {
            const fs = require('fs');
            const path = require('path');
            let baseDir = process.cwd();
            if (baseDir.includes('apps')) {
               baseDir = path.resolve(baseDir, '../../');
            }
            const configPath = path.join(baseDir, 'packages/config/src/index.js');
            try {
                let configContent = fs.readFileSync(configPath, 'utf8');
                // Regex to replace the SUPPORT_SERVER value
                configContent = configContent.replace(
                    /SUPPORT_SERVER:\s*["'].*?["']/, 
                    `SUPPORT_SERVER: "${body.discord_invite_url}"`
                );
                fs.writeFileSync(configPath, configContent);
            } catch (err) {
                console.error('Failed to write to config file:', err);
                // Non-fatal, just log it. In vercel this won't work but on VPS it works perfectly.
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error [admin/settings PATCH]:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
