#!/bin/bash
echo "==> Github'dan en guncel kodlar cekiliyor..."
git pull origin main

echo "==> Bagimliliklar kontrol ediliyor (gerekliyse yukleniyor)..."
pnpm install

echo "==> Proje yeniden baslatiliyor..."
pnpm restart

echo "==> Guncelleme tamamlandi!"
