import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

export function getPostSlugs() {
  if (!fs.existsSync(contentDirectory)) {
    try {
      fs.mkdirSync(contentDirectory, { recursive: true });
    } catch(e) {}
    return [];
  }
  return fs.readdirSync(contentDirectory).filter(file => file.endsWith('.md'));
}

export function getPostBySlug(slug) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(contentDirectory, `${realSlug}.md`);
  
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return { slug: realSlug, meta: data, content };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter(Boolean)
    .sort((post1, post2) => {
      // Sort posts by date in descending order
      const date1 = post1.meta.date ? new Date(post1.meta.date) : new Date(0);
      const date2 = post2.meta.date ? new Date(post2.meta.date) : new Date(0);
      return date1 > date2 ? -1 : 1;
    });
  return posts;
}
