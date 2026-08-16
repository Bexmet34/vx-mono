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
    .from('auto_premium_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, rule_name, albion_guilds, discord_servers, premium_type, days_to_give } = body;

    let result;
    if (id) {
      // Update
      const { data, error } = await supabase
        .from('auto_premium_rules')
        .update({ rule_name, albion_guilds, discord_servers, premium_type, days_to_give })
        .eq('id', id)
        .select();
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('auto_premium_rules')
        .insert([{ rule_name, albion_guilds, discord_servers, premium_type, days_to_give }])
        .select();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Rules POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from('auto_premium_rules').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
