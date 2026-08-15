-- ============================================================
-- Veyronix — Random Drop Sistemi SQL Migration
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- 1. Drop ayarları tablosu (sunucu başına bir kayıt)
CREATE TABLE IF NOT EXISTS public.drop_settings (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id              TEXT NOT NULL UNIQUE,
    is_enabled            BOOLEAN DEFAULT FALSE,
    channel_ids           JSONB DEFAULT '[]'::jsonb,        -- İzlenecek kanal ID'leri dizisi
    schedule_type         TEXT DEFAULT 'exact_minutes',      -- 'exact_minutes' | 'hourly_chance' | 'random_interval' | 'activity'
    exact_minutes         JSONB DEFAULT '[]'::jsonb,         -- [0, 15, 30, 45] (schedule_type = 'exact_minutes' ise)
    hourly_chance_pct     INT DEFAULT 25,                    -- Her saat başı tetiklenme ihtimali % (schedule_type = 'hourly_chance' ise)
    random_interval_min   INT DEFAULT 30,                    -- Rastgele düşme aralığı Min (dakika)
    random_interval_max   INT DEFAULT 120,                   -- Rastgele düşme aralığı Max (dakika)
    drop_chance           TEXT DEFAULT 'medium',             -- 'low' | 'medium' | 'high' | 'custom' (Aktivite modu için)
    custom_chance_pct     INT DEFAULT 15,                    -- Özel % oran (drop_chance = 'custom' ise)
    cooldown_minutes      INT DEFAULT 15,                    -- İki drop arası minimum bekleme süresi
    reward_type           TEXT DEFAULT 'coin',               -- 'coin' | 'xp' | 'role' | 'ticket'
    reward_amount         INT DEFAULT 100,                   -- Coin/XP miktarı (rol/bilet için kullanılmaz)
    reward_role_id        TEXT DEFAULT NULL,                 -- Rol ödülü seçildiyse Discord rol ID'si
    silence_threshold_min INT DEFAULT 15,                    -- Kanal "sessiz" sayılma süresi (dakika)
    burst_threshold_msg   INT DEFAULT 30,                    -- Burst tetiklemek için gereken mesaj sayısı
    burst_window_sec      INT DEFAULT 180,                   -- Burst için bakılan pencere (saniye)
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Drop geçmişi / log tablosu
CREATE TABLE IF NOT EXISTS public.drop_logs (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guild_id      TEXT NOT NULL,
    channel_id    TEXT NOT NULL,
    message_id    TEXT DEFAULT NULL,          -- Discord mesaj ID'si (embed)
    trigger_type  TEXT NOT NULL,              -- 'silence_break' | 'burst'
    claimed_by    TEXT DEFAULT NULL,          -- Kazanan kullanıcı Discord ID'si
    claimed_at    TIMESTAMPTZ DEFAULT NULL,
    reward_type   TEXT NOT NULL,
    reward_amount INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_drop_logs_guild_id    ON public.drop_logs (guild_id);
CREATE INDEX IF NOT EXISTS idx_drop_logs_claimed_by  ON public.drop_logs (claimed_by);
CREATE INDEX IF NOT EXISTS idx_drop_settings_guild   ON public.drop_settings (guild_id);

-- 4. Atomik Claim RPC Fonksiyonu
--    Bot bu fonksiyonu çağırır; sadece claimed_by NULL ise günceller.
--    TRUE dönerse: bu kullanıcı kazandı | FALSE dönerse: başkası kapmış
CREATE OR REPLACE FUNCTION public.claim_drop(p_drop_id UUID, p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows INT;
BEGIN
  UPDATE public.drop_logs
  SET
    claimed_by = p_user_id,
    claimed_at = NOW()
  WHERE
    id         = p_drop_id
    AND claimed_by IS NULL;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

-- 5. updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_drop_settings_updated_at ON public.drop_settings;
CREATE TRIGGER trg_drop_settings_updated_at
  BEFORE UPDATE ON public.drop_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. RLS (Row Level Security) — Supabase için temel güvenlik
ALTER TABLE public.drop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_logs     ENABLE ROW LEVEL SECURITY;

-- Service role (backend) her şeyi okuyup yazabilir
CREATE POLICY IF NOT EXISTS "service_drop_settings_all"
  ON public.drop_settings FOR ALL
  USING (true);

CREATE POLICY IF NOT EXISTS "service_drop_logs_all"
  ON public.drop_logs FOR ALL
  USING (true);
