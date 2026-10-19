const { supabase } = require('@veyronix/database');

const GEMINI_KEYS = (process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

function slugifyTr(text) {
  const trMap = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o'
  };
  let out = String(text || '');
  for (const [k, v] of Object.entries(trMap)) {
    out = out.replace(new RegExp(k, 'g'), v);
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function extractTagBlock(text, startTag, endTag) {
  const s = text.indexOf(startTag);
  if (s === -1) return null;
  const e = text.indexOf(endTag, s + startTag.length);
  if (e === -1) return null;
  return text.substring(s + startTag.length, e).trim();
}

async function callGemini(systemInstruction, promptText) {
  const keys = (process.env.GEMINI_API_KEY || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  for (const key of keys) {
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: { temperature: 0.7 }
            }),
            signal: AbortSignal.timeout(60000)
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (_) {}
    }
  }
  return null;
}

/**
 * Google Apps Script (otoblog) tarafından İngilizce ('en') olarak eklenen yeni blog yazılarını
 * otomatik yakalar ve Türkiye SEO'su için %100 doğal Türkçe ('tr') rehbere dönüştürür.
 */
async function convertRecentEnglishBlogPosts(limit = 1) {
  try {
    // Son 48 saat içinde Google Apps Script tarafından 'en' olarak eklenmiş yazıları kontrol et
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: enPosts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, description, content, category, tags, published_at')
      .eq('lang', 'en')
      .gte('published_at', cutoff)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error || !enPosts || enPosts.length === 0) {
      return 0;
    }

    let convertedCount = 0;

    for (const post of enPosts) {
      console.log(`[BlogSEO] İngilizce blog yazısı Türkçe SEO'ya dönüştürülüyor: "${post.title}"`);

      const systemInstruction =
        "Sen 10 yıllık deneyime sahip bir Discord sunucu mimarı, Albion Online ZvZ/PvP uzmanı ve Türkçe SEO stratejistisin. 'Veyronix' (veyronix.com.tr) için yazılmış İngilizce makaleyi, Türkiye'deki oyuncuların ve Discord sunucu sahiplerinin Google'da aradığı kelimelere tam uyumlu, %100 DOĞAL ve AKICI TÜRKÇE bir rehbere dönüştürüyorsun.";

      const promptText = `
Aşağıdaki İngilizce blog başlığını ve konusunu, Türkiye'deki kullanıcıların Google'da arayacağı en güçlü TÜRKÇE SEO rehberine dönüştür:
İngilizce Başlık: "${post.title}"
Kategori: "${post.category || 'Rehber'}"

KRİTİK KURALLAR:
1. Başlık ve içerik %100 doğal, akıcı Türkçe olmalı.
2. H2 (##) ve H3 (###) alt başlıkları kullan (H1 # kullanma).
3. Yazı içinde doğal akışta şu resmi Veyronix sayfalarından konuyla ilgili en az 2 tanesine Markdown linki ([metin](url)) ver:
   - [Discord Geçici Ses Kanalı Botu (VoiceForge)](https://veyronix.com.tr/ozellikler/gecici-ses-kanali)
   - [Discord Butonlu Kayıt ve Oto Rol Sistemi](https://veyronix.com.tr/ozellikler/kayit-sistemi)
   - [Albion Online ZvZ Parti Kurucu Botu](https://veyronix.com.tr/ozellikler/parti-kurucu)
   - [Discord Ticket ve Destek Talebi Botu](https://veyronix.com.tr/ozellikler/ticket-destek)
   - [Canlı Albion Online Killboard](https://veyronix.com.tr/killboard)
   - [7/24 Otomatik Twitch Drops Botu](https://twitch.veyronix.com.tr)
4. En az 800-1000 kelime derinliğinde olsun ve sonunda 'Sıkça Sorulan Sorular (SSS)' altında 3 soru-cevap bulunsun.

ÇIKTI FORMATI (KESİN KURAL - JSON KULLANMA):
[[[TITLE_START]]]
(Yüksek tıklama oranlı Türkçe SEO Başlığı)
[[[TITLE_END]]]

[[[DESCRIPTION_START]]]
(2 cümlelik Türkçe Google meta açıklaması)
[[[DESCRIPTION_END]]]

[[[TAGS_START]]]
(Virgülle ayrılmış 5 adet Türkçe anahtar kelime)
[[[TAGS_END]]]

[[[CONTENT_START]]]
(Türkçe Markdown makale içeriği)
[[[CONTENT_END]]]
`;

      const aiText = await callGemini(systemInstruction, promptText);
      if (!aiText) {
        console.warn(`[BlogSEO] Gemini yanıt vermedi, sonraki denemeye bırakıldı: ${post.slug}`);
        continue;
      }

      const trTitle = extractTagBlock(aiText, '[[[TITLE_START]]]', '[[[TITLE_END]]]');
      const trDesc = extractTagBlock(aiText, '[[[DESCRIPTION_START]]]', '[[[DESCRIPTION_END]]]');
      const trTagsRaw = extractTagBlock(aiText, '[[[TAGS_START]]]', '[[[TAGS_END]]]');
      let trContent = extractTagBlock(aiText, '[[[CONTENT_START]]]', '[[[CONTENT_END]]]');

      if (!trTitle || !trContent || trContent.length < 400) {
        console.warn(`[BlogSEO] Eksik içerik döndü, atlanıyor: ${post.slug}`);
        continue;
      }

      trContent = trContent.replace(/^#\s+.*\n+/i, '').trim();
      const newSlug = slugifyTr(trTitle) || post.slug;
      const tagsArray = trTagsRaw
        ? trTagsRaw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : ['discord botu', 'albion online', 'veyronix', 'rehber'];
      const wordCount = trContent.split(/\s+/).length;
      const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

      const trCategory =
        (post.category || '').toLowerCase().includes('albion')
          ? 'Albion Online'
          : (post.category || '').toLowerCase().includes('discord')
          ? 'Discord Rehberleri'
          : 'Oyun Topluluğu';

      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({
          title: trTitle,
          slug: newSlug,
          description: trDesc || `${trTitle} hakkında kapsamlı Türkçe rehber.`,
          content: trContent,
          category: trCategory,
          tags: tagsArray,
          lang: 'tr',
          author_name: 'Veyronix Ekibi',
          read_time_minutes: readTimeMinutes
        })
        .eq('id', post.id);

      if (!updateErr) {
        convertedCount++;
        console.log(`[BlogSEO] ✅ Türkçe SEO'ya dönüştürüldü: "${trTitle}" -> /blog/${newSlug}`);
      } else {
        console.error(`[BlogSEO] Güncelleme hatası (${post.id}):`, updateErr.message);
      }
    }

    return convertedCount;
  } catch (err) {
    console.error('[BlogSEO] convertRecentEnglishBlogPosts hatası:', err.message);
    return 0;
  }
}

module.exports = { convertRecentEnglishBlogPosts };
