import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/utils/supabase';
import { checkDashboardAccess } from '@/utils/authUtils';

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

    const { hasAccess, subscription } = await checkDashboardAccess(guildId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      language, auto_role_sync, embed_thumbnail_url, whitelist, party_templates,
      albion_guild_id, albion_guild_name, killboard_channel_id, killboard_time,
      registration_enabled, registration_channel_id, registration_staff_role_ids,
      registration_category_id, registration_welcome_message, registration_given_role_id,
      registration_given_role_id_2, registration_given_role_id_3,
      registration_unregistered_role_id, registration_log_channel_id,
      registration_welcome_channel_id, registration_welcome_message_text, auto_role_on_join_id,
      auto_check_enabled, auto_check_interval, auto_check_custom_role_id,
      auto_check_guild_tag, auto_check_log_channel_id
    } = body;

    // Upsert: varsa güncelle, yoksa ekle
    const { data, error } = await supabase
      .from('guild_settings')
      .upsert(
        {
          guild_id: guildId,
          owner_id: subscription.owner_id,
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
          registration_given_role_id: registration_given_role_id || null,
          registration_given_role_id_2: registration_given_role_id_2 || null,
          registration_given_role_id_3: registration_given_role_id_3 || null,
          registration_unregistered_role_id: registration_unregistered_role_id || null,
          registration_log_channel_id: registration_log_channel_id || null,
          registration_welcome_channel_id: registration_welcome_channel_id || null,
          registration_welcome_message_text: registration_welcome_message_text || null,
          auto_role_on_join_id: auto_role_on_join_id || null,
          auto_check_enabled: auto_check_enabled ?? false,
          auto_check_interval: auto_check_interval ?? 3,
          auto_check_custom_role_id: auto_check_custom_role_id || null,
          auto_check_guild_tag: auto_check_guild_tag || null,
          auto_check_log_channel_id: auto_check_log_channel_id || null,
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
