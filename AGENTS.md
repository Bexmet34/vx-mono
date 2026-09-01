# Veyronix Hostinger E-Posta & MCP Gönderim Kuralları

## Mailbox & API Bilgileri
- **Resmi E-Posta Adresi:** `info@veyronix.com.tr`
- **Mailbox Resource ID:** `AC30b8d8ceec68a6689b8b6a0ece64`
- **Order Resource ID:** `OR1a85b557ef0111b81fbb336143c1`
- **API Base URL:** `https://api.mail.hostinger.com`
- **Gönderim Endpoint:** `POST /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/send`
- **Klasörler:** `INBOX` (Gelen), `INBOX.Sent` (Gönderilen), `INBOX.Drafts` (Taslak), `INBOX.Junk` (Spam), `INBOX.Trash` (Çöp)

Hostinger Email MCP sunucusu (`email_call_api_write` / `email_call_api_read`) kullanılarak e-posta gönderildiğinde:

1. **HTML Gövdesi (`html`):** Mesaj metninin sonuna mutlaka aşağıdaki Veyronix resmi HTML imzasını ekleyin.
2. **Düz Metin Gövdesi (`text`):** Mesaj metninin sonuna mutlaka aşağıdaki düz metin imzasını ekleyin.
3. **Gönderici (`from`):** Her zaman `{ "name": "Veyronix", "address": "info@veyronix.com.tr" }` olarak tanımlanmalıdır.

### Resmi HTML İmza Şablonu

```html
<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #1e293b; margin-top: 24px; padding-top: 18px; border-top: 2px solid #e2e8f0; width: 100%; max-width: 580px;">
  <tr>
    <td valign="middle" style="width: 56px; padding-right: 16px;">
      <a href="https://veyronix.com.tr" target="_blank" style="text-decoration: none; display: block;">
        <img src="https://veyronix.com.tr/icon.png" alt="Veyronix" width="48" height="48" style="display: block; border-radius: 10px; border: 0;" />
      </a>
    </td>
    <td valign="top" style="border-left: 2px solid #6366f1; padding-left: 16px;">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
        Veyronix <span style="font-size: 11px; font-weight: 600; color: #6366f1; background-color: #eef2ff; padding: 2px 8px; border-radius: 12px; margin-left: 4px; vertical-align: middle;">Platform</span>
      </div>
      <div style="font-size: 12px; color: #64748b; margin-top: 3px; font-weight: 500;">
        Discord Otomasyon & Topluluk Yönetim Sistemi
      </div>
      
      <div style="margin-top: 10px; font-size: 13px;">
        <span style="display: inline-block; margin-right: 14px;">
          🌐 <a href="https://veyronix.com.tr" target="_blank" style="color: #4f46e5; text-decoration: none; font-weight: 600;">veyronix.com.tr</a>
        </span>
        <span style="display: inline-block; margin-right: 14px;">
          💬 <a href="https://veyronix.com.tr/support" target="_blank" style="color: #5865F2; text-decoration: none; font-weight: 600;">Destek Sunucusu</a>
        </span>
        <span style="display: inline-block;">
          📚 <a href="https://docs.veyronix.com.tr" target="_blank" style="color: #0284c7; text-decoration: none; font-weight: 600;">Dokümantasyon</a>
        </span>
      </div>

      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
        E-posta: <a href="mailto:info@veyronix.com.tr" style="color: #64748b; text-decoration: none;">info@veyronix.com.tr</a> | © 2026 Veyronix. Tüm hakları saklıdır.
      </div>
    </td>
  </tr>
</table>
```

### Düz Metin (Plain Text) İmza Şablonu

```text
--
Veyronix Platform | Discord Otomasyon & Topluluk Yönetim Sistemi
🌐 Web: https://veyronix.com.tr
💬 Destek Sunucusu: https://veyronix.com.tr/support
📚 Dokümantasyon: https://docs.veyronix.com.tr
✉️ E-posta: info@veyronix.com.tr
```

---

# Git Commit Mesajı Kuralları

Tüm Git commit mesajları, özetleri ve IDE commit başlıkları (Generate butonu dahil) oluşturulurken:

1. **Dil:** Her zaman **Türkçe** olarak yazılmalıdır.
2. **Format:** Conventional Commits standardına uygun olmalıdır:
   - `feat: <yeni özellik veya ekleme>` (Örn: `feat: discord geçici ses kanalı ve seo sayfaları eklendi`)
   - `fix: <hata düzeltmesi>` (Örn: `fix: sitemap bağlantı hatası giderildi`)
   - `docs: <dokümantasyon veya blog yazıları>` (Örn: `docs: yeni kayıt sistemi rehberi eklendi`)
   - `refactor: <kod düzenlemesi ve mimari iyileştirme>` (Örn: `refactor: admin bileşenleri modüler hale getirildi`)
   - `style: <tasarım ve css güncellemeleri>` (Örn: `style: navbar ve footer tasarımı yenilendi`)
   - `chore: <bağımlılık, yapılandırma ve derleme güncellemeleri>` (Örn: `chore: jsconfig yol eşlemeleri eklendi`)

