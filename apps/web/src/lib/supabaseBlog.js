import { supabase } from '@veyronix/database';
import { LINKS } from '@veyronix/config';

// Helper to query with a timeout for fast fallback
async function fetchWithTimeout(promise, timeoutMs = 15000) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Supabase fetch timeout')), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch (err) {
    clearTimeout(timeoutHandle);
    throw err;
  }
}

// Kalıcı bellek içi önbellek (In-Memory Delta Cache)
// Tüm tabloyu tekrar tekrar çekmek yerine yalnızca yeni blog eklendiğinde sadece yeni eklenen kaydı çeker.
let allPostsCache = null;
let lastDeltaCheckTime = 0;
const DELTA_CHECK_INTERVAL = 30 * 60 * 1000; // 30 dakikada bir sadece "yeni yazı var mı?" kontrolü (2 byte yanıt)

// Tekil blog yazıları yayınlandıktan sonra değişmediği için kalıcı olarak RAM'de tutulur (Admin düzenlemesinde sıfırlanır)
const singlePostCache = new Map();

function mapRowToPostSummary(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description || '',
    coverImage: post.cover_image || null,
    category: post.category || 'Rehber',
    tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',').map(t => t.trim()) : []),
    authorName: post.author_name || 'Veyronix Ekibi',
    authorAvatar: post.author_avatar || LINKS.LOGO_URL,
    readTimeMinutes: post.read_time_minutes || 3,
    lang: post.lang || (post.slug?.endsWith('-en') ? 'en' : 'tr'),
    publishedAt: post.published_at || post.created_at,
    viewsCount: post.views_count || 0
  };
}

/**
 * Admin panelinden yeni yazı eklendiğinde, güncellendiğinde veya silindiğinde önbelleği anında temizler/günceller.
 */
export function invalidateBlogCache(slug = null) {
  allPostsCache = null;
  lastDeltaCheckTime = 0;
  if (slug) {
    singlePostCache.delete(slug);
  } else {
    singlePostCache.clear();
  }
}

/**
 * Tüm yayınlanmış blog yazılarını liste formatında getirir.
 * İlk yüklemeden sonra tüm tabloyu bir daha çekmez; yalnızca son yazıdan daha yeni eklenen blog varsa onu çeker.
 */
export async function getAllBlogPosts() {
  const now = Date.now();

  // 1. Önbellek zaten doluysa: Süre dolmadıysa direkt RAM'den dön
  if (allPostsCache && allPostsCache.length > 0) {
    if (now - lastDeltaCheckTime < DELTA_CHECK_INTERVAL) {
      return allPostsCache;
    }

    // Süre dolduysa tüm tabloyu (285 KB) çekmek yerine sadece son yazıdan sonra yeni blog eklendi mi diye bak (Delta sorgusu: ~2 byte)
    lastDeltaCheckTime = now;
    const latestPublishedAt = allPostsCache[0]?.publishedAt;
    if (latestPublishedAt) {
      try {
        const { data: newRows, error: deltaErr } = await fetchWithTimeout(
          supabase
            .from('blog_posts')
            .select('id, slug, title, description, cover_image, category, tags, author_name, author_avatar, read_time_minutes, lang, published_at, created_at, views_count')
            .eq('status', 'published')
            .gt('published_at', latestPublishedAt)
            .order('published_at', { ascending: false }),
          10000
        );

        if (!deltaErr && Array.isArray(newRows) && newRows.length > 0) {
          const existingIds = new Set(allPostsCache.map(p => p.id));
          const mappedNew = newRows
            .filter(r => !existingIds.has(r.id))
            .map(mapRowToPostSummary);
          if (mappedNew.length > 0) {
            allPostsCache = [...mappedNew, ...allPostsCache];
          }
        }
      } catch (err) {
        console.warn('[SupabaseBlog] Delta check error:', err.message);
      }
      return allPostsCache;
    }
  }

  // 2. İlk başlangıç yüklemesi (Sunucu açıldığında yalnızca 1 kez çalışır)
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('blog_posts')
        .select('id, slug, title, description, cover_image, category, tags, author_name, author_avatar, read_time_minutes, lang, published_at, created_at, views_count')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
      15000
    );

    if (!error && data && data.length > 0) {
      allPostsCache = data.map(mapRowToPostSummary);
      lastDeltaCheckTime = Date.now();
      return allPostsCache;
    }
  } catch (err) {
    console.warn('[SupabaseBlog] Initial fetch error:', err.message);
  }

  return allPostsCache || [];
}

/**
 * Slug'a göre tek bir blog yazısını getirir.
 * Bir kez çekilen yazı kalıcı olarak RAM'de tutulur, tekrar tekrar Supabase'den çekilmez.
 */
export async function getBlogPostBySlug(slug) {
  if (!slug) return null;

  if (singlePostCache.has(slug)) {
    return singlePostCache.get(slug);
  }

  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle(),
      15000
    );

    if (!error && data) {
      const post = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description || '',
        content: data.content,
        coverImage: data.cover_image || null,
        category: data.category || 'Rehber',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : []),
        authorName: data.author_name || 'Veyronix Ekibi',
        authorAvatar: data.author_avatar || LINKS.LOGO_URL,
        readTimeMinutes: data.read_time_minutes || calculateReadTime(data.content),
        lang: data.lang || (data.slug.endsWith('-en') ? 'en' : 'tr'),
        publishedAt: data.published_at || data.created_at,
        viewsCount: data.views_count || 0
      };
      singlePostCache.set(slug, post);
      return post;
    }
  } catch (err) {
    console.warn(`[SupabaseBlog] Single post fetch error for "${slug}":`, err.message);
  }

  return null;
}

/**
 * İlgili diğer makaleleri getirir (Aynı dil ve aynı kategori öncelikli)
 */
export async function getRelatedPosts(currentSlug, category, limit = 3, currentLang = 'tr') {
  const allPosts = await getAllBlogPosts();
  const catLower = (category || '').toLowerCase();
  return allPosts
    .filter(p => p.slug !== currentSlug)
    .sort((a, b) => {
      const aLang = (a.lang || 'tr') === currentLang ? 1 : 0;
      const bLang = (b.lang || 'tr') === currentLang ? 1 : 0;
      if (aLang !== bLang) return bLang - aLang;
      const aCat = catLower && (a.category || '').toLowerCase() === catLower ? 1 : 0;
      const bCat = catLower && (b.category || '').toLowerCase() === catLower ? 1 : 0;
      return bCat - aCat;
    })
    .slice(0, limit);
}

/**
 * Okuma süresi hesaplama yardımcısı (kelime sayısı / 200)
 */
export function calculateReadTime(content = '') {
  const words = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
