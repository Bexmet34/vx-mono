import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkDashboardAccess } from '@/utils/authUtils';
import { getDropSettings, upsertDropSettings, getDropHistory } from '@veyronix/database';

export const dynamic = 'force-dynamic';

// ─── GET: Drop ayarlarını ve geçmişi çek ─────────────────────────────────────
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

    const settings = await getDropSettings(guildId);
    const history  = await getDropHistory(guildId, 10);

    return NextResponse.json({ settings, history });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: Drop ayarlarını güncelle ──────────────────────────────────────────
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

    const updated = await upsertDropSettings(guildId, {
      is_enabled:            body.is_enabled            ?? false,
      channel_ids:           body.channel_ids           || [],
      schedule_type:         body.schedule_type         || 'exact_minutes',
      exact_minutes:         body.exact_minutes         || [],
      hourly_chance_pct:     parseInt(body.hourly_chance_pct, 10)     || 25,
      random_interval_min:   parseInt(body.random_interval_min, 10)   || 30,
      random_interval_max:   parseInt(body.random_interval_max, 10)   || 120,
      drop_chance:           body.drop_chance           || 'medium',
      custom_chance_pct:     parseInt(body.custom_chance_pct, 10)     || 15,
      cooldown_minutes:      parseInt(body.cooldown_minutes, 10)      || 15,
      reward_type:           body.reward_type           || 'coin',
      reward_amount:         parseInt(body.reward_amount, 10)         || 100,
      reward_role_id:        body.reward_role_id        || null,
      silence_threshold_min: parseInt(body.silence_threshold_min, 10) || 15,
      burst_threshold_msg:   parseInt(body.burst_threshold_msg, 10)   || 30,
      burst_window_sec:      parseInt(body.burst_window_sec, 10)      || 180,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
