-- 1. SECURITY DEFINER Uyarısını Çözme (Postgres 15+)
-- View'ı sorgulayanın kendi yetkisiyle çalışmasını sağlar.
ALTER VIEW public.user_guild_access SET (security_invoker = true);

-- 2. Belirtilen Bütün Tablolarda RLS'yi Aktif Etme
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- 3. Frontend (Tarayıcı) İçin Sadece Okuma (SELECT) Yetkisi Tanımlama
-- UYARI: Eğer bu tablolardaki verilerin dışarıdan tamamen gizli kalmasını istiyorsan, bu SELECT politikalarını silebilirsin.
-- Ancak Next.js veya bot tarafında Service Role Key kullanılmazsa sistem hata verebilir diye temel okuma yetkisi eklenmiştir.
CREATE POLICY "Herkes kampanyaları okuyabilir" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Herkes sistem ayarlarını okuyabilir" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Herkes kullanıcıları okuyabilir" ON public.users FOR SELECT USING (true);
CREATE POLICY "Herkes logları okuyabilir" ON public.campaign_logs FOR SELECT USING (true);
CREATE POLICY "Herkes kullanımları okuyabilir" ON public.promo_usages FOR SELECT USING (true);
CREATE POLICY "Herkes oyları okuyabilir" ON public.user_votes FOR SELECT USING (true);

-- NOT: INSERT, UPDATE ve DELETE işlemleri için politika (policy) eklenmedi!
-- Çünkü bu tabloları düzenleme işlemleri sadece Bot ve Next.js Backend (API) üzerinden yapılmaktadır.
-- Backend sistemleri "Service Role Key" kullandıkları için RLS kurallarını bypass ederek hata almadan her işlemi yapabilirler.
