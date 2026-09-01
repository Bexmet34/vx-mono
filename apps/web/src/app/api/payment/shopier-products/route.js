import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const patToken = process.env.SHOPIER_PAT_TOKEN;
    if (!patToken) {
      return NextResponse.json({ error: "SHOPIER_PAT_TOKEN ortam değişkeni tanımlı değil." }, { status: 500 });
    }

    // Shopier v1 API ile Mağazadaki Ürünleri Çek
    const response = await fetch("https://api.shopier.com/v1/products", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${patToken}`,
        "Accept": "application/json",
        "User-Agent": "VeyronixPlatform/1.0"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Shopier Products Error]:", data);
      // Hata alınırsa varsayılan Veyronix paketlerini döndür ki sayfa boş kalmasın
      return NextResponse.json([
        { id: "696547", title: "1 Aylık Sunucu Premium", price: "150.00" },
        { id: "696548", title: "3 Aylık Sunucu Premium", price: "390.00" },
        { id: "696549", title: "1 Yıllık Sunucu Premium", price: "1200.00" }
      ]);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Shopier Products GET Error]:", error);
    // Bağlantı hatasında da varsayılan Veyronix paketlerini dön
    return NextResponse.json([
      { id: "696547", title: "1 Aylık Sunucu Premium", price: "150.00" },
      { id: "696548", title: "3 Aylık Sunucu Premium", price: "390.00" },
      { id: "696549", title: "1 Yıllık Sunucu Premium", price: "1200.00" }
    ]);
  }
}

