import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getPostSlugs } from '@/lib/markdown';
import Navbar from "@/components/Navbar";
import styles from "../../page.module.css";
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft } from "lucide-react";
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }
  return {
    title: `${post.meta.title} | Veyronix Blog`,
    description: post.meta.description,
  };
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug: slug.replace(/\.md$/, '') }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className={styles.main} style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <article style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 1.5rem' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> {post.meta.lang === 'en' ? 'Back to Blog' : "Blog'a Dön"}
          </Link>
          
          <h1 style={{ fontSize: '3rem', lineHeight: '1.2', marginBottom: '1rem', color: '#fff' }}>
            {post.meta.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              {new Date(post.meta.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            {post.meta.tags && (
              <span style={{ background: 'rgba(88, 101, 242, 0.15)', color: '#5865F2', padding: '0.2rem 0.6rem', borderRadius: '50px', fontWeight: 'bold' }}>
                {post.meta.tags.split(',')[0]}
              </span>
            )}
          </div>

          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-content { color: var(--text-muted); line-height: 1.8; font-size: 1.1rem; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { color: #fff; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; }
        .markdown-content h2 { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
        .markdown-content p { margin-bottom: 1.5rem; }
        .markdown-content a { color: var(--accent-color); text-decoration: none; }
        .markdown-content a:hover { text-decoration: underline; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.5rem; }
        .markdown-content blockquote { border-left: 4px solid var(--accent-color); padding-left: 1rem; margin-left: 0; color: rgba(255,255,255,0.7); font-style: italic; }
        .markdown-content code { background: rgba(0,0,0,0.5); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .markdown-content pre { background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1.5rem; }
        .markdown-content pre code { background: none; padding: 0; }
        .markdown-content img { max-width: 100%; border-radius: 8px; }
      `}} />
    </>
  );
}
