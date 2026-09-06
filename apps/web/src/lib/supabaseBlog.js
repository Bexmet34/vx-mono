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

/**
 * Tüm yayınlanmış blog yazılarını Supabase 'blog_posts' tablosundan getirir.
 */
export async function getAllBlogPosts() {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
      15000
    );

    if (!error && data && data.length > 0) {
      return data.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description || '',
        content: post.content,
        coverImage: post.cover_image || null,
        category: post.category || 'Rehber',
        tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',').map(t => t.trim()) : []),
        authorName: post.author_name || 'Veyronix Ekibi',
        authorAvatar: post.author_avatar || LINKS.LOGO_URL,
        readTimeMinutes: post.read_time_minutes || calculateReadTime(post.content),
        lang: post.lang || (post.slug.endsWith('-en') ? 'en' : 'tr'),
        publishedAt: post.published_at || post.created_at,
        viewsCount: post.views_count || 0
      }));
    }
  } catch (err) {
    console.warn('[SupabaseBlog] Fetch error:', err.message);
  }

  return [];
}

/**
 * Slug'a göre tek bir blog yazısını getirir
 */
export async function getBlogPostBySlug(slug) {
  try {
    const { data, error } = await fetchWithTimeout(
      supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single(),
      15000
    );

    if (!error && data) {
      return {
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
    }
  } catch (err) {
    console.warn(`[SupabaseBlog] Fetch failed for slug ${slug}:`, err.message);
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
    .filter(p => !category || p.category.toLowerCase() === category.toLowerCase() || true)
    .slice(0, limit);
}

/**
 * Okuma süresi hesaplama yardımcısı (kelime sayısı / 200)
 */
export function calculateReadTime(content = '') {
  const words = content.replace(/[#*`\-[\]()]/g, '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
