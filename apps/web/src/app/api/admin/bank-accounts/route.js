import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2;
const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminUser(session.user?.id)) {
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
    if (!session || !isAdminUser(session.user?.id)) {
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
    if (!session || !isAdminUser(session.user?.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, is_active, bank_name, account_holder, iban } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    // Güncelleme objesi: gönderilen alanları güncelle
    const updateFields = {};
    if (is_active !== undefined) updateFields.is_active = is_active;
    if (bank_name !== undefined) updateFields.bank_name = bank_name;
    if (account_holder !== undefined) updateFields.account_holder = account_holder;
    if (iban !== undefined) updateFields.iban = iban;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan gönderilmedi" }, { status: 400 });
    }

    const { error } = await supabase
      .from('bank_accounts')
      .update(updateFields)
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
    if (!session || !isAdminUser(session.user?.id)) {
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
