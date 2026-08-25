import { supabase } from '@veyronix/database';
import { getAllPosts as getLocalMarkdownPosts, getPostBySlug as getLocalPostBySlug } from './markdown';
import { LINKS } from '@veyronix/config';

// Helper to query with a fast timeout
async function fetchWithTimeout(promise, timeoutMs = 2500) {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs);
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

/**
 * Tüm yayınlanmış blog yazılarını getirir (Supabase + Local Markdown Yedekli)
 */
export async function getAllBlogPosts() {
  let supabasePosts = [];
  
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
      2500
    );

    if (!error && data && data.length > 0) {
      supabasePosts = data.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        coverImage: post.cover_image || null,
        category: post.category || 'Rehber',
        tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',') : []),
        authorName: post.author_name || 'Veyronix Ekibi',
        authorAvatar: post.author_avatar || LINKS.LOGO_URL,
        readTimeMinutes: post.read_time_minutes || calculateReadTime(post.content),
        lang: post.lang || 'tr',
        publishedAt: post.published_at || post.created_at,
        isFromSupabase: true
      }));
    }
  } catch (err) {
    // Gracefully fallback to local posts
  }

  // Yerel markdown dosyalarını da dönüştür ve ekle
  const localPosts = getLocalMarkdownPosts().map(p => ({
    id: p.slug,
    slug: p.slug,
    title: p.meta.title || p.slug,
    description: p.meta.description || '',
    content: p.content,
    coverImage: p.meta.coverImage || null,
    category: p.meta.category || (p.meta.tags ? p.meta.tags.split(',')[0] : 'Rehber'),
    tags: p.meta.tags ? p.meta.tags.split(',').map(t => t.trim()) : [],
    authorName: p.meta.author || 'Veyronix Ekibi',
    authorAvatar: LINKS.LOGO_URL,
    readTimeMinutes: calculateReadTime(p.content),
    lang: p.meta.lang || 'tr',
    publishedAt: p.meta.date || new Date().toISOString(),
    isFromSupabase: false
  }));

  // Supabase postları ve local postları slug'a göre tekilleştir (Supabase öncelikli)
  const map = new Map();
  supabasePosts.forEach(p => map.set(p.slug, p));
  localPosts.forEach(p => {
    if (!map.has(p.slug)) map.set(p.slug, p);
  });

  const merged = Array.from(map.values());
  merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return merged;
}

/**
 * Slug'a göre tek bir blog yazısını getirir
 */
export async function getBlogPostBySlug(slug) {
  // Önce yerel dosyayı hızlıca kontrol et
  const local = getLocalPostBySlug(slug);

  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single(),
      2000
    );

    if (!error && data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        content: data.content,
        coverImage: data.cover_image || null,
        category: data.category || 'Rehber',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',') : []),
        authorName: data.author_name || 'Veyronix Ekibi',
        authorAvatar: data.author_avatar || LINKS.LOGO_URL,
        readTimeMinutes: data.read_time_minutes || calculateReadTime(data.content),
        lang: data.lang || 'tr',
        publishedAt: data.published_at || data.created_at,
        viewsCount: data.views_count || 0
      };
    }
  } catch (err) {
    // Fallback to local
  }

  // Yerel dosyaya dön
  if (local) {
    return {
      id: local.slug,
      slug: local.slug,
      title: local.meta.title || local.slug,
      description: local.meta.description || '',
      content: local.content,
      coverImage: local.meta.coverImage || null,
      category: local.meta.category || (local.meta.tags ? local.meta.tags.split(',')[0] : 'Rehber'),
      tags: local.meta.tags ? local.meta.tags.split(',').map(t => t.trim()) : [],
      authorName: local.meta.author || 'Veyronix Ekibi',
      authorAvatar: LINKS.LOGO_URL,
      readTimeMinutes: calculateReadTime(local.content),
      lang: local.meta.lang || 'tr',
      publishedAt: local.meta.date || new Date().toISOString(),
      viewsCount: 0
    };
  }

  return null;
}

/**
 * İlgili diğer makaleleri getirir
 */
export async function getRelatedPosts(currentSlug, category, limit = 3) {
  const allPosts = await getAllBlogPosts();
  return allPosts
    .filter(p => p.slug !== currentSlug)
    .filter(p => p.category.toLowerCase() === (category || '').toLowerCase() || true)
    .slice(0, limit);
}

/**
 * Okuma süresi hesaplama yardımcısı (kelime sayısı / 200)
 */
export function calculateReadTime(content = '') {
  const words = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
