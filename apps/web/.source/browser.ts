// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"en/index.mdx": () => import("../src/content/docs/en/index.mdx?collection=docs"), "en/party-management.mdx": () => import("../src/content/docs/en/party-management.mdx?collection=docs"), "en/setup-commands.mdx": () => import("../src/content/docs/en/setup-commands.mdx?collection=docs"), "en/setup.mdx": () => import("../src/content/docs/en/setup.mdx?collection=docs"), "tr/index.mdx": () => import("../src/content/docs/tr/index.mdx?collection=docs"), "tr/kurulum-komutlari.mdx": () => import("../src/content/docs/tr/kurulum-komutlari.mdx?collection=docs"), "tr/kurulum.mdx": () => import("../src/content/docs/tr/kurulum.mdx?collection=docs"), "tr/parti-yonetimi.mdx": () => import("../src/content/docs/tr/parti-yonetimi.mdx?collection=docs"), }),
};
export default browserCollections;