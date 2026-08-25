"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, Share2, Copy, Check, Sparkles, Bot, BookOpen, ChevronRight, Tag } from "lucide-react";
import AdSenseUnit from "@/components/AdSenseUnit";
import { LINKS } from '@veyronix/config';

export default function BlogPostDetailClient({ post, relatedPosts = [] }) {
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const isTr = post.lang !== 'en';

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
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary-container transition-colors">{isTr ? 'Ana Sayfa' : 'Home'}</Link>
        <ChevronRight size={12} />
        <Link href="/blog" className="hover:text-primary-container transition-colors">Blog</Link>
        <ChevronRight size={12} />
        <span className="text-primary-container font-semibold truncate max-w-xs sm:max-w-md">{post.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {post.category && (
            <span className="px-3 py-1 rounded-full bg-primary-container/15 border border-primary-container/40 text-primary-container text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
          )}
          <span className="text-xs text-on-surface-variant flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant/30">
            <Clock size={12} />
            <span>{post.readTimeMinutes} {isTr ? 'dk okuma' : 'min read'}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author & Share Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-outline-variant/20 bg-surface-container-lowest/40 rounded-xl px-4">
          
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar || 'https://veyronix.com.tr/icon.svg'}
              alt={post.authorName || 'Veyronix Team'}
              className="w-10 h-10 rounded-full border border-primary-container/40 object-cover"
            />
            <div>
              <div className="text-xs font-bold text-white">{post.authorName || 'Veyronix Ekibi'}</div>
              <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                <Calendar size={12} />
                <span>{new Date(post.publishedAt).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Social Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTwitter}
              title="X (Twitter)"
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Share2 size={13} />
              <span>{isTr ? 'Paylaş' : 'Share'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className={copied ? 'text-emerald-400 font-semibold' : ''}>
                {copied ? (isTr ? 'Kopyalandı!' : 'Copied!') : (isTr ? 'Bağlantıyı Kopyala' : 'Copy Link')}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Cover Image Banner */}
      {post.coverImage && (
        <div className="w-full max-h-[460px] rounded-3xl overflow-hidden mb-12 border border-outline-variant/30 shadow-2xl bg-[#080c16]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover max-h-[460px]"
          />
        </div>
      )}

      {/* Layout Grid: Article Body + Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Main Markdown Content */}
        <article className="lg:col-span-8 markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>

          {/* Google AdSense Unit */}
          <div className="my-10">
            <AdSenseUnit />
          </div>

          {/* Call to Action Box */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary-container/15 via-surface-container to-surface-container-lowest border border-primary-container/40 text-center relative overflow-hidden shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary-container/50 text-primary-container flex items-center justify-center mx-auto mb-4">
              <Bot size={24} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {isTr ? 'Discord Sunucunuzu Veyronix ile Otomatize Edin' : 'Automate Your Discord Community with Veyronix'}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mb-6 leading-relaxed">
              {isTr 
                ? 'Geçici ses odaları, butonlu kayıt sistemi ve Albion Online parti yönetimini saniyeler içinde sunucunuza kazandırın.'
                : 'Empower your community with dynamic voice rooms, button registration, and advanced Albion Online party finder tools.'}
            </p>
            <a
              href={LINKS.BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(255,215,0,0.25)]"
            >
              <Sparkles size={15} />
              <span>{isTr ? 'Hemen Ücretsiz Discord\'a Ekle' : 'Add to Discord Free'}</span>
            </a>
          </div>
        </article>

        {/* Sticky Table of Contents Sidebar */}
        {headings.length > 0 && (
          <aside className="lg:col-span-4 sticky top-28 hidden lg:block">
            <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-container uppercase tracking-wider pb-3 mb-3 border-b border-outline-variant/20">
                <BookOpen size={14} />
                <span>{isTr ? 'İçindekiler' : 'Table of Contents'}</span>
              </div>
              <nav className="flex flex-col gap-2 text-xs">
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className={`text-on-surface-variant hover:text-primary-container transition-colors leading-snug py-0.5 ${
                      h.level === 3 ? 'pl-3 border-l border-outline-variant/30 text-[11px]' : 'font-medium'
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-outline-variant/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isTr ? 'İlgili Diğer Rehberler' : 'Related Articles'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.slug}
                href={`/blog/${rel.slug}`}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 hover:border-primary-container/40 hover:bg-surface-container-high/60 transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-container/15 text-primary-container uppercase">
                    {rel.category}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-primary-container transition-colors mt-2.5 line-clamp-2 leading-snug">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light line-clamp-2 mt-2 leading-relaxed">
                    {rel.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-primary-container font-semibold">
                  <span>{isTr ? 'Okumaya Devam Et' : 'Read More'}</span>
                  <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Markdown Content Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-content { color: rgba(226, 232, 240, 0.9); line-height: 1.85; font-size: 1.05rem; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 { color: #fff; margin-top: 2.2rem; margin-bottom: 0.9rem; line-height: 1.35; font-weight: 700; }
        .markdown-content h1 { font-size: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.6rem; }
        .markdown-content h2 { font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; color: #fff; }
        .markdown-content h3 { font-size: 1.25rem; color: #f1f5f9; }
        .markdown-content p { margin-bottom: 1.4rem; font-weight: 300; }
        .markdown-content strong { color: #fff; font-weight: 600; }
        .markdown-content a { color: #ffd700; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
        .markdown-content a:hover { opacity: 0.8; text-decoration: underline; }
        .markdown-content ul, .markdown-content ol { margin-bottom: 1.4rem; padding-left: 1.4rem; }
        .markdown-content li { margin-bottom: 0.5rem; }
        .markdown-content blockquote { border-left: 3px solid #ffd700; padding: 0.8rem 1.2rem; margin: 1.6rem 0; background: rgba(255, 215, 0, 0.05); border-radius: 0 12px 12px 0; color: rgba(255,255,255,0.9); font-style: italic; }
        .markdown-content code { background: rgba(15, 23, 42, 0.8); padding: 0.2rem 0.5rem; border-radius: 6px; font-family: monospace; font-size: 0.88em; border: 1px solid rgba(255,255,255,0.1); color: #38bdf8; }
        .markdown-content pre { background: #070c18; padding: 1.2rem; border-radius: 14px; overflow-x: auto; margin-bottom: 1.6rem; border: 1px solid rgba(255,255,255,0.1); }
        .markdown-content pre code { background: none; padding: 0; border: none; color: #e2e8f0; }
        .markdown-content img { max-width: 100%; border-radius: 14px; margin: 1.5rem 0; border: 1px solid rgba(255,255,255,0.1); }
        .markdown-content hr { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem 0; }
      `}} />

    </main>
  );
}
