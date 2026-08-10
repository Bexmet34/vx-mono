#!/usr/bin/env bash

# ==============================================================================
# Veyronix (VX-Mono) Otomatik Güncelleme, Temizlik ve Canlıya Alma Scripti (up)
# ==============================================================================

set -e

echo "🚀 [Veyronix UP] Otomatik güncelleme ve canlıya alma işlemi başlatılıyor..."

# 1. Proje ana dizininde olduğumuzdan emin olalım
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 2. VPS üzerindeki tüm çakışan ve geçici dosyaları zorunlu temizle
echo "🧹 [1/6] Yerel değişiklikler sıfırlanıyor ve geçici dosyalar temizleniyor..."
git reset --hard origin/main
git clean -fd

# 3. GitHub'dan en güncel kodları çek
echo "📥 [2/6] GitHub repodan güncel kodlar çekiliyor..."
git pull origin main

# 4. Eski Next.js build önbelleğini temizle
echo "🗑️ [3/6] Web sitesi eski derleme önbelleği siliniyor..."
rm -rf apps/web/.next

# 5. Bağımlılıkları kontrol et
echo "📦 [4/6] Paket bağımlılıkları doğrulanıyor..."
CI=true pnpm install --no-frozen-lockfile || pnpm install

# 6. Web sitesini sıfırdan derle (Production Build)
echo "🏗️ [5/6] Web sitesi (vxweb) production build alınıyor..."
cd apps/web
pnpm run build
cd "$PROJECT_DIR"

# 7. PM2 ile botları ve web sitesini yeniden başlat
echo "🔄 [6/6] PM2 servisleri (partikur, vxdestek, vxweb) yeniden başlatılıyor..."
pm2 restart ecosystem.config.js || pm2 restart all

# 8. Otomatik 'up' kısayol komutu oluştur (Tek 'up' yazarak çalıştırmak için)
if [ ! -f /usr/local/bin/up ]; then
  cp "$PROJECT_DIR/up.sh" /usr/local/bin/up 2>/dev/null || true
  chmod +x /usr/local/bin/up 2>/dev/null || true
fi

echo "=============================================================================="
echo "✅ [BAŞARILI] Veyronix Botu, Destek Botu ve Web Sitesi Güncellendi ve Canlıda!"
echo "=============================================================================="
pm2 status
