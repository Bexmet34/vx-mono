---
name: hostinger-email
description: Hostinger E-posta Yönetimi ve Gönderimi (Mailbox ID, API işlemleri, Veyronix resmi imzaları ve e-posta şablonları)
---

# Hostinger E-Posta MCP & API Kılavuzu (Veyronix)

Bu kılavuz ve beceri (skill), Veyronix platformunun Hostinger Email MCP sunucusu ve API entegrasyonu için gerekli tüm kimlik bilgilerini, mailbox tanımlarını, imza şablonlarını ve API kullanım standartlarını içerir. Başka bir cihazda (örneğin iş yeri bilgisayarında) çalışırken doğrudan bu tanımlar kullanılır.

---

## 1. Mailbox & Hesap Bilgileri

| Parametre | Değer | Açıklama |
| :--- | :--- | :--- |
| **Varsayılan E-Posta** | `info@veyronix.com.tr` | Resmi iletişim ve bildirim adresi |
| **Mailbox Resource ID** | `AC30b8d8ceec68a6689b8b6a0ece64` | API çağrılarındaki `{mailboxResourceId}` parametresi |
| **Order Resource ID** | `OR1a85b557ef0111b81fbb336143c1` | Hostinger sipariş referans numarası |
| **API Base URL** | `https://api.mail.hostinger.com` | Hostinger Mail REST API |
| **Varsayılan Gönderici Adı** | `Veyronix` veya `Veyronix Destek` | Giden e-postalarda görünecek isim |

### Klasör Yapısı (IMAP / Mailbox)
- Gelen Kutusu: `INBOX`
- Gönderilenler: `INBOX.Sent`
- Taslaklar: `INBOX.Drafts`
- İstenmeyen / Spam: `INBOX.Junk`
- Çöp Kutusu: `INBOX.Trash`

---

## 2. Hostinger MCP Araçları ve Kullanım Şekli

Antigravity ve MCP destekli ortamlarda aşağıdaki araçlar kullanılır:

1. **`email_call_api_read`**:
   - `GET /api/v1/me` -> Hesap ve mailbox listesi sorgulama.
   - `GET /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/folders` -> Klasörleri listeleme.
   - `GET /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/folders/INBOX/messages` -> Gelen e-postaları listeleme (query_params: `page`, `perPage`).
   - `GET /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/messages/{messageId}` -> Belirli bir mesajın detayını ve gövdesini okuma.

2. **`email_call_api_write`**:
   - `POST /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/send` -> E-posta gönderme.
   - `POST /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/folders/INBOX/messages/{messageId}/move` -> Mesaj taşıma.

3. **`email_list_operations`** & **`email_describe_operation`**:
   - Desteklenen API rotalarını ve parametre şemalarını listelemek için kullanılır.

---

## 3. E-Posta Gönderme Standartları ve İmzalar

Hostinger MCP üzerinden e-posta gönderilirken (`POST /api/v1/mailboxes/AC30b8d8ceec68a6689b8b6a0ece64/send`), gönderilen her e-postanın sonuna **zorunlu olarak** Veyronix resmi imzaları eklenmelidir.

### JSON Gönderim Payload Şablonu

```json
{
  "from": {
    "name": "Veyronix",
    "address": "info@veyronix.com.tr"
  },
  "to": [
    {
      "name": "Alıcı Adı",
      "address": "alici@example.com"
    }
  ],
  "subject": "E-posta Konusu",
  "html": "<div style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; color: #1e293b; line-height: 1.6;\"><p>Sayın İlgili,</p><p>E-posta içeriğiniz buraya gelecektir.</p><p>İyi çalışmalar dileriz.<br><strong>Veyronix Ekibi</strong></p></div>\n\n<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #1e293b; margin-top: 24px; padding-top: 18px; border-top: 2px solid #e2e8f0; width: 100%; max-width: 580px;\"><tr><td valign=\"middle\" style=\"width: 56px; padding-right: 16px;\"><a href=\"https://veyronix.com.tr\" target=\"_blank\" style=\"text-decoration: none; display: block;\"><img src=\"https://veyronix.com.tr/icon.png\" alt=\"Veyronix\" width=\"48\" height=\"48\" style=\"display: block; border-radius: 10px; border: 0;\" /></a></td><td valign=\"top\" style=\"border-left: 2px solid #6366f1; padding-left: 16px;\"><div style=\"font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;\">Veyronix <span style=\"font-size: 11px; font-weight: 600; color: #6366f1; background-color: #eef2ff; padding: 2px 8px; border-radius: 12px; margin-left: 4px; vertical-align: middle;\">Platform</span></div><div style=\"font-size: 12px; color: #64748b; margin-top: 3px; font-weight: 500;\">Discord Otomasyon & Topluluk Yönetim Sistemi</div><div style=\"margin-top: 10px; font-size: 13px;\"><span style=\"display: inline-block; margin-right: 14px;\">🌐 <a href=\"https://veyronix.com.tr\" target=\"_blank\" style=\"color: #4f46e5; text-decoration: none; font-weight: 600;\">veyronix.com.tr</a></span><span style=\"display: inline-block; margin-right: 14px;\">💬 <a href=\"https://veyronix.com.tr/support\" target=\"_blank\" style=\"color: #5865F2; text-decoration: none; font-weight: 600;\">Destek Sunucusu</a></span><span style=\"display: inline-block;\">📚 <a href=\"https://docs.veyronix.com.tr\" target=\"_blank\" style=\"color: #0284c7; text-decoration: none; font-weight: 600;\">Dokümantasyon</a></span></div><div style=\"margin-top: 8px; font-size: 11px; color: #94a3b8; line-height: 1.4;\">E-posta: <a href=\"mailto:info@veyronix.com.tr\" style=\"color: #64748b; text-decoration: none;\">info@veyronix.com.tr</a> | © 2026 Veyronix. Tüm hakları saklıdır.</div></td></tr></table>",
  "text": "Sayın İlgili,\n\nE-posta içeriğiniz buraya gelecektir.\n\nİyi çalışmalar dileriz.\nVeyronix Ekibi\n\n--\nVeyronix Platform | Discord Otomasyon & Topluluk Yönetim Sistemi\n🌐 Web: https://veyronix.com.tr\n💬 Destek Sunucusu: https://veyronix.com.tr/support\n📚 Dokümantasyon: https://docs.veyronix.com.tr\n✉️ E-posta: info@veyronix.com.tr"
}
```

### Resmi HTML İmza Kodu

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

### Resmi Düz Metin (Plain Text) İmza Kodu

```text
--
Veyronix Platform | Discord Otomasyon & Topluluk Yönetim Sistemi
🌐 Web: https://veyronix.com.tr
💬 Destek Sunucusu: https://veyronix.com.tr/support
📚 Dokümantasyon: https://docs.veyronix.com.tr
✉️ E-posta: info@veyronix.com.tr
```

---

## 4. Yeni / İş Yeri Bilgisayarı Kurulumu

Projeyi başka bir bilgisayarda (iş yeri vb.) klonladığınızda:
1. `.agents/skills/hostinger-email/SKILL.md` ve `AGENTS.md` dosyaları repo ile birlikte geleceği için yapay zeka asistanı tüm mailbox kimliklerine (`AC30b8d8ceec68a6689b8b6a0ece64`), imza şablonlarına ve kurallara anında sahip olur.
2. Antigravity IDE'de Hostinger MCP entegrasyonu otomatik olarak bu mailbox ile eşleşecektir.
