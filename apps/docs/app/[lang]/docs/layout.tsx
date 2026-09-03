import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';

export default function Layout({ children, params }: { children: ReactNode, params: { lang: string } }) {
  return (
    <DocsLayout tree={source.pageTree[params.lang]} {...baseOptions}>
      {children}
    </DocsLayout>
  );
}
