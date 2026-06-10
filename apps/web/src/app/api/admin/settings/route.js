import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error [admin/settings PATCH]:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
