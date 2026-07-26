import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    
    if (!fs.existsSync(blogDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(blogDir);
    const blogs = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        // Simple frontmatter parsing (very basic)
        const titleMatch = content.match(/title:\s*['"](.*?)['"]/);
        const descMatch = content.match(/description:\s*['"](.*?)['"]/);
        const langMatch = file.endsWith('-en.md') ? 'en' : 'tr';
        
        return {
          slug: file.replace('.md', ''),
          title: titleMatch ? titleMatch[1] : file.replace('.md', ''),
          description: descMatch ? descMatch[1] : 'Rehber ve ipuçları...',
          lang: langMatch
        };
      });

    return NextResponse.json(blogs, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error("Blog API Error:", error);
    return NextResponse.json([]);
  }
}
