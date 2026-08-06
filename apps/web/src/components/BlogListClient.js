"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, Search, Clock, Tag, Sparkles } from "lucide-react";
import styles from "../app/page.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function BlogListClient({ allPosts = [] }) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Normalize posts from both Supabase & Markdown formats
  const normalizedPosts = useMemo(() => {
    return allPosts.map(p => {
      const isSupabase = p.isFromSupabase !== false && !p.meta;
      return {
        slug: p.slug,
        title: isSupabase ? p.title : (p.meta?.title || p.title),
        description: isSupabase ? p.description : (p.meta?.description || p.description),
        date: isSupabase ? p.publishedAt : (p.meta?.date || p.publishedAt || new Date()),
        category: isSupabase ? (p.category || 'Rehber') : (p.meta?.category || (p.meta?.tags ? p.meta.tags.split(',')[0] : 'Rehber')),
        tags: isSupabase ? (p.tags || []) : (p.meta?.tags ? p.meta.tags.split(',').map(t => t.trim()) : []),
        readTimeMinutes: p.readTimeMinutes || 5,
        coverImage: isSupabase ? p.coverImage : (p.meta?.coverImage || null),
        lang: isSupabase ? (p.lang || 'tr') : (p.meta?.lang || 'tr')
      };
    });
  }, [allPosts]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set();
    normalizedPosts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [normalizedPosts]);

  // Filter posts based on language, search query and selected category
  const filteredPosts = useMemo(() => {
    return normalizedPosts.filter(post => {
      // Language filter
      const matchesLang = !post.lang || post.lang === lang;
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        post.title.toLowerCase().includes(query) || 
        post.description.toLowerCase().includes(query) ||
        post.tags.some(t => t.toLowerCase().includes(query));

      return matchesLang && matchesCategory && matchesSearch;
    });
  }, [normalizedPosts, lang, selectedCategory, searchQuery]);

  const t = lang === 'en' ? {
    badge: "Guides & Knowledge Base",
    title: "Veyronix",
    highlight: "Blog",
    desc: "In-depth guides, Albion Online tactics, Discord bot automation tips, and guild management strategies.",
    searchPlaceholder: "Search articles or keywords...",
    allCategories: "All Categories",
    empty: "No matching articles found.",
    readMore: "Read Article",
    readTime: "min read"
  } : {
    badge: "Rehberler ve Bilgi Bankası",
    title: "Veyronix",
    highlight: "Blog",
    desc: "Albion Online taktikleri, Discord bot otomasyon rehberleri ve topluluk yönetimi stratejileri.",
    searchPlaceholder: "Makale veya anahtar kelime ara...",
    allCategories: "Tüm Kategoriler",
    empty: "Aradığınız kriterlere uygun makale bulunamadı.",
    readMore: "Devamını Oku",
    readTime: "dk okuma"
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <div className={`${styles.hero} animate-fade-in`} style={{ paddingBottom: '2rem', paddingTop: '2rem' }}>
        <div className={styles.badge}>
          <BookOpen size={14} className={styles.badgeHighlight} />
          {t.badge}
        </div>
        <h1 className={styles.title} style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
          {t.title} <span className={styles.highlight}>{t.highlight}</span>
        </h1>
        <p className={styles.description}>
          {t.desc}
        </p>

        {/* Search Bar & Filter Controls */}
        <div style={{ maxWidth: '700px', width: '100%', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem auto 0' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              style={{
                width: '100%',
                padding: '0.9rem 1rem 0.9rem 3.2rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                border: selectedCategory === 'all' ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedCategory === 'all' ? 'rgba(88, 101, 242, 0.2)' : 'rgba(255,255,255,0.03)',
                color: selectedCategory === 'all' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {t.allCategories}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '50px',
                  border: selectedCategory.toLowerCase() === cat.toLowerCase() ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedCategory.toLowerCase() === cat.toLowerCase() ? 'rgba(88, 101, 242, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: selectedCategory.toLowerCase() === cat.toLowerCase() ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: selectedCategory.toLowerCase() === cat.toLowerCase() ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid Section */}
      <section className="animate-fade-in delay-2" style={{ width: '100%', padding: '0 1.5rem', marginBottom: '8rem' }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t.empty}</p>
          </div>
        ) : (
          <div className={styles.blogGrid}>
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} style={{ textDecoration: 'none' }}>
                <div className={`${styles.bentoCard}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s ease, border-color 0.2s ease' }}>
                  {post.coverImage && (
                    <div style={{ width: '100%', height: '180px', marginBottom: '1.2rem', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                      <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', color: '#5865F2', border: '1px solid rgba(88, 101, 242, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {post.category}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      {new Date(post.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} />
                      {post.readTimeMinutes} {t.readTime}
                    </div>
                    {!post.coverImage && post.category && (
                      <span style={{ marginLeft: 'auto', background: 'rgba(88, 101, 242, 0.15)', color: '#5865F2', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {post.category}
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.35rem', marginBottom: '0.8rem', color: '#fff', lineHeight: '1.4' }}>{post.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.description}
                  </p>

                  <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                      {t.readMore} <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
