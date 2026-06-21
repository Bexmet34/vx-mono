-- Mevcut 'crypto_payments' tablosunu Havale/EFT ödemelerini de destekleyecek şekilde genişletiyoruz.
-- Böylece gereksiz yere fazladan tablo açmamış oluyoruz.

-- 1. Hangi ödeme yöntemi olduğunu anlamak için 'payment_method' sütunu ekliyoruz
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'crypto';

-- 2. Havale/EFT işlemi için Gönderen (Kart Üzerindeki) İsmi
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS sender_name TEXT;

-- 3. Havale/EFT açıklamasında yer alacak 8 haneli benzersiz kod (Örn: h1rqe31v)
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS description_code TEXT;

-- #4 FIX: description_code UNIQUE kisiti (cakisma onleme)
-- UNIQUE kisiti NULL degerlere toleranslidir, sadece dolu degerlerde cakismayi onler
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

-- 4. Admin panelinde rahat görebilmeniz için Sunucu Adı
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS guild_name TEXT;

-- 5. Kullanıcının hangi bankaya ödeme yaptığını takip etmek için (#2 FIX)
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS target_bank TEXT;

-- #12 FIX: Ödeme zaman asimi — 7 gün sonra otomatik iptal için expires_at
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

-- 6. Dinamik Banka Hesapları Tablosu
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  iban TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Havale/EFT Ödeme Bildirim Sablonları (Onaylandı / Reddedildi)
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

-- =============================================
-- ZORUNLU: Asagidaki degiskenleri apps/web/.env.local dosyasına ekleyin:
--
-- NEXT_PUBLIC_USDT_TRY_RATE=40
-- NEXT_PUBLIC_ADMIN_ID_2=407234961582587916
-- =============================================
