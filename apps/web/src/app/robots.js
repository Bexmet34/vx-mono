export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/dashboard/', '/player/', '/guild/'],
    },
    sitemap: 'https://veyronix.com.tr/sitemap.xml',
  }
}

