# Veyronix Veritabanı Şeması (Supabase)

Bu dosya, projenin veritabanı yapısını ve tabloların kullanım amaçlarını içerir.

## Aktif Tablolar

### 1. `subscriptions`
Sunucuların abonelik durumlarını ve kullanım sürelerini takip eder.
- `guild_id` (text): Sunucunun Discord ID'si.
- `guild_name` (text): Sunucu adı.
- `owner_id` (text): Sunucu sahibinin ID'si.
- `expires_at` (timestamp): Aboneliğin veya deneme sürümünün bitiş tarihi.
- `is_active` (boolean): Abonelik aktif mi?
- `is_unlimited` (boolean): Sınırsız paket mi?
- `trial_used` (boolean): 3 günlük deneme kullanıldı mı?
- `one_day_notified` (boolean): 1 gün kala bildirimi gönderildi mi?

### 2. `guild_settings`
Her sunucuya özel yapılandırmaları saklar.
- `guild_id` (text): Sunucunun Discord ID'si.
- `owner_id` (text): Sunucu sahibinin ID'si.
- `language` (text): Botun sunucudaki dili (tr/en).
- `embed_thumbnail_url` (text): Discord mesajlarındaki logo/resim linki.
- `whitelist` (jsonb): Aynı anda birden fazla parti kurabilen rol/kullanıcı ID listesi.
- `party_templates` (jsonb): Sunucuya özel kaydedilmiş parti şablonları.
- `auto_role_sync` (boolean): Kayıtlı üyelerin rollerini otomatik eşitleme ayarı.

### 3. `support_rewards`
Destek sunucusuna katılan kullanıcılara verilen tek seferlik ödülleri takip eder.
- `user_id` (text): Ödülü alan kullanıcının ID'si.
- `guild_id` (text): Ödülün tanımlandığı sunucu ID'si.
- `awarded_at` (timestamp): Ödülün verildiği tarih.

### 4. `message_queue`
Botun kullanıcılara göndereceği bildirimlerin kuyruğudur. `broadcastService.js` tarafından işlenir.
- `message_content` (text): Gönderilecek mesaj metni veya JSON embed yapısı.
- `status` (text): Mesajın durumu (`pending`, `processing`, `completed`, `failed`).
- `error_message` (text): Eğer gönderim başarısız olursa hata detayı.
- `subscription_id` (uuid): İlgili abonelik kaydına referans.

### 5. `users`
Kullanıcı bazlı verileri ve global premium durumlarını saklar.
- `discord_id` (text): Kullanıcının global Discord ID'si.
- `premium_until` (timestamp): Kullanıcı bazlı premium bitiş tarihi.
- `is_unlimited` (boolean): Kullanıcının sınırsız erişimi var mı?

---

## Silinen / Arşivlenen Tablolar (Notlar)
- `changelogs`: Statik koda (`apps/web/src/app/changelog/page.js`) taşındığı için silindi.
- `guild_blacklist`: Aktif kullanımda olmadığı için silindi.
- `user_guild_access`: Dashboard yetki kontrolleri artık direkt session üzerinden yapıldığı için silindi.
- `pending_links`: Eski hesap bağlama sistemi parçası, şu an kullanılmıyor.
