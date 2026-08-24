const { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
const { DEFAULT_CONTENT, LOGO_NAME, LINKS } = require('../constants/constants');
const { sendSubscriptionNotification, logPublicTransaction } = require('../utils/notificationUtils');
const config = require('../config/config');
const { createHelpEmbed } = require('../builders/embedBuilder');
const { safeReply } = require('../utils/interactionUtils');
const { hasActiveParty, setActiveParty, getActiveParties, removeActiveParty, getActivePartyCount } = require('../services/partyManager');
const db = require('../services/db');
const { getGuildConfig, updateGuildConfig } = require('../services/guildConfig');

const { t } = require('../services/i18n');
const { performServerCleanup } = require('../services/cronService');
const { parseTimeToMs } = require('../utils/timeUtils');
const { getUserDropPoints, getDropLeaderboard } = require('@veyronix/database');
const { createObjectiveEmbed, createObjectiveInfoEmbed } = require('../builders/embedBuilder');
const { createObjectiveButtons, createObjectiveSetupButtons } = require('../builders/componentBuilder');

/**
 * Handles /help command
 */
async function handleHelpCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    const embed = createHelpEmbed(0, interaction.guild, lang, guildConfig?.embed_thumbnail_url);

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel(t('help.btn_support', lang)).setEmoji('🆘').setStyle(ButtonStyle.Link).setURL('https://veyronix.com.tr/support'),
        new ButtonBuilder().setLabel(t('help.btn_docs', lang)).setEmoji('📚').setStyle(ButtonStyle.Link).setURL('https://veyronix.com.tr/docs'),
        new ButtonBuilder().setLabel(t('help.btn_invite', lang)).setEmoji('📨').setStyle(ButtonStyle.Link).setURL('https://discord.com/oauth2/authorize?client_id=' + interaction.client.user.id + '&permissions=8&scope=bot%20applications.commands')
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel(t('help.btn_premium', lang)).setEmoji('⭐').setStyle(ButtonStyle.Link).setURL('https://veyronix.com.tr/premium')
    );

    return await safeReply(interaction, {
        embeds: [embed],
        components: [row1, row2],
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
            const noPartyText = `❌ **${t('common.no_party', lang)}**`;
            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp({
                    content: noPartyText,
                    flags: [MessageFlags.Ephemeral]
                }).catch(() => {});
            }
            return await interaction.reply({
                content: noPartyText,
                flags: [MessageFlags.Ephemeral]
            }).catch(() => {});
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
                        if (guildConfig?.system_mode === 'fixed_channel' && channelId !== guildConfig?.fixed_message_channel_id) {
                            try {
                                await channel.send({ content: `⏳ **${lang === 'tr' ? 'Bu kanal 5 saniye içinde silinecek...' : 'This channel will be deleted in 5 seconds...'}**` });
                                setTimeout(async () => {
                                    await channel.delete().catch(() => { });
                                }, 5000);
                                totalClosed++;
                            } catch (err) { }
                        } else {
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

                                const { createClosedButton } = require('../builders/componentBuilder');
                                const closedRow = createClosedButton(lang);
                                await message.edit({
                                    embeds: [closedEmbed],
                                    components: [closedRow]
                                }).catch(() => { });
                                totalClosed++;
                            }
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
 * Handles /settings command
 */
async function handleSettingsCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId) || {};
    const lang = guildConfig.language || 'tr';

    const embed = new EmbedBuilder()
        .setTitle(lang === 'tr' ? '⚙️ Bot Ayarları' : '⚙️ Bot Settings')
        .setDescription(lang === 'tr' ? 'Lütfen botun dilini aşağıdan seçin:' : 'Please select the bot language below:')
        .setColor(3447003)
        .addFields({ name: lang === 'tr' ? 'Mevcut Dil' : 'Current Language', value: lang === 'tr' ? '🇹🇷 Türkçe' : '🇺🇸 English', inline: true });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('settings_lang_select')
        .setPlaceholder(lang === 'tr' ? 'Bir dil seçin...' : 'Select a language...')
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
            content: lang === 'tr'
                ? `❌ **Bu özellik Veyronix Premium gerektirir!**\n\nObjektif ve Timer takip sistemini sunucunuzda kurmak için web panelimiz üzerinden sunucunuzu premium pakete yükseltin.`
                : `❌ **This feature requires Veyronix Premium!**\n\nTo set up Objective and Timer tracking on your server, upgrade your server to premium via our web panel.`,
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
            content: lang === 'tr'
                ? `✅ **Sistem başarıyla kuruldu!**\nSetup Kanalı: <#${setupChannel.id}>\nBildirim Kanalı: <#${notifyChannel.id}>`
                : `✅ **System successfully set up!**\nSetup Channel: <#${setupChannel.id}>\nNotification Channel: <#${notifyChannel.id}>`,
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
            content: lang === 'tr'
                ? `❌ **Bu özellik Veyronix Premium gerektirir!**\n\nGünlük otomatik KillBoard özet raporlarını aktifleştirmek için web panelimiz üzerinden sunucunuzu premium pakete yükseltin.`
                : `❌ **This feature requires Veyronix Premium!**\n\nTo activate daily automatic KillBoard summary reports, upgrade your server to premium via our web panel.`,
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
            content: lang === 'tr'
                ? `✅ **KillBoard ayarlandı!**\nKanal: <#${channel.id}>\nSaat: **${time} UTC**`
                : `✅ **KillBoard configured!**\nChannel: <#${channel.id}>\nTime: **${time} UTC**`,
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

    let ev = guildConfig?.log_events;
    if (typeof ev === 'string' && ev !== '[object Object]') {
        try { ev = JSON.parse(ev); } catch(e) { ev = {}; }
    }
    const buttonType = (ev && ev.registration_button_type) ? ev.registration_button_type : (guildConfig?.registration_button_type || 'both');
    const components = [];

    if (buttonType === 'tr' || buttonType === 'both') {
        components.push(
            new ButtonBuilder()
                .setCustomId('register_start_tr')
                .setLabel('🇹🇷 Kayıt Ol')
                .setStyle(ButtonStyle.Primary)
        );
    }

    if (buttonType === 'en' || buttonType === 'both') {
        components.push(
            new ButtonBuilder()
                .setCustomId('register_start_en')
                .setLabel('🇬🇧 Register')
                .setStyle(ButtonStyle.Primary)
        );
    }

    const row = new ActionRowBuilder().addComponents(components);

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
                    const newNick = lang === 'tr' ? `[Kayıt Bekliyor]` : `[Pending Register]`;
                    await member.setNickname(newNick).catch(() => { });
                } catch (nickErr) { }

                // Update roles (removes all existing roles and gives the unregistered role)
                try {
                    await member.roles.set([unregRole.id]).catch(() => { });
                } catch (roleErr) { }

                affectedCount++;

                // Wait slightly to avoid discord API rate limit (4-5 requests per second is safe)
                await new Promise(r => setTimeout(r, 400));
            }
        }

        await interaction.editReply({
            content: t('registration.force_reg_done', lang, { count: affectedCount, role: `<@&${unregRole.id}>` })
        });
    } catch (err) {
        console.error('[CommandHandler] Error in handleForceRegistrationCommand:', err);
        await interaction.editReply({ content: `❌ Bir hata oluştu: ${err.message}` });
    }
}

/**
 * Handles /kayit-duzenle command
 */
async function handleFixRegistrationCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    // Verify staff permissions
    const staffRoles = guildConfig?.registration_staff_role_ids?.split(',') || [];
    const isStaff = interaction.member.roles.cache.some(r => staffRoles.includes(r.id)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isStaff) {
        return await safeReply(interaction, {
            content: `⛔ **${lang === 'tr' ? 'Sadece kayıt sorumluları bu komutu kullanabilir!' : 'Only registration staff can use this command!'}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const targetUser = interaction.options.getUser('kullanici');
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
        return await safeReply(interaction, {
            content: `❌ **${lang === 'tr' ? 'Kullanıcı sunucuda bulunamadı!' : 'User not found in the server!'}**`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const roleAction = interaction.options.getString('rol');

    // Extract info from current nickname
    let currentNickname = targetMember.nickname || targetMember.user.username;
    let currentIgn = '', currentIsim = '', currentYas = '';

    // Remove tag/prefix if exists (e.g. [TURQ] Ign - Isim Yas)
    let nameWithoutPrefix = currentNickname.replace(/^\[.*?\]\s*/, '').trim();

    // Split by ' - ' to separate Ign from RealName/Age
    let parts = nameWithoutPrefix.split(' - ');
    currentIgn = parts[0].trim();

    if (parts.length > 1) {
        let rest = parts.slice(1).join(' - ').trim();
        let lastSpaceIndex = rest.lastIndexOf(' ');

        if (lastSpaceIndex !== -1) {
            currentIsim = rest.substring(0, lastSpaceIndex).trim();
            currentYas = rest.substring(lastSpaceIndex + 1).trim();
            // Check if yas is just numbers
            if (!/^\d+$/.test(currentYas)) {
                // It's not a number, maybe they don't have age, just a multi-word name
                currentIsim = rest;
                currentYas = '';
            }
        } else {
            currentIsim = rest;
            currentYas = '';
        }
    }

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    let ign = interaction.options.getString('ign') || currentIgn;
    let realName = interaction.options.getString('isim') || currentIsim;
    let age = interaction.options.getString('yas') || currentYas;

    ign = capitalize(ign);
    realName = capitalize(realName);

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
        // Find which roles to add and remove
        let givenRoleId = null;
        let roleIndex = roleAction === 'temp' ? 'temp' : parseInt(roleAction, 10);

        if (roleIndex === 1) givenRoleId = guildConfig?.registration_given_role_id;
        else if (roleIndex === 2) givenRoleId = guildConfig?.registration_given_role_id_2;
        else if (roleIndex === 3) givenRoleId = guildConfig?.registration_given_role_id_3;
        else if (roleIndex === 4) givenRoleId = guildConfig?.registration_given_role_id_4;
        else if (roleIndex === 5) givenRoleId = guildConfig?.registration_given_role_id_5;
        else if (roleIndex === 'temp') givenRoleId = guildConfig?.registration_unregistered_role_id;

        // Support direct role ID if passed directly
        if (!givenRoleId && roleAction) {
            if (roleAction === guildConfig?.registration_given_role_id) { givenRoleId = roleAction; roleIndex = 1; }
            else if (roleAction === guildConfig?.registration_given_role_id_2) { givenRoleId = roleAction; roleIndex = 2; }
            else if (roleAction === guildConfig?.registration_given_role_id_3) { givenRoleId = roleAction; roleIndex = 3; }
            else if (roleAction === guildConfig?.registration_given_role_id_4) { givenRoleId = roleAction; roleIndex = 4; }
            else if (roleAction === guildConfig?.registration_given_role_id_5) { givenRoleId = roleAction; roleIndex = 5; }
            else if (roleAction === guildConfig?.registration_unregistered_role_id) { givenRoleId = roleAction; roleIndex = 'temp'; }
            else if (interaction.guild.roles.cache.has(roleAction)) { givenRoleId = roleAction; roleIndex = 1; }
        }

        if (!givenRoleId) {
            return await interaction.editReply({
                content: `❌ **${lang === 'tr' ? 'Seçilen rol türü sistemde ayarlanmamış!' : 'Selected role type is not configured in the system!'}**`
            });
        }

        const allRegRoles = [
            guildConfig?.registration_given_role_id,
            guildConfig?.registration_given_role_id_2,
            guildConfig?.registration_given_role_id_3,
            guildConfig?.registration_given_role_id_4,
            guildConfig?.registration_given_role_id_5,
            guildConfig?.registration_unregistered_role_id,
            guildConfig?.auto_role_on_join_id
        ].filter(r => r);

        // Remove other registration roles
        for (const roleId of allRegRoles) {
            if (roleId && roleId !== givenRoleId && targetMember.roles.cache.has(roleId)) {
                await targetMember.roles.remove(roleId).catch(() => { });
            }
        }

        // Add the target role
        await targetMember.roles.add(givenRoleId).catch(() => { });

        // Format Nickname: [PREFIX] Ign - RealName Age
        let prefix = '';
        if (roleIndex === 1 && guildConfig?.auto_check_guild_tag) {
            prefix = `[${guildConfig.auto_check_guild_tag.toUpperCase()}] `;
        } else if (roleIndex !== 1 && guildConfig?.auto_check_guild_tag) {
            // For community members, we can use NAN or leave it without a prefix. 
            // In the buttonHandler, it tries to get it from the embed. Let's just use NAN or custom if not role 1.
            prefix = `[NAN] `;
        } else {
            prefix = `[NAN] `;
        }

        const safeAge = age ? ` ${age}` : '';
        const safeRealName = realName ? ` - ${realName}` : '';

        const fixedLength = prefix.length + safeRealName.length + safeAge.length;
        let finalIgn = ign;

        // Truncate logic
        if (fixedLength + finalIgn.length > 32) {
            let charsToRemove = (fixedLength + finalIgn.length) - 32;
            const vowels = 'aeıioöuüAEIİOÖUÜ';
            let ignArr = finalIgn.split('');

            for (let i = ignArr.length - 1; i >= 0 && charsToRemove > 0; i--) {
                if (vowels.includes(ignArr[i])) {
                    ignArr.splice(i, 1);
                    charsToRemove--;
                }
            }

            finalIgn = ignArr.join('');

            if (fixedLength + finalIgn.length > 32) {
                const maxIgnLength = Math.max(0, 32 - fixedLength);
                finalIgn = finalIgn.substring(0, maxIgnLength);
            }
        }

        let newNickname = `${prefix}${finalIgn}${safeRealName}${safeAge}`.trim();
        if (newNickname.length > 32) {
            newNickname = newNickname.substring(0, 32);
        }

        let nickStatus = '';
        if (interaction.guild.ownerId !== targetMember.id) {
            try {
                await targetMember.setNickname(newNickname);
                nickStatus = `\n✅ **Yeni İsim:** \`${newNickname}\``;
            } catch (e) {
                console.error(`[Nickname error] ${e.message} for user ${targetMember.id}`);
                nickStatus = `\n❌ **İsim değiştirilemedi (Yetki sınırı olabilir). Olması gereken:** \`${newNickname}\``;
            }
        } else {
            nickStatus = `\n⚠️ **Sunucu sahibinin ismi değiştirilemez. Olması gereken:** \`${newNickname}\``;
        }

        await interaction.editReply({
            content: `✅ **<@${targetMember.id}> kullanıcısının kaydı başarıyla güncellendi!**\n🎖️ **Verilen Rol:** <@&${givenRoleId}>${nickStatus}`
        });

    } catch (err) {
        console.error('[CommandHandler] Error in handleFixRegistrationCommand:', err);
        await interaction.editReply({ content: `❌ Bir hata oluştu: ${err.message}` });
    }
}

module.exports = {
    handleHelpCommand,
    handleVoteCommand,
    handleClosePartyCommand,

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
    handleForceRegistrationCommand,
    handleFixRegistrationCommand,

    handleMyPointsCommand,
    handleDropLeaderboardCommand,
    handleDropManualCommand,
    handleSetupAutoPremiumCommand,
    handleRegCloseCommand,
};

/**
 * /mypoints — Kullanıcının bu sunucudaki drop puanını gösterir
 */
async function handleMyPointsCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const isEn = lang === 'en';

    const data = await getUserDropPoints(interaction.guildId, interaction.user.id);

    const embed = new EmbedBuilder()
        .setTitle(isEn ? '🏆 Your Drop Points' : '🏆 Drop Puanlarım')
        .setColor('#7C83FD')
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: 'Veyronix Drop System' });

    if (!data || data.total_points === 0) {
        embed.setDescription(
            isEn
                ? `You haven't won any drops yet in **${interaction.guild.name}**.\n\nJoin a channel and type the drop code first to earn points!`
                : `**${interaction.guild.name}** sunucusunda henüz hiç drop kazanmadın.\n\nBir kanaldaki drop kodunu ilk yazan olmaya çalış!`
        );
    } else {
        const lastWin = data.last_win_at
            ? `<t:${Math.floor(new Date(data.last_win_at).getTime() / 1000)}:R>`
            : (isEn ? 'Never' : 'Hiç');

        embed
            .setDescription(isEn
                ? `Here are your drop stats for **${interaction.guild.name}**:`
                : `**${interaction.guild.name}** sunucusundaki drop istatistiklerin:`)
            .addFields(
                { name: isEn ? '🏆 Total Points' : '🏆 Toplam Puan', value: `**${data.total_points}**`, inline: true },
                { name: isEn ? '🎯 Wins' : '🎯 Kazanılan', value: `**${data.win_count}**`, inline: true },
                { name: isEn ? '⏱️ Last Win' : '⏱️ Son Kazanma', value: lastWin, inline: true },
            );
    }

    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
}

/**
 * /drop-leaderboard — Sunucunun drop puan liderlik tablosu
 */
async function handleDropLeaderboardCommand(interaction) {
    await interaction.deferReply();

    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const isEn = lang === 'en';

    const leaderboard = await getDropLeaderboard(interaction.guildId, 10);

    const embed = new EmbedBuilder()
        .setTitle(isEn ? '🏆 Drop Leaderboard' : '🏆 Drop Liderlik Tablosu')
        .setColor('#FFD700')
        .setTimestamp()
        .setFooter({ text: `${interaction.guild.name} • Veyronix Drop System` });

    if (!leaderboard || leaderboard.length === 0) {
        embed.setDescription(isEn
            ? 'No drops have been claimed yet in this server!'
            : 'Bu sunucuda henüz hiç drop kazanılmadı!');
    } else {
        const medals = ['🥇', '🥈', '🥉'];
        const rows = leaderboard.map((entry, i) => {
            const medal = medals[i] || `**${i + 1}.**`;
            return `${medal} <@${entry.user_id}> — **${entry.total_points}** ${isEn ? 'pts' : 'puan'} *(${entry.win_count} ${isEn ? 'wins' : 'kazanım'})*`;
        });
        embed.setDescription(rows.join('\n'));
    }

    await interaction.editReply({ embeds: [embed] });
}

/**
 * /drop-manual — Sadece Bot Owner kullanabilir. Manuel drop düşürür.
 */
async function handleDropManualCommand(interaction) {
    const isBotOwner = interaction.user.id === config.OWNER_ID;
    if (!isBotOwner) {
        return await safeReply(interaction, { content: '❌ Bu komutu sadece bot sahibi kullanabilir.', flags: [MessageFlags.Ephemeral] });
    }

    const { getDropSettings } = require('@veyronix/database');
    const { publishDrop } = require('../services/dropEngine');

    let settings = await getDropSettings(interaction.guildId);
    if (!settings) {
        // Eğer sunucu drop sistemini kurmamışsa varsayılan ayarlar oluştur
        settings = {
            guild_id: interaction.guildId,
            code_expire_seconds: 60,
            drop_points: 10
        };
    }

    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const result = await publishDrop(interaction.client, settings, interaction.channel.id, 'manual', lang);
    if (result) {
        await interaction.editReply({ content: '✅ Drop başarıyla bu kanala düşürüldü.' });
    } else {
        await interaction.editReply({ content: '❌ Drop düşürülürken bir hata oluştu.' });
    }
}

/**
 * /setup-autopremium — Otomatik Premium butonu gönderir
 */
async function handleSetupAutoPremiumCommand(interaction) {
    if (interaction.user.id !== config.OWNER_ID) {
        return interaction.reply({ content: '❌ Bu komutu sadece bot yetkilisi kullanabilir.', flags: [MessageFlags.Ephemeral] });
    }

    const embed = new EmbedBuilder()
        .setTitle('💎 Claim Premium')
        .setDescription('If you meet the requirements, click the button below to claim your Veyronix Premium.\nThe system will ask for your in-game name (IGN).')
        .setColor('#FFD700');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('request_auto_premium')
            .setLabel('💎 Claim Premium')
            .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Buton gönderildi.', flags: [MessageFlags.Ephemeral] });
}

/**
 * /reg-close — Manuel kayıt oturumu sonlandırma (Sadece Kayıt Sorumluları)
 */
async function handleRegCloseCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const staffRoles = guildConfig?.registration_staff_role_ids?.split(',') || [];

    // Kullanıcının yetkisi var mı kontrol et
    const hasPermission = interaction.member.roles.cache.some(role => staffRoles.includes(role.id)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    if (!hasPermission) {
        return interaction.reply({
            content: lang === 'tr' ? '❌ Bu komutu sadece Kayıt Sorumluları kullanabilir.' : '❌ Only Registration Staff can use this command.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    const targetUser = interaction.options.getUser('kullanici');
    if (!targetUser) {
        return interaction.reply({ content: '❌ Kullanıcı bulunamadı.', flags: [MessageFlags.Ephemeral] });
    }

    const appSvc = require('../services/applicationService');
    const { supabase } = require('@veyronix/database');

    // Supabase'den pending kayıtları sil
    await supabase
        .from('application_answers')
        .delete()
        .eq('user_id', targetUser.id)
        .eq('guild_id', interaction.guildId)
        .eq('status', 'pending');

    // RAM'den oturumu temizle
    appSvc.clearSession(targetUser.id, interaction.guildId);

    return interaction.reply({
        content: `✅ <@${targetUser.id}> adlı kullanıcının takılı kalan kayıt oturumu başarıyla sonlandırıldı. Artık yeniden kayıt başlatabilir.`,
        flags: [MessageFlags.Ephemeral]
    });
}
