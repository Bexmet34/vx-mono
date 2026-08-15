import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/utils/supabase';
import { checkDashboardAccess } from '@/utils/authUtils';
import { createGiveaway, getActiveGiveaways, getEndedGiveaways, cancelGiveaway } from '@veyronix/database';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;
    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const active = await getActiveGiveaways(guildId);
    const ended = await getEndedGiveaways(guildId);

    return NextResponse.json({ active, ended });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;
    const { hasAccess } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'cancel') {
      const { giveawayId } = body;
      await cancelGiveaway(giveawayId);
      return NextResponse.json({ success: true });
    }

    // Create Giveaway
    const giveawayData = {
      guild_id: guildId,
      channel_id: body.channel_id,
      title: body.title,
      description: body.description || '',
      winner_count: parseInt(body.winner_count, 10) || 1,
      backup_count: parseInt(body.backup_count, 10) || 1,
      required_role_ids: body.required_role_ids || [],
      excluded_role_ids: body.excluded_role_ids || [],
      role_match_mode: body.role_match_mode || 'any',
      role_multipliers: body.role_multipliers || [],
      reward_role_id: body.reward_role_id || null,
      reward_role_duration: body.reward_role_duration || 'permanent',
      image_url: body.image_url || null,
      auto_repeat: body.auto_repeat ?? false,
      secret_fairness: body.secret_fairness ?? true,
      starts_at: body.starts_at || new Date().toISOString(),
      ends_at: body.ends_at,
      created_by: session.user.id
    };

    const giveaway = await createGiveaway(giveawayData);

    // Call Internal Bot API or ShardingManager to publish Discord message
    try {
      const botApiUrl = process.env.BOT_API_URL || process.env.BOT_INTERNAL_API_URL || 'http://localhost:3005';
      await fetch(`${botApiUrl}/api/giveaway/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveawayId: giveaway.id })
      }).catch(e => console.error('[GiveawayAPI] Bot publish webhook warning:', e.message));
    } catch (e) {}

    return NextResponse.json({ success: true, giveaway });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
