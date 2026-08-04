#!/bin/bash

# Hataları ve çıktıları loglayacağımız dosya
LOG_FILE="/tmp/deploy_error.log"
exec 5>&1 # Orijinal stdout'u koru

WEBHOOK_URL="https://discord.com/api/webhooks/1534325527442358373/9geJu4CNNua-rhogcfNv7SeWkq5fnVf8MWXuBOKu-Jx5B9XgHHvUHzooxWOxR_USlEac"

# Hata yakalama fonksiyonu
send_error_to_discord() {
    local exit_code=$?
    local failed_command="$BASH_COMMAND"
    echo "==> Hata algılandı! Discord'a detaylı log gönderiliyor..."
    
    # Hata log dosyasının son 15 satırını al
    local error_details="Bilinmeyen hata logu bulunamadı."
    if [ -f "$LOG_FILE" ]; then
        error_details=$(tail -n 15 "$LOG_FILE" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
    fi
    
    # Hata mesajı içeriği (Discord Markdown formatında)
    local payload=$(cat <<JSON
{
  "content": null,
  "embeds": [
    {
      "title": "🚨 Sunucu Dağıtım (Deploy) Hatası!",
      "description": "**Başarısız olan komut:** \`$failed_command\`\n**Çıkış Kodu:** \`$exit_code\`\n\n**Hata Detayları:**\n\`\`\`text\n$error_details\n\`\`\`",
      "color": 16711680,
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
JSON
)

    curl -H "Content-Type: application/json" -X POST -d "$payload" "$WEBHOOK_URL"
    rm -f "$LOG_FILE"
    exit $exit_code
}

# Herhangi bir hata oluştuğunda bu fonksiyonu çağır
trap 'send_error_to_discord' ERR

echo "==> [1/6] Github'dan güncel dosyalar çekiliyor..." | tee -a "$LOG_FILE"
cd /root/vx-mono
# Çakışmaları önlemek için git pull'u daha kararlı yapıyoruz
git fetch --all >> "$LOG_FILE" 2>&1
git reset --hard origin/main >> "$LOG_FILE" 2>&1

echo "==> [2/6] Next.js Önbelleği temizleniyor..." | tee -a "$LOG_FILE"
if [ -d "apps/web/.next" ]; then
    rm -rf apps/web/.next >> "$LOG_FILE" 2>&1
fi

echo "==> [3/6] Gerekli paketler yükleniyor..." | tee -a "$LOG_FILE"
pnpm install --frozen-lockfile >> "$LOG_FILE" 2>&1

echo "==> [4/6] Proje derleniyor (Build)..." | tee -a "$LOG_FILE"
pnpm build >> "$LOG_FILE" 2>&1

echo "==> [5/6] pnpm Önbelleği temizleniyor..." | tee -a "$LOG_FILE"
pnpm store prune >> "$LOG_FILE" 2>&1

echo "==> [6/6] PM2 servisleri yeniden başlatılıyor..." | tee -a "$LOG_FILE"
pm2 restart all >> "$LOG_FILE" 2>&1

# Sistem genelinde ufak bir temizlik yapalım
sudo apt-get autoclean -y >> "$LOG_FILE" 2>&1
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

rm -f "$LOG_FILE"
echo "==> Güncelleme ve optimizasyon başarıyla tamamlandı!"
