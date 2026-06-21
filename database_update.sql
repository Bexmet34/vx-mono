-- ==============================================================
-- VEYRONIX BİRLEŞTİRİLMİŞ VERİTABANI GÜNCELLEME VE LİSANS SİSTEMİ SQL
-- ==============================================================
-- Bu kodların tamamını Supabase -> SQL Editor kısmına yapıştırıp 
-- tek seferde çalıştırarak veritabanınızı otomatik olarak güncelleyebilirsiniz.

-- --------------------------------------------------------------
-- 1. YENİ TABLOLAR VE MEVCUT TABLOLARIN ALANLARININ GENİŞLETİLMESİ
-- --------------------------------------------------------------

-- Hangi ödeme yöntemi olduğunu anlamak için 'payment_method' sütunu ekliyoruz
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'crypto';

-- Havale/EFT işlemi için Gönderen (Kart Üzerindeki) İsmi
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- Havale/EFT açıklamasında yer alacak 8 haneli benzersiz kod (Örn: h1rqe31v)
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS description_code TEXT;

-- description_code UNIQUE kısıtı (Çakışma önleme)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'crypto_payments_description_code_unique'
  ) THEN
    ALTER TABLE public.crypto_payments 
    ADD CONSTRAINT crypto_payments_description_code_unique UNIQUE (description_code);
  END IF;
END $$;

-- Admin panelinde rahat görebilmeniz için Sunucu Adı
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS guild_name TEXT;

-- Kullanıcının hangi bankaya ödeme yaptığını takip etmek için target_bank
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS target_bank TEXT;

-- Ödeme zaman aşımı — 7 gün sonra otomatik iptal için expires_at
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Yeni kayıtlarda varsayılan 7 günlük süre
ALTER TABLE public.crypto_payments 
ALTER COLUMN expires_at SET DEFAULT (timezone('utc'::text, now()) + interval '7 days');

-- Mevcut pending kayıtlar için expires_at'ı güncelle
UPDATE public.crypto_payments 
SET expires_at = created_at + interval '7 days'
WHERE expires_at IS NULL 
  AND payment_method = 'havale' 
  AND status = 'pending';

-- pricing_plans tablosuna 'plan_type' kolonu ekleme
ALTER TABLE public.pricing_plans 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'server';

-- crypto_payments tablosuna 'plan_type' kolonu ekleme
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'server';

-- pricing_plans tablosuna 'duration_days' kolonu yoksa ekleme
ALTER TABLE public.pricing_plans 
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;

-- Dinamik Banka Hesapları Tablosu
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  iban TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Users (Kullanıcılar) tablosuna global premium durumları için alanlar (Yoksa eklenir)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;

-- --------------------------------------------------------------
-- 2. HAVA/EFT ÖDEME BİLDİRİM ŞABLONLARI
-- --------------------------------------------------------------

INSERT INTO public.notification_templates (id, title_tr, title_en, content_tr, content_en, color, is_embed)
VALUES 
(
  'manual_payment_approved', 
  '💳 Ödeme Onaylandı!', 
  '💳 Payment Approved!', 
  'Merhaba, **{sunucu}** sunucusu için yaptığınız Havale/EFT işlemi onaylandı ve aboneliğinize **{gun} gün** eklendi! Bizi tercih ettiğiniz için teşekkür ederiz.', 
  'Hello, your manual payment for **{sunucu}** has been approved and **{gun} days** have been added to your subscription! Thank you for choosing us.', 
  '#2ecc71', 
  true
),
(
  'manual_payment_rejected', 
  '❌ Ödeme Reddedildi', 
  '❌ Payment Rejected', 
  'Merhaba, **{sunucu}** sunucusu için yaptığınız Havale/EFT işlemi reddedildi. Lütfen ödeme açıklamanızın doğru olduğundan emin olun veya destek ekibiyle iletişime geçin.', 
  'Hello, your manual payment for **{sunucu}** has been rejected. Please ensure your payment description is correct or contact the support team.', 
  '#e74c3c', 
  true
)
ON CONFLICT (id) DO UPDATE SET
  title_tr = EXCLUDED.title_tr,
  title_en = EXCLUDED.title_en,
  content_tr = EXCLUDED.content_tr,
  content_en = EXCLUDED.content_en,
  color = EXCLUDED.color;

-- --------------------------------------------------------------
-- 3. YENİ MONETİZASYON VE LİSANS PAKETLERİ (ÜÇ PAKET SİSTEMİ)
-- --------------------------------------------------------------

-- Eski plan kayıtlarını temizleyip yenilerini ekliyoruz
DELETE FROM public.pricing_plans;

-- A. BİREYSEL OYLAMA MUAFİYETİ (plan_type: user)
-- Botun bulunduğu tüm sunucularda oylama yapma zorunluluğunu kaldırır.
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

-- B. SUNUCU PREMİUM PAKETLERİ (plan_type: server)
-- Sunucu bazlı gelişmiş özellikleri aktifleştirir.
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

-- 4. ALBION GUILD MULTI-REGION DESTEĞİ
-- Lonca ayarlarında Albion Online sunucusunu (bölgesini) saklamak için
ALTER TABLE public.guild_settings 
ADD COLUMN IF NOT EXISTS albion_server TEXT DEFAULT 'Europe';

-- ==============================================================
-- BİLGİLENDİRME:
-- Lütfen sunucunuzun .env / .env.local dosyalarına şunları eklediğinizden emin olun:
-- NEXT_PUBLIC_USDT_TRY_RATE=48
-- NEXT_PUBLIC_ADMIN_ID_2=407234961582587916
-- ==============================================================


-- 5. Kripto odeme durum kisitlamasi guncellemesi (rejected ve cancel eklendi)
ALTER TABLE public.crypto_payments DROP CONSTRAINT IF EXISTS crypto_payments_status_check;
ALTER TABLE public.crypto_payments ADD CONSTRAINT crypto_payments_status_check CHECK (status IN ('pending', 'paid', 'cancel', 'rejected', 'failed', 'paid_over'));
