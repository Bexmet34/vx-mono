import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_PRODUCTS = [
  { id: "45902957", title: "3 Months Access",  price: "390.00",  duration_days: 90,  url: "https://www.shopier.com/veyronixbot/45902957" },
  { id: "45902970", title: "1 Year Access",    price: "1200.00", duration_days: 365, url: "https://www.shopier.com/veyronixbot/45902970" },
];

export async function GET() {
  try {
    const patToken = process.env.SHOPIER_PAT_TOKEN;
    if (!patToken) {
      return NextResponse.json(FALLBACK_PRODUCTS);
    }

    const headers = {
      "Authorization": `Bearer ${patToken}`,
      "Accept": "application/json",
      "User-Agent": "VeyronixPlatform/1.0"
    };

    // Önce mağaza ayarlarından shop URL'sini al (bu endpoint çalışıyor ✅)
    let shopUrl = "https://www.shopier.com/veyronixbot";
    try {
      const shopRes = await fetch("https://api.shopier.com/v1/shop/settings", { headers });
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        if (shopData.url) shopUrl = shopData.url;
      }
    } catch (e) {}

    // /v1/products endpoint'ini dene (403 dönebilir - Shopier kısıtlı)
    const response = await fetch("https://api.shopier.com/v1/products", { headers });

    if (response.ok) {
      const data = await response.json();
      // Gerçek ürünleri döndür
      return NextResponse.json(Array.isArray(data) ? data : FALLBACK_PRODUCTS);
    }

    // /v1/products 403 dönerse geçmiş siparişlerden ürün bilgisi çekmeyi dene
    const ordersRes = await fetch("https://api.shopier.com/v1/orders?limit=10", { headers });
    if (ordersRes.ok) {
      const ordersData = await ordersRes.json();
      // Siparişlerden benzersiz ürünleri çıkar
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        const seenIds = new Set();
        const products = [];
        for (const order of ordersData) {
          if (order.product && !seenIds.has(order.product.id)) {
            seenIds.add(order.product.id);
            products.push({
              id: String(order.product.id),
              title: order.product.title || order.product.name,
              price: String(order.product.price || order.totalPrice || "0.00"),
              url: order.product.url || shopUrl,
              duration_days: 30
            });
          }
        }
        if (products.length > 0) {
          return NextResponse.json(products);
        }
      }
    }

    // Hiçbiri çalışmazsa varsayılan paketleri döndür (mağaza URL'siyle)
    return NextResponse.json(FALLBACK_PRODUCTS.map(p => ({ ...p, url: shopUrl })));

  } catch (error) {
    console.error("[Shopier Products GET Error]:", error);
    return NextResponse.json(FALLBACK_PRODUCTS);
  }
}

