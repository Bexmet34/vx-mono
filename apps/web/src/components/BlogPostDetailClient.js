"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, Share2, Copy, Check, Sparkles, MessageSquare, Bot, BookOpen } from "lucide-react";
import AdSenseUnit from "@/components/AdSenseUnit";

export default function BlogPostDetailClient({ post, relatedPosts = [] }) {
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  // Extract Table of Contents from markdown content (headings)
  const headings = [];
  const lines = post.content.split('\n');
  lines.forEach(line => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
  });

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${post.title} - Veyronix Blog`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  return (
    <main style={{ paddingBottom: '6rem' }}>
      <article style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 1.5rem' }}>
        
        {/* Navigation Back */}
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', transition: 'color 0.2s' }}>
          <ArrowLeft size={16} /> {post.lang === 'en' ? 'Back to Blog' : "Blog'a Dön"}
        </Link>
        
        {/* Category & Badge */}
        {post.category && (
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', border: '1px solid rgba(88, 101, 242, 0.4)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {post.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: '1.25', marginBottom: '1.5rem', color: '#fff', fontWeight: '800' }}>
          {post.title}
        </h1>

        {/* Meta Bar (Author, Date, Read Time, Share) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src={post.authorAvatar} alt={post.authorName} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
              <span style={{ color: '#fff', fontWeight: '600' }}>{post.authorName}</span>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} />
              {new Date(post.publishedAt).toLocaleDateString(post.lang === 'en' ? 'en-US' : 'tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            {/* Read Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} />
              {post.readTimeMinutes} {post.lang === 'en' ? 'min read' : 'dk okuma'}
            </div>
          </div>

          {/* Social Share Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handleShareTwitter} title="X (Twitter)'da Paylaş" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <Share2 size={14} /> Paylaş
            </button>
            <button onClick={handleCopyLink} title="Bağlantıyı Kopyala" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copied ? (post.lang === 'en' ? 'Copied!' : 'Kopyalandı!') : (post.lang === 'en' ? 'Copy Link' : 'Link Kopyala')}
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div style={{ width: '100%', maxHeight: '420px', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Layout Grid: Table of Contents + Article Body */}
        <div style={{ display: 'grid', gridTemplateColumns: headings.length > 0 ? 'minmax(0, 1fr) 240px' : '1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Main Content Body */}
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>

            {/* Google AdSense Unit */}
            <AdSenseUnit />

            {/* CTA Box (Call to Action) */}
            <div style={{ marginTop: '4rem', padding: '2rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(88, 101, 242, 0.4)', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '12px', background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', marginBottom: '1rem' }}>
                <Bot size={28} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {post.lang === 'en' ? 'Automate Your Discord Server with Veyronix' : 'Discord Sunucunuzu Veyronix ile Otomatikleştirin!'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
                {post.lang === 'en' 
                  ? 'Manage parties, track Albion Online stats, and organize your community effortlessly.' 
                  : 'Albion Online parti yönetimi, rol eşitleme ve topluluk etkinliklerinizi saniyeler içinde yönetmeye başlayın.'}
              </p>
              <a href="https://discord.com/oauth2/authorize" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#5865F2', color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', transition: 'transform 0.2s, background 0.2s' }}>
                <Sparkles size={18} /> {post.lang === 'en' ? 'Add Bot to Discord' : 'Veyronix Botu Sunucuna Ekle'}
              </a>
            </div>
          </div>

          {/* Sticky Table of Contents (İçindekiler) */}
          {headings.length > 0 && (
            <aside style={{ position: 'sticky', top: '100px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <BookOpen size={16} color="#5865F2" /> {post.lang === 'en' ? 'Table of Contents' : 'İçindekiler'}
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                {headings.map((h, i) => (
                  <a 
                    key={i} 
                    href={`#${h.id}`} 
                    style={{ 
                      color: 'var(--text-muted)', 
                      textDecoration: 'none', 
                      paddingLeft: h.level === 3 ? '0.8rem' : '0',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#5865F2'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}

        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '6rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
            <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {post.lang === 'en' ? 'Related Articles' : 'İlgili Makaleler'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {relatedPosts.map(rel => (
                <Link href={`/blog/${rel.slug}`} key={rel.slug} style={{ textDecoration: 'none' }}>
                  <div className={styles.bentoCard} style={{ height: '100%', padding: '1.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#5865F2', fontWeight: 'bold' }}>{rel.category}</span>
                    <h4 style={{ fontSize: '1.1rem', color: '#fff', margin: '0.5rem 0', lineHeight: '1.4' }}>{rel.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rel.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Styled Markdown CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-content { color: rgba(255,255,255,0.85); line-height: 1.85; font-size: 1.08rem; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 { color: #fff; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.35; font-weight: 700; }
        .markdown-content h2 { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; font-size: 1.7rem; }
        .markdown-content h3 { font-size: 1.35rem; color: #E2E8F0; }
        .markdown-content p { margin-bottom: 1.6rem; }
        .markdown-content a { color: #5865F2; text-decoration: none; font-weight: 600; }
        .markdown-content a:hover { text-decoration: underline; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.6rem; padding-left: 1.5rem; }
        .markdown-content li { margin-bottom: 0.6rem; }
        .markdown-content blockquote { border-left: 4px solid #5865F2; padding: 0.8rem 1.2rem; margin: 1.8rem 0; background: rgba(88, 101, 242, 0.08); border-radius: 0 8px 8px 0; color: rgba(255,255,255,0.9); font-style: italic; }
        .markdown-content code { background: rgba(0,0,0,0.6); padding: 0.2rem 0.5rem; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid rgba(255,255,255,0.1); color: #38BDF8; }
        .markdown-content pre { background: rgba(15, 23, 42, 0.9); padding: 1.2rem; border-radius: 12px; overflow-x: auto; margin-bottom: 1.8rem; border: 1px solid rgba(255,255,255,0.1); }
        .markdown-content pre code { background: none; padding: 0; border: none; color: #E2E8F0; }
        .markdown-content img { max-width: 100%; border-radius: 12px; margin: 1.5rem 0; border: 1px solid rgba(255,255,255,0.1); }
        .markdown-content table { width: 100%; border-collapse: collapse; margin-bottom: 1.8rem; }
        .markdown-content th, .markdown-content td { border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem 1rem; text-align: left; }
        .markdown-content th { background: rgba(255,255,255,0.05); color: #fff; font-weight: bold; }
      `}} />
    </main>
  );
}
