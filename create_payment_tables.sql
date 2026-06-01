-- 1. Kripto Ödemeleri Tablosu
CREATE TABLE IF NOT EXISTS crypto_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'USDT',
  duration_days INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crypto_payments_order_id ON crypto_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_guild_id ON crypto_payments(guild_id);

ALTER TABLE crypto_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON crypto_payments FOR ALL USING (true) WITH CHECK (true);

-- 2. Paket Yönetimi (Pricing Plans) Tablosu
CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'USDT',
  duration_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  features_tr JSONB DEFAULT '[]',
  features_en JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role plans" ON pricing_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow read access for all" ON pricing_plans FOR SELECT USING (true);

-- Varsayılan paketleri ekle (Eğer tablo boşsa)
INSERT INTO pricing_plans (id, name_tr, name_en, amount, duration_days, sort_order, is_featured, features_tr, features_en)
VALUES
  ('7_days', '7 Günlük Paket', '7 Days Package', '1.00', 7, 1, false, '["Gelişmiş Parti Sistemi", "Tam Web Paneli Erişimi"]', '["Advanced Party System", "Full Web Dashboard Access"]'),
  ('1_month', '1 Aylık Paket', '1 Month Package', '8.00', 30, 2, false, '["Gelişmiş Parti Sistemi", "Tam Web Paneli Erişimi"]', '["Advanced Party System", "Full Web Dashboard Access"]'),
  ('3_months', '3 Aylık Paket', '3 Months Package', '17.99', 90, 3, true, '["Gelişmiş Parti Sistemi", "Sınırsız Parti Kurma", "Tam Web Paneli Erişimi", "Öncelikli Discord Desteği"]', '["Advanced Party System", "Unlimited Party Creation", "Full Web Dashboard Access", "Priority Discord Support"]'),
  ('1_year', '1 Yıllık Paket', '1 Year Package', '65.00', 365, 4, false, '["Gelişmiş Parti Sistemi", "Sınırsız Parti Kurma", "Tam Web Paneli Erişimi", "Öncelikli Discord Desteği"]', '["Advanced Party System", "Unlimited Party Creation", "Full Web Dashboard Access", "Priority Discord Support"]')
ON CONFLICT (id) DO NOTHING;
