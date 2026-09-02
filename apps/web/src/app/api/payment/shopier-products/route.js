import { NextResponse } from 'next/server';
import { getShopierAccessToken } from '@/lib/shopierOAuth';

export const dynamic = 'force-dynamic';

const FALLBACK_PRODUCTS = [
  { 
    id: "45902932", 
    title: "7 Day Access",  
    price: "159.00",  
    duration_days: 7,  
    url: "https://www.shopier.com/veyronixbot/45902932",
    plan_type: "server",
    is_featured: false,
    name_tr: "7 Günlük Premium",
    name_en: "7 Days Premium",
    amount: "159",
    features_tr: ["Sunucu bazlı tüm Veyronix özellikleri", "Gelişmiş bilet (ticket) sistemi", "Gelişmiş bot koruması", "Özel kayıt sistemi", "7 Gün kesintisiz erişim"],
    features_en: ["All server-based Veyronix features", "Advanced ticket system", "Advanced bot protection", "Custom register system", "7 Days uninterrupted access"]
  },
  { 
    id: "45902949", 
    title: "1 Month Access",  
    price: "319.00",  
    duration_days: 30,  
    url: "https://www.shopier.com/veyronixbot/45902949",
    plan_type: "server",
    is_featured: false,
    name_tr: "1 Aylık Premium",
    name_en: "1 Month Premium",
    amount: "319",
    features_tr: ["Sunucu bazlı tüm Veyronix özellikleri", "Gelişmiş bilet (ticket) sistemi", "Gelişmiş bot koruması", "Özel kayıt sistemi", "30 Gün kesintisiz erişim"],
    features_en: ["All server-based Veyronix features", "Advanced ticket system", "Advanced bot protection", "Custom register system", "30 Days uninterrupted access"]
  },
  { 
    id: "45902957", 
    title: "3 Months Access",  
    price: "799.00",  
    duration_days: 90,  
    url: "https://www.shopier.com/veyronixbot/45902957",
    plan_type: "server",
    is_featured: true,
    name_tr: "3 Aylık Premium",
    name_en: "3 Months Premium",
    amount: "799",
    features_tr: ["Sunucu bazlı tüm Veyronix özellikleri", "Gelişmiş bilet (ticket) sistemi", "Gelişmiş bot koruması", "Özel kayıt sistemi", "90 Gün kesintisiz erişim", "%11 İndirim"],
    features_en: ["All server-based Veyronix features", "Advanced ticket system", "Advanced bot protection", "Custom register system", "90 Days uninterrupted access", "11% Discount"]
  },
  { 
    id: "45902970", 
    title: "1 Year Access",    
    price: "1899.00", 
    duration_days: 365, 
    url: "https://www.shopier.com/veyronixbot/45902970",
    plan_type: "server",
    is_featured: false,
    name_tr: "1 Yıllık Premium",
    name_en: "1 Year Premium",
    amount: "1899",
    features_tr: ["Sunucu bazlı tüm Veyronix özellikleri", "Gelişmiş bilet (ticket) sistemi", "Gelişmiş bot koruması", "Özel kayıt sistemi", "365 Gün kesintisiz erişim", "Öncelikli destek"],
    features_en: ["All server-based Veyronix features", "Advanced ticket system", "Advanced bot protection", "Custom register system", "365 Days uninterrupted access", "Priority support"]
  }
];

async function fetchWithToken(token) {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json",
    "User-Agent": "VeyronixPlatform/1.0"
  };

  // Mağaza URL'sini al
  let shopUrl = "https://www.shopier.com/veyronixbot";
  try {
    const shopRes = await fetch("https://api.shopier.com/v1/shop/settings", { headers });
    if (shopRes.ok) {
      const d = await shopRes.json();
      if (d.url) shopUrl = d.url;
    }
  } catch (e) {}

  // Ürünleri çek
  const res = await fetch("https://api.shopier.com/v1/products", { headers });
  return { res, shopUrl, headers };
}

export async function GET() {
  try {
    // 1. Önce OAuth App Token ile dene (yeni uygulama kimlik bilgileri)
    const clientId = process.env.SHOPIER_CLIENT_ID;
    if (clientId) {
      try {
        const oauthToken = await getShopierAccessToken();
        const { res, shopUrl } = await fetchWithToken(oauthToken);

        if (res.ok) {
          const data = await res.json();
          console.log('[Shopier] OAuth token ile ürünler başarıyla çekildi!');
          return NextResponse.json(Array.isArray(data) ? data : FALLBACK_PRODUCTS);
        }
        console.warn('[Shopier] OAuth token ile /v1/products:', res.status);
      } catch (oauthErr) {
        console.warn('[Shopier] OAuth token alınamadı:', oauthErr.message);
      }
    }

    // 2. PAT token ile dene (fallback)
    const patToken = process.env.SHOPIER_PAT_TOKEN;
    if (patToken) {
      const { res, shopUrl } = await fetchWithToken(patToken);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(Array.isArray(data) ? data : FALLBACK_PRODUCTS);
      }
      // PAT ile de 403 gelirse statik ürünleri URL'leriyle döndür
      return NextResponse.json(FALLBACK_PRODUCTS);
    }

    // 3. Her şey başarısız → statik fallback
    return NextResponse.json(FALLBACK_PRODUCTS);

  } catch (error) {
    console.error('[Shopier Products GET Error]:', error);
    return NextResponse.json(FALLBACK_PRODUCTS);
  }
}

