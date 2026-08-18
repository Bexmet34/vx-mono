const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

const GUILD_ID = process.argv[2];
const HOURS_AGO = parseFloat(process.argv[3] || '2'); // Varsayılan: Son 2 saat

if (!GUILD_ID) {
    console.error("❌ Kullanım: node restore-from-audit.js <SUNUCU_ID> [KAC_SAAT_ONCESI]");
    process.exit(1);
}

client.once('ready', async () => {
    console.log(`Bot giriş yaptı: ${client.user.tag}`);
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.members.fetch();

        const timeLimit = Date.now() - (HOURS_AGO * 60 * 60 * 1000);
        let restoredCount = 0;

        console.log(`Son ${HOURS_AGO} saat içindeki bot işlemleri geri alınıyor...`);

        // 1. Rol Güncellemelerini Geri Al (MemberRoleUpdate)
        let lastId = null;
        let keepFetching = true;
        
        while (keepFetching) {
            const roleLogs = await guild.fetchAuditLogs({
                limit: 100,
                type: AuditLogEvent.MemberRoleUpdate,
                ...(lastId && { before: lastId })
            });

            if (roleLogs.entries.size === 0) break;

            for (const entry of roleLogs.entries.values()) {
                if (entry.createdTimestamp < timeLimit) {
                    keepFetching = false;
                    break;
                }
                
                lastId = entry.id; // Update lastId for next iteration pagination

                // Sadece botun yaptığı işlemleri geri al
                if (entry.executorId !== client.user.id) continue;
                if (entry.reason && !entry.reason.includes('Albion Guild Sync')) continue;

                const member = await guild.members.fetch(entry.targetId).catch(() => null);
                if (!member) continue;

                let changed = false;

                // Rolleri geri ver (Botun sildiği rolleri)
                for (const role of entry.changes.filter(c => c.key === '$remove').flatMap(c => c.new)) {
                    if (!member.roles.cache.has(role.id)) {
                        await member.roles.add(role.id, "Audit Log Kurtarma: Silinen rol geri verildi").catch(() => {});
                        changed = true;
                    }
                }

                // Botun verdiği rolleri geri al (Örn: Kayıtsız rolü)
                for (const role of entry.changes.filter(c => c.key === '$add').flatMap(c => c.new)) {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role.id, "Audit Log Kurtarma: Eklenen rol geri alındı").catch(() => {});
                        changed = true;
                    }
                }

                if (changed) {
                    console.log(`Rolleri kurtarıldı: ${member.user.tag}`);
                    restoredCount++;
                }
            }
            if (roleLogs.entries.size < 100) break;
        }

        // 2. İsim Güncellemelerini Geri Al (MemberUpdate)
        lastId = null;
        keepFetching = true;
        
        while (keepFetching) {
            const nameLogs = await guild.fetchAuditLogs({
                limit: 100,
                type: AuditLogEvent.MemberUpdate,
                ...(lastId && { before: lastId })
            });

            if (nameLogs.entries.size === 0) break;

            for (const entry of nameLogs.entries.values()) {
                if (entry.createdTimestamp < timeLimit) {
                    keepFetching = false;
                    break;
                }
                
                lastId = entry.id;

                if (entry.executorId !== client.user.id) continue;
                if (entry.reason && !entry.reason.includes('Albion Guild Sync')) continue;

                const member = await guild.members.fetch(entry.targetId).catch(() => null);
                if (!member) continue;

                const nickChange = entry.changes.find(c => c.key === 'nick');
                if (nickChange && nickChange.old) {
                    if (guild.members.me.permissions.has('ManageNicknames') && member.manageable) {
                        await member.setNickname(nickChange.old, "Audit Log Kurtarma: İsim geri alındı").catch(() => {});
                        console.log(`İsmi kurtarıldı: ${member.user.tag} (${nickChange.old})`);
                    }
                }
            }
            if (nameLogs.entries.size < 100) break;
        }

        console.log(`\n🎉 Audit Log kurtarma işlemi bitti! Rolleri onarılan üye sayısı: ${restoredCount}`);
    } catch (err) {
        console.error("Hata:", err);
    }
    process.exit(0);
});

const config = require('../src/config/config');
client.login(process.env.DISCORD_TOKEN || config.DISCORD_TOKEN);
