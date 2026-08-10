#!/usr/bin/env bash

# ==============================================================================
# Veyronix (VX-Mono) Akıllı Güncelleme, Sistem Temizliği ve Canlıya Alma (up)
# ==============================================================================

set -e

FORCE_BUILD=false
if [ "$1" == "--force" ] || [ "$1" == "-f" ]; then
  FORCE_BUILD=true
fi

echo "🚀 [Veyronix UP] Akıllı güncelleme ve sistem temizliği başlatılıyor..."

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Güncelleme öncesi Git Commit Hash kaydet
BEFORE_HASH=$(git rev-parse HEAD 2>/dev/null || echo "NONE")

# 2. VPS üzerindeki tüm çakışan ve geçici dosyaları sıfırla
echo "🧹 [1/7] Yerel çakışan dosyalar ve artıklar temizleniyor..."
git reset --hard origin/main
git clean -fd

# 3. GitHub'dan güncel kodları çek
echo "📥 [2/7] GitHub repodan güncel kodlar çekiliyor..."
git pull origin main

AFTER_HASH=$(git rev-parse HEAD 2>/dev/null || echo "NONE")

# Değişiklik Kontrolü
CHANGED_FILES=""
if [ "$BEFORE_HASH" != "NONE" ] && [ "$AFTER_HASH" != "NONE" ] && [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
  CHANGED_FILES=$(git diff --name-only "$BEFORE_HASH" "$AFTER_HASH" 2>/dev/null || echo "ALL")
else
  CHANGED_FILES="ALL"
fi

WEB_CHANGED=false
BOT_CHANGED=false
SUPPORT_CHANGED=false

if [ "$FORCE_BUILD" = true ] || [ "$CHANGED_FILES" == "ALL" ]; then
  WEB_CHANGED=true
  BOT_CHANGED=true
  SUPPORT_CHANGED=true
else
  echo "$CHANGED_FILES" | grep -E "^(apps/web/|packages/|package.json|pnpm-lock.yaml|ecosystem.config.js|up.sh)" >/dev/null && WEB_CHANGED=true || true
  echo "$CHANGED_FILES" | grep -E "^(apps/bot/|packages/|package.json|pnpm-lock.yaml|ecosystem.config.js|up.sh)" >/dev/null && BOT_CHANGED=true || true
  echo "$CHANGED_FILES" | grep -E "^(apps/support/|packages/|package.json|pnpm-lock.yaml|ecosystem.config.js|up.sh)" >/dev/null && SUPPORT_CHANGED=true || true
fi

# 4. Paket bağımlılıklarını doğrula
echo "📦 [3/7] Bağımlılıklar kontrol ediliyor..."
CI=true pnpm install --no-frozen-lockfile || pnpm install

# 5. Akıllı Web Build (Sadece Web veya Bağımlılık Değiştiyse)
if [ "$WEB_CHANGED" = true ]; then
  echo "🏗️ [4/7] Web sitesinde değişiklik tespit edildi, sıfırdan derleniyor (vxweb)..."
  rm -rf apps/web/.next
  cd apps/web
  pnpm run build
  cd "$PROJECT_DIR"
else
  echo "⏩ [4/7] Web sitesinde değişiklik yok, ağır derleme adımı es geçildi (Tasarruf)."
fi

# 6. Akıllı PM2 Servis Restartları
echo "🔄 [5/7] Servis durumları güncelleniyor..."
if [ "$WEB_CHANGED" = true ]; then
  pm2 restart vxweb || pm2 start ecosystem.config.js --only vxweb
fi

if [ "$BOT_CHANGED" = true ]; then
  echo "🤖 [Partikur Bot] Güncellendi, yeniden başlatılıyor..."
  pm2 restart partikur || pm2 start ecosystem.config.js --only partikur
else
  echo "⏩ [Partikur Bot] Değişiklik yok, restart es geçildi."
fi

if [ "$SUPPORT_CHANGED" = true ]; then
  echo "🎧 [Destek Botu] Güncellendi, yeniden başlatılıyor..."
  pm2 restart vxdestek || pm2 start ecosystem.config.js --only vxdestek
else
  echo "⏩ [Destek Botu] Değişiklik yok, restart es geçildi."
fi

# 7. Derin Sistem Temizliği (Maksimum Sunucu / Disk Performansı)
echo "🧼 [6/7] Derin sistem ve disk temizliği yapılıyor..."
pnpm store prune 2>/dev/null || true
pm2 flush 2>/dev/null || true
rm -f *.log *.txt install_log.txt build_log.txt 2>/dev/null || true
git gc --prune=now --quiet 2>/dev/null || true

# 8. Otomatik 'up' kısayol güncelleme
echo "⚙️ [7/7] Kısayol kontrolü..."
cp "$PROJECT_DIR/up.sh" /usr/local/bin/up 2>/dev/null || true
chmod +x /usr/local/bin/up 2>/dev/null || true

echo "=============================================================================="
echo "✅ [BAŞARILI] Veyronix Sunucu Güncellemesi ve Sistem Temizliği Tamamlandı!"
echo "=============================================================================="
pm2 status
