# Veyronix Destek Botu

Bu bot, Veyronix topluluğu için tasarlanmış bir destek ve abonelik yönetim botudur.

## Özellikler

-   **Ticket Sistemi**: Kullanıcılar için kolay destek talebi oluşturma.
-   **Abonelik Yönetimi**: Supabase üzerinden kullanıcı aboneliklerini kontrol etme ve yönetme.
-   **Gelişmiş Senkronizasyon**: Discord rolleri ile veritabanı arasındaki uyumu sağlar.
-   **Personel Yönetimi**: Admin ve Staff rolleri için özel komutlar.

## Kurulum ve VPS Yayına Alma (VPS Deployment)

### 1. Hazırlık

VPS (Ubuntu/Debian) üzerinde Node.js'in yüklü olduğundan emin olun (Sürüm 20+ önerilir):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Projeyi İndirme

Projeyi sunucuya çekin:
```bash
git clone <GITHUB_DEPO_URL>
cd vxdestek
```

### 3. Bağımlılıkları Kurma

```bash
npm install
```

### 4. Yapılandırma

`.env.example` dosyasını `.env` olarak kopyalayın ve kendi bilgilerinizi girin:
```bash
cp .env.example .env
nano .env # Bilgileri girip kaydedin (CTRL+O, Enter, CTRL+X)
```

### 5. Komutları Eşitleme (Slash Commands Sync)

Botunuzun slash komutlarını Discord API'sine kaydetmek için:
```bash
npm run deploy
```

### 6. Botu Başlatma (PM2 ile 7/24 Açık Tutma)

Botun sunucu kapansa bile çalışması için PM2 kullanmanız önerilir:
```bash
sudo npm install pm2 -g
pm2 start index.js --name "vxdestek-bot"
pm2 save
pm2 startup
```

## GitHub'a Yükleme Adımları

Eğer henüz bir GitHub deponuz yoksa, bir tane oluşturun ve şu komutları yerel bilgisayarınızda (CMD/Terminal) çalıştırın:

1. `git init`
2. `git add .`
3. `git commit -m "İlk sürüm hazır"`
4. `git branch -M main`
5. `git remote add origin <GITHUB_DEPO_URL>`
6. `git push -u origin main`

**Not:** `.gitignore` dosyası sayesinde `.env` dosyanız (şifreleriniz) GitHub'a YÜKLENMEYECEKTİR. Güvenliğiniz için bu dosyayı asla manuel olarak yüklemeyin.
