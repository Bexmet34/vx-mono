const fs = require('fs');
const path = require('path');

const trDocs = {
  'index.mdx': `---
title: Veyronix'e Hoş Geldiniz
description: Veyronix Discord botunun kullanım rehberi ve detaylı dokümantasyonu.
---

# Veyronix Dokümantasyonu

Veyronix, Albion Online oyuncuları ve loncaları için özel olarak tasarlanmış, parti yönetimini, istatistik takibini ve yönetim süreçlerini Discord üzerinden otomatize eden gelişmiş bir bottur.

Bu Wiki üzerinden, botu sunucunuza nasıl kuracağınızı, ayarlarını nasıl yapacağınızı ve gelişmiş parti kurma araçlarını nasıl kullanacağınızı öğrenebilirsiniz.
`,
  'kurulum.mdx': `---
title: İlk Kurulum ve Ayarlar
description: Botu sunucunuza ekleme ve temel ayarlarını yapma.
---

# Kurulum Rehberi

Botu sunucunuza ekledikten sonra çalışabilmesi için temel ayarlarının yapılması gerekmektedir. Yöneticiler (Administrator yetkisi olanlar) aşağıdaki komutu kullanarak paneli açabilir:

### \`/settings\`
Bu komut ile karşınıza açılan panel üzerinden şunları yapabilirsiniz:
- **Dil Ayarı:** Botun mesajlarını Türkçe veya İngilizce olarak seçme.
- **Log Kanalı:** Parti açıldığında, kapandığında veya whitelist işlemleri yapıldığında bilgilerin düşeceği log kanalı.
- **Saat Dilimi:** Etkinliklerinizin saatlerinin doğru ayarlanabilmesi için yerel saatinizi (Örn: \`+3\`) ayarlama.
`,
  'parti-yonetimi.mdx': `---
title: Parti Oluşturma ve Yönetimi
description: Veyronix ile nasıl profesyonel Albion Online partileri oluşturulur.
---

# Parti Sistemi

Kullanıcıların en çok etkileşime girdiği alan parti sistemidir.

## 1. Parti Oluşturmak (\`/createparty\`)
Bu komutu kullandığınızda karşınıza bir menü açılır:
- **Etkinlik Adı:** ZvZ, Roaming, Gank vb.
- **Saat:** Etkinliğin başlama saati.
- **Kişi Sayısı:** Toplam alınacak kişi limiti.

Açılan parti mesajında kullanıcılar **Tank**, **Healer**, **DPS** veya **Support** rollerinden birini seçerek partiye katılabilir. Roller dolduğunda bot otomatik olarak parti alımını o rol için durdurur.

## 2. Şablon Kullanımı (\`/temp\`)
Eğer Veyronix Web Dashboard'una (veyronix.com.tr/dashboard) giriş yapıp kendi parti şablonlarınızı oluşturduysanız, \`/temp <şablon-adı>\` komutuyla tek tıkla parti açabilirsiniz.

## 3. Partiyi Kapatma (\`/closeparty\`)
Eğer etkinlik iptal edildiyse veya bittiyse, parti yöneticisi bu komutla aktif partisini sonlandırabilir.
`,
  'kurulum-komutlari.mdx': `---
title: Setup Komutları
description: Sunucu sahipleri için detaylı setup (kurulum) rehberleri.
---

# Kurulum (Setup) Komutları

Veyronix'i tam potansiyeliyle kullanmak için çeşitli sistemleri \`/setup\` komutlarıyla sunucunuza entegre edebilirsiniz.

## \`/setup-guild\`
KillBoard ve otomatik Kayıt sisteminin çalışması için oyun içi loncanızı bota tanıtmanız gerekir. Komutu yazdıktan sonra loncanızın tam adını girerek eşleştirme yapabilirsiniz.

## \`/setup-killboard\`
Albion Online üzerinden loncanızın günlük savaş (PvP/PvE) özetlerini Discord'a çeker.
- **Kanal:** Özetlerin her gün düşeceği metin kanalı.
- **Saat:** UTC olarak hangi saatte gönderileceği (Örn: 22:00).

## \`/setup-registration\`
Sunucunuza yeni gelen oyuncuların oyun içi nickleriyle Discord isimlerini eşleştirmeleri için butonlu bir kayıt sistemi oluşturur.

## \`/setup-objective-system\`
ZvZ, Roaming veya Gank ekipleri için hedef (objective) belirleme paneli kurar. Seçilen kanala sabit bir "Objektif Belirle" butonu atar, yöneticiler bu butonu kullanarak oyunculara hedefleri ping ile bildirir.

## \`/setup-reward\`
Discord sunucunuzu büyütmek için davet ödül sistemi. 
- Kaç davete hangi rolün verileceğini ve bildirimlerin hangi kanala atılacağını seçersiniz.
`
};

const enDocs = {
  'index.mdx': `---
title: Welcome to Veyronix
description: Veyronix Discord bot user guide and detailed documentation.
---

# Veyronix Documentation

Veyronix is an advanced Discord bot specifically designed for Albion Online players and guilds, automating party management, statistics tracking, and guild administration directly through Discord.

Through this Wiki, you will learn how to add the bot to your server, configure its settings, and utilize advanced party building tools.
`,
  'setup.mdx': `---
title: Initial Setup and Settings
description: How to add the bot to your server and configure basic settings.
---

# Setup Guide

After adding the bot to your server, you need to configure its basic settings. Administrators can open the settings panel using the following command:

### \`/settings\`
With this command, a panel opens where you can:
- **Language:** Choose Turkish or English for the bot's messages.
- **Log Channel:** Set the channel where party creation, deletion, and whitelist logs will be sent.
- **Timezone:** Set your local timezone offset (e.g., \`+3\`) so that event times display correctly.
`,
  'party-management.mdx': `---
title: Party Creation and Management
description: How to create professional Albion Online parties with Veyronix.
---

# Party System

The party system is the core feature your community will interact with.

## 1. Creating a Party (\`/createparty\`)
When you use this command, a menu opens asking for:
- **Event Name:** ZvZ, Roaming, Gank, etc.
- **Time:** The starting time of the event.
- **Limit:** Total number of players.

In the generated party message, users can join by selecting **Tank**, **Healer**, **DPS**, or **Support** roles. When a role reaches its limit, the bot automatically disables joining for that role.

## 2. Using Templates (\`/temp\`)
If you have logged into the Veyronix Web Dashboard (veyronix.com.tr/dashboard) and created custom party templates, you can open a party instantly using the \`/temp <template-name>\` command.

## 3. Closing a Party (\`/closeparty\`)
If an event is canceled or finished, the party leader can end their active party using this command.
`,
  'setup-commands.mdx': `---
title: Setup Commands
description: Detailed setup guides for server owners.
---

# Setup Commands

To use Veyronix to its full potential, you can integrate various systems into your server using the \`/setup\` commands.

## \`/setup-guild\`
In order for the KillBoard and automatic Registration systems to work, you must introduce your in-game guild to the bot. Type the command and enter your guild's exact name.

## \`/setup-killboard\`
Pulls daily battle (PvP/PvE) summaries of your guild from Albion Online to Discord.
- **Channel:** The text channel where summaries will drop daily.
- **Time:** The UTC time it will be sent (e.g., 22:00).

## \`/setup-registration\`
Creates a button-based registration system for newcomers to match their Discord names with their in-game nicknames.

## \`/setup-objective-system\`
Sets up an objective defining panel for ZvZ, Roaming, or Gank teams. Drops a persistent "Create Objective" button in a channel.

## \`/setup-reward\`
Invite reward system to grow your Discord server.
- Select how many invites grant which role, and which channel notifications should go to.
`
};

const trDir = path.join(__dirname, 'apps/web/src/content/docs/tr');
const enDir = path.join(__dirname, 'apps/web/src/content/docs/en');

for (const [file, content] of Object.entries(trDocs)) {
  fs.writeFileSync(path.join(trDir, file), content);
}

for (const [file, content] of Object.entries(enDocs)) {
  fs.writeFileSync(path.join(enDir, file), content);
}

console.log("MDX files generated successfully!");
