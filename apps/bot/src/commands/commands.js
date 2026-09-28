const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the help menu with all available commands.')
        .setDescriptionLocalizations({
            tr: 'Mevcut tüm komutların bulunduğu yardım menüsünü gösterir.'
        }),

    new SlashCommandBuilder()
        .setName('createparty')
        .setDescription('Create a new Albion Online party.')
        .setDescriptionLocalizations({
            tr: 'Yeni bir Albion Online partisi oluşturun.'
        }),

    new SlashCommandBuilder()
        .setName('closeparty')
        .setDescription('Manually end your active parties.')
        .setDescriptionLocalizations({
            tr: 'Aktif partilerinizi manuel olarak sonlandırın.'
        }),

    new SlashCommandBuilder()
        .setName('temp')
        .setDescription('Quickly creates a party using templates saved via the web dashboard.')
        .setDescriptionLocalizations({
            tr: 'Web dashboard üzerinden kaydettiğiniz şablonları kullanarak hızlı parti kurar.'
        })
        .addStringOption(option =>
            option.setName('template')
                .setDescription('Select the template you want to use')
                .setDescriptionLocalizations({
                    tr: 'Kullanmak istediğiniz şablonu seçin'
                })
                .setRequired(true)
                .setAutocomplete(true)),

    new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for the bot to support us (Top.gg).')
        .setDescriptionLocalizations({
            tr: 'Botu desteklemek için oy verin (Top.gg).'
        }),

    new SlashCommandBuilder()
        .setName('mytemps')
        .setDescription('Manage your personal party templates (Delete / Edit).')
        .setDescriptionLocalizations({
            tr: 'Bireysel parti şablonlarınızı yönetin (Sil / Düzenle).'
        }),

    new SlashCommandBuilder()
        .setName('subscription')
        .setDescription('Manage server subscription (Owner only).')
        .setDescriptionLocalizations({
            tr: 'Sunucu aboneliğini yönetir (Sadece kurucu).'
        })
        .addStringOption(option =>
            option.setName('guild_id')
                .setDescription('Discord Server ID')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('cleanup-manual')
        .setDescription('Manually start server cleanup process (Owner only).')
        .setDescriptionLocalizations({
            tr: 'Sunucu temizleme işlemini manuel olarak başlatır (Owner only).'
        }),

    new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure bot settings for your server.')
        .setDescriptionLocalizations({
            tr: 'Sunucunuz için bot ayarlarını yapılandırın.'
        }),

    new SlashCommandBuilder()
        .setName('servers')
        .setDescription('List all servers the bot is currently in (Owner only).')
        .setDescriptionLocalizations({
            tr: 'Botun bulunduğu tüm sunucuları listeler (Sadece kurucu).'
        }),

    new SlashCommandBuilder()
        .setName('setup-reward')
        .setDescription('Configure the invitation reward system.')
        .setDescriptionLocalizations({
            tr: 'Davet ödül sistemini yapılandırır.'
        })
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Channel to send reward logs')
                .setDescriptionLocalizations({ tr: 'Ödül loglarının atılacağı kanal' })
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Role to give as a reward')
                .setDescriptionLocalizations({ tr: 'Ödül olarak verilecek rol' })
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('davet')
                .setDescription('Required invite count')
                .setDescriptionLocalizations({ tr: 'Gereken davet sayısı' })
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setup-objective-system')
        .setDescription('Set up the objective system (Pinned message and notification channel).')
        .setDescriptionLocalizations({
            tr: 'Objektif sistemini kurar (Sabit mesaj ve bildirim kanalı).'
        })
        .addChannelOption(option => 
            option.setName('setup_kanal')
                .setDescription('Channel for the pinned objective creation button')
                .setDescriptionLocalizations({ tr: 'Sabit mesajın (Objektif Oluştur butonu) atılacağı kanal' })
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('bildirim_kanal')
                .setDescription('Channel for objective notifications')
                .setDescriptionLocalizations({ tr: 'Objektif bildirimlerinin atılacağı kanal' })
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('setup-guild')
        .setDescription('Register the server\'s Albion Online guild (for KillBoard and Registration).')
        .setDescriptionLocalizations({
            tr: 'Sunucunun Albion Online loncasını tanıtır (KillBoard ve Kayıt için).'
        })
        .addStringOption(option => 
            option.setName('lonca')
                .setDescription('Type the guild name and select from the list')
                .setDescriptionLocalizations({ tr: 'Lonca adını yazın ve listeden seçin' })
                .setRequired(true)
                .setAutocomplete(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),


    new SlashCommandBuilder()
        .setName('setup-registration')
        .setDescription('Starts the registration system in this channel.')
        .setDescriptionLocalizations({
            tr: 'Kayıt sistemini bu kanalda başlatır.'
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    new SlashCommandBuilder()
        .setName('setup-autopremium')
        .setDescription('Creates a button for users to request premium (Owner only).')
        .setDescriptionLocalizations({
            tr: 'Kullanıcıların premium talep edebileceği butonu oluşturur (Owner only).'
        }),
        
    new SlashCommandBuilder()
        .setName('kayitsizlari-belirle')
        .setDescription('Removes all roles from unregistered members, sets name to [Pending] and gives selected role.')
        .setDescriptionLocalizations({
            tr: 'Kayıtsız üyelerin tüm rollerini siler, ismini [Kayıt Bekliyor] yapar ve seçili rolü verir.'
        })
        .addRoleOption(option => 
            option.setName('rol')
                .setDescription('Role to give to unregistered users')
                .setDescriptionLocalizations({ tr: 'Kayıtsız kullanıcılara verilecek rol' })
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    new SlashCommandBuilder()
        .setName('rd')
        .setDescription('Edits the role and name of a registered user. Automatically limits to 32 characters.')
        .setDescriptionLocalizations({
            tr: 'Kayıtlı bir kullanıcının rolünü (tagını) ve ismini düzenler. 32 karakter sınırına otomatik uyar.'
        })
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('User to edit')
                .setDescriptionLocalizations({ tr: 'Düzenlenecek kullanıcı' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rol')
                .setDescription('New role to assign')
                .setDescriptionLocalizations({ tr: 'Verilecek yeni rol' })
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('ign')
                .setDescription('In-game name (Leave empty to use current name)')
                .setDescriptionLocalizations({ tr: 'Oyun içi isim (Boş bırakılırsa mevcut isminden çekilir)' }))
        .addStringOption(option => 
            option.setName('isim')
                .setDescription('Real name (Leave empty to use current name)')
                .setDescriptionLocalizations({ tr: 'Gerçek isim (Boş bırakılırsa mevcut isminden çekilir)' }))
        .addStringOption(option => 
            option.setName('yas')
                .setDescription('Age (Leave empty to use current age)')
                .setDescriptionLocalizations({ tr: 'Yaş (Boş bırakılırsa mevcut isminden çekilir)' })),

    new SlashCommandBuilder()
        .setName('reg-close')
        .setDescription('Manually closes an ongoing registration session of a user.')
        .setDescriptionLocalizations({
            tr: 'Kullanıcının devam eden kayıt oturumunu manuel olarak kapatır.'
        })
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('User whose session will be closed')
                .setDescriptionLocalizations({ tr: 'Oturumu kapatılacak kullanıcı' })
                .setRequired(true)),
                
    new SlashCommandBuilder()
        .setName('mypoints')
        .setDescription('View your total drop points and win count in this server.')
        .setDescriptionLocalizations({
            tr: 'Bu sunucudaki toplam drop puanınızı ve kazanma sayınızı görüntüleyin.'
        }),

    new SlashCommandBuilder()
        .setName('drop-leaderboard')
        .setDescription('View the top drop point earners in this server.')
        .setDescriptionLocalizations({
            tr: 'Bu sunucuda en çok drop puanı kazananları görüntüleyin.'
        }),

    new SlashCommandBuilder()
        .setName('drop-manual')
        .setDescription('Manual drop trigger for bot owner (Owner only).')
        .setDescriptionLocalizations({
            tr: 'Bot sahibi için manuel drop düşürme komutu (Owner only).'
        }),

    new SlashCommandBuilder()
        .setName('changelog-publish')
        .setDescription('Saves a new update to Supabase and posts it to the announcement channel (Owner only).')
        .setDescriptionLocalizations({
            tr: 'Yeni bir güncellemeyi Supabase\'e kaydeder ve duyuru kanalına atar (Owner only).'
        })
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Update title')
                .setDescriptionLocalizations({ tr: 'Güncelleme başlığı' })
                .setRequired(true))
        .addStringOption(option => 
            option.setName('content')
                .setDescription('Update content (Supports markdown)')
                .setDescriptionLocalizations({ tr: 'Güncelleme içeriği (Markdown destekler)' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('version')
                .setDescription('Version (e.g. 2.1.0)')
                .setDescriptionLocalizations({ tr: 'Versiyon (Örn: 2.1.0)' })
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type (feature, bugfix, improvement)')
                .setDescriptionLocalizations({ tr: 'Tür (feature, bugfix, improvement)' })
                .setRequired(true)
                .addChoices(
                    { name: 'Feature', value: 'feature' },
                    { name: 'Bugfix', value: 'bugfix' },
                    { name: 'Improvement', value: 'improvement' }
                )),
];

module.exports = commands.map(command => command.toJSON());
