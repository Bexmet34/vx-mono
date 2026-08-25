import { getAllBlogPosts } from '@/lib/supabaseBlog';
import { LINKS } from '@veyronix/config';

export const revalidate = 3600; // Sitemap'i her saat başı otomatik yenile

export default async function sitemap() {
  let blogUrls = [];

  try {
    const posts = await getAllBlogPosts();
    if (Array.isArray(posts)) {
      blogUrls = posts.map((post) => {
        let lastModDate = new Date();
        if (post.publishedAt) {
          const parsed = new Date(post.publishedAt);
          if (!isNaN(parsed.getTime())) {
            lastModDate = parsed;
          }
        }

        return {
          url: `${LINKS.PAGE_BLOG}/${post.slug}`,
          lastModified: lastModDate,
          changeFrequency: 'daily',
          priority: 0.85,
        };
      });
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching blog posts:', error);
  }

  const staticUrls = [
    {
      url: LINKS.WEBSITE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Core Feature Landing Pages (High Priority for Search Intent)
    {
      url: `${LINKS.WEBSITE}/ozellikler/gecici-ses-kanali`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${LINKS.WEBSITE}/ozellikler/kayit-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${LINKS.WEBSITE}/ozellikler/parti-kurucu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${LINKS.WEBSITE}/ozellikler/ticket-destek`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: LINKS.PAGE_BLOG,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.90,
    },
    ...blogUrls,
    {
      url: LINKS.PAGE_ABOUT,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.80,
    },
    {
      url: `${LINKS.WEBSITE}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${LINKS.WEBSITE}/cerez-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${LINKS.WEBSITE}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${LINKS.WEBSITE}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: LINKS.PAGE_REFUND,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.50,
    },
    {
      url: LINKS.PAGE_SALES_AGREEMENT,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.50,
    },
    {
      url: LINKS.PAGE_PREMIUM,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: LINKS.PAGE_KILLBOARD,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: LINKS.PAGE_VOTE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: LINKS.PAGE_CHANGELOG,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.70,
    },
  ];

  return staticUrls;
}
