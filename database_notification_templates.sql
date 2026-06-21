-- ==============================================================
-- VEYRONIX PREMİUM BİLDİRİM ŞABLONLARI SQL GÜNCELLEMESİ
-- ==============================================================
-- Bu kodların tamamını Supabase -> SQL Editor kısmına yapıştırıp 
-- tek seferde çalıştırarak bildirim şablonlarınızı oluşturabilirsiniz.

-- 1. Admin tarafından manuel Premium eklendiğinde gönderilen DM Bildirimi
INSERT INTO public.notification_templates (id, title_tr, title_en, content_tr, content_en, color, is_embed)
VALUES (
  'user_premium_admin',
  '✨ Veyronix Premium Activated / Aktif Edildi!',
  '✨ Veyronix Premium Activated / Aktif Edildi!',
  '🇬🇧 **Premium Subscription Activated!**
Your individual premium subscription has been defined by the Administrator!
• All premium features have been activated.
• The Top.gg vote requirement has been removed.
• You can now use the bot without limits (Duration: **{sure}**).
• Website: https://veyronix.com.tr

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

🇹🇷 **Premium Aboneliği Aktif Edildi!**
Bireysel premium aboneliğiniz Yönetici tarafından tanımlandı!
• Tüm premium özellikleriniz aktif edildi.
• Top.gg oy verme zorunluluğunuz kaldırıldı.
• Botu artık sınırsız kullanabilirsiniz (Süre: **{sure}**).
• Web Sitesi: https://veyronix.com.tr',
  '🇬🇧 **Premium Subscription Activated!**
Your individual premium subscription has been defined by the Administrator!
• All premium features have been activated.
• The Top.gg vote requirement has been removed.
• You can now use the bot without limits (Duration: **{sure}**).
• Website: https://veyronix.com.tr

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

🇹🇷 **Premium Aboneliği Aktif Edildi!**
Bireysel premium aboneliğiniz Yönetici tarafından tanımlandı!
• Tüm premium özellikleriniz aktif edildi.
• Top.gg oy verme zorunluluğunuz kaldırıldı.
• Botu artık sınırsız kullanabilirsiniz (Süre: **{sure}**).
• Web Sitesi: https://veyronix.com.tr',
  '#fca311',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title_tr = EXCLUDED.title_tr,
  title_en = EXCLUDED.title_en,
  content_tr = EXCLUDED.content_tr,
  content_en = EXCLUDED.content_en,
  color = EXCLUDED.color,
  is_embed = EXCLUDED.is_embed;

-- 2. Otomatik satın alım onaylandığında gönderilen DM Bildirimi
INSERT INTO public.notification_templates (id, title_tr, title_en, content_tr, content_en, color, is_embed)
VALUES (
  'user_premium_bought',
  '🎉 Veyronix Premium Activated / Aktif Edildi!',
  '🎉 Veyronix Premium Activated / Aktif Edildi!',
  '🇬🇧 **Thank You for Your Purchase!**
Your individual premium subscription has been successfully activated!
• All premium features have been activated.
• The Top.gg vote requirement has been removed.
• You can now use the bot without limits for **{gun} days**.
• Website: https://veyronix.com.tr

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

🇹🇷 **Satın Alımınız İçin Teşekkürler!**
Bireysel premium aboneliğiniz başarıyla aktif edildi!
• Tüm premium özellikleriniz aktif edildi.
• Top.gg oy verme zorunluluğunuz kaldırıldı.
• Botu artık **{gun} gün** boyunca sınırsız kullanabilirsiniz.
• Web Sitesi: https://veyronix.com.tr',
  '🇬🇧 **Thank You for Your Purchase!**
Your individual premium subscription has been successfully activated!
• All premium features have been activated.
• The Top.gg vote requirement has been removed.
• You can now use the bot without limits for **{gun} days**.
• Website: https://veyronix.com.tr

▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

🇹🇷 **Satın Alımınız İçin Teşekkürler!**
Bireysel premium aboneliğiniz başarıyla aktif edildi!
• Tüm premium özellikleriniz aktif edildi.
• Top.gg oy verme zorunluluğunuz kaldırıldı.
• Botu artık **{gun} gün** boyunca sınırsız kullanabilirsiniz.
• Web Sitesi: https://veyronix.com.tr',
  '#2ecc71',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title_tr = EXCLUDED.title_tr,
  title_en = EXCLUDED.title_en,
  content_tr = EXCLUDED.content_tr,
  content_en = EXCLUDED.content_en,
  color = EXCLUDED.color,
  is_embed = EXCLUDED.is_embed;
