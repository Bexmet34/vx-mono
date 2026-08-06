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
    
    export FAILED_COMMAND="$failed_command"
    export EXIT_CODE="$exit_code"
    export LOG_FILE_PATH="$LOG_FILE"
    export WEBHOOK_URL_VAL="$WEBHOOK_URL"

    node -e '
      const fs = require("fs");
      const webhookUrl = process.env.WEBHOOK_URL_VAL;
      const failedCommand = process.env.FAILED_COMMAND || "Bilinmeyen komut";
      const exitCode = process.env.EXIT_CODE || "1";
      const logFile = process.env.LOG_FILE_PATH || "/tmp/deploy_error.log";
      
      let errorDetails = "Bilinmeyen hata logu bulunamadı.";
      if (fs.existsSync(logFile)) {
        const lines = fs.readFileSync(logFile, "utf-8").split("\n");
        errorDetails = lines.slice(-20).join("\n");
      }

      const payload = JSON.stringify({
        content: null,
        embeds: [{
          title: "🚨 Sunucu Dağıtım (Deploy) Hatası!",
          description: `**Başarısız olan komut:** \`${failedCommand}\`\n**Çıkış Kodu:** \`${exitCode}\`\n\n**Hata Detayları:**\n\`\`\`text\n${errorDetails.slice(-1500)}\n\`\`\``,
          color: 16711680,
          timestamp: new Date().toISOString()
        }]
      });

      fs.writeFileSync("/tmp/discord_payload.json", payload);
    '

    if [ -f "/tmp/discord_payload.json" ]; then
        curl -H "Content-Type: application/json" -X POST -d @"/tmp/discord_payload.json" "$WEBHOOK_URL"
        rm -f /tmp/discord_payload.json
    fi
    rm -f "$LOG_FILE"
    exit $exit_code
}

# Herhangi bir hata oluştuğunda bu fonksiyonu çağır
trap 'send_error_to_discord' ERR

echo "==> [1/6] Github'dan güncel dosyalar çekiliyor..." | tee -a "$LOG_FILE"
cd /root/vx-mono

git fetch --all >> "$LOG_FILE" 2>&1
git reset --hard origin/main >> "$LOG_FILE" 2>&1

# Son commit mesajını alalım (Güncelleme yapıldıktan SONRA)
commit_author=$(git log -1 --format="%an" 2>/dev/null || echo "Bilinmiyor")
commit_message=$(git log -1 --format="%s" 2>/dev/null || echo "Bilinmiyor")
commit_hash=$(git log -1 --format="%h" 2>/dev/null || echo "Bilinmiyor")

# PM2 Discord logger'ın her zaman doğru webhook ile çalıştığından emin olalım
pm2 set pm2-discord-logger:error_url "$WEBHOOK_URL" >> "$LOG_FILE" 2>&1
pm2 set pm2-discord-logger:log_errors true >> "$LOG_FILE" 2>&1

# RAM yetersizliğini (Exit Code 137 / OOM) önlemek için Swap kontrolü ve yapılandırması
if [ -f /proc/meminfo ] && [ $(free -m 2>/dev/null | awk '/^Swap:/ {print $2}' || echo 0) -lt 512 ]; then
    echo "==> Swap alanı yetersiz, RAM taşmalarını önlemek için 2GB Swap oluşturuluyor..." | tee -a "$LOG_FILE"
    swapoff /swapfile 2>/dev/null || true
    rm -f /swapfile
    dd if=/dev/zero of=/swapfile bs=1M count=2048 2>>"$LOG_FILE" || true
    chmod 600 /swapfile 2>/dev/null || true
    mkswap /swapfile >> "$LOG_FILE" 2>&1 || true
    swapon /swapfile >> "$LOG_FILE" 2>&1 || true
fi

echo "==> [2/6] Paket bağımlılıkları kontrol ediliyor..." | tee -a "$LOG_FILE"

echo "==> [3/6] Gerekli paketler yükleniyor..." | tee -a "$LOG_FILE"
pnpm install --frozen-lockfile >> "$LOG_FILE" 2>&1

echo "==> [4/6] Proje derleniyor (Build)..." | tee -a "$LOG_FILE"
# Takılı kalan eski derleme süreçlerini temizleyelim
pkill -f "next build" 2>/dev/null || true
pkill -f "next-build" 2>/dev/null || true
sleep 1

export NODE_OPTIONS="--max-old-space-size=1024"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_DIST_DIR=".next_new"
pnpm build >> "$LOG_FILE" 2>&1

if [ -d "apps/web/.next_new" ]; then
    echo "==> Yeni Next.js derlemesi aktif ediliyor (Swap)..." | tee -a "$LOG_FILE"
    rm -rf apps/web/.next
    mv apps/web/.next_new apps/web/.next
fi

echo "==> [5/6] pnpm Önbelleği temizleniyor..." | tee -a "$LOG_FILE"
pnpm store prune >> "$LOG_FILE" 2>&1

echo "==> [6/6] PM2 servisleri yeniden başlatılıyor..." | tee -a "$LOG_FILE"
pm2 restart all >> "$LOG_FILE" 2>&1

# Sistem genelinde ufak bir temizlik yapalım
sudo apt-get autoclean -y >> "$LOG_FILE" 2>&1
echo 3 > /proc/sys/vm/drop_caches

# PM2 durumunu JSON formatından parse edip düzgün bir tablo yapalım
pm2_status=$(pm2 jlist | node -e '
const list = JSON.parse(require("fs").readFileSync(0, "utf-8"));
const filtered = list.filter(app => ["partikur", "vxdestek", "vxweb"].includes(app.name));
const output = filtered.map(app => {
  const ram = (app.monit.memory / 1024 / 1024).toFixed(1) + " MB";
  const cpu = app.monit.cpu + "%";
  const status = app.pm2_env.status.toUpperCase();
  return `${app.name.padEnd(10)} | ${status.padEnd(7)} | CPU: ${cpu.padEnd(4)} | RAM: ${ram}`;
}).join("\n");
console.log(output);
' 2>/dev/null || echo "PM2 bilgileri alınamadı.")

# Eğer çıktıda çift tırnak veya yeni satır varsa JSON bozulmasın diye kaçıralım
pm2_status_escaped=$(echo "$pm2_status" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

free_disk=$(df -h / | awk 'NR==2 {print $4 " boş (Toplam: " $2 ")"}')
free_ram=$(free -h | awk 'NR==2 {print $4 " kullanılabilir (Toplam: " $2 ")"}')

# Başarı mesajı gönder
success_payload=$(cat <<JSON
{
  "content": null,
  "embeds": [
    {
      "title": "✅ Sunucu Dağıtım Başarılı!",
      "description": "Tüm servisler başarıyla güncellendi ve yeniden başlatıldı.",
      "color": 65280,
      "fields": [
        {
          "name": "📌 Son Güncelleme (Commit)",
          "value": "\`$commit_hash\` - **$commit_message** *(Yazar: $commit_author)*",
          "inline": false
        },
        {
          "name": "⚙️ Servis Durumları (İsim | Durum | CPU | RAM)",
          "value": "\`\`\`text\n$pm2_status_escaped\n\`\`\`",
          "inline": false
        },
        {
          "name": "💾 Sunucu Kaynakları",
          "value": "• **Disk:** $free_disk\n• **RAM:** $free_ram",
          "inline": false
        }
      ],
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ]
}
JSON
)
curl -H "Content-Type: application/json" -X POST -d "$success_payload" "$WEBHOOK_URL"

rm -f "$LOG_FILE"
echo "==> Güncelleme ve optimizasyon başarıyla tamamlandı!"
