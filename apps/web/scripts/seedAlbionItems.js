require('dotenv').config({ path: '../../.env' });
const { createClient } = require('@supabase/supabase-js');

// Load environment variables for Supabase
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error("HATA: Supabase URL veya KEY bulunamadı. Lütfen .env dosyasını kontrol edin.");
  process.exit(1);
}

const supabase = createClient(url, key);

const ITEMS_URL = "https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json";

async function run() {
  console.log("AO Veri İndiriliyor...");
  
  let data;
  try {
    const response = await fetch(ITEMS_URL);
    data = await response.json();
  } catch (err) {
    console.error("Veri indirilemedi:", err);
    return;
  }

  console.log(`Toplam ${data.length} adet ham eşya verisi bulundu. Temizleniyor...`);

  const families = new Map();

  for (const item of data) {
    const uniqueName = item.UniqueName;
    if (!uniqueName || !item.LocalizedNames) continue;
    
    // Yalnızca kullanıcının giyebileceği eşyaları filtreliyoruz (trash, resource vb. hariç)
    let category = null;
    if (uniqueName.includes('_MAIN_') || uniqueName.includes('_2H_')) category = 'weapon';
    else if (uniqueName.includes('_HEAD_')) category = 'head';
    else if (uniqueName.includes('_ARMOR_')) category = 'chest';
    else if (uniqueName.includes('_SHOES_')) category = 'shoes';
    else if (uniqueName.includes('_OFF_')) category = 'offhand';
    else if (uniqueName.includes('_POTION_')) category = 'potion';
    else if (uniqueName.includes('_MEAL_')) category = 'food';

    // Eğer kategorisi yoksa atla
    if (!category) continue;

    // Eşyaların geneli "T4_...", "T5_..." şeklinde başlıyor.
    const tierMatch = uniqueName.match(/^T(\d+)_/);
    if (!tierMatch) continue;
    const tier = parseInt(tierMatch[1], 10);
    
    // Aile adını çıkarıyoruz (Örn: "HEAD_LEATHER_SET1")
    const familyName = uniqueName.replace(/^T\d+_/, '');
    
    // Eğer aynı ailenin daha yüksek tier'lı bir versiyonu yoksa, bunu ekle/güncelle
    if (!families.has(familyName) || families.get(familyName).tier < tier) {
      families.set(familyName, {
        unique_name: uniqueName,
        name_en: item.LocalizedNames['EN-US'],
        name_tr: item.LocalizedNames['TR-TR'] || item.LocalizedNames['EN-US'],
        category,
        tier
      });
    }
  }

  const itemsToInsert = Array.from(families.values());
  console.log(`Toplam ${itemsToInsert.length} adet Eşsiz & Maksimum Tier eşya filtrelendi. Supabase'e yükleniyor...`);

  // Chunking for insert to avoid hitting payload limits
  const CHUNK_SIZE = 500;
  for (let i = 0; i < itemsToInsert.length; i += CHUNK_SIZE) {
    const chunk = itemsToInsert.slice(i, i + CHUNK_SIZE);
    
    const { error } = await supabase.from('albion_items').upsert(chunk, { onConflict: 'unique_name' });
    
    if (error) {
      console.error("Yükleme sırasında hata oluştu:", error);
    } else {
      console.log(`[${i + chunk.length} / ${itemsToInsert.length}] başarıyla yüklendi.`);
    }
  }

  console.log("Tüm yükleme işlemleri başarıyla tamamlandı!");
}

run();
