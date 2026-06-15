import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    const { data: settings, error: settingsError } = await supabase
      .from('guild_role_menus')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    const { data: globalRoles, error: rolesError } = await supabase
      .from('global_roles')
      .select('*')
      .order('created_at', { ascending: true });

    return NextResponse.json({ 
      settings: settings || null, 
      global_roles: globalRoles || []
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
    
    // Check if this is a setup trigger or send menu trigger
    if (body.action === 'setup') {
      const { error } = await supabase
        .from('guild_role_menus')
        .upsert(
          { guild_id: guildId, trigger_roles_setup: true },
          { onConflict: 'guild_id' }
        );
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Role setup triggered" });
    }
    
    if (body.action === 'send_menu') {
      const { error } = await supabase
        .from('guild_role_menus')
        .upsert(
          { guild_id: guildId, trigger_roles_menu_send: true },
          { onConflict: 'guild_id' }
        );
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Menu send triggered" });
    }

    // Normal settings save
    const { 
      channel_id, active_roles, category_limits, header_image_url
    } = body;

    const { data, error } = await supabase
      .from('guild_role_menus')
      .upsert(
        {
          guild_id: guildId,
          channel_id: channel_id || null,
          active_roles: active_roles || [],
          category_limits: category_limits || { combat: 5, economy: 5, crafting: 5 },
          header_image_url: header_image_url || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'guild_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
