import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";
const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.length < 3) {
    return NextResponse.json({ error: "En az 3 karakter girilmelidir." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Albion API Error");
    const data = await res.json();
    
    // We only care about guilds
    const guilds = data.guilds || [];
    return NextResponse.json({ success: true, guilds: guilds.slice(0, 10) }); // return top 10 matches
  } catch (error) {
    return NextResponse.json({ error: "Arama sırasında bir hata oluştu." }, { status: 500 });
  }
}
