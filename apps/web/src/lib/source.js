import { docs, meta } from '../../.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
  i18n: {
    defaultLanguage: 'tr',
    languages: ['tr', 'en'],
  },
});
