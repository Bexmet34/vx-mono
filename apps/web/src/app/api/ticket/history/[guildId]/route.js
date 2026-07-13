import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/utils/supabase';
import { checkDashboardAccess } from '@/utils/authUtils';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { guildId } = await params;
        const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
        if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const { data, error } = await supabase
            .from('tickets')
            .select('id, owner_id, owner_name, topic, closed_by, closed_at, created_at, transcript')
            .eq('guild_id', guildId)
            .eq('status', 'closed')
            .order('closed_at', { ascending: false });

        if (error) {
            console.error("Fetch Tickets Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ tickets: data || [] });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { guildId } = await params;
        const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
        if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const url = new URL(req.url);
        const ticketId = url.searchParams.get('id');

        if (!ticketId) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('guild_id', guildId)
            .eq('id', ticketId);

        if (error) {
            console.error("Delete Ticket Error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
