import { getAllBlogPosts } from '@/lib/supabaseBlog';
import { LINKS } from '@veyronix/config';

export default async function sitemap() {
  const posts = await getAllBlogPosts();

  const blogUrls = posts.map((post) => {
    return {
      url: `${LINKS.PAGE_BLOG}/${post.slug}`,
      lastModified: new Date(post.publishedAt || Date.now()),
      changeFrequency: 'daily',
      priority: 0.8,
    };
  });

  return [
    {
      url: LINKS.WEBSITE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: LINKS.PAGE_BLOG,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogUrls,
    {
      url: LINKS.PAGE_ABOUT,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: LINKS.PAGE_PRIVACY,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: LINKS.PAGE_TERMS,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: LINKS.PAGE_REFUND,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: LINKS.PAGE_SALES_AGREEMENT,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: LINKS.PAGE_PREMIUM,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: LINKS.PAGE_KILLBOARD,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: LINKS.PAGE_VOTE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: LINKS.PAGE_CHANGELOG,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
