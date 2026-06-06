import { docs, meta } from '../../.source/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: {
    get pages() {
      return docs;
    },
    get meta() {
      return meta;
    }
  },
  i18n: {
    defaultLanguage: 'tr',
    languages: ['tr', 'en'],
  },
});
