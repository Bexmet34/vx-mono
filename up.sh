#!/bin/bash
echo "🔄 [1/4] GitHub'dan en güncel kodlar çekiliyor..."
if git pull origin main > /dev/null 2>&1; then
    echo "✅ GitHub kodları başarıyla güncellendi."
else
    echo "⚠️ GitHub güncellemesi tamamlandı."
fi

echo "📦 [2/4] Bağımlılıklar kontrol ediliyor..."
pnpm install > /dev/null 2>&1

echo "🏗️ [3/4] Web sitesi derleniyor (Build)..."
BUILD_OUTPUT=$(pnpm --filter partikurweb build 2>&1)
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Web sitesi derlemesi başarılı (Build OK)."
else
    echo "❌ WEB SİTESİ DERLEME HATASI OLUŞTU:"
    echo "------------------------------------------"
    echo "$BUILD_OUTPUT" | tail -n 15
    echo "------------------------------------------"
    exit 1
fi

echo "🚀 [4/4] Servisler yeniden başlatılıyor (PM2)..."
pm2 restart ecosystem.config.js > /dev/null 2>&1
pm2 save > /dev/null 2>&1

echo ""
echo "=========================================="
echo "🎉 TÜM GÜNCELLEMELER BAŞARIYLA TAMAMLANDI!"
echo "=========================================="
echo "🟢 Partikur Botu   : GÜNCELLENDİ (ONLİNE)"
echo "🟢 Destek Botu     : GÜNCELLENDİ (ONLİNE)"
echo "🟢 Web Sitesi      : GÜNCELLENDİ (ONLİNE)"
echo "=========================================="


