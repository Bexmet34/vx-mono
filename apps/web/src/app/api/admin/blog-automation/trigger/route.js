import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Sluggify yardımcısı
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

function calculateReadTime(content = '') {
  const words = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// 40+ Yüksek SEO Değerli Varsayılan Konu Havuzu
const DEFAULT_TOPICS = [
  { category: 'Albion Online', topic: 'Albion Online 2026 Black Zone Rehberi: Tehlikeli Bölgelerde Hayatta Kalma ve Gankten Kaçma Taktikleri' },
  { category: 'Albion Online', topic: 'Albion Online ZvZ (Guild vs Guild) Parti Yapısı: Rol Dağılımları, Caller Taktikleri ve Ekipman Seçimi' },
  { category: 'Albion Online', topic: 'Albion Online Parti Organizasyonu: Discord Uyumlu Parti Kurma ve Hızlı Katılım Taktikleri' },
  { category: 'Discord Rehberleri', topic: 'Discord Sunucusu Nasıl Büyütülür? 2026 Etkili Oyun Topluluk Yönetimi İpuçları' },
  { category: 'Discord Rehberleri', topic: 'Oyun Sunucuları İçin Olmazsa Olmaz Discord Botları ve Otomatik Rol Yönetimi' },
  { category: 'Guild Yönetimi', topic: 'Başarılı Bir Oyun Klanı (Guild/Lonca) Yönetmenin 7 Altın Kuralı ve Discord Düzeni' },
  { category: 'Strateji', topic: 'MMORPG Oyunlarında Takım Çalışması ve İletişim: Discord Ses Kanalları Nasıl Yapılandırılmalı?' }
];

export async function POST() {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY ortam değişkeni bulunamadı. Lütfen ortam değişkenlerinize Google Gemini API key ekleyin.' 
      }, { status: 400 });
    }

    // 1. Önce henüz kullanılmamış özel anahtar kelime var mı kontrol et
    let targetTopic = null;
    let customKeywordRecord = null;

    const { data: unusedKeywords } = await supabase
      .from('blog_custom_keywords')
      .select('*')
      .eq('is_used', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1);

    if (unusedKeywords && unusedKeywords.length > 0) {
      customKeywordRecord = unusedKeywords[0];
      targetTopic = {
        category: customKeywordRecord.category || 'Rehber',
        topic: customKeywordRecord.keyword
      };
    } else {
      // Varsayılan havuzdan rastgele seç
      targetTopic = DEFAULT_TOPICS[Math.floor(Math.random() * DEFAULT_TOPICS.length)];
    }

    // 2. Gemini API ile makaleyi üret
    const prompt = `
Sen Veyronix (Albion Online parti botu ve Discord topluluk otomasyonu) platformunda kıdemli bir oyun ve SEO editörüsün.
Aşağıdaki konu/anahtar kelime hakkında Türkçe, Google AdSense standartlarına uygun, özgün, akıcı ve en az 1000 kelimelik kapsayıcı bir blog yazısı hazırla.

Konu / Anahtar Kelime: "${targetTopic.topic}"
Kategori: "${targetTopic.category}"

Yazının Yapısı:
1. Giriş bölümü (Okuyucuyu yakalayan ilgi çekici giriş).
2. En az 4 adet H2 başlığı ve gerekli H3 alt başlıkları.
3. Maddeli liste (ul/ol) formatında pratik ipuçları.
4. Kod / Discord komutu / Ekipman tablosu önerisi (gerekirse).
5. Sıkça Sorulan Sorular (SSS) bölümü (En az 3 SSS soru-cevap).
6. Sonuç ve Veyronix Discord Botuna Yönlendirme (Call to Action).

Lütfen tam olarak aşağıdaki JSON formatında yanıt ver (Başka hiçbir metin ekleme, sadece saf JSON üret):

{
  "title": "SEO Uyumlu Çarpıcı Başlık",
  "description": "Meta description (140-160 karakter arası etkileyici özet)",
  "tags": ["tag1", "tag2", "tag3"],
  "imagePrompt": "English prompt for image generation describing the article theme",
  "content": "Markdown formatında 1000+ kelimelik tam makale metni"
}
`;

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
      return NextResponse.json({ error: `Gemini API Hatası: ${errText}` }, { status: 500 });
    }

    const aiData = await response.json();
    const rawJsonText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      return NextResponse.json({ error: 'Gemini yanıt üretmedi.' }, { status: 500 });
    }

    const article = JSON.parse(rawJsonText);
    const baseSlug = slugify(article.title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const cleanImagePrompt = encodeURIComponent(`${article.imagePrompt || targetTopic.topic}, gaming art, high resolution, dark neon gaming background, 8k`);
    const coverImage = `https://image.pollinations.ai/prompt/${cleanImagePrompt}?width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

    const readTimeMinutes = calculateReadTime(article.content);

    // 3. Supabase'e kaydet
    const { data: dbData, error: dbError } = await supabase
      .from('blog_posts')
      .insert([{
        slug: slug,
        title: article.title,
        description: article.description,
        content: article.content,
        cover_image: coverImage,
        category: targetTopic.category,
        tags: article.tags || [targetTopic.category.toLowerCase()],
        author_name: 'Veyronix AI Editör',
        author_avatar: 'https://veyronix.com.tr/icon.svg',
        read_time_minutes: readTimeMinutes,
        lang: 'tr',
        status: 'published',
        published_at: new Date().toISOString()
      }])
      .select();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 4. Özel anahtar kelime kullanıldıysa durumunu güncelle
    if (customKeywordRecord) {
      await supabase
        .from('blog_custom_keywords')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', customKeywordRecord.id);
    }

    return NextResponse.json({
      success: true,
      message: `"${article.title}" başarıyla üretildi ve yayınlandı!`,
      post: dbData[0]
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
