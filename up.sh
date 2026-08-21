#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║           VEYRONIX — Akıllı Sunucu Güncelleme & Bakım Sistemi              ║
# ║                         Sürüm 2.0  |  up.sh                                ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ─── Renkler & Stiller ───────────────────────────────────────────────────────
RESET="\033[0m";   BOLD="\033[1m";    DIM="\033[2m"
RED="\033[31m";    GREEN="\033[32m";  YELLOW="\033[33m"
BLUE="\033[34m";   MAGENTA="\033[35m"; CYAN="\033[36m"; WHITE="\033[97m"
BG_DARK="\033[48;5;235m"

# ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────
ts()    { date "+%H:%M:%S"; }
line()  { printf "${DIM}${CYAN}%-78s${RESET}\n" "" | tr ' ' '─'; }
step()  { echo -e "\n${BOLD}${CYAN} ◆  $1${RESET}"; }
ok()    { echo -e "  ${GREEN}✓${RESET}  $1"; }
skip()  { echo -e "  ${DIM}⏭  $1${RESET}"; }
warn()  { echo -e "  ${YELLOW}⚠  $1${RESET}"; }
info()  { echo -e "  ${BLUE}→${RESET}  $1"; }
fail()  { echo -e "  ${RED}✗  $1${RESET}"; }

spinner_start() {
  local msg="$1"
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  SPINNER_MSG="$msg"
  (
    i=0
    while true; do
      printf "\r  ${CYAN}%s${RESET}  %s " "${frames[$((i % ${#frames[@]}))]}" "$msg"
      sleep 0.08
      ((i++))
    done
  ) &
  SPINNER_PID=$!
}

spinner_stop() {
  local status="${1:-ok}"
  kill "$SPINNER_PID" 2>/dev/null; wait "$SPINNER_PID" 2>/dev/null
  if [ "$status" = "ok" ]; then
    printf "\r  ${GREEN}✓${RESET}  %-60s\n" "$SPINNER_MSG"
  else
    printf "\r  ${RED}✗${RESET}  %-60s\n" "$SPINNER_MSG"
  fi
}

# Sistem metrikleri
sys_metrics() {
  local cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print int($2+$4)}' 2>/dev/null || echo "?")
  local mem=$(free | awk '/^Mem/{printf "%.0f", $3/$2*100}' 2>/dev/null || echo "?")
  local disk=$(df -h / | awk 'NR==2{print $5}' 2>/dev/null || echo "?")
  echo -e "  ${DIM}CPU: ${cpu}%  │  RAM: ${mem}%  │  Disk: ${disk}${RESET}"
}

# ─── Başlık ──────────────────────────────────────────────────────────────────
clear
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════════════════════════╗"
echo "  ║         ⚡  VEYRONIX — Sunucu Güncelleme Sistemi  ⚡            ║"
echo "  ╚═══════════════════════════════════════════════════════════════════╝${RESET}"
echo -e "  ${DIM}Başlangıç: $(date '+%d.%m.%Y %H:%M:%S')${RESET}"
sys_metrics
line

# ─── Argümanlar ──────────────────────────────────────────────────────────────
FORCE_BUILD=false
SKIP_CLEAN=false
for arg in "$@"; do
  case $arg in
    --force|-f) FORCE_BUILD=true ;;
    --no-clean) SKIP_CLEAN=true ;;
  esac
done

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# ═══════════════════════════════════════════════════════════════════════════════
step "GIT — Uzak sunucu ile senkronizasyon"
# ═══════════════════════════════════════════════════════════════════════════════

BEFORE_HASH=$(git rev-parse HEAD 2>/dev/null || echo "NONE")

spinner_start "GitHub'dan değişiklikler alınıyor (fetch)..."
git fetch origin main --quiet 2>/dev/null
spinner_stop

# Yerel çakışmaları otomatik çöz
LOCAL_CHANGES=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$LOCAL_CHANGES" -gt 0 ]; then
  spinner_start "Yerel değişiklikler tespit edildi → otomatik sıfırlanıyor..."
  git reset --hard origin/main --quiet 2>/dev/null
  git clean -fd --quiet 2>/dev/null
  spinner_stop
else
  ok "Yerel çakışma yok"
fi

spinner_start "Güncel kodlar uygulanıyor (pull)..."
PULL_OUT=$(git pull origin main --quiet 2>&1 || true)
spinner_stop

AFTER_HASH=$(git rev-parse HEAD 2>/dev/null || echo "NONE")

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  info "Zaten güncel (${CYAN}${AFTER_HASH:0:8}${RESET})"
else
  ok "Güncellendi: ${DIM}${BEFORE_HASH:0:8}${RESET} → ${GREEN}${AFTER_HASH:0:8}${RESET}"
  COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "")
  [ -n "$COMMIT_MSG" ] && info "${DIM}\"${COMMIT_MSG}\"${RESET}"
fi

# ─── Değişiklik analizi ───────────────────────────────────────────────────────
WEB_CHANGED=false; BOT_CHANGED=false; SUPPORT_CHANGED=false

if [ "$FORCE_BUILD" = true ] || [ "$BEFORE_HASH" = "NONE" ] || [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  # Hash değişmemişse veya force ise hepsini işaretle (ilk çalıştırma veya -f)
  [ "$FORCE_BUILD" = true ] && { WEB_CHANGED=true; BOT_CHANGED=true; SUPPORT_CHANGED=true; }
else
  CHANGED_FILES=$(git diff --name-only "$BEFORE_HASH" "$AFTER_HASH" 2>/dev/null || echo "")
  echo "$CHANGED_FILES" | grep -qE "^(apps/web/|packages/|pnpm-lock.yaml)" && WEB_CHANGED=true
  echo "$CHANGED_FILES" | grep -qE "^(apps/bot/|packages/|pnpm-lock.yaml)"  && BOT_CHANGED=true
  echo "$CHANGED_FILES" | grep -qE "^(apps/support/|packages/|pnpm-lock.yaml)" && SUPPORT_CHANGED=true
fi

# Değişiklik özeti
echo ""
echo -e "  ${BOLD}Değişiklik Özeti:${RESET}"
[ "$WEB_CHANGED"     = true ] && echo -e "  ${YELLOW}●${RESET} Web Sitesi (vxweb)     ${YELLOW}→ Derleme gerekli${RESET}" || echo -e "  ${DIM}○ Web Sitesi (vxweb)     → Değişiklik yok${RESET}"
[ "$BOT_CHANGED"     = true ] && echo -e "  ${YELLOW}●${RESET} Ana Bot (partikur)    ${YELLOW}→ Restart gerekli${RESET}" || echo -e "  ${DIM}○ Ana Bot (partikur)    → Değişiklik yok${RESET}"
[ "$SUPPORT_CHANGED" = true ] && echo -e "  ${YELLOW}●${RESET} Destek Botu (vxdestek) ${YELLOW}→ Restart gerekli${RESET}" || echo -e "  ${DIM}○ Destek Botu (vxdestek) → Değişiklik yok${RESET}"

# ═══════════════════════════════════════════════════════════════════════════════
line
step "BAĞIMLILIKLAR — Paket kontrolü"
# ═══════════════════════════════════════════════════════════════════════════════

spinner_start "pnpm bağımlılıkları doğrulanıyor..."
if CI=true pnpm install --no-frozen-lockfile >/dev/null 2>&1; then
  spinner_stop
else
  spinner_stop ok
  pnpm install >/dev/null 2>&1 || true
fi
ok "Bağımlılıklar hazır"

# ═══════════════════════════════════════════════════════════════════════════════
line
step "WEB — Derleme & Yayınlama"
# ═══════════════════════════════════════════════════════════════════════════════

if [ "$WEB_CHANGED" = true ]; then
  info "Bakım modu devreye alınıyor..."
  pm2 stop vxweb >/dev/null 2>&1 || true
  pkill -f "scripts/maintenance-server.js" >/dev/null 2>&1 || true
  node "$PROJECT_DIR/scripts/maintenance-server.js" 3000 >/dev/null 2>&1 &
  MAINT_PID=$!
  sleep 1
  ok "Bakım sayfası aktif (ziyaretçiler bekletiliyor)"

  spinner_start "Next.js uygulaması derleniyor (bu 1-2 dakika sürebilir)..."
  rm -rf apps/web/.next
  BUILD_START=$SECONDS
  if (cd apps/web && pnpm run build) >/tmp/vx_build.log 2>&1; then
    BUILD_TIME=$((SECONDS - BUILD_START))
    spinner_stop
    ok "Derleme tamamlandı — ${BUILD_TIME}s"
  else
    spinner_stop fail
    fail "Derleme başarısız! Son 20 satır:"
    tail -20 /tmp/vx_build.log | while read -r l; do echo -e "  ${RED}│${RESET} $l"; done
    kill $MAINT_PID 2>/dev/null || true
    exit 1
  fi
  rm -f /tmp/vx_build.log

  info "Bakım modu kapatılıyor..."
  kill $MAINT_PID 2>/dev/null || true
  pkill -f "scripts/maintenance-server.js" >/dev/null 2>&1 || true
else
  skip "Web sitesinde değişiklik yok — derleme atlandı"
fi

# ═══════════════════════════════════════════════════════════════════════════════
line
step "SERVİSLER — PM2 Yeniden Başlatma"
# ═══════════════════════════════════════════════════════════════════════════════

restart_service() {
  local name="$1" label="$2"
  spinner_start "$label yeniden başlatılıyor..."
  if pm2 restart "$name" >/dev/null 2>&1; then
    spinner_stop
    sleep 1
    local status=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json; d=[x for x in json.load(sys.stdin) if x['name']=='$name']; print(d[0]['pm2_env']['status'] if d else 'unknown')" 2>/dev/null || echo "online")
    if [ "$status" = "online" ] || [ "$status" = "unknown" ]; then
      ok "$label çalışıyor"
    else
      warn "$label durumu: $status"
    fi
  else
    spinner_stop fail
    warn "$label başlatılamadı — pm2 start deneniyor..."
    pm2 start ecosystem.config.js --only "$name" >/dev/null 2>&1 || true
  fi
}

[ "$WEB_CHANGED"     = true ] && restart_service "vxweb"    "Web Sitesi"     || skip "Web sitesi — değişiklik yok"
[ "$BOT_CHANGED"     = true ] && restart_service "partikur" "Ana Bot"        || skip "Ana Bot (partikur) — değişiklik yok"
[ "$SUPPORT_CHANGED" = true ] && restart_service "vxdestek" "Destek Botu"    || skip "Destek Botu (vxdestek) — değişiklik yok"

# ═══════════════════════════════════════════════════════════════════════════════
line
step "TEMİZLİK — Disk & RAM optimizasyonu"
# ═══════════════════════════════════════════════════════════════════════════════

if [ "$SKIP_CLEAN" = false ]; then
  spinner_start "APT önbelleği temizleniyor..."
  command -v apt-get >/dev/null 2>&1 && {
    apt-get autoremove -y >/dev/null 2>&1 || true
    apt-get clean >/dev/null 2>&1 || true
  }
  spinner_stop

  spinner_start "Sistem logları budanıyor (3 günden eski)..."
  command -v journalctl >/dev/null 2>&1 && {
    journalctl --vacuum-time=3d >/dev/null 2>&1 || true
    journalctl --vacuum-size=50M >/dev/null 2>&1 || true
  }
  rm -f /var/log/*.gz /var/log/*.[0-9] 2>/dev/null || true
  spinner_stop

  spinner_start "Geçici dosyalar & proje artıkları siliniyor..."
  rm -rf /tmp/* /var/tmp/* 2>/dev/null || true
  rm -f "$PROJECT_DIR"/*.log "$PROJECT_DIR"/*.txt 2>/dev/null || true
  spinner_stop

  spinner_start "PM2 logları & pnpm store temizleniyor..."
  pm2 flush >/dev/null 2>&1 || true
  pnpm store prune >/dev/null 2>&1 || true
  git gc --prune=now --quiet 2>/dev/null || true
  spinner_stop

  spinner_start "RAM önbelleği boşaltılıyor..."
  sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
  spinner_stop
else
  skip "Temizlik --no-clean ile atlandı"
fi

# ═══════════════════════════════════════════════════════════════════════════════
line
step "KIYASOL — Kısayol güncelleniyor"
# ═══════════════════════════════════════════════════════════════════════════════
cp "$PROJECT_DIR/up.sh" /usr/local/bin/up 2>/dev/null && chmod +x /usr/local/bin/up 2>/dev/null && ok "Kısayol güncellendi (/usr/local/bin/up)" || warn "Kısayol güncellenemedi"

# ═══════════════════════════════════════════════════════════════════════════════
# ─── Sonuç Özeti ─────────────────────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════
line
echo ""
echo -e "${BOLD}${GREEN}  ✅  Güncelleme tamamlandı!${RESET}  ${DIM}$(date '+%H:%M:%S')${RESET}"
echo ""

# PM2 Servis Durumu — Minimal Tablo
echo -e "  ${BOLD}${WHITE}Servis Durumları:${RESET}"
pm2 jlist 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    icons = {'online': '\033[32m●\033[0m', 'stopped': '\033[31m●\033[0m', 'errored': '\033[31m✗\033[0m'}
    for p in data:
        name   = p.get('name','?')
        status = p.get('pm2_env',{}).get('status','?')
        pid    = p.get('pid','—')
        mem    = p.get('monit',{}).get('memory',0)
        cpu    = p.get('monit',{}).get('cpu',0)
        mem_mb = f'{mem/1024/1024:.0f}MB'
        icon   = icons.get(status, '○')
        print(f'  {icon}  {name:<18} {status:<10} CPU:{cpu:<4}%  RAM:{mem_mb}')
except: pass
" 2>/dev/null || pm2 status

echo ""
# Sistem metrikleri
RAM_FREE=$(free -m | awk '/^Mem/{printf "%.0f", ($2-$3)}')
DISK_FREE=$(df -h / | awk 'NR==2{print $4}')
echo -e "  ${DIM}RAM Serbest: ${RAM_FREE}MB  │  Disk Serbest: ${DISK_FREE}  │  Commit: ${AFTER_HASH:0:8}${RESET}"
echo ""
line
