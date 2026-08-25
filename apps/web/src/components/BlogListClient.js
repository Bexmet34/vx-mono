"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, Search, Clock, Tag, Sparkles, X, User, Newspaper, Flame } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Kategori isimlerini TR ve EN için standart, temiz ve düzenli hale getirir.
 */
function normalizeCategory(rawCategory = '', lang = 'tr') {
  const cat = (rawCategory || '').toLowerCase().trim();
  const isTr = lang === 'tr';

  if (cat.includes('albion')) {
    return 'Albion Online';
  }
  if (cat.includes('discord') || cat.includes('topluluk') || cat.includes('community') || cat.includes('automation') || cat.includes('otomasyon')) {
    return isTr ? 'Discord Otomasyonu' : 'Discord Automation';
  }
  if (cat.includes('veyronix') || cat.includes('haber') || cat.includes('update') || cat.includes('platform')) {
    return 'Veyronix';
  }
  return isTr ? 'Rehberler' : 'Guides';
}

export default function BlogListClient({ allPosts = [] }) {
  const { lang } = useLanguage();
  const isTr = lang === 'tr';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Reset category filter when site language switches
  useEffect(() => {
    setSelectedCategory('all');
  }, [lang]);

  // Normalize all posts with unified categories and languages
  const processedPosts = useMemo(() => {
    return allPosts.map(p => {
      const postLang = p.lang || (p.slug?.endsWith('-en') ? 'en' : 'tr');
      const normalizedCat = normalizeCategory(p.category, postLang);
      
      return {
        ...p,
        lang: postLang,
        category: normalizedCat,
        readTimeMinutes: p.readTimeMinutes || 5,
        authorName: p.authorName || (postLang === 'tr' ? 'Veyronix Ekibi' : 'Veyronix Team'),
        authorAvatar: p.authorAvatar || 'https://veyronix.com.tr/icon.svg',
      };
    });
  }, [allPosts]);

  // Extract categories dynamically for the current language with counts
  const categories = useMemo(() => {
    const map = new Map();
    processedPosts
      .filter(p => p.lang === lang)
      .forEach(p => {
        const cat = p.category;
        map.set(cat, (map.get(cat) || 0) + 1);
      });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [processedPosts, lang]);

  // Filter posts based on strictly matching language, search query and selected category
  const filteredPosts = useMemo(() => {
    return processedPosts.filter(post => {
      // Strict language match
      const matchesLang = post.lang === lang;
      
      // Category filter (case-insensitive on normalized category)
      const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (post.title || '').toLowerCase().includes(query) || 
        (post.description || '').toLowerCase().includes(query) ||
        (Array.isArray(post.tags) ? post.tags.some(t => t.toLowerCase().includes(query)) : false);

      return matchesLang && matchesCategory && matchesSearch;
    });
  }, [processedPosts, lang, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    if (selectedCategory === 'all' && !searchQuery && filteredPosts.length > 0) {
      return filteredPosts[0];
    }
    return null;
  }, [filteredPosts, selectedCategory, searchQuery]);

  const gridPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.slice(1);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  const t = isTr ? {
    badge: "Bilgi Merkezi & Rehberler",
    title1: "Veyronix",
    highlight: "Blog & Rehberler",
    desc: "Discord bot otomasyonu, geçici ses odaları, butonlu kayıt sistemleri ve Albion Online lonca stratejileri hakkında uzman rehberleri.",
    searchPlaceholder: "Makale, rehber veya anahtar kelime ara...",
    allCategories: "Tüm Yazılar",
    featuredBadge: "Öne Çıkan Rehber",
    emptyTitle: "Sonuç Bulunamadı",
    emptyDesc: "Aradığınız kriterlere uygun makale bulunamadı veya henüz bu dilde yazı eklenmedi.",
    clearSearch: "Aramayı Temizle",
    readMore: "Rehberi Oku",
    readTime: "dk okuma",
    totalArticles: "yazı",
  } : {
    badge: "Knowledge Hub & Guides",
    title1: "Veyronix",
    highlight: "Blog & Insights",
    desc: "Expert guides on Discord bot automation, temporary voice channels, registration systems, and Albion Online guild tactics.",
    searchPlaceholder: "Search articles, guides, or keywords...",
    allCategories: "All Articles",
    featuredBadge: "Featured Guide",
    emptyTitle: "No Articles Found",
    emptyDesc: "No articles match your current search or category filter.",
    clearSearch: "Clear Search",
    readMore: "Read Guide",
    readTime: "min read",
    totalArticles: "articles",
  };

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center mb-14 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider mb-5 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
          <BookOpen size={14} />
          <span>{t.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-tight mb-5">
          {t.title1} <span className="bg-gradient-to-r from-primary-container via-amber-300 to-primary-container bg-clip-text text-transparent">{t.highlight}</span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed mb-8">
          {t.desc}
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mb-8">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 backdrop-blur-xl text-sm focus:outline-none focus:border-primary-container/70 focus:ring-2 focus:ring-primary-container/20 transition-all shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
                aria-label="Clear Search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-primary-container text-black shadow-[0_0_20px_rgba(255,215,0,0.25)] font-bold scale-105'
                : 'bg-surface-container/60 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
            }`}
          >
            <span>{t.allCategories}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedCategory === 'all' ? 'bg-black/20 text-black' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {filteredPosts.length}
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-primary-container text-black shadow-[0_0_20px_rgba(255,215,0,0.25)] font-bold scale-105'
                  : 'bg-surface-container/60 border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/60'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'bg-black/20 text-black' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Hero Article */}
      {featuredPost && (
        <section className="mb-14">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block relative rounded-3xl overflow-hidden border border-primary-container/30 bg-surface-container-low/70 backdrop-blur-xl shadow-[0_15px_45px_rgba(0,0,0,0.6)] hover:border-primary-container/60 transition-all duration-500 hover:-translate-y-1"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 md:p-10 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4 relative z-10">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/20 border border-primary-container/40 text-primary-container text-xs font-bold uppercase tracking-wider">
                    <Flame size={13} className="animate-pulse" />
                    <span>{t.featuredBadge}</span>
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-medium">
                    {featuredPost.category}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white group-hover:text-primary-container transition-colors tracking-tight leading-tight">
                  {featuredPost.title}
                </h2>

                <p className="text-sm sm:text-base text-on-surface-variant font-light leading-relaxed line-clamp-3">
                  {featuredPost.description}
                </p>

                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredPost.authorAvatar || 'https://veyronix.com.tr/icon.svg'}
                      alt={featuredPost.authorName || 'Veyronix'}
                      className="w-8 h-8 rounded-full border border-primary-container/40 object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{featuredPost.authorName || (isTr ? 'Veyronix Ekibi' : 'Veyronix Team')}</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                        <span>{new Date(featuredPost.publishedAt || featuredPost.date).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {featuredPost.readTimeMinutes || 5} {t.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 text-xs font-bold text-primary-container group-hover:translate-x-1 transition-transform">
                    <span>{t.readMore}</span>
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>

              {/* Right Cover Image */}
              <div className="lg:col-span-5 relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-outline-variant/30 bg-[#080d1a]">
                {featuredPost.coverImage ? (
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/10 via-surface-container to-surface-container-lowest">
                    <Newspaper size={64} className="text-primary-container/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/80 via-transparent to-transparent"></div>
              </div>

            </div>
          </Link>
        </section>
      )}

      {/* Grid of Articles */}
      {gridPosts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-low/50 hover:bg-surface-container-high/60 hover:border-primary-container/40 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden shadow-lg"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-48 w-full overflow-hidden bg-[#0a0f1d] border-b border-outline-variant/20">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-container/10 via-surface-container to-surface-container-lowest">
                      <Newspaper size={40} className="text-primary-container/30" />
                    </div>
                  )}
                  
                  {/* Category Pill Tag Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#0B0F19]/90 border border-outline-variant/40 backdrop-blur-md text-[11px] font-bold text-primary-container">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-container transition-colors tracking-tight line-clamp-2 mb-2.5">
                    {post.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light leading-relaxed line-clamp-3 mb-4">
                    {post.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Meta */}
              <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-outline-variant/10 mt-auto text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>{new Date(post.publishedAt || post.date).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-primary-container group-hover:translate-x-1 transition-transform">
                  <span>{post.readTimeMinutes || 5} {t.readTime}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        /* Empty Search State */
        <div className="text-center py-16 px-6 rounded-3xl bg-surface-container-low/40 border border-outline-variant/20 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary-container/10 border border-primary-container/30 text-primary-container flex items-center justify-center mx-auto mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{t.emptyTitle}</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-6 leading-relaxed">
            {t.emptyDesc}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
            >
              {t.clearSearch}
            </button>
          )}
        </div>
      )}

    </main>
  );
}
