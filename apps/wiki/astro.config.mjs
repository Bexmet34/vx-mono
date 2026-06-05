// @ts-check
import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Veyronix Wiki',
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Başlangıç',
          items: [
            { label: 'Giriş', link: '/introduction' },
            { label: 'Komutlar', link: '/commands' },
          ],
        },
        {
          label: 'Albion Online Sistemleri',
          items: [
            { label: 'Kayıt ve Doğrulama', link: '/albion-systems' },
          ],
        },
        {
          label: 'Parti ve Organizasyon',
          items: [
            { label: 'Parti Sistemi (LFG)', link: '/party-system' },
            { label: 'Objektif (CTA) Sistemi', link: '/objective-system' },
          ],
        },
        {
          label: 'Topluluk Yönetimi',
          items: [
            { label: 'Davet ve Ödül Sistemi', link: '/rewards' },
          ],
        },
        {
          label: 'Web Dashboard',
          items: [
            { label: 'Panel Kullanımı', link: '/dashboard' },
          ],
        },
      ],
    }),
  ],
});