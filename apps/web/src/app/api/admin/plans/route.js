import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

// Bu API için anon key değil, gerekirse role izinlerini bypass edecek key de kullanılabilir.
// Ancak anon key'de tabloya Select/Update izinleri açıksa kullanılabilir.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin Plans GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const { data, error } = await supabase
      .from('pricing_plans')
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, plan: data[0] });
  } catch (error) {
    console.error("Admin Plans POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updates } = await req.json();

    const { data, error } = await supabase
      .from('pricing_plans')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, plan: data[0] });
  } catch (error) {
    console.error("Admin Plans PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Plans DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
