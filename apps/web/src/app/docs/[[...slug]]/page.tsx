import { source } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Page({ params }: { params: { slug?: string[] } }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en";

  const fullSlug = [lang, ...(params.slug || [])];
  const page = source.getPage(fullSlug);
  
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en";

  const fullSlug = [lang, ...(params.slug || [])];
  const page = source.getPage(fullSlug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
