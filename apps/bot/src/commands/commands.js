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
        
    new SlashCommandBuilder()
        .setName('kayitsizlari-belirle')
        .setDescription('Kayıtsız üyelerin tüm rollerini siler, ismini [Kayıt Bekliyor] yapar ve seçili rolü verir.')
        .addRoleOption(option => 
            option.setName('rol')
                .setDescription('Kayıtsız kullanıcılara verilecek rol')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    new SlashCommandBuilder()
        .setName('rd')
        .setDescription('Kayıtlı bir kullanıcının rolünü (tagını) ve ismini düzenler. 32 karakter sınırına otomatik uyar.')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Düzenlenecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rol')
                .setDescription('Verilecek yeni rol')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('ign')
                .setDescription('Oyun içi isim (Boş bırakılırsa mevcut isminden çekilir)'))
        .addStringOption(option => 
            option.setName('isim')
                .setDescription('Gerçek isim (Boş bırakılırsa mevcut isminden çekilir)'))
        .addStringOption(option => 
            option.setName('yas')
                .setDescription('Yaş (Boş bırakılırsa mevcut isminden çekilir)')),

    // ─── Drop Puan Sistemi ────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('mypoints')
        .setDescription('View your total drop points and win count in this server.'),

    new SlashCommandBuilder()
        .setName('drop-leaderboard')
        .setDescription('View the top drop point earners in this server.'),

    new SlashCommandBuilder()
        .setName('drop-manual')
        .setDescription('Bot sahibi için manuel drop düşürme komutu (Owner only).'),
];

module.exports = commands.map(command => command.toJSON());
