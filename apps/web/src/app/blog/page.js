import { getAllBlogPosts } from '@/lib/supabaseBlog';
import Navbar from "@/components/Navbar";
import BlogListClient from "@/components/BlogListClient";

export const metadata = {
  title: 'Blog & Rehberler | Veyronix',
  description: 'Albion Online parti yönetimi, Discord oyun botları, sunucu otomasyonu ve topluluk yönetimi hakkında kapsamlı rehberler ve ipuçları.',
};

export const revalidate = 60; // 60 saniyede bir yeni yazıları kontrol et (ISR)

export default async function BlogIndex() {
  const posts = await getAllBlogPosts();

  return (
    <>
      <Navbar />
      <BlogListClient allPosts={posts} />
    </>
  );
}
