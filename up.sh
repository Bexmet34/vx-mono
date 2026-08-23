#!/usr/bin/env bash
# ==============================================================================
# VEYRONIX — Akıllı Sunucu Güncelleme & Bakım Sistemi (up)
# ==============================================================================

# Renkler & Stiller
RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"
WHITE="\033[97m"

# Yardımcı Loglama
log_step()    { echo -e "\n${BOLD}${CYAN}▶ [$1] $2${RESET}"; }
log_ok()      { echo -e "  ${GREEN}✔${RESET} $1"; }
log_warn()    { echo -e "  ${YELLOW}⚠${RESET} $1"; }
log_info()    { echo -e "  ${BLUE}ℹ${RESET} $1"; }
log_skip()    { echo -e "  ${DIM}⏭ $1${RESET}"; }
log_err()     { echo -e "  ${RED}✖${RESET} $1"; }

echo -e "${BOLD}${CYAN}==============================================================================${RESET}"
echo -e "${BOLD}${WHITE} 🚀 VEYRONIX SUNUCU GÜNCELLEME & BAKIM SİSTEMİ${RESET}"
echo -e " ${DIM}Zaman: $(date '+%d.%m.%Y %H:%M:%S')${RESET}"
echo -e "${BOLD}${CYAN}==============================================================================${RESET}"

FORCE_BUILD=false
SKIP_CLEAN=false
for arg in "$@"; do
  case $arg in
    --force|-f) FORCE_BUILD=true ;;
    --no-clean) SKIP_CLEAN=true ;;
  esac
done

PROJECT_DIR="/root/vx-mono"
if [ ! -d "$PROJECT_DIR" ]; then
  PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi
cd "$PROJECT_DIR"

# 1. GIT SENKRONİZASYONU
log_step "1/6" "GitHub ile senkronizasyon yapılıyor..."
BEFORE_HASH=$(git rev-parse HEAD 2>/dev/null || echo "NONE")

# Yerel çakışan değişiklikleri temizle
LOCAL_DIFF=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$LOCAL_DIFF" -gt 0 ]; then
  log_warn "Yerel çakışan değişiklikler bulundu, sıfırlanıyor..."
  git reset --hard origin/main 2>/dev/null || true
  git clean -fd 2>/dev/null || true
fi

# Güncel kodları çek
git fetch origin main 2>/dev/null || true
git pull origin main --no-rebase

AFTER_HASH=$(git rev-parse HEAD 2>/dev/null || echo "NONE")

if [ "$BEFORE_HASH" = "$AFTER_HASH" ] && [ "$BEFORE_HASH" != "NONE" ]; then
  log_ok "Kodlar güncel (Commit: ${CYAN}${AFTER_HASH:0:8}${RESET})"
else
  log_ok "Kodlar güncellendi: ${DIM}${BEFORE_HASH:0:8}${RESET} → ${GREEN}${AFTER_HASH:0:8}${RESET}"
  COMMIT_TITLE=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "")
  [ -n "$COMMIT_TITLE" ] && log_info "Son Değişiklik: \"${COMMIT_TITLE}\""
fi

# Değişiklik tespiti
WEB_CHANGED=false
BOT_CHANGED=false
SUPPORT_CHANGED=false

if [ "$FORCE_BUILD" = true ] || [ "$BEFORE_HASH" = "NONE" ] || [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  [ "$FORCE_BUILD" = true ] && { WEB_CHANGED=true; BOT_CHANGED=true; SUPPORT_CHANGED=true; }
else
  CHANGED_FILES=$(git diff --name-only "$BEFORE_HASH" "$AFTER_HASH" 2>/dev/null || echo "")
  echo "$CHANGED_FILES" | grep -qE "^(apps/web/|packages/|pnpm-lock.yaml)" && WEB_CHANGED=true
  echo "$CHANGED_FILES" | grep -qE "^(apps/bot/|packages/|pnpm-lock.yaml)" && BOT_CHANGED=true
  echo "$CHANGED_FILES" | grep -qE "^(apps/support/|packages/|pnpm-lock.yaml)" && SUPPORT_CHANGED=true
fi

# 2. PAKET BAĞIMLILIKLARI
log_step "2/6" "Paket bağımlılıkları kontrol ediliyor..."
pnpm install --prefer-offline >/dev/null 2>&1 || pnpm install >/dev/null 2>&1
log_ok "Bağımlılıklar hazır"

# 3. WEB DERLEME
log_step "3/6" "Web sitesi durumu kontrol ediliyor..."
if [ "$WEB_CHANGED" = true ]; then
  log_info "Bakım modu yayına alınıyor (3 Çarklı Animasyon)..."
  pm2 stop vxweb >/dev/null 2>&1 || true
  pkill -9 -f "scripts/maintenance-server.js" >/dev/null 2>&1 || true
  pkill -9 -f "maintenance-server" >/dev/null 2>&1 || true
  fuser -k 3000/tcp >/dev/null 2>&1 || true
  sleep 1

  node "$PROJECT_DIR/scripts/maintenance-server.js" 3000 >/dev/null 2>&1 &
  MAINT_PID=$!
  sleep 1
  log_ok "Bakım sayfası devrede (Port 3000)"

  log_info "Web sitesi sıfırdan derleniyor (Next.js)..."
  rm -rf apps/web/.next
  BUILD_START=$SECONDS
  
  if (cd apps/web && pnpm run build); then
    BUILD_DUR=$((SECONDS - BUILD_START))
    log_ok "Web derlemesi tamamlandı (${BUILD_DUR}s)"
  else
    log_err "Derleme hatası oluştu!"
    kill -9 $MAINT_PID 2>/dev/null || true
    pkill -9 -f "maintenance-server" 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
    exit 1
  fi

  log_info "Bakım modu kapatılıyor..."
  kill -9 $MAINT_PID 2>/dev/null || true
  pkill -9 -f "scripts/maintenance-server.js" >/dev/null 2>&1 || true
  pkill -9 -f "maintenance-server" >/dev/null 2>&1 || true
  fuser -k 3000/tcp >/dev/null 2>&1 || true
  sleep 1
else
  log_skip "Web sitesinde değişiklik yok (Derleme adımı atlandı)"
fi

# 4. PM2 SERVİS RESTARTLARI
log_step "4/6" "PM2 servisleri güncelleniyor..."

if [ "$WEB_CHANGED" = true ]; then
  pm2 restart vxweb >/dev/null 2>&1 || pm2 start ecosystem.config.js --only vxweb >/dev/null 2>&1
  log_ok "Web Sitesi (vxweb) yeniden başlatıldı"
else
  log_skip "Web Sitesi (vxweb) — Değişiklik yok"
fi

if [ "$BOT_CHANGED" = true ]; then
  pm2 restart partikur >/dev/null 2>&1 || pm2 start ecosystem.config.js --only partikur >/dev/null 2>&1
  log_ok "Ana Bot (partikur) yeniden başlatıldı"
else
  log_skip "Ana Bot (partikur) — Değişiklik yok"
fi

if [ "$SUPPORT_CHANGED" = true ]; then
  pm2 restart vxdestek >/dev/null 2>&1 || pm2 start ecosystem.config.js --only vxdestek >/dev/null 2>&1
  log_ok "Destek Botu (vxdestek) yeniden başlatıldı"
else
  log_skip "Destek Botu (vxdestek) — Değişiklik yok"
fi

# 5. SİSTEM & RAM TEMİZLİĞİ
log_step "5/6" "Sistem temizliği ve RAM optimizasyonu yapılıyor..."
if [ "$SKIP_CLEAN" = false ]; then
  command -v apt-get >/dev/null 2>&1 && { apt-get autoremove -y >/dev/null 2>&1 || true; apt-get clean >/dev/null 2>&1 || true; }
  command -v journalctl >/dev/null 2>&1 && { journalctl --vacuum-time=3d >/dev/null 2>&1 || true; }
  rm -rf /tmp/* /var/tmp/* 2>/dev/null || true
  rm -f "$PROJECT_DIR"/*.log "$PROJECT_DIR"/*.txt 2>/dev/null || true
  pm2 flush >/dev/null 2>&1 || true
  pnpm store prune >/dev/null 2>&1 || true
  git gc --prune=now --quiet 2>/dev/null || true
  sync && (echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true)
  log_ok "RAM & Disk temizliği yapıldı"
else
  log_skip "Temizlik adımı atlandı"
fi

# 6. KISAYOL GÜNCELLEME
log_step "6/6" "Kısayol kontrol ediliyor..."
cp "$PROJECT_DIR/up.sh" /usr/local/bin/up 2>/dev/null || true
chmod +x /usr/local/bin/up 2>/dev/null || true
log_ok "up kısayolu hazır"

# BİTİŞ TABLOSU
echo -e "\n${BOLD}${CYAN}==============================================================================${RESET}"
echo -e "${BOLD}${GREEN} ✔ GÜNCELLEME BAŞARIYLA TAMAMLANDI!${RESET}"
echo -e "${BOLD}${CYAN}==============================================================================${RESET}\n"

pm2 status

