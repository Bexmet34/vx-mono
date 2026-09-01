import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patToken = process.env.SHOPIER_PAT_TOKEN;
    if (!patToken) {
      return NextResponse.json({ error: "SHOPIER_PAT_TOKEN bulunamadı." }, { status: 500 });
    }

    // Shopier v1 API ile Mağazadaki Ürünleri Çek
    const response = await fetch("https://api.shopier.com/v1/products", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${patToken}`,
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Shopier Products Error]:", data);
      return NextResponse.json({ error: "Shopier ürünleri çekilemedi.", details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Shopier Products GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
