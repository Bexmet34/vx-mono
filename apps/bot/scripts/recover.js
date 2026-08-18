const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' }); // Adjust depending on run location

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const GUILD_ID = process.argv[2];
const COMMUNITY_ROLE_ID = process.argv[3]; // Opsiyonel

if (!GUILD_ID) {
    console.error("❌ Kullanım: node recover.js <SUNUCU_ID> [TOPLULUK_ROL_ID]");
    console.error("Örnek: node recover.js 123456789 987654321");
    process.exit(1);
}

client.once('ready', async () => {
    console.log(`Bot giriş yaptı: ${client.user.tag}`);
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();

        const config = require('../src/config/config');
        const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
        const { data: settings } = await supabase
            .from('guild_settings')
            .select('*')
            .eq('guild_id', GUILD_ID)
            .single();

        const unregisteredRoleId = settings?.registration_unregistered_role_id;

        let fixed = 0;
        for (const [id, member] of guild.members.cache) {
            // Sadece "[NaN]" tagı olanları tespit et (Yanlışlıkla atılanlar)
            if (member.nickname && member.nickname.includes('[NaN]')) {
                let changed = false;

                // 1. Kayıtsız rolünü sil
                if (unregisteredRoleId && member.roles.cache.has(unregisteredRoleId)) {
                    await member.roles.remove(unregisteredRoleId, "Acil Kurtarma");
                    changed = true;
                }
                
                // 2. Eğer özel bir Topluluk Rolü verdiyseniz, onu ekle
                if (COMMUNITY_ROLE_ID && !member.roles.cache.has(COMMUNITY_ROLE_ID)) {
                    await member.roles.add(COMMUNITY_ROLE_ID, "Acil Kurtarma");
                    changed = true;
                }

                // 3. İsimden [NaN] ibaresini kaldır
                const cleanName = member.nickname.replace(/\[NaN\]\s*/g, '').substring(0, 32);
                if (guild.members.me.permissions.has('ManageNicknames') && member.manageable) {
                    await member.setNickname(cleanName, "Acil Kurtarma");
                    changed = true;
                }

                if (changed) {
                    fixed++;
                    console.log(`✅ Kurtarıldı: ${member.user.tag}`);
                }
            }
        }
        
        console.log(`\n🎉 İşlem bitti! Toplam ${fixed} üye kurtarıldı.`);
    } catch (err) {
        console.error("Hata:", err);
    }
    process.exit(0);
});

// Eğer .env okunamazsa config'den çek
const config = require('../src/config/config');
client.login(process.env.DISCORD_TOKEN || config.DISCORD_TOKEN);
