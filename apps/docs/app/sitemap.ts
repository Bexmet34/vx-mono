import type { MetadataRoute } from 'next';

const BASE_URL = 'https://docs.veyronix.com.tr';

const DOC_PAGES = [
  '',
  '/albion',
  '/voiceforge',
  '/registration',
  '/community',
  '/commands',
  '/dashboard',
  '/faq',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of ['tr', 'en']) {
    for (const slug of DOC_PAGES) {
      entries.push({
        url: `${BASE_URL}/${lang}/docs${slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: slug === '' ? 1.0 : 0.9,
      });
    }
  }

  return entries;
}
