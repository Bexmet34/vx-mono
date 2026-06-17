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
    const body = await req.json();
    const { action, targetUserId } = body; // action: 'add' | 'remove'

    if (!action || !targetUserId) {
        return NextResponse.json({ error: "Missing action or targetUserId" }, { status: 400 });
    }

    // Check if the requester is the OWNER of the subscription
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (fetchError || !sub) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (sub.owner_id !== session.user.id) {
        return NextResponse.json({ error: "Only the server owner can manage admins" }, { status: 403 });
    }

    // Parse existing authorized_users
    let authorizedUsers = [];
    if (sub.authorized_users) {
        if (Array.isArray(sub.authorized_users)) {
            authorizedUsers = sub.authorized_users;
        } else if (typeof sub.authorized_users === 'string') {
            try {
                authorizedUsers = JSON.parse(sub.authorized_users);
            } catch(e) {
                const stripped = sub.authorized_users.replace(/^{|}$/g, '');
                if (stripped) {
                    authorizedUsers = stripped.split(',');
                }
            }
        }
    }

    if (action === 'add') {
        if (!authorizedUsers.includes(targetUserId)) {
            authorizedUsers.push(targetUserId);
        }
    } else if (action === 'remove') {
        authorizedUsers = authorizedUsers.filter(id => id !== targetUserId);
    }

    // Update in database
    const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ authorized_users: authorizedUsers })
        .eq('guild_id', guildId);

    if (updateError) {
        console.error("Supabase Admin Update Error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, authorizedUsers });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
