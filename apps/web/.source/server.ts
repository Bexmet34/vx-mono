// @ts-nocheck
import * as __fd_glob_7 from "../src/content/docs/parti-yonetimi.mdx?collection=docs"
import * as __fd_glob_6 from "../src/content/docs/parti-yonetimi.en.mdx?collection=docs"
import * as __fd_glob_5 from "../src/content/docs/kurulum.mdx?collection=docs"
import * as __fd_glob_4 from "../src/content/docs/kurulum.en.mdx?collection=docs"
import * as __fd_glob_3 from "../src/content/docs/kurulum-komutlari.mdx?collection=docs"
import * as __fd_glob_2 from "../src/content/docs/kurulum-komutlari.en.mdx?collection=docs"
import * as __fd_glob_1 from "../src/content/docs/index.mdx?collection=docs"
import * as __fd_glob_0 from "../src/content/docs/index.en.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "src/content/docs", {"index.en.mdx": __fd_glob_0, "index.mdx": __fd_glob_1, "kurulum-komutlari.en.mdx": __fd_glob_2, "kurulum-komutlari.mdx": __fd_glob_3, "kurulum.en.mdx": __fd_glob_4, "kurulum.mdx": __fd_glob_5, "parti-yonetimi.en.mdx": __fd_glob_6, "parti-yonetimi.mdx": __fd_glob_7, });

export const meta = await create.meta("meta", "src/content/docs", {});