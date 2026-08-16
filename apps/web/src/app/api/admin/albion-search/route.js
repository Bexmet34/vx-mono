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
    const endpoints = [
        'https://gameinfo.albiononline.com/api/gameinfo/search?q=',
        'https://gameinfo-sg.albiononline.com/api/gameinfo/search?q=',
        'https://gameinfo-ams.albiononline.com/api/gameinfo/search?q='
    ];

    let allGuilds = [];
    for (const url of endpoints) {
        const res = await fetch(`${url}${encodeURIComponent(q)}`);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.guilds) {
            allGuilds = [...allGuilds, ...data.guilds];
        }
    }

    // Tekrarlananları temizle (Farklı API'lerden aynı isim gelebilir mi? ID'ye göre filtrele)
    const uniqueGuilds = Array.from(new Map(allGuilds.map(g => [g.Id, g])).values());

    return NextResponse.json({ success: true, guilds: uniqueGuilds.slice(0, 15) });
  } catch (error) {
    return NextResponse.json({ error: "Arama sırasında bir hata oluştu." }, { status: 500 });
  }
}
