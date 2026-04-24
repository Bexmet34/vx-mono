import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    const { data, error } = await supabase
      .from('guild_settings')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found (ok, defaults used)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || null);
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
    const body = await req.json();
    const { language, auto_role_sync, embed_thumbnail_url, whitelist, party_templates } = body;

    // Upsert: varsa güncelle, yoksa ekle
    const { data, error } = await supabase
      .from('guild_settings')
      .upsert(
        {
          guild_id: guildId,
          owner_id: session.user.id,
          language: language ?? 'tr',
          auto_role_sync: auto_role_sync ?? false,
          embed_thumbnail_url: embed_thumbnail_url || null,
          whitelist: Array.isArray(whitelist) ? whitelist : [],
          party_templates: Array.isArray(party_templates) ? party_templates : [],
        },
        { onConflict: 'guild_id' }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
