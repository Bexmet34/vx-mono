import { createI18nMiddleware } from 'fumadocs-core/i18n';
import { i18n } from '@/lib/i18n';

export default createI18nMiddleware(i18n);

export const config = {
  // Matcher ignoring static assets, SEO files (robots.txt, sitemap.xml), and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|icon\\.png|icon\\.svg|og-image\\.png|logo\\.png).*)'],
};
