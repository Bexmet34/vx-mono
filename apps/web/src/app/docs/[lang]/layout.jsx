import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';

export default async function Layout({ children, params }) {
  const { lang } = await params;
  
  return (
    <DocsLayout 
      tree={source.pageTree[lang]} 
      nav={{ title: 'Veyronix Wiki' }}
    >
      {children}
    </DocsLayout>
  );
}
