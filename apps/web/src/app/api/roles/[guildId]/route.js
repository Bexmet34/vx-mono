import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@veyronix/database';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    const { data: configs, error: settingsError } = await supabase
      .from('custom_role_menus')
      .select('*')
      .eq('guild_id', guildId)
      .order('updated_at', { ascending: false });

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      configs: configs || []
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
    
    if (body.action === 'send_menu') {
      if (!body.id) {
        return NextResponse.json({ error: "Configuration ID is required to send menu" }, { status: 400 });
      }
      const { error } = await supabase
        .from('custom_role_menus')
        .update({ trigger_menu_send: true })
        .eq('id', body.id)
        .eq('guild_id', guildId);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Menu send triggered" });
    }

    // Save/Upsert configuration
    const { 
      id, channel_id, embed_title, embed_description, embed_color, embed_image_url, menus
    } = body;

    const payload = {
      guild_id: guildId,
      channel_id: channel_id || null,
      embed_title: embed_title || 'Rol Seçimi',
      embed_description: embed_description || 'Rollerinizi aşağıdaki menülerden seçebilirsiniz.',
      embed_color: embed_color || '#fca311',
      embed_image_url: embed_image_url || null,
      menus: menus || [],
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      // Update existing
      result = await supabase
        .from('custom_role_menus')
        .update(payload)
        .eq('id', id)
        .eq('guild_id', guildId)
        .select()
        .single();
    } else {
      // Insert new
      result = await supabase
        .from('custom_role_menus')
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Configuration ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from('custom_role_menus')
      .delete()
      .eq('id', id)
      .eq('guild_id', guildId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Configuration deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
