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

    const { data: settings, error: settingsError } = await supabase
      .from('guild_settings')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    return NextResponse.json({ 
      settings: settings || null, 
      subscription: subscription || null 
    });
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
    const { 
      language, auto_role_sync, embed_thumbnail_url, whitelist, party_templates,
      albion_guild_id, albion_guild_name, killboard_channel_id, killboard_time,
      registration_enabled, registration_channel_id, registration_staff_role_ids,
      registration_category_id, registration_welcome_message
    } = body;

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
          albion_guild_id: albion_guild_id || null,
          albion_guild_name: albion_guild_name || null,
          killboard_channel_id: killboard_channel_id || null,
          killboard_time: killboard_time || '06:00',
          registration_enabled: registration_enabled ?? false,
          registration_channel_id: registration_channel_id || null,
          registration_staff_role_ids: registration_staff_role_ids || null,
          registration_category_id: registration_category_id || null,
          registration_welcome_message: registration_welcome_message || null,
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
