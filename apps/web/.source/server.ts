// @ts-nocheck
import * as __fd_glob_7 from "../src/content/docs/tr/parti-yonetimi.mdx?collection=docs"
import * as __fd_glob_6 from "../src/content/docs/tr/kurulum.mdx?collection=docs"
import * as __fd_glob_5 from "../src/content/docs/tr/kurulum-komutlari.mdx?collection=docs"
import * as __fd_glob_4 from "../src/content/docs/tr/index.mdx?collection=docs"
import * as __fd_glob_3 from "../src/content/docs/en/setup.mdx?collection=docs"
import * as __fd_glob_2 from "../src/content/docs/en/setup-commands.mdx?collection=docs"
import * as __fd_glob_1 from "../src/content/docs/en/party-management.mdx?collection=docs"
import * as __fd_glob_0 from "../src/content/docs/en/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "src/content/docs", {"en/index.mdx": __fd_glob_0, "en/party-management.mdx": __fd_glob_1, "en/setup-commands.mdx": __fd_glob_2, "en/setup.mdx": __fd_glob_3, "tr/index.mdx": __fd_glob_4, "tr/kurulum-komutlari.mdx": __fd_glob_5, "tr/kurulum.mdx": __fd_glob_6, "tr/parti-yonetimi.mdx": __fd_glob_7, });

export const meta = await create.meta("meta", "src/content/docs", {});