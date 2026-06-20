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

-- 4. Admin panelinde rahat görebilmeniz için Sunucu Adı
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS guild_name TEXT;

-- 5. Kullanıcının hangi bankaya ödeme yaptığını takip etmek için
ALTER TABLE public.crypto_payments 
ADD COLUMN IF NOT EXISTS target_bank TEXT;

-- 6. Dinamik Banka Hesapları Tablosu
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  iban TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
