require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const pm2 = require('pm2');
const axios = require('axios');

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1537896611315720262';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const FALLBACK_TOKEN = process.env.DISCORD_FALLBACK_TOKEN || '';

const BOT_NAME = 'partikur';

pm2.connect((err) => {
    if (err) {
        console.error('PM2 bağlanamadı:', err);
        process.exit(2);
    }
    
    console.log(`[Monitor] PM2 izleyicisi aktif. Dinlenen servis: ${BOT_NAME}`);

    pm2.launchBus((err, bus) => {
        if (err) {
            console.error('PM2 Bus başlatılamadı:', err);
            return;
        }

        bus.on('log:err', (packet) => {
            if (packet.process.name === BOT_NAME) {
                const errorLog = typeof packet.data === 'string' ? packet.data : String(packet.data);
                console.log(`[Monitor] Yakalanan Hata: ${errorLog.slice(0, 100)}...`);
                sendDiscordAlert('🔴 Bot Konsolunda Hata Yakalandı', `\`\`\`js\n${errorLog.slice(0, 3900)}\n\`\`\``, 0xff0000);
            }
        });

        bus.on('process:event', (packet) => {
            if (packet.process.name === BOT_NAME) {
                const eventName = packet.event;
                
                if (['exit', 'stop', 'errored'].includes(eventName)) {
                    console.log(`[Monitor] Bot kapandı/çöktü. Event: ${eventName}`);
                    sendDiscordAlert('🚨 Bot Offline (Çöktü veya Kapatıldı)', `**Event:** \`${eventName}\`\nBot şu anda hizmet veremiyor!`, 0x000000);
                } else if (eventName === 'restart') {
                    console.log('[Monitor] Bot yeniden başlatılıyor...');
                    sendDiscordAlert('🔄 Bot Yeniden Başlatılıyor', `PM2 üzerinden bot restart atıyor veya tekrar ayağa kalkıyor.`, 0xffa500);
                } else if (eventName === 'online') {
                    console.log('[Monitor] Bot şu an online.');
                    sendDiscordAlert('✅ Bot Tekrar Online', `Bot başarıyla ayağa kalktı.`, 0x00ff00);
                }
            }
        });
    });
});

async function sendDiscordAlert(title, description, color) {
    const payload = {
        embeds: [{
            title: title,
            description: description,
            color: color,
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await axios.post(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, payload, {
            headers: { 'Authorization': `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[Monitor] Birinci token başarısız, fallback deneniyor...', e.response ? e.response.data : e.message);
        try {
            await axios.post(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, payload, {
                headers: { 'Authorization': `Bot ${FALLBACK_TOKEN}`, 'Content-Type': 'application/json' }
            });
        } catch (err2) {
             console.error('[Monitor] Discord API Hata:', err2.response ? err2.response.data : err2.message);
        }
    }
}
