require('dotenv').config({ path: __dirname + '/../../.env' }); // try root
require('dotenv').config(); // try local
const { Client, GatewayIntentBits } = require('discord.js');

const GUILD_ID = '1007350278984564866';
const USER_IDS = ['427041440531480576', '357653213014392834'];
const REASON = 'Manuel kayıt tespit edildi';

if (!process.env.DISCORD_TOKEN) {
    console.error("HATA: DISCORD_TOKEN bulunamadı. Lütfen .env dosyanızın doğru yerde olduğundan emin olun.");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', async () => {
    console.log(`Bot olarak giriş yapıldı: ${client.user.tag}`);
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        console.log(`Sunucu bulundu: ${guild.name}`);
        
        for (const userId of USER_IDS) {
            try {
                console.log(`${userId} ID'li kullanıcı aranıyor...`);
                const member = await guild.members.fetch(userId);
                await member.kick(REASON);
                console.log(`✅ BAŞARILI: ${member.user.tag} (${userId}) başarıyla sunucudan atıldı. Sebep: ${REASON}`);
            } catch (e) {
                console.log(`❌ HATA: ${userId} ID'li kullanıcı atılamadı. Hata: ${e.message}`);
            }
        }
    } catch (e) {
        console.error("❌ HATA: Sunucu bulunamadı veya botun yetkisi yok:", e.message);
    }
    
    console.log("İşlem tamamlandı, bot kapatılıyor...");
    client.destroy();
    process.exit(0);
});

console.log("Discord API'sine bağlanılıyor...");
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("Giriş başarısız:", err.message);
    process.exit(1);
});
