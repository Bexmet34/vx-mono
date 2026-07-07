const { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { DEFAULT_CONTENT, LOGO_NAME, LINKS } = require('../constants/constants');
const { sendSubscriptionNotification, logPublicTransaction } = require('../utils/notificationUtils');
const config = require('../config/config');
const { createHelpEmbed } = require('../builders/embedBuilder');
const { safeReply } = require('../utils/interactionUtils');
const { hasActiveParty, setActiveParty, getActiveParties, removeActiveParty, getActivePartyCount } = require('../services/partyManager');
const { addToWhitelist, removeFromWhitelist, isWhitelisted } = require('../services/whitelistManager');
const db = require('../services/db');
const { getGuildConfig, updateGuildConfig } = require('../services/guildConfig');

const { t } = require('../services/i18n');
const { performServerCleanup } = require('../services/cronService');
const { parseTimeToMs } = require('../utils/timeUtils');
const { createObjectiveEmbed, createObjectiveInfoEmbed } = require('../builders/embedBuilder');
const { createObjectiveButtons, createObjectiveSetupButtons } = require('../builders/componentBuilder');

/**
 * Handles /help command
 */
async function handleHelpCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    const embed = createHelpEmbed(0, interaction.guild, lang, guildConfig?.embed_thumbnail_url);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_page_0').setLabel('🏠').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('help_page_1').setLabel(`⚔️ ${t('help.page_2', lang)}`).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('help_vote').setLabel(`🗳️ /vote`).setStyle(ButtonStyle.Success)
    );

    const linkRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel(`🌐 Website`).setStyle(ButtonStyle.Link).setURL(LINKS.WEBSITE),
        new ButtonBuilder().setLabel(t('help.donate_button', lang) || 'Top.gg').setStyle(ButtonStyle.Link).setURL(LINKS.TOPGG)
    );

    return await safeReply(interaction, {
        embeds: [embed],
        components: [row, linkRow],
        flags: [MessageFlags.Ephemeral]
    });
}

/**
 * Handles /closeparty command
 */
async function handleClosePartyCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const userId = interaction.user.id;

    console.log(`[CommandHandler] /closeparty triggered by ${interaction.user.tag} (${userId})`);

    try {
        let parties = getActiveParties(userId);

        // If not found in JSON (e.g. after bot restart), fallback to SQL Database
        if (!parties || parties.length === 0) {
            console.log(`[CommandHandler] JSON empty, searching SQL DB for active parties of ${userId}`);
            const dbParties = await db.all('SELECT message_id, channel_id FROM parties WHERE owner_id = ? AND status = ?', [userId, 'active']);
            
            if (dbParties && dbParties.length > 0) {
                parties = dbParties.map(p => ({ messageId: p.message_id, channelId: p.channel_id }));
            }
        }

        if (!parties || parties.length === 0) {
            console.log(`[CommandHandler] No active parties found for ${interaction.user.tag} in both JSON and SQL DB`);
            return await safeReply(interaction, {
                content: `❌ **${t('common.no_party', lang)}**`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        console.log(`[CommandHandler] Closing ${parties.length} parties for ${interaction.user.tag}`);
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(() => { });

        let totalClosed = 0;

        for (const partyInfo of parties) {
            let messageId = typeof partyInfo === 'object' ? partyInfo.messageId : partyInfo;
            let channelId = typeof partyInfo === 'object' ? partyInfo.channelId : null;

            // Fallback: If channelId is missing from JSON, try fetching from SQL DB
            if (!channelId && messageId) {
                const dbParty = await db.get('SELECT channel_id FROM parties WHERE message_id = ?', [messageId]);
                if (dbParty) channelId = dbParty.channel_id;
            }

            if (channelId && messageId) {
                try {
                    const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
                    if (channel) {
                        const message = await channel.messages.fetch(messageId).catch(() => null);

                        if (message && message.embeds && message.embeds[0]) {
                            const oldEmbed = message.embeds[0];
                            const fields = oldEmbed.fields || [];
                            const newFields = fields.filter(f => f.name && !f.name.includes('📌') && !f.name.includes('KURALLAR'));

                            const closedEmbed = EmbedBuilder.from(oldEmbed)
                                .setTitle(`${oldEmbed.title || 'Party'} [${t('common.closed', lang)}]`)
                                .setColor('#808080')
                                .setFields(newFields)
                                .setFooter(null)
                                .setTimestamp(null);

                            const closedRow = createClosedButton(lang);
                            const { AttachmentBuilder } = require('discord.js');
                            const { LOGO_PATH } = require('../constants/constants');
                            await message.edit({ 
                                embeds: [closedEmbed], 
                                components: [closedRow]
                            }).catch(() => { });
                            totalClosed++;
                        }
                    }
                } catch (err) { }
            }
            removeActiveParty(userId, messageId);
            try {
                await db.run('UPDATE parties SET status = ? WHERE message_id = ?', ['closed', messageId]).catch(() => { });
            } catch (dbErr) { }
        }

        const responseContent = totalClosed > 0
            ? `✅ **${t('party.closed_success', lang, { count: totalClosed })}**`
            : `✅ **${t('party.cleared_success', lang)}**`;

        await interaction.editReply({ content: responseContent }).catch(() => { });

    } catch (error) {
        console.error('[CommandHandler] Critical Error in handleClosePartyCommand:', error);
        removeActiveParty(userId);
        await db.run('UPDATE parties SET status = ? WHERE owner_id = ? AND status = ?', ['closed', userId, 'active']).catch(() => { });
        await interaction.followUp({
            content: `❌ **${t('common.error', lang)}**\n${error.message}`,
            flags: [MessageFlags.Ephemeral]
        }).catch(() => { });
    }
}

/**
 * Handles /whitelistadd command
 */
async function handleWhitelistAddCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    const userId = interaction.user.id;
    const isBotOwner = userId === config.OWNER_ID;
    const isGuildOwner = interaction.guild && userId === interaction.guild.ownerId;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isBotOwner && !isGuildOwner && !isAdmin) {
        return await safeReply(interaction, { content: `❌ ${t('common.owner_only', lang)}`, flags: [MessageFlags.Ephemeral] });
    }

    const targetUser = interaction.options.getUser('user');

    if (await addToWhitelist(targetUser.id, interaction.guildId)) {
        return await safeReply(interaction, {
            content: `✅ **${targetUser.tag}** ${t('whitelist.added', lang)}`,
            flags: [MessageFlags.Ephemeral]
        });
    } else {
        return await safeReply(interaction, {
            content: `❌ **${targetUser.tag}** ${t('whitelist.already_in', lang)}`,
            flags: [MessageFlags.Ephemeral]
        });
    }
}

/**
 * Handles /whitelistremove command
 */
async function handleWhitelistRemoveCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    const userId = interaction.user.id;
    const isBotOwner = userId === config.OWNER_ID;
    const isGuildOwner = interaction.guild && userId === interaction.guild.ownerId;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isBotOwner && !isGuildOwner && !isAdmin) {
        return await safeReply(interaction, { content: `❌ ${t('common.owner_only', lang)}`, flags: [MessageFlags.Ephemeral] });
    }

    const targetUser = interaction.options.getUser('user');

    if (await removeFromWhitelist(targetUser.id, interaction.guildId)) {
        return await safeReply(interaction, {
            content: `✅ **${targetUser.tag}** ${t('whitelist.removed', lang)}`,
            flags: [MessageFlags.Ephemeral]
        });
    }
}

/**
 * Handles /settings command
 */
async function handleSettingsCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId) || {};
    const lang = guildConfig.language || 'tr';

    const embed = new EmbedBuilder()
        .setTitle('⚙️ Bot Ayarları')
        .setDescription('Lütfen botun dilini aşağıdan seçin:')
        .setColor(3447003)
        .addFields({ name: `Mevcut Dil`, value: lang === 'tr' ? '🇹🇷 Türkçe' : '🇺🇸 English', inline: true });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('settings_lang_select')
        .setPlaceholder('Bir dil seçin...')
        .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('Türkçe 🇹🇷').setValue('tr').setEmoji('🇹🇷'),
            new StringSelectMenuOptionBuilder().setLabel('English 🇺🇸').setValue('en').setEmoji('🇺🇸')
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return await safeReply(interaction, {
        embeds: [embed],
        components: [row],
        flags: [MessageFlags.Ephemeral]
    });
}

/**
 * Handles /servers command (Owner Only)
 */
async function handleServersCommand(interaction) {
    const isBotOwner = interaction.user.id === config.OWNER_ID;
    
    if (!isBotOwner) {
        return await safeReply(interaction, { content: '❌ Bu komutu sadece bot yetkilisi kullanabilir.', flags: [MessageFlags.Ephemeral] });
    }

    const guilds = interaction.client.guilds.cache;
    const guildList = guilds.map(g => `• **${g.name}** (${g.id}) - ${g.memberCount} üye`).join('\n');

    const embed = new EmbedBuilder()
        .setTitle('🏢 Sunucu Listesi')
        .setDescription(`Toplam **${guilds.size}** sunucuda bulunuyorum.\n\n${guildList.length > 2000 ? guildList.substring(0, 1900) + '...' : guildList}`)
        .setColor('#2ECC71');

    return await safeReply(interaction, {
        embeds: [embed],
        flags: [MessageFlags.Ephemeral]
    });
}

const { addSubscriptionDays, removeSubscriptionDays, setUnlimitedSubscription, setSubscriptionActive, getSubscription, isSubscriptionActive } = require('@veyronix/database');

/**
 * Handles /subscription command (Owner Only)
 */
async function handleSubscriptionCommand(interaction) {
    const isBotOwner = interaction.user.id === config.OWNER_ID;
    
    if (!isBotOwner) {
        return await safeReply(interaction, { content: '❌ Bu komutu sadece bot sahibi kullanabilir.', flags: [MessageFlags.Ephemeral] });
    }

    const guildId = interaction.options.getString('guild_id');
    const sub = await getSubscription(guildId, 'Sistem Sorgusu', interaction.user.id);

    if (!sub) {
        return await safeReply(interaction, { content: `❌ **${guildId}** ID'li sunucu veritabanında bulunamadı.`, flags: [MessageFlags.Ephemeral] });
    }

    const embed = createSubscriptionEmbed(sub);
    const row = createSubscriptionMenu(guildId, sub);

    return await safeReply(interaction, {
        embeds: [embed],
        components: [row],
        flags: [MessageFlags.Ephemeral]
    });
}

function createSubscriptionEmbed(sub) {
    const expiresAt = new Date(sub.expires_at);
    const timestamp = Math.floor(expiresAt.getTime() / 1000);
    const now = new Date();
    const isExpired = !sub.is_unlimited && expiresAt < now;

    let statusText = sub.is_active ? (isExpired ? 'Süresi Dolmuş ⚠️' : 'Aktif ✅') : 'Devre Dışı ❌';
    if (sub.is_unlimited) statusText = 'Sınırsız ✅';

    return new EmbedBuilder()
        .setTitle(`🏢 Abonelik Yönetimi: ${sub.guild_name}`)
        .setColor(sub.is_active && !isExpired ? '#2ECC71' : '#E74C3C')
        .setFields(
            { name: 'Sunucu ID', value: `\`${sub.guild_id}\``, inline: true },
            { name: 'Durum', value: statusText, inline: true },
            { name: 'Sınırsız mı?', value: sub.is_unlimited ? 'Evet' : 'Hayır', inline: true },
            { name: 'Bitiş Tarihi', value: sub.is_unlimited ? '∞' : `<t:${timestamp}:F> (<t:${timestamp}:R>)`, inline: false }
        )
        .setFooter({ text: 'Aşağıdaki menüden işlem seçiniz.' })
        .setTimestamp();
}

function createSubscriptionMenu(guildId, sub) {
    const select = new StringSelectMenuBuilder()
        .setCustomId(`sub_manage:${guildId}`)
        .setPlaceholder('Hızlı İşlemler...')
        .addOptions(
            { label: 'Gün Ekle', value: 'add_custom', description: 'Sunucuya belirli bir gün kadar abonelik ekler.', emoji: '➕' },
            { label: 'Gün Çıkar', value: 'rem_custom', description: 'Sunucudan belirli bir gün kadar abonelik çıkarır.', emoji: '➖' },
            { label: sub.is_unlimited ? 'Sınırsız Modu Kapat' : 'Sınırsız Modu Aç', value: 'toggle_unlimited', description: sub.is_unlimited ? 'Sınırsız erişimi kaldırır.' : 'Sınırsız abonelik tanımlar.', emoji: '♾️' },
            { label: sub.is_active ? 'Devre Dışı Bırak' : 'Aktifleştir', value: 'toggle_active', description: sub.is_active ? 'Aboneliği dondurur/kapatır.' : 'Aboneliği tekrar aktif eder.', emoji: sub.is_active ? '🚫' : '✅' }
        );

    return new ActionRowBuilder().addComponents(select);
}

async function handleSubscriptionSelect(interaction) {
    const isBotOwner = interaction.user.id === config.OWNER_ID;
    if (!isBotOwner) return;

    const [_, guildId] = interaction.customId.split(':');
    const action = interaction.values[0];

    let success = false;

    if (action === 'add_custom' || action === 'rem_custom') {
        const modal = new ModalBuilder()
            .setCustomId(`sub_modal:${action}:${guildId}`)
            .setTitle(action === 'add_custom' ? 'Abonelik Günü Ekle' : 'Abonelik Günü Çıkar');

        const input = new TextInputBuilder()
            .setCustomId('days_input')
            .setLabel('Kaç gün?')
            .setPlaceholder('Örn: 30')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return await interaction.showModal(modal);
    } else if (action === 'toggle_unlimited') {
        const sub = await getSubscription(guildId, 'Sistem', interaction.user.id);
        success = await setUnlimitedSubscription(guildId, !sub?.is_unlimited);
    } else if (action === 'toggle_active') {
        const sub = await getSubscription(guildId, 'Sistem', interaction.user.id);
        success = await setSubscriptionActive(guildId, !sub?.is_active);
    }

    if (success) {
        const updatedSub = await getSubscription(guildId, 'Sistem', interaction.user.id);
        
        // Log transaction
        let detail = '';
        if (action === 'toggle_unlimited') detail = updatedSub.is_unlimited ? '♾️ Sınırsız mod açıldı.' : '🚫 Sınırsız mod kapatıldı.';
        else if (action === 'toggle_active') detail = updatedSub.is_active ? '✅ Abonelik aktifleştirildi.' : '🚫 Abonelik donduruldu.';

        await logPublicTransaction(interaction.client, interaction.user.id, guildId, updatedSub.guild_name, 'admin_action', detail);

        await interaction.update({
            embeds: [createSubscriptionEmbed(updatedSub)],
            components: [createSubscriptionMenu(guildId, updatedSub)],
            files: []
        });
    }
}

async function handleSubscriptionModal(interaction) {
    const isBotOwner = interaction.user.id === config.OWNER_ID;
    if (!isBotOwner) return;

    const [_, action, guildId] = interaction.customId.split(':');
    const daysStr = interaction.fields.getTextInputValue('days_input');
    const days = parseInt(daysStr);

    if (isNaN(days) || days <= 0) {
        return await interaction.reply({ content: '❌ Lütfen geçerli bir sayı giriniz.', flags: [MessageFlags.Ephemeral] });
    }

    let success = false;
    if (action === 'add_custom') {
        success = await addSubscriptionDays(guildId, days);
    } else if (action === 'rem_custom') {
        success = await removeSubscriptionDays(guildId, days);
    }

    if (success) {
        const updatedSub = await getSubscription(guildId, 'Sistem', interaction.user.id);

        // Log transaction
        const detail = action === 'add_custom' ? `➕ ${days} gün eklendi.` : `➖ ${days} gün çıkarıldı.`;
        await logPublicTransaction(interaction.client, interaction.user.id, guildId, updatedSub.guild_name, 'admin_action', detail);

        await interaction.update({
            embeds: [createSubscriptionEmbed(updatedSub)],
            components: [createSubscriptionMenu(guildId, updatedSub)],
            files: []
        });
    }
}

/**
 * Handles /cleanup-manual command (Owner Only)
 */
async function handleCleanupManualCommand(interaction) {
    const BOT_OWNER_ID = '407234961582587916';
    
    if (interaction.user.id !== BOT_OWNER_ID) {
        return await safeReply(interaction, { 
            content: '❌ Bu komutu sadece bot sahibi kullanabilir.', 
            flags: [MessageFlags.Ephemeral] 
        });
    }

    await interaction.reply({ 
        content: '⏳ Sunucu temizleme işlemi başlatıldı. Veritabanı taranıyor...', 
        flags: [MessageFlags.Ephemeral] 
    });

    try {
        await performServerCleanup(interaction.client, `Manuel Komut (${interaction.user.tag})`);
        await interaction.editReply({ 
            content: '✅ Sunucu temizleme işlemi başarıyla tamamlandı. Rapor özel mesaj ile gönderildi.' 
        });
    } catch (err) {
        await interaction.editReply({ 
            content: `❌ Temizleme sırasında hata oluştu: ${err.message}` 
        });
    }
}

/**
 * Handles /vote command
 */
async function handleVoteCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    const embed = new EmbedBuilder()
        .setTitle(t('vote.title', lang))
        .setDescription(t('vote.description', lang))
        .setColor('#5865F2')
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(t('vote.button_text', lang))
            .setStyle(ButtonStyle.Link)
            .setURL(LINKS.TOPGG)
    );

    const { AttachmentBuilder } = require('discord.js');
    const { LOGO_PATH } = require('../constants/constants');
    const logo = new AttachmentBuilder(LOGO_PATH, { name: LOGO_NAME });

    return await safeReply(interaction, {
        embeds: [embed],
        components: [row],
        flags: [MessageFlags.Ephemeral]
    });
}

/**
 * Handles /setup-objective-system command
 */
async function handleSetupObjectiveSystemCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    
    // Check Subscription
    const isPremium = await isSubscriptionActive(interaction.guildId, interaction.guild.name, interaction.guild.ownerId);
    if (!isPremium) {
        return await safeReply(interaction, {
            content: `❌ **Bu özellik Veyronix Premium gerektirir!**\n\nObjektif ve Timer takip sistemini sunucunuzda kurmak için web panelimiz üzerinden sunucunuzu premium pakete yükseltin.`,
            flags: [MessageFlags.Ephemeral]
        });
    }
    
    const setupChannel = interaction.options.getChannel('setup_kanal');
    const notifyChannel = interaction.options.getChannel('bildirim_kanal');

    const success = await updateGuildConfig(interaction.guildId, { 
        objective_channel_id: setupChannel.id,
        objective_notify_channel_id: notifyChannel.id
    });

    if (success) {
        // Send static info message to setup channel
        const infoEmbed = createObjectiveInfoEmbed(lang);
        const buttons = createObjectiveSetupButtons(lang);
        
        const channel = await interaction.client.channels.fetch(setupChannel.id).catch(() => null);
        if (channel) {
            await channel.send({
                embeds: [infoEmbed],
                components: buttons
            });
        }

        return await safeReply(interaction, {
            content: `✅ **Sistem başarıyla kuruldu!**\nSetup Kanalı: <#${setupChannel.id}>\nBildirim Kanalı: <#${notifyChannel.id}>`,
            flags: [MessageFlags.Ephemeral]
        });
    } else {
        return await safeReply(interaction, {
            content: `❌ **${t('common.error', lang)}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }
}

/**
 * Handles /setup-guild command
 */
async function handleSetupGuildCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    
    const loncaValue = interaction.options.getString('lonca');
    const [guildId, guildName] = loncaValue.split('|');

    if (!guildId || !guildName) {
        return await safeReply(interaction, {
            content: `❌ **${lang === 'tr' ? 'Lütfen listeden bir lonca seçin!' : 'Please select a guild from the list!'}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const success = await updateGuildConfig(interaction.guildId, { 
        albion_guild_id: guildId,
        albion_guild_name: guildName
    });

    if (success) {
        return await safeReply(interaction, {
            content: `✅ **${lang === 'tr' ? 'Lonca başarıyla ayarlandı:' : 'Guild set successfully:'}** **${guildName}** (\`${guildId}\`)`,
            flags: [MessageFlags.Ephemeral]
        });
    } else {
        return await safeReply(interaction, {
            content: `❌ **${t('common.error', lang)}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }
}

/**
 * Handles /setup-killboard command
 */
async function handleSetupKillBoardCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    
    // Check Subscription
    const isPremium = await isSubscriptionActive(interaction.guildId, interaction.guild.name, interaction.guild.ownerId);
    if (!isPremium) {
        return await safeReply(interaction, {
            content: `❌ **Bu özellik Veyronix Premium gerektirir!**\n\nGünlük otomatik KillBoard özet raporlarını aktifleştirmek için web panelimiz üzerinden sunucunuzu premium pakete yükseltin.`,
            flags: [MessageFlags.Ephemeral]
        });
    }
    
    const channel = interaction.options.getChannel('kanal');
    const time = interaction.options.getString('saat') || '06:00'; // Default 06:00 UTC

    const success = await updateGuildConfig(interaction.guildId, { 
        killboard_channel_id: channel.id,
        killboard_time: time
    });

    if (success) {
        return await safeReply(interaction, {
            content: `✅ **KillBoard ayarlandı!**\nKanal: <#${channel.id}>\nSaat: **${time} UTC**`,
            flags: [MessageFlags.Ephemeral]
        });
    } else {
        return await safeReply(interaction, {
            content: `❌ **${t('common.error', lang)}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }
}

/**
 * Handles /setup-registration command
 */
async function handleSetupRegistrationCommand(interaction) {
    const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    if (!interaction.member.permissions.has('Administrator')) {
        return await interaction.reply({
            content: `⛔ **${lang === 'tr' ? 'Bu komutu sadece yöneticiler kullanabilir!' : 'Only administrators can use this command!'}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const channel = interaction.channel;
    const welcomeText = guildConfig?.registration_welcome_message || (lang === 'tr' ? 'Hoş geldiniz! Albion Online guildimize katılmak için aşağıdaki butona basarak kayıt olabilirsiniz.' : 'Welcome! Click the button below to register and join our Albion Online guild.');

    const embed = new EmbedBuilder()
        .setTitle(lang === 'tr' ? '🛡️ Albion Kayıt Sistemi' : '🛡️ Albion Registration')
        .setDescription(welcomeText)
        .setColor('#E67E22')
        .setThumbnail(guildConfig?.embed_thumbnail_url || interaction.guild.iconURL())
        .setFooter({ text: 'Veyronix Registration System' });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('register_start')
            .setLabel(lang === 'tr' ? 'Kayıt Ol / Register' : 'Register Now')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🛡️')
    );

    await interaction.reply({
        content: lang === 'tr' ? '✅ Kayıt sistemi bu kanalda başlatıldı!' : '✅ Registration system started in this channel!',
        flags: [MessageFlags.Ephemeral]
    });

    await channel.send({
        embeds: [embed],
        components: [row]
    });
}

/**
 * Handles /kayitsizlari-belirle command
 */
async function handleForceRegistrationCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await safeReply(interaction, {
            content: `⛔ **${lang === 'tr' ? 'Bu komutu sadece yöneticiler kullanabilir!' : 'Only administrators can use this command!'}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const unregRole = interaction.options.getRole('rol');

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
        // Fetch registered users from DB
        const dbRows = await db.all(`SELECT user_id FROM guild_registrations WHERE guild_id = ?`, [interaction.guildId]);
        const registeredIds = new Set(dbRows.map(r => r.user_id));

        // Fetch all members
        const members = await interaction.guild.members.fetch();
        let affectedCount = 0;

        for (const [memberId, member] of members) {
            // Skip bots and the owner
            if (member.user.bot) continue;
            if (memberId === interaction.guild.ownerId) continue;
            
            // Skip users higher than or equal to the bot's highest role to avoid permission errors
            if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) continue;

            if (!registeredIds.has(memberId)) {
                // Change nickname
                try {
                    let oldNick = member.nickname || member.user.username;
                    oldNick = oldNick.replace(/^\[.*?\]\s*/, '');
                    const newNick = `[Kayıt Bekliyor] ${oldNick}`.substring(0, 32);
                    await member.setNickname(newNick).catch(()=>{});
                } catch (nickErr) {}

                // Update roles (removes all existing roles and gives the unregistered role)
                try {
                    await member.roles.set([unregRole.id]).catch(()=>{});
                } catch (roleErr) {}

                affectedCount++;
                
                // Wait slightly to avoid discord API rate limit (4-5 requests per second is safe)
                await new Promise(r => setTimeout(r, 400));
            }
        }

        await interaction.editReply({
            content: `✅ İşlem tamamlandı! Toplam **${affectedCount}** kayıtlı olmayan kullanıcının tüm rolleri alındı, <@&${unregRole.id}> rolü verildi ve isimleri güncellendi.`
        });
    } catch (err) {
        console.error('[CommandHandler] Error in handleForceRegistrationCommand:', err);
        await interaction.editReply({ content: `❌ Bir hata oluştu: ${err.message}` });
    }
}

module.exports = {
    handleHelpCommand,
    handleVoteCommand,
    handleClosePartyCommand,
    handleWhitelistAddCommand,
    handleWhitelistRemoveCommand,
    handleSettingsCommand,
    handleServersCommand,
    handleSubscriptionCommand,
    handleSubscriptionSelect,
    handleSubscriptionModal,
    handleCleanupManualCommand,

    handleSetupObjectiveSystemCommand,
    handleSetupGuildCommand,
    handleSetupKillBoardCommand,
    handleSetupRegistrationCommand,
    handleForceRegistrationCommand
};
