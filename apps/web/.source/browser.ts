// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.en.mdx": () => import("../src/content/docs/index.en.mdx?collection=docs"), "index.mdx": () => import("../src/content/docs/index.mdx?collection=docs"), "kurulum-komutlari.en.mdx": () => import("../src/content/docs/kurulum-komutlari.en.mdx?collection=docs"), "kurulum-komutlari.mdx": () => import("../src/content/docs/kurulum-komutlari.mdx?collection=docs"), "kurulum.en.mdx": () => import("../src/content/docs/kurulum.en.mdx?collection=docs"), "kurulum.mdx": () => import("../src/content/docs/kurulum.mdx?collection=docs"), "parti-yonetimi.en.mdx": () => import("../src/content/docs/parti-yonetimi.en.mdx?collection=docs"), "parti-yonetimi.mdx": () => import("../src/content/docs/parti-yonetimi.mdx?collection=docs"), }),
};
export default browserCollections;