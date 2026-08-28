# Veyronix Veritabanı Şeması (Supabase)

Bu dosya, projenin veritabanı yapısını ve aktif olarak kullanılan 30 tablonun kullanım amaçlarını içerir.

## Aktif Tablolar

### 1. Sistem ve Kullanıcı Yönetimi
- **`users`**: Kullanıcı bazlı verileri (Discord ID) ve global premium durumlarını saklar.
- **`system_settings`**: Sistem genelindeki ayarları (key/value formatında) tutar.
- **`bot_analytics`**: Botun genel kullanım verilerini ve istatistiklerini (event bazlı) kaydeder.
- **`user_templates`**: Kullanıcıların oluşturduğu parti/ekip şablonlarını saklar.
- **`user_votes`**: Top.gg vb. platformlardan bota oy veren kullanıcıların kayıtlarını tutar.

### 2. Abonelik ve Ödemeler
- **`subscriptions`**: Sunucuların abonelik durumlarını (başlangıç, bitiş, aktiflik) takip eder.
- **`pricing_plans`**: Satışta olan premium paketlerin özelliklerini ve fiyatlarını tutar.
- **`bank_accounts`**: Manuel havale/EFT ödemeleri için gösterilecek banka hesabı (IBAN) bilgilerini tutar.
- **`crypto_payments`**: Kripto para ile yapılan ödeme işlemlerinin kayıtlarını (sipariş ID, durum) saklar.
- **`auto_premium_rules`**: Otomatik premium verilecek sunuculara veya üyelere dair kuralları tanımlar.

### 3. Sunucu (Guild) ve Moderasyon
- **`guild_settings`**: Her sunucuya özel yapılandırmaları (dil, yetkili roller, hoş geldin mesajları vb.) saklar.
- **`cached_guild_members`**: Sunucu üyelerinin önbelleğe alınmış listesini tutarak hızlı erişim sağlar.
- **`custom_role_menus`**: Sunuculardaki özel rol seçim menülerinin (Reaction/Button Role) ayarlarını saklar.
- **`temp_roles`**: Belirli bir süre sonra süresi dolacak olan geçici rollerin kayıtlarını tutar.
- **`tickets`**: Sunucularda açılan destek taleplerinin (ticket) ve log/transcript verilerinin kaydını tutar.

### 4. Kampanya ve Promosyonlar
- **`campaigns`**: Genel indirim ve promosyon kampanyalarının bilgilerini tutar.
- **`campaign_logs`**: Kampanyalar hakkında kullanıcılara gönderilen logları ve durumları saklar.
- **`promo_usages`**: Kullanıcıların hangi promosyon/kampanya kodlarını kullandığını takip eder.

### 5. Bildirim ve İletişim
- **`message_queue`**: Botun kullanıcılara veya kanallara göndereceği bildirimlerin kuyruğudur.
- **`notification_templates`**: Sistem mesajlarının (hoş geldin, süre bitimi vb.) çoklu dil destekli şablonlarını tutar.
- **`scheduled_messages`**: Belirli zamanlarda otomatik olarak gönderilecek zamanlanmış mesajları saklar.

### 6. Oyun İçi Entegrasyon (Albion Online vb.)
- **`albion_guild_members`**: Albion Online entegrasyonu ile sunucudaki oyuncu eşleşmelerini tutar.
- **`application_answers`**: Başvuru sistemi (guild/oyun alımları vb.) üzerinden gelen yanıtları kaydeder.

### 7. Çekiliş (Giveaway) Sistemi
- **`giveaways`**: Sunucularda başlatılan çekilişlerin genel ayarlarını (ödül, süre, bitiş tarihi) saklar.
- **`giveaway_participants`**: Çekilişe katılan kullanıcıların kayıtlarını tutar.
- **`giveaway_history`**: Sona eren çekilişlerin geçmişini ve kazananlarını kaydeder.

### 8. Drop Sistemi (Puan/Ödül Düşürme)
- **`drop_settings`**: Kanallarda rastgele belirecek olan ödüllerin/puanların kurallarını tutar.
- **`drop_logs`**: Beliren dropların ne zaman kime düştüğü bilgisini kaydeder.
- **`drop_points`**: Kullanıcıların kazandığı toplam drop puanlarını saklar.

### 9. Web ve İçerik
- **`blog_posts`**: Web sitesindeki blog yazılarının (title, content, slug, views) verilerini tutar.

---

## Silinen / Arşivlenen Tablolar (Geçmiş)
- `changelogs`: Statik koda (`apps/web/src/app/changelog/page.js`) taşındığı için hem koddan hem DB'den silindi.
- `user_guild_access`: Dashboard yetki kontrolleri session üzerinden yapıldığı için gereksiz olduğu tespit edilip DB'den DROP edildi.
- `guild_blacklist`: Aktif kullanımda olmadığı için silindi.
- `support_rewards`, `global_roles`, `guild_roles`: Eski planlamalarda kalan ve uygulanmamış çürük tablolar.
