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

// ─── POST: Drop ayarlarını güncelle (v2) ─────────────────────────────────────
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
      // Temel
      is_enabled:           body.is_enabled          ?? false,
      channel_ids:          body.channel_ids          || [],
      channel_drop_mode:    body.channel_drop_mode    || 'random_one',

      // Zamanlama
      schedule_type:        body.schedule_type        || 'exact_minutes',
      exact_minutes:        body.exact_minutes        || [],
      random_interval_min:  parseInt(body.random_interval_min,  10) || 30,
      random_interval_max:  parseInt(body.random_interval_max,  10) || 120,
      hourly_chance_pct:    parseFloat(body.hourly_chance_pct)       || 25,

      // Mesaj bazlı % modu
      drop_chance_pct:      parseFloat(body.drop_chance_pct)         || 5.0,

      // Puan & Kod
      drop_points:          parseInt(body.drop_points,         10)  || 10,
      code_expire_seconds:  parseInt(body.code_expire_seconds, 10)  || 60,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
