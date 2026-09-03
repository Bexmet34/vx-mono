// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"albion.mdx": () => import("../content/docs/albion.mdx?collection=docs"), "commands.mdx": () => import("../content/docs/commands.mdx?collection=docs"), "community.mdx": () => import("../content/docs/community.mdx?collection=docs"), "dashboard.mdx": () => import("../content/docs/dashboard.mdx?collection=docs"), "faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "registration.mdx": () => import("../content/docs/registration.mdx?collection=docs"), "voiceforge.mdx": () => import("../content/docs/voiceforge.mdx?collection=docs"), }),
};
export default browserCollections;