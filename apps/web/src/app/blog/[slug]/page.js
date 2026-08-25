import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from '@/lib/supabaseBlog';
import BlogPostDetailClient from "@/components/BlogPostDetailClient";
import { notFound } from 'next/navigation';
import { LINKS } from '@veyronix/config';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Makale Bulunamadı | Veyronix Blog' };
  }

  const postUrl = `${LINKS.PAGE_BLOG}/${post.slug}`;
  const ogImage = post.coverImage || LINKS.OG_IMAGE_URL;

  return {
    title: `${post.title} | Veyronix Blog`,
    description: post.description,
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: postUrl,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.authorName || 'Veyronix Ekibi'],
      tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',') : []),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export const revalidate = 60; // 60 saniyede bir yeni veri kontrol et

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const postUrl = `${LINKS.PAGE_BLOG}/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: post.coverImage || LINKS.OG_IMAGE_URL,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl,
        },
        author: {
          '@type': 'Organization',
          name: post.authorName || 'Veyronix Team',
          url: LINKS.WEBSITE,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Veyronix',
          url: LINKS.WEBSITE,
          logo: {
            '@type': 'ImageObject',
            url: LINKS.OG_IMAGE_URL,
          },
        },
        keywords: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Ana Sayfa',
            item: LINKS.WEBSITE,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog & Rehberler',
            item: LINKS.PAGE_BLOG,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostDetailClient post={post} relatedPosts={related} />
    </>
  );
}
