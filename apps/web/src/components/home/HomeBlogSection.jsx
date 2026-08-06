"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HomeBlogSection({ blogs = [] }) {
  const { t } = useLanguage();

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-20 bg-surface-container-lowest border-y border-on-surface/10">
      <div className="max-w-container-max mx-auto">
        <div className="mb-3">
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">{t.blogHeaderTitle}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{t.blogHeaderDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {blogs.slice(0, 3).map((blog, idx) => (
            <a href={`/blog/${blog.slug}`} key={idx} className="block group">
              <div className="h-full glass-panel p-2 border border-outline-variant group-hover:border-primary-container/50 transition-colors relative overflow-hidden">
                <div className="w-10 h-7 bg-surface border border-outline-variant flex items-center justify-center text-primary-container mb-2 group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                  <Star size={14} />
                </div>
                <h3 className="font-headline-md text-xs text-on-surface mb-2 line-clamp-2">{blog.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">{blog.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
