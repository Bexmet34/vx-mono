const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the help menu with all available commands.'),

    new SlashCommandBuilder()
        .setName('createparty')
        .setDescription('Create a new Albion Online party.'),

    new SlashCommandBuilder()
        .setName('closeparty')
        .setDescription('Manually end your active parties.'),

    new SlashCommandBuilder()
        .setName('whitelistadd')
        .setDescription('Add a user to the whitelist (Can create up to 3 parties).')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to add')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('whitelistremove')
        .setDescription('Remove a user from the whitelist.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('temp')
        .setDescription('Web dashboard üzerinden kaydettiğiniz şablonları kullanarak hızlı parti kurar.')
        .addStringOption(option =>
            option.setName('template')
                .setDescription('Kullanmak istediğiniz şablonu seçin')
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Botu desteklemek için oy verin (Top.gg).'),

    new SlashCommandBuilder()
        .setName('mytemps')
        .setDescription('Bireysel parti şablonlarınızı yönetin (Sil / Düzenle).'),

    new SlashCommandBuilder()
        .setName('subscription')
        .setDescription('Manage server subscription (Owner only).')
        .addStringOption(option =>
            option.setName('guild_id')
                .setDescription('Discord Server ID')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('cleanup-manual')
        .setDescription('Sunucu temizleme işlemini manuel olarak başlatır (Owner only).'),

    new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure bot settings for your server.'),

    new SlashCommandBuilder()
        .setName('servers')
        .setDescription('List all servers the bot is currently in (Owner only).'),

    new SlashCommandBuilder()
        .setName('setup-reward')
        .setDescription('Configure the invitation reward system.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Channel to send reward logs')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Role to give as a reward')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('davet')
                .setDescription('Required invite count')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setup-objective-system')
        .setDescription('Objektif sistemini kurar (Sabit mesaj ve bildirim kanalı).')
        .addChannelOption(option => 
            option.setName('setup_kanal')
                .setDescription('Sabit mesajın (Objektif Oluştur butonu) atılacağı kanal')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('bildirim_kanal')
                .setDescription('Objektif bildirimlerinin atılacağı kanal')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('setup-guild')
        .setDescription('Sunucunun Albion Online loncasını tanıtır (KillBoard ve Kayıt için).')
        .addStringOption(option => 
            option.setName('lonca')
                .setDescription('Lonca adını yazın ve listeden seçin')
                .setRequired(true)
                .setAutocomplete(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('setup-killboard')
        .setDescription('Günlük KillBoard özetinin atılacağı kanalı ve saati ayarlar.')
        .addChannelOption(option => 
            option.setName('kanal')
                .setDescription('KillBoard özetinin atılacağı kanal')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('saat')
                .setDescription('Bildirim saati (UTC olarak, Örn: 06:00, 23:00)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    new SlashCommandBuilder()
        .setName('setup-registration')
        .setDescription('Kayıt sistemini bu kanalda başlatır | Starts the registration system in this channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
];

module.exports = commands.map(command => command.toJSON());
