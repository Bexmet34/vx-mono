"use client";

import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import styles from "../app/page.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function BlogListClient({ allPosts }) {
  const { lang } = useLanguage();
  
  // Filter posts based on current language
  const posts = allPosts.filter(post => post.meta.lang === lang);

  const t = lang === 'en' ? {
    badge: "Guides and Blog",
    title: "Veyronix",
    highlight: "Blog",
    desc: "The latest tips, Discord bot management guides, and guild organization strategies for Albion Online.",
    empty: "No articles published yet.",
    readMore: "Read More"
  } : {
    badge: "Rehberler ve Blog",
    title: "Veyronix",
    highlight: "Blog",
    desc: "Albion Online ipuçları, Discord bot yönetimi ve lonca organizasyonlarına dair en güncel içerikler.",
    empty: "Henüz yayınlanmış bir makale bulunmuyor.",
    readMore: "Devamını Oku"
  };

  return (
    <main className={styles.main}>
      <div className={`${styles.hero} animate-fade-in`} style={{ paddingBottom: '3rem', paddingTop: '8rem' }}>
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
      </div>

      <section className={`${styles.bentoSection} animate-fade-in delay-2`} style={{ paddingTop: '0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem', color: 'var(--text-muted)' }}>
              {t.empty}
            </div>
          )}
          
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} style={{ textDecoration: 'none' }}>
              <div className={`${styles.bentoCard}`} style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Calendar size={14} />
                  {new Date(post.meta.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {post.meta.tags && (
                    <span style={{ marginLeft: 'auto', background: 'rgba(88, 101, 242, 0.15)', color: '#5865F2', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {post.meta.tags.split(',')[0]}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#fff', lineHeight: '1.4' }}>{post.meta.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', flex: 1 }}>{post.meta.description}</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {t.readMore} <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
