/**
 * Veyronix Otomatik Blog İçerik Üretici (0 TL Maliyetli - Google Gemini API + Pollinations.ai)
 * 
 * Bu script Google Gemini 2.0 / 1.5 Flash (Ücretsiz API Key) kullanarak 
 * SEO uyumlu 1000+ kelimelik zengin Türkçe rehberler oluşturur ve Supabase'e kaydeder.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase Bağlantısı
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ HATA: SUPABASE_URL veya SUPABASE_KEY ortam değişkeni bulunamadı.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// 40+ Yüksek SEO Değerli Varsayılan Konu Havuzu
const TOPIC_POOL = [
  { category: 'Albion Online', topic: 'Albion Online 2026 Black Zone Rehberi: Tehlikeli Bölgelerde Hayatta Kalma ve Gankten Kaçma Taktikleri' },
  { category: 'Albion Online', topic: 'Albion Online ZvZ (Guild vs Guild) Parti Yapısı: Rol Dağılımları, Caller Taktikleri ve Ekipman Seçimi' },
  { category: 'Albion Online', topic: 'Albion Online Parti Organizasyonu: Discord Uyumlu Parti Kurma ve Hızlı Katılım Taktikleri' },
  { category: 'Albion Online', topic: 'Albion Online Static Dungeon ve Ava Dungeon Rehberi: En Hızlı Silver ve FAME Kasmak İçin Parti Dizilimleri' },
  { category: 'Albion Online', topic: 'Albion Online Ekonomi ve Market Rehberi: Günlük 10M+ Silver Kazanma Yolları ve Taşımacılık' },
  { category: 'Discord Rehberleri', topic: 'Discord Sunucusu Nasıl Büyütülür? 2026 Etkili Oyun Topluluğu Yönetimi İpuçları' },
  { category: 'Discord Rehberleri', topic: 'Oyun Sunucuları İçin Olmazsa Olmaz Discord Botları ve Otomatik Rol Yönetimi' },
  { category: 'Discord Rehberleri', topic: 'Discord Güvenlik ve Moderasyon Rehberi: Raid, Spam ve Saldırılara Karşı Koruma Yöntemleri' },
  { category: 'Guild Yönetimi', topic: 'Başarılı Bir Oyun Klanı (Guild/Lonca) Yönetmenin 7 Altın Kuralı ve Discord Düzeni' },
  { category: 'Guild Yönetimi', topic: 'Oyun Topluluklarında Etkinlik Zamanlaması ve Üye Katılımını %200 Artırma Stratejileri' },
  { category: 'Strateji', topic: 'MMORPG Oyunlarında Takım Çalışması ve İletişim: Discord Ses Kanalları Nasıl Yapılandırılmalı?' },
  { category: 'Strateji', topic: 'Hardcore Oyun Sunucularında Rol Bazlı Yetkilendirme ve Üye Takibi Rehberi' }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadTime(content) {
  const words = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function generateArticle() {
  if (!geminiApiKey) {
    console.error('❌ HATA: GEMINI_API_KEY eksik!');
    console.log('👉 Google AI Studio (https://aistudio.google.com) adresinden ücretsiz API Key alabilirsiniz.');
    process.exit(1);
  }

  // 1. Önce Admin Panelinden Eklenen Henüz Kullanılmamış Özel Anahtar Kelime Var mı Kontrol Et
  let selected = null;
  let customRecord = null;

  try {
    const { data: customKeywords } = await supabase
      .from('blog_custom_keywords')
      .select('*')
      .eq('is_used', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1);

    if (customKeywords && customKeywords.length > 0) {
      customRecord = customKeywords[0];
      selected = {
        category: customRecord.category || 'Rehber',
        topic: customRecord.keyword
      };
      console.log(`🎯 Admin Panelinden Eklenen Özel Konu Seçildi: "${selected.topic}" (Kategori: ${selected.category})`);
    }
  } catch (err) {
    console.warn('⚠️ Özel anahtar kelimeler çekilirken uyarı:', err.message);
  }

  // Eğer özel anahtar kelime bulunamadıysa varsayılan havuzdan seç
  if (!selected) {
    selected = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
    console.log(`🎲 Varsayılan Konu Havuzundan Seçildi [${selected.category}]: "${selected.topic}"`);
  }

  const prompt = `
Sen Veyronix (Albion Online parti botu ve Discord topluluk otomasyonu) platformunda kıdemli bir oyun ve SEO editörüsün.
Aşağıdaki konu/anahtar kelime hakkında Türkçe, Google AdSense standartlarına uygun, özgün, akıcı ve en az 1000 kelimelik kapsayıcı bir blog yazısı hazırla.

Konu / Anahtar Kelime: "${selected.topic}"
Kategori: "${selected.category}"

Yazının Yapısı:
1. Giriş bölümü (Okuyucuyu yakalayan ilgi çekici giriş).
2. En az 4 adet H2 başlığı ve gerekli H3 alt başlıkları.
3. Maddeli liste (ul/ol) formatında pratik ipuçları.
4. Kod / Discord komutu / Ekipman tablosu önerisi (gerekirse).
5. Sıkça Sorulan Sorular (SSS) bölümü (En az 3 SSS soru-cevap).
6. Sonuç ve Veyronix Discord Botuna Yönlendirme (Call to Action).

Lütfen tam olarak aşağıdaki JSON formatında yanıt ver (Başka hiçbir giriş/çıkış metni ekleme, sadece saf JSON üret):

{
  "title": "SEO Uyumlu Çarpıcı Başlık",
  "description": "Meta description (140-160 karakter arası etkileyici özet)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "imagePrompt": "English prompt for image generation describing the article theme",
  "content": "Markdown formatında 1000+ kelimelik tam makale metni"
}
`;

  console.log('🤖 Google Gemini 2.0 Flash API çağrılıyor...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Hatası (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJsonText) {
      throw new Error('Gemini API boş yanıt döndürdü!');
    }

    const articleData = JSON.parse(rawJsonText);
    
    const baseSlug = slugify(articleData.title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const cleanImagePrompt = encodeURIComponent(`${articleData.imagePrompt || selected.topic}, gaming art, high resolution, dark neon gaming background, 8k`);
    const coverImage = `https://image.pollinations.ai/prompt/${cleanImagePrompt}?width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    const readTimeMinutes = calculateReadTime(articleData.content);

    console.log(`✅ Makale Başarıyla Üretildi: "${articleData.title}"`);
    console.log(`📊 Okuma Süresi: ${readTimeMinutes} dk | Kelime Sayısı: ~${articleData.content.split(/\s+/).length}`);

    // Supabase'e ekle
    console.log('💾 Supabase blog_posts tablosuna kaydediliyor...');

    const { data: dbData, error: dbError } = await supabase
      .from('blog_posts')
      .insert([{
        slug: slug,
        title: articleData.title,
        description: articleData.description,
        content: articleData.content,
        cover_image: coverImage,
        category: selected.category,
        tags: articleData.tags || [selected.category.toLowerCase()],
        author_name: 'Veyronix AI Editör',
        author_avatar: 'https://veyronix.com.tr/icon.svg',
        read_time_minutes: readTimeMinutes,
        lang: 'tr',
        status: 'published',
        published_at: new Date().toISOString()
      }])
      .select();

    if (dbError) {
      throw new Error(`Supabase Veritabanı Hatası: ${dbError.message}`);
    }

    // Özel anahtar kelime kullanıldıysa durumunu güncelle
    if (customRecord) {
      await supabase
        .from('blog_custom_keywords')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', customRecord.id);
      console.log(`📌 Özel anahtar kelime kullanıldı olarak işaretlendi: "${customRecord.keyword}"`);
    }

    console.log('🎉 TEBRİKLER! Otomatik blog yazısı başarıyla Supabase\'e eklendi ve canlıya alındı!');
    console.log(`🔗 Slug: /blog/${slug}`);

  } catch (error) {
    console.error('❌ İşlem Başarısız:', error.message);
    process.exit(1);
  }
}

generateArticle();
