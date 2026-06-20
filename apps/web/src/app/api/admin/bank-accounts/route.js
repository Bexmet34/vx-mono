import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin Bank Accounts GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bank_name, account_holder, iban, is_active } = await req.json();

    if (!bank_name || !account_holder || !iban) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([{ bank_name, account_holder, iban, is_active: is_active ?? true }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin Bank Accounts POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, is_active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_active })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Bank Accounts PATCH Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== ADMIN_ID && session.user.id !== "407234961582587916")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Bank Accounts DELETE Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
