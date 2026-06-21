import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/utils/supabase";

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('discord_id', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { discord_id, duration_days, is_unlimited } = await req.json();

    if (!discord_id) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }

    // Check if user already exists
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discord_id)
      .single();

    let updateData = { discord_id };

    if (is_unlimited) {
      updateData.is_unlimited = true;
      updateData.premium_until = null;
    } else {
      const days = parseInt(duration_days) || 0;
      const now = new Date();
      let currentExpiry = now;

      if (!userError && userProfile && userProfile.premium_until) {
        const profileExpiry = new Date(userProfile.premium_until);
        if (profileExpiry > now) {
          currentExpiry = profileExpiry;
        }
      }

      currentExpiry.setDate(currentExpiry.getDate() + days);
      updateData.is_unlimited = false;
      updateData.premium_until = currentExpiry.toISOString();
    }

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(updateData, { onConflict: 'discord_id' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, user: updateData });
  } catch (error) {
    console.error("Admin Users POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { discord_id, action, value } = await req.json();

    if (!discord_id || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discord_id)
      .single();

    if (fetchError || !userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData = {};

    if (action === 'toggle_unlimited') {
      updateData.is_unlimited = !!value;
      if (updateData.is_unlimited) {
        updateData.premium_until = null;
      } else {
        updateData.premium_until = userProfile.premium_until || new Date().toISOString();
      }
    } else if (action === 'add_days' || action === 'remove_days') {
      const days = parseInt(value) || 0;
      const now = new Date();
      const currentExpires = userProfile.premium_until ? new Date(userProfile.premium_until) : now;
      let baseDate = isNaN(currentExpires.getTime()) ? now : currentExpires;

      if (action === 'add_days' && baseDate < now) baseDate = now;

      let newExpiry = new Date(baseDate.getTime());
      if (action === 'add_days') {
        newExpiry.setDate(newExpiry.getDate() + days);
      } else {
        newExpiry.setDate(newExpiry.getDate() - days);
      }

      updateData.premium_until = newExpiry.toISOString();
      updateData.is_unlimited = false;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('discord_id', discord_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, updatedData: updateData });
  } catch (error) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const discordId = searchParams.get('id');

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('discord_id', discordId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Users DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
