import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@veyronix/database';
import { checkDashboardAccess } from '@/utils/authUtils';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    const { hasAccess, isOwner } = await checkDashboardAccess(guildId, session.user.id);
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
      subscription: subscription || null,
      isOwner: isOwner
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
      language, embed_thumbnail_url, party_templates,
      log_system_enabled, log_channel_id, log_events, log_exempts,
      albion_guild_id, albion_guild_name, albion_server, killboard_channel_id, killboard_time,
      registration_enabled, registration_channel_id, registration_staff_role_ids,
      registration_category_id, registration_welcome_message, registration_given_role_id,
      registration_given_role_id_2, registration_given_role_id_3,
      registration_given_role_id_4, registration_given_role_id_5,
      registration_guest_role_duration,
      registration_unregistered_role_id, registration_log_channel_id,
      registration_welcome_channel_id, registration_welcome_message_text, auto_role_on_join_id,
      registration_ticket_welcome_message_tr, registration_ticket_welcome_message_en,
      auto_check_enabled, auto_check_interval, auto_check_custom_role_id,
      auto_check_guild_tag, auto_check_log_channel_id,
      system_mode, fixed_message_channel_id, target_category_id,
      channel_name_format, fixed_message_content,
      ticket_system_enabled, ticket_category_id, ticket_channel_id,
      ticket_staff_roles, ticket_message_title, ticket_message_desc,
      ticket_options, auto_delete_party_hours,
      application_enabled, registration_rules_text, application_questions,
      registration_button_type, registration_rules_text_en
    } = body;

    // Upsert: varsa güncelle, yoksa ekle
    const { data, error } = await supabase
      .from('guild_settings')
      .upsert(
        {
          guild_id: guildId,
          owner_id: subscription.owner_id,
          language: language ?? 'tr',
          embed_thumbnail_url: embed_thumbnail_url || null,
          log_system_enabled: log_system_enabled ?? false,
          log_channel_id: log_channel_id || null,
          log_events: { ...(log_events || {"message_delete": true, "message_edit": true, "channel_create": true, "channel_delete": true, "bot_add": true, "member_ban": true}), exempts: log_exempts || null, auto_delete_party_hours: auto_delete_party_hours || 0, registration_button_type: registration_button_type || 'both', registration_rules_text_en: registration_rules_text_en || null },
          party_templates: Array.isArray(party_templates) ? party_templates : [],
          albion_guild_id: albion_guild_id || null,
          albion_guild_name: albion_guild_name || null,
          albion_server: albion_server || 'Europe',
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
          registration_given_role_id_4: registration_given_role_id_4 || null,
          registration_given_role_id_5: registration_given_role_id_5 || null,
          registration_guest_role_duration: registration_guest_role_duration || 7,
          registration_unregistered_role_id: registration_unregistered_role_id || null,
          registration_log_channel_id: registration_log_channel_id || null,
          registration_welcome_channel_id: registration_welcome_channel_id || null,
          registration_welcome_message_text: registration_welcome_message_text || null,
          registration_ticket_welcome_message_tr: registration_ticket_welcome_message_tr || null,
          registration_ticket_welcome_message_en: registration_ticket_welcome_message_en || null,
          auto_role_on_join_id: auto_role_on_join_id || null,
          auto_check_enabled: auto_check_enabled ?? false,
          auto_check_interval: auto_check_interval ?? 3,
          auto_check_custom_role_id: auto_check_custom_role_id || null,
          auto_check_guild_tag: auto_check_guild_tag || null,
          auto_check_log_channel_id: auto_check_log_channel_id || null,
          system_mode: system_mode || 'command',
          fixed_message_channel_id: fixed_message_channel_id || null,
          target_category_id: target_category_id || null,
          channel_name_format: channel_name_format || 'name_title',
          fixed_message_content: fixed_message_content || null,
          ticket_system_enabled: ticket_system_enabled ?? false,
          ticket_category_id: ticket_category_id || null,
          ticket_channel_id: ticket_channel_id || null,
          ticket_staff_roles: ticket_staff_roles || null,
          ticket_message_title: ticket_message_title || 'Destek Talebi',
          ticket_message_desc: ticket_message_desc || 'Lütfen aşağıdaki menüden bir konu seçerek destek talebinizi oluşturun.',
          ticket_options: Array.isArray(ticket_options) ? ticket_options : [{"label": "Genel Destek", "value": "genel", "description": "Genel konular hakkında destek alın", "emoji": "📩"}],
          application_enabled: application_enabled ?? false,
          registration_rules_text: registration_rules_text || null,
          application_questions: Array.isArray(application_questions) ? application_questions : [],
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
