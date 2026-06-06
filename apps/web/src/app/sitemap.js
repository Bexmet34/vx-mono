import { getPostSlugs, getPostBySlug } from '@/lib/markdown';

export default function sitemap() {
  const slugs = getPostSlugs() || [];
  const posts = slugs.map((slug) => {
    const post = getPostBySlug(slug);
    return {
      url: `https://veyronix.com.tr/blog/${post.slug}`,
      lastModified: new Date(post.meta.date),
      changeFrequency: 'monthly',
      priority: 0.8,
    };
  });

  return [
    {
      url: 'https://veyronix.com.tr',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://veyronix.com.tr/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...posts,
    {
      url: 'https://veyronix.com.tr/hakkimizda',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://veyronix.com.tr/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://veyronix.com.tr/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://veyronix.com.tr/iptal-ve-iade-kosullari',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://veyronix.com.tr/mesafeli-satis-sozlesmesi',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://veyronix.com.tr/changelog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
