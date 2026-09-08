const { REST, Routes } = require('discord.js');
const config = require('../config/config');
const commands = require('../commands/commands');

/**
 * Registers slash commands with Discord
 */
async function registerCommands(client, retryCount = 0) {
    const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
    try {
        if (config.REGISTER_GLOBAL) {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
        } else {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, config.GUILD_ID),
                { body: commands },
            );
        }
        console.log('✅ Slash komutları yüklendi.');

    } catch (error) {
        if ((error.code === 'ERR_SSL_INVALID_SESSION_ID' || error.message?.includes('SSL')) && retryCount < 5) {
            console.log(`SSL hatası nedeniyle komutlar yüklenemedi, 5 saniye sonra tekrar denenecek... (${retryCount + 1}/5)`);
            setTimeout(() => registerCommands(client, retryCount + 1), 5000);
        } else {
            console.error('Komut yükleme hatası:', error);
        }
    }
}

module.exports = {
    registerCommands
};
