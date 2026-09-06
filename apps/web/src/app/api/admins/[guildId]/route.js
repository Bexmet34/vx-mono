import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@veyronix/database';

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
    let { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (fetchError || !sub) {
        // If not in subscriptions, check if they are owner in guild_settings (Freemium server)
        const { data: gs, error: gsError } = await supabase
            .from('guild_settings')
            .select('owner_id')
            .eq('guild_id', guildId)
            .single();

        if (gsError || !gs) {
            return NextResponse.json({ error: "Sunucu veritabanında bulunamadı." }, { status: 404 });
        }

        if (gs.owner_id !== session.user.id) {
            return NextResponse.json({ error: "Yetkili atama işlemini sadece sunucu sahibi yapabilir." }, { status: 403 });
        }

        // Create a default freemium subscription row to hold authorized_users
        const newSub = {
             guild_id: guildId,
             owner_id: session.user.id,
             guild_name: 'Sunucu',
             is_active: true,
             is_unlimited: false,
             trial_used: true,
             expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
             authorized_users: []
        };
        const { data: inserted, error: insertError } = await supabase.from('subscriptions').insert(newSub).select().single();
        if (insertError) {
             console.error("Supabase Sub Insert Error:", insertError);
             return NextResponse.json({ error: "Sunucu abonelik kaydı oluşturulamadı." }, { status: 500 });
        }
        sub = inserted;
    } else {
        if (sub.owner_id !== session.user.id) {
            return NextResponse.json({ error: "Yetkili atama işlemini sadece sunucu sahibi yapabilir." }, { status: 403 });
        }
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
