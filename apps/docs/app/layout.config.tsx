import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  i18n: true,
  nav: {
    title: 'Veyronix Docs',
    url: '/docs',
  },
  links: [
    {
      text: 'Ana Site',
      url: 'https://veyronix.com.tr',
      active: 'nested-url',
    },
    {
      text: 'Destek Sunucusu',
      url: 'https://veyronix.com.tr/support',
      active: 'nested-url',
    },
  ],
};
