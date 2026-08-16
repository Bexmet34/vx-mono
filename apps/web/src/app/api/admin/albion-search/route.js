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

  const server = searchParams.get('server') || 'all';

  if (!q || q.length < 3) {
    return NextResponse.json({ error: "En az 3 karakter girilmelidir." }, { status: 400 });
  }

  try {
    const allEndpoints = {
        'americas': 'https://gameinfo.albiononline.com/api/gameinfo/search?q=',
        'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo/search?q=',
        'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo/search?q='
    };
    
    const endpoints = server === 'all' ? Object.values(allEndpoints) : [allEndpoints[server]];

    let allGuilds = [];
    const fetchPromises = endpoints.map(url => 
        fetch(`${url}${encodeURIComponent(q)}`, { signal: AbortSignal.timeout(10000) })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
    );

    const results = await Promise.allSettled(fetchPromises);
    
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.guilds) {
            allGuilds = [...allGuilds, ...result.value.guilds];
        }
    }

    // Tekrarlananları temizle (ID'ye göre filtrele)
    const uniqueGuilds = Array.from(new Map(allGuilds.map(g => [g.Id, g])).values());

    return NextResponse.json({ success: true, guilds: uniqueGuilds.slice(0, 15) });
  } catch (error) {
    return NextResponse.json({ error: "Arama sırasında bir hata oluştu." }, { status: 500 });
  }
}
