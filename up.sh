#!/bin/bash

WEBHOOK_URL="https://discord.com/api/webhooks/1534325527442358373/9geJu4CNNua-rhogcfNv7SeWkq5fnVf8MWXuBOKu-Jx5B9XgHHvUHzooxWOxR_USlEac"

# Hata yakalama fonksiyonu
send_error_to_discord() {
    local exit_code=$?
    local failed_command="$BASH_COMMAND"
    echo "==> Hata algılandı! Discord'a bildiriliyor..."
    
    # Hata mesajı içeriği (Discord Markdown formatında)
    local payload=$(cat <<JSON
{
  "content": null,
  "embeds": [
    {
      "title": "🚨 Sunucu Dağıtım (Deploy) Hatası!",
      "description": "**Başarısız olan komut:** \`$failed_command\`\n**Çıkış Kodu:** \`$exit_code\`\n\nLütfen sunucu terminal loglarını veya PM2 durumunu kontrol edin.",
      "color": 16711680,
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
JSON
)

    curl -H "Content-Type: application/json" -X POST -d "$payload" "$WEBHOOK_URL"
    exit $exit_code
}

# Herhangi bir hata oluştuğunda bu fonksiyonu çağır
trap 'send_error_to_discord' ERR

echo "==> [1/6] Github'dan güncel dosyalar çekiliyor..."
cd /root/vx-mono
git pull

echo "==> [2/6] Next.js Önbelleği temizleniyor..."
if [ -d "apps/web/.next" ]; then
    rm -rf apps/web/.next
fi

echo "==> [3/6] Gerekli paketler yükleniyor..."
pnpm install --frozen-lockfile

echo "==> [4/6] Proje derleniyor (Build)..."
pnpm build

echo "==> [5/6] pnpm Önbelleği temizleniyor..."
pnpm store prune

echo "==> [6/6] PM2 servisleri yeniden başlatılıyor..."
pm2 restart all

# Sistem genelinde ufak bir temizlik yapalım
sudo apt-get autoclean -y
echo 3 > /proc/sys/vm/drop_caches

# Başarı mesajı gönder
success_payload=$(cat <<JSON
{
  "content": null,
  "embeds": [
    {
      "title": "✅ Sunucu Başarıyla Güncellendi",
      "description": "Tüm servisler derlendi, önbellekler temizlendi ve PM2 uygulamaları başarıyla yeniden başlatıldı.",
      "color": 65280,
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
JSON
)
curl -H "Content-Type: application/json" -X POST -d "$success_payload" "$WEBHOOK_URL"

echo "==> Güncelleme ve optimizasyon başarıyla tamamlandı!"
