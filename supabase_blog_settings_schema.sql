-- Blog Otomasyon Ayarları ve Özel Anahtar Kelimeler Tablosu (Supabase)
-- Bu SQL kodunu Supabase Dashboard -> SQL Editor kısmında bir kez çalıştırın.

-- 1. Otomasyon Ayarları Tablosu
CREATE TABLE IF NOT EXISTS public.blog_automation_settings (
  id INT PRIMARY KEY DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  schedule_times TEXT[] DEFAULT '{"09:00", "15:00", "21:00"}',
  posts_per_day INT DEFAULT 3,
  preferred_lang TEXT DEFAULT 'tr',
  ai_model TEXT DEFAULT 'gemini-2.0-flash',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Varsayılan ayar kaydını oluştur
INSERT INTO public.blog_automation_settings (id, is_active, schedule_times, posts_per_day)
VALUES (1, true, ARRAY['09:00', '15:00', '21:00'], 3)
ON CONFLICT (id) DO NOTHING;

-- 2. Özel Anahtar Kelimeler ve Konu Havuzu Tablosu
CREATE TABLE IF NOT EXISTS public.blog_custom_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'Genel',
  priority INT DEFAULT 1, -- 1: Normal, 2: Yüksek Öncelikli
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Ayarları
ALTER TABLE public.blog_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_custom_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Settings" ON public.blog_automation_settings FOR SELECT USING (true);
CREATE POLICY "Service Role All Settings" ON public.blog_automation_settings FOR ALL USING (true);

CREATE POLICY "Public Read Keywords" ON public.blog_custom_keywords FOR SELECT USING (true);
CREATE POLICY "Service Role All Keywords" ON public.blog_custom_keywords FOR ALL USING (true);
