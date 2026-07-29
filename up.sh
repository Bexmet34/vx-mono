#!/bin/bash
echo "==> Github'dan en guncel kodlar cekiliyor..."
git pull origin main

echo "==> Bagimliliklar kontrol ediliyor..."
pnpm install

echo "==> Web projesi derleniyor (Build)..."
pnpm --filter partikurweb build

echo "==> Servisler yeniden baslatiliyor (PM2)..."
pm2 restart ecosystem.config.js
pm2 save

echo "==> Tum guncellemeler tamamlandi ve web sitesi yayinda!"

