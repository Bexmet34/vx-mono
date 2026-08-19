require('dotenv').config({ path: '../../.env' });
const { Client, GatewayIntentBits, AuditLogEvent } = require('discord.js');
const db = require('../src/services/db');
const { getSupabaseGuildSettings } = require('@veyronix/database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

const GUILD_ID = process.argv[2];

if (!GUILD_ID) {
    console.error('Lütfen Guild ID belirtin: node scripts/restore-roles.js <GUILD_ID>');
    process.exit(1);
}

client.once('ready', async () => {
    console.log(`Bot giriş yaptı: ${client.user.tag}`);
    
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        if (!guild) throw new Error('Guild bulunamadı.');

        const settings = await getSupabaseGuildSettings(GUILD_ID);
        if (!settings) throw new Error('Guild ayarları bulunamadı.');

        const roleIds = [
            settings.registration_given_role_id,
            settings.registration_given_role_id_2,
            settings.registration_given_role_id_3
        ].filter(id => id);

        const unregRole = settings.auto_check_custom_role_id || settings.registration_unregistered_role_id;

        console.log(`[+] Denetim kaydı taranıyor...`);
        const auditLogs = await guild.fetchAuditLogs({
            type: AuditLogEvent.MemberRoleUpdate,
            limit: 100
        });

        let restoredCount = 0;

        for (const entry of auditLogs.entries.values()) {
            // Sadece botumuzun yaptığı işlemleri bul
            if (entry.executor.id !== client.user.id) continue;
            
            // Sadece son 3 saat içindeki işlemleri bul
            const hoursAgo = (Date.now() - entry.createdTimestamp) / (1000 * 60 * 60);
            if (hoursAgo > 3) continue;

            const targetId = entry.target.id;
            const changes = entry.changes;

            let removedTargetRoles = [];
            
            for (const change of changes) {
                if (change.key === '$remove') {
                    for (const role of change.new) {
                        if (roleIds.includes(role.id)) {
                            removedTargetRoles.push(role.id);
                        }
                    }
                }
            }

            if (removedTargetRoles.length > 0) {
                try {
                    const member = await guild.members.fetch(targetId);
                    if (member) {
                        console.log(`[+] Rolleri geri veriliyor: ${member.user.tag}`);
                        await member.roles.add(removedTargetRoles);
                        if (unregRole && member.roles.cache.has(unregRole)) {
                            await member.roles.remove(unregRole);
                        }
                        restoredCount++;
                    }
                } catch (e) {
                    console.log(`[-] Üye bulunamadı veya yetki yetmedi: ${targetId}`);
                }
            }
        }

        console.log(`\n==========================================`);
        console.log(`✅ İşlem Tamamlandı! Toplam Onarılan Üye: ${restoredCount}`);
        console.log(`==========================================\n`);

    } catch (err) {
        console.error('Hata:', err);
    }

    process.exit(0);
});

client.login(process.env.DISCORD_BOT_TOKEN);
