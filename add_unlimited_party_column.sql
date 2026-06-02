-- Sunuculara unlimited_party (sınırsız party açma) kolonu ekle
-- Bu migration sadece bir kez çalıştırılmalıdır.
-- Supabase Dashboard > SQL Editor'de çalıştırın.

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS unlimited_party boolean DEFAULT false;

-- Doğrulama
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' AND column_name = 'unlimited_party';
