-- ==============================================================
-- VEYRONIX MONETİZASYON VE LİSANS SİSTEMİ VERİTABANI GÜNCELLEMESİ
-- ==============================================================
-- Bu SQL kodlarını Supabase SQL Editor alanına yapıştırıp çalıştırın.

-- 1. pricing_plans tablosuna 'plan_type' kolonu ekleme
ALTER TABLE public.pricing_plans 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'server';

-- 2. crypto_payments tablosuna 'plan_type' kolonu ekleme
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'server';

-- 3. pricing_plans tablosuna 'duration_days' kolonu yoksa ekleme
ALTER TABLE public.pricing_plans 
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;

-- 4. Eski planları temizle
DELETE FROM public.pricing_plans;

-- 5. Yeni Monetizasyon Paketlerini Ekle (3 Paket/Tür)

-- A. Bireysel Oylama Muafiyeti (plan_type: user)
INSERT INTO public.pricing_plans (id, name_tr, name_en, amount, duration_days, plan_type, features_tr, features_en, sort_order, is_active)
VALUES 
(
  'vote_bypass_1m',
  'Bireysel Oylama Muafiyeti (1 Ay)',
  'Individual Vote Bypass (1 Month)',
  2.99,
  30,
  'user',
  to_jsonb(ARRAY['Haftalık Top.gg oylamasından muafiyet', 'Tüm sunucularda geçerlidir', 'Kesintisiz parti katılımı']),
  to_jsonb(ARRAY['Bypass weekly Top.gg voting', 'Valid across all servers', 'Uninterrupted party participation']),
  10,
  true
),
(
  'vote_bypass_1y',
  'Bireysel Oylama Muafiyeti (1 Yıl)',
  'Individual Vote Bypass (1 Year)',
  19.99,
  365,
  'user',
  to_jsonb(ARRAY['Haftalık Top.gg oylamasından muafiyet', 'Tüm sunucularda geçerlidir', 'Kesintisiz parti katılımı', 'Ekonomik yıllık paket']),
  to_jsonb(ARRAY['Bypass weekly Top.gg voting', 'Valid across all servers', 'Uninterrupted party participation', 'Economic yearly plan']),
  20,
  true
);

-- B. Sunucu Premium Paketleri (plan_type: server)
INSERT INTO public.pricing_plans (id, name_tr, name_en, amount, duration_days, plan_type, features_tr, features_en, sort_order, is_active)
VALUES 
(
  'guild_premium_1m',
  'Sunucu Premium (1 Ay)',
  'Guild Premium (1 Month)',
  8.00,
  30,
  'server',
  to_jsonb(ARRAY['Gelişmiş Otomatik Rol Eşitleme (Loncadan Çıkışta Temizleme)', 'Günlük Otomatik KillBoard Özet Raporları', 'Objektif ve Timer Takip Sistemi', 'Özelleştirilmiş Embed Rengi ve Logosu']),
  to_jsonb(ARRAY['Advanced Auto-Role Sync (Cleanup on Guild Leave)', 'Daily Automatic KillBoard Summaries', 'Objective and Timer Tracking System', 'Customized Embed Colors and Logo']),
  30,
  true
),
(
  'guild_premium_3m',
  'Sunucu Premium (3 Ay)',
  'Guild Premium (3 Month)',
  17.99,
  90,
  'server',
  to_jsonb(ARRAY['Gelişmiş Otomatik Rol Eşitleme (Loncadan Çıkışta Temizleme)', 'Günlük Otomatik KillBoard Özet Raporları', 'Objektif ve Timer Takip Sistemi', 'Özelleştirilmiş Embed Rengi ve Logosu', 'Öncelikli Destek']),
  to_jsonb(ARRAY['Advanced Auto-Role Sync (Cleanup on Guild Leave)', 'Daily Automatic KillBoard Summaries', 'Objective and Timer Tracking System', 'Customized Embed Colors and Logo', 'Priority Support']),
  40,
  true
),
(
  'guild_premium_1y',
  'Sunucu Premium (1 Yıl)',
  'Guild Premium (1 Year)',
  65.00,
  365,
  'server',
  to_jsonb(ARRAY['Gelişmiş Otomatik Rol Eşitleme (Loncadan Çıkışta Temizleme)', 'Günlük Otomatik KillBoard Özet Raporları', 'Objektif ve Timer Takip Sistemi', 'Özelleştirilmiş Embed Rengi ve Logosu', 'Öncelikli Destek (1 Yıl)']),
  to_jsonb(ARRAY['Advanced Auto-Role Sync (Cleanup on Guild Leave)', 'Daily Automatic KillBoard Summaries', 'Objective and Timer Tracking System', 'Customized Embed Colors and Logo', 'Priority Support (1 Year)']),
  50,
  true
);
