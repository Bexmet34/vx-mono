// @ts-nocheck
import { default as __fd_glob_8 } from "../content/docs/meta.json?collection=meta"
import * as __fd_glob_7 from "../content/docs/voiceforge.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/registration.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/faq.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/dashboard.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/community.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/commands.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/albion.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.doc("docs", "content/docs", {"albion.mdx": __fd_glob_0, "commands.mdx": __fd_glob_1, "community.mdx": __fd_glob_2, "dashboard.mdx": __fd_glob_3, "faq.mdx": __fd_glob_4, "index.mdx": __fd_glob_5, "registration.mdx": __fd_glob_6, "voiceforge.mdx": __fd_glob_7, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_8, });