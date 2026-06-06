import { getAllPosts } from '@/lib/markdown';
import Navbar from "@/components/Navbar";
import BlogListClient from "@/components/BlogListClient";

export const metadata = {
  title: 'Blog & Rehberler | Veyronix',
  description: 'Albion Online parti yönetimi, Discord oyun botları ve topluluk yönetimi hakkında en güncel ipuçları ve rehberler.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <BlogListClient allPosts={posts} />
    </>
  );
}
