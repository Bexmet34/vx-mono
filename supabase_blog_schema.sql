-- Supabase blog_posts Tablosu Oluşturma SQL'i
-- Bu sorguyu Supabase Dashboard -> SQL Editor kısmında çalıştırabilirsiniz.

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT DEFAULT 'Rehber',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT DEFAULT 'Veyronix Ekibi',
  author_avatar TEXT DEFAULT 'https://veyronix.com.tr/icon.svg',
  read_time_minutes INT DEFAULT 5,
  lang TEXT DEFAULT 'tr',
  status TEXT DEFAULT 'published',
  views_count INT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hızlı erişim için indeksler
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published_at DESC) WHERE status = 'published';

-- Row Level Security (RLS) Ayarları
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilsin (Anonim kullanıcılar erişebilsin)
CREATE POLICY "Public Read Access" 
  ON public.blog_posts 
  FOR SELECT 
  USING (status = 'published');

-- Yalnızca Service Role veya yetkili kullanıcılar ekleme/güncelleme yapabilsin
CREATE POLICY "Service Role Insert/Update Access" 
  ON public.blog_posts 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
