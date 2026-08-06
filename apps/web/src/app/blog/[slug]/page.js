import { getBlogPostBySlug, getAllBlogPosts, getRelatedPosts } from '@/lib/supabaseBlog';
import Navbar from "@/components/Navbar";
import BlogPostDetailClient from "@/components/BlogPostDetailClient";
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Makale Bulunamadı | Veyronix Blog' };
  }
  return {
    title: `${post.title} | Veyronix Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : [],
    }
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

  return (
    <>
      <Navbar />
      <BlogPostDetailClient post={post} relatedPosts={related} />
    </>
  );
}
