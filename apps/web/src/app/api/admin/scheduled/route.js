import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

// Helper to check admin access
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    // If id is provided, update existing
    if (body.id) {
      const { error } = await supabase
        .from('scheduled_messages')
        .update({
          message_content: body.message_content,
          ping_everyone: body.ping_everyone,
          buttons: body.buttons || [],
          schedule_type: body.schedule_type,
          send_time: body.send_time,
          is_active: body.is_active !== undefined ? body.is_active : true
        })
        .eq('id', body.id);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Updated successfully" });
    } else {
      // Create new
      const { error } = await supabase
        .from('scheduled_messages')
        .insert([{
          message_content: body.message_content,
          ping_everyone: body.ping_everyone || false,
          buttons: body.buttons || [],
          schedule_type: body.schedule_type,
          send_time: body.send_time,
          is_active: true
        }]);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "Created successfully" });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase
      .from('scheduled_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
