require('dotenv').config({ quiet: true });
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first'); // Force IPv4 to prevent ENETUNREACH errors on VPS
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const { LINKS } = require('./constants/constants');
const config = require('./config/config');
const fs = require('fs');
const path = require('path');
const { registerCommands } = require('./services/commandRegistration');
const { handleHelpCommand, handleVoteCommand, handleClosePartyCommand, handleSettingsCommand, handleServersCommand, handleSubscriptionCommand, handleSubscriptionSelect, handleSubscriptionModal, handleSetupObjectiveSystemCommand, handleSetupGuildCommand, handleSetupKillBoardCommand, handleMyPointsCommand, handleDropLeaderboardCommand } = require('./handlers/commandHandler');

const { handleCreatePartyCommand, handleTempCommand, handleTempAutocomplete, handleMyTempsCommand } = require('./handlers/partikurHandler');

const { handlePartyButtons, handleObjectiveButtons, handleRegisterButtons } = require('./handlers/buttonHandler');
const { handlePartiModal, handleObjectiveModal, handleRegisterModal, handleApplicationAnswerModal } = require('./handlers/modalHandler');
const { AutoPoster } = require('topgg-autoposter');
const { handleManageMenu, handleEditModal, handleKickMember, handleJoinRoleSelect, handleJoinMultiRoleSelect, handleAddMemberSelect, handleAddMemberUserSelect } = require('./handlers/menuHandler');
const { handleSettingsLanguageSelect } = require('./handlers/settingsHandler');
const { handleReactionAdd, handleReactionRemove } = require('./handlers/reactionHandler');
const { handleAutocomplete } = require('./handlers/autocompleteHandler');
const { handleInteractionError } = require('./utils/interactionUtils');
const { initDb } = require('./services/db');
const { getGuildConfig } = require('./services/guildConfig');
const { MessageFlags } = require('discord.js');
const { t } = require('./services/i18n');
const { syncTimeOffset } = require('./utils/timeUtils');

// Create Discord client
const { Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent, // Drop v2: Kod okumak için gerekli — Discord Developer Portal'da da açılmalı!
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

// Register log events
require('./events/logEvents')(client);

// Error handling to prevent crashes
client.on('error', async error => {
    if (error.code === 'ERR_SSL_INVALID_SESSION_ID' || error.message.includes('SSL')) {
        setTimeout(startBot, 5000);
    } else {
        console.error('Discord client error:', error);
    }
});

process.on('unhandledRejection', error => {
    const isNetworkError = error.message?.includes('SSL') || error.message?.includes('fetch failed') || error.message?.includes('JSON') || error.message?.includes('525') || error.message?.includes('ECONNRESET');
    if (isNetworkError) {
        console.warn('[Network Error Swallowed] A database or network request failed but was swallowed to prevent crash:', error.message);
    } else {
        console.error('Sistemsel bir hata oluştu (Promise Rejection):', error);
    }
});

process.on('uncaughtException', error => {
    const fs = require('fs');
    const isNetworkError = error.message?.includes('SSL') || error.message?.includes('fetch failed') || error.message?.includes('JSON') || error.message?.includes('525') || error.message?.includes('ECONNRESET');
    
    if (isNetworkError) {
        console.warn('[Network Error Swallowed] An uncaught database or network request failed but was swallowed to prevent crash:', error.message);
    } else {
        fs.writeFileSync('error.log', `Error: ${error.message}\nStack: ${error.stack}\n`, { flag: 'a' });
        console.error('Sistemsel bir hata oluştu (Uncaught Exception):', error);
    }
});

// Bot startup function
async function startBot() {
    try {
        await syncTimeOffset();
        await initDb();
        await client.login(config.DISCORD_TOKEN);
    } catch (error) {
        console.error('Bot login error:', error);
        setTimeout(startBot, 5000);
    }
}

// Client ready event
client.once('clientReady', async (c) => {
    // Uygulama emojilerini yükle
    try {
        await c.application.emojis.fetch();
    } catch (err) {
        console.error('❌ Uygulama emojileri çekilirken hata oluştu:', err);
    }

    const { startCronService } = require('./services/cronService');
    const { initDbListeners } = require('./services/dbListenerService');
    const { startBroadcastWorker } = require('./services/broadcastService');
    const { initObjectiveService } = require('./services/objectiveService');
    const { initKillBoardService } = require('./services/killboardService');
    const { startScheduledMessageService } = require('./services/scheduledMessageService');
    const { initTempRoleService } = require('./services/tempRoleService');

    // Sadece ana (birinci) Shard üzerinde arka plan işlemlerini başlat
    const isPrimaryShard = !client.shard || client.shard.ids[0] === 0;

    if (isPrimaryShard) {
        startCronService(client);
        initDbListeners(client);
        startBroadcastWorker(client);
        initObjectiveService(client);
        initKillBoardService(client);
        startScheduledMessageService(client);
        initTempRoleService(client);
        console.log('[PrimaryShard] Background services initialized.');
    }


    // Auto-Poster for Top.gg is now handled in sharding.js

    console.log('-------------------------------------------');
    console.log(`🚀 ${c.user.tag} Online! (${new Date().toLocaleTimeString('tr-TR')})`);
    console.log(`🌍 Service active on ${c.guilds.cache.size} servers.`);
    console.log('-------------------------------------------');

    // Sunucuları Supabase ile senkronize et
    const { getSubscription } = require('@veyronix/database');
    const guilds = c.guilds.cache;
    guilds.forEach(async (guild) => {
        try {
            await getSubscription(guild.id, guild.name, guild.ownerId);
        } catch (err) { }
    });

    // Set activity safely
    try {
        client.user.setActivity({
            name: 'custom',
            type: ActivityType.Custom,
            state: config.ACTIVITY_TEXT || '🌐 veyronix.com.tr | /help'
        });
    } catch (err) { }

    registerCommands(client);

    // Güncelleme Bildirimi
    const updateFilePath = path.join(process.cwd(), '.update_success');
    if (fs.existsSync(updateFilePath)) {
        try {
            const ownerId = config.OWNER_ID;
            if (ownerId) {
                const owner = await client.users.fetch(ownerId);
                if (owner) {
                    await owner.send('🚀 **Bot Başarıyla Güncellendi!**\nGitHub\'dan en son değişiklikler çekildi ve bot yeniden başlatıldı. Sistem şu an aktif.');
                }
            }
            fs.unlinkSync(updateFilePath);
        } catch (err) { }
    }
});

// Guild join event
const { getNotification } = require('./services/notificationService');

client.on('guildCreate', async (guild) => {
    try {
        console.log(`[GuildCreate] Joined new server: ${guild.name} (${guild.id})`);
        const { getSubscription } = require('@veyronix/database');
        const sub = await getSubscription(guild.id, guild.name, guild.ownerId);

        if (!sub || !sub.created) return;

        const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
        if (owner) {
            const notification = await getNotification('welcome_trial', 'tr', {
                sunucu: guild.name,
                tarih: new Date(sub.expires_at).toLocaleString('tr-TR')
            });

            if (notification) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Destek Sunucusu | Support Server')
                        .setURL(LINKS.SUPPORT_SERVER)
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel('Web Sitesi | Website')
                        .setURL(LINKS.WEBSITE)
                        .setStyle(ButtonStyle.Link)
                );

                await owner.send({ 
                    embeds: notification.embeds, 
                    content: notification.content,
                    components: [row] 
                }).catch(() => { });
            }
        }
    } catch (err) {
        console.error('[GuildCreate] Error:', err.message);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isAutocomplete()) {
            if (interaction.commandName === 'temp') {
                await handleTempAutocomplete(interaction);
            } else {
                await handleAutocomplete(interaction);
            }
        } else if (interaction.isChatInputCommand()) {
            try {
                const db = require('./services/db');
                db.logAnalyticsEvent('command_used', interaction.commandName, interaction.guildId || 'DM', interaction.user.id);
            } catch (e) {
                console.error('[Analytics] Error logging command:', e.message);
            }
            if (interaction.commandName === 'help') {
                await handleHelpCommand(interaction);
            } else if (interaction.commandName === 'vote') {
                await handleVoteCommand(interaction);
            } else if (interaction.commandName === 'createparty') {
                await handleCreatePartyCommand(interaction);
            } else if (interaction.commandName === 'mytemps') {
                await handleMyTempsCommand(interaction);
            } else if (interaction.commandName === 'temp') {
                await handleTempCommand(interaction);
            } else if (interaction.commandName === 'closeparty') {
                await handleClosePartyCommand(interaction);
            } else if (interaction.commandName === 'settings') {
                await handleSettingsCommand(interaction);
            } else if (interaction.commandName === 'servers') {
                await handleServersCommand(interaction);
            } else if (interaction.commandName === 'subscription') {
                await handleSubscriptionCommand(interaction);
            } else if (interaction.commandName === 'cleanup-manual') {
                const { handleCleanupManualCommand } = require('./handlers/commandHandler');
                await handleCleanupManualCommand(interaction);

            } else if (interaction.commandName === 'setup-objective-system') {
                await handleSetupObjectiveSystemCommand(interaction);
            } else if (interaction.commandName === 'setup-guild') {
                await handleSetupGuildCommand(interaction);
            } else if (interaction.commandName === 'setup-killboard') {
                await handleSetupKillBoardCommand(interaction);
            } else if (interaction.commandName === 'setup-registration') {
                const { handleSetupRegistrationCommand } = require('./handlers/commandHandler');
                await handleSetupRegistrationCommand(interaction);
            } else if (interaction.commandName === 'kayitsizlari-belirle') {
                const { handleForceRegistrationCommand } = require('./handlers/commandHandler');
                await handleForceRegistrationCommand(interaction);
            } else if (interaction.commandName === 'rd') {
                const { handleFixRegistrationCommand } = require('./handlers/commandHandler');
                await handleFixRegistrationCommand(interaction);
            } else if (interaction.commandName === 'mypoints') {
                await handleMyPointsCommand(interaction);
            } else if (interaction.commandName === 'drop-leaderboard') {
                await handleDropLeaderboardCommand(interaction);
            } else if (interaction.commandName === 'drop-manual') {
                const { handleDropManualCommand } = require('./handlers/commandHandler');
                await handleDropManualCommand(interaction);
            } else if (interaction.commandName === 'setup-autopremium') {
                const { handleSetupAutoPremiumCommand } = require('./handlers/commandHandler');
                await handleSetupAutoPremiumCommand(interaction);
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'help_vote') {
                await handleVoteCommand(interaction);
            } else if (interaction.customId === 'obj_open_modal' || interaction.customId.startsWith('obj_join_')) {
                await handleObjectiveButtons(interaction);
            } else if (interaction.customId === 'register_start' || interaction.customId === 'register_btn' || interaction.customId.startsWith('reg_approve_') || interaction.customId.startsWith('reg_reject_') || interaction.customId.startsWith('reg_temp_') || interaction.customId === 'reg_rules_accept' || interaction.customId === 'reg_rules_reject' || interaction.customId.startsWith('app_yesno:') || interaction.customId.startsWith('app_continue:')) {
                await handleRegisterButtons(interaction);
            } else if (interaction.customId.startsWith('fc_')) {
                const { handleFixedContentButtons } = require('./handlers/fixedContentHandler');
                await handleFixedContentButtons(interaction);
            } else if (interaction.customId.startsWith('ticket_')) {
                const { handleTicketInteraction } = require('./handlers/ticketHandler');
                await handleTicketInteraction(interaction);
            } else if (interaction.customId.startsWith('giveaway_')) {
                const { handleGiveawayButtons } = require('./handlers/giveawayHandler');
                await handleGiveawayButtons(interaction);
            } else if (interaction.customId.startsWith('drop_claim:')) {
                const { handleDropButtons } = require('./handlers/dropHandler');
                await handleDropButtons(interaction);
            } else if (interaction.customId === 'request_auto_premium') {
                const { handleAutoPremiumButton } = require('./handlers/buttonHandler');
                await handleAutoPremiumButton(interaction);
            } else {
                await handlePartyButtons(interaction);
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'mytemps_select') {
                const { handleMyTempsSelect } = require('./handlers/menuHandler');
                await handleMyTempsSelect(interaction);
            } else if (interaction.customId === 'fc_temp_select') {
                const { handleFixedContentButtons } = require('./handlers/fixedContentHandler');
                await handleFixedContentButtons(interaction);
            } else if (interaction.customId.startsWith('manage_party_')) {
                await handleManageMenu(interaction);
            } else if (interaction.customId.startsWith('join_role_')) {
                await handleJoinRoleSelect(interaction);
            } else if (interaction.customId.startsWith('join_multi_role_')) {
                await handleJoinMultiRoleSelect(interaction);
            } else if (interaction.customId.startsWith('kick_member_')) {
                await handleKickMember(interaction);
            } else if (interaction.customId.startsWith('add_member_select_')) {
                await handleAddMemberSelect(interaction);
            } else if (interaction.customId === 'settings_lang_select') {
                await handleSettingsLanguageSelect(interaction);
            } else if (interaction.customId.startsWith('sub_manage:')) {
                await handleSubscriptionSelect(interaction);
            } else if (interaction.customId.startsWith('role_menu_') || interaction.customId.startsWith('custom_role_select_')) {
                const { handleRoleMenuSelect } = require('./handlers/roleMenuHandler');
                await handleRoleMenuSelect(interaction);
            } else if (interaction.customId === 'ticket_topic_select') {
                const { handleTicketInteraction } = require('./handlers/ticketHandler');
                await handleTicketInteraction(interaction);
            } else if (interaction.customId.startsWith('app_select:')) {
                await handleRegisterButtons(interaction);

            }
        } else if (interaction.isUserSelectMenu()) {
            if (interaction.customId.startsWith('add_member_user_select_')) {
                await handleAddMemberUserSelect(interaction);
            }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('edit_party_modal:')) {
                await handleEditModal(interaction);
            } else if (interaction.customId.startsWith('add_member_modal:')) {
                const { handleAddMemberModal } = require('./handlers/modalHandler');
                await handleAddMemberModal(interaction);
            } else if (interaction.customId.startsWith('sub_modal:')) {
                await handleSubscriptionModal(interaction);
            } else if (interaction.customId === 'objective_create_modal') {
                await handleObjectiveModal(interaction);
            } else if (interaction.customId === 'register_modal') {
                await handleRegisterModal(interaction);
            } else if (interaction.customId === 'auto_premium_modal') {
                const { handleAutoPremiumModal } = require('./handlers/modalHandler');
                await handleAutoPremiumModal(interaction);
            } else if (interaction.customId.startsWith('app_answer_modal:')) {
                await handleApplicationAnswerModal(interaction);
            } else if (interaction.customId.startsWith('save_temp_modal:') || interaction.customId.startsWith('edit_temp_modal:')) {
                const { handleSaveTempModal } = require('./handlers/modalHandler');
                await handleSaveTempModal(interaction);
            } else {
                await handlePartiModal(interaction);
            }
        }
    } catch (error) {
        const guildSettings = await getGuildConfig(interaction.guildId);
        const lang = guildSettings?.language || 'tr';
        await handleInteractionError(interaction, error, lang);
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    try {
        const guildConfig = await getGuildConfig(member.guild.id);
        const autoRoleId = guildConfig?.auto_role_on_join_id;
        if (autoRoleId) {
            await member.roles.add(autoRoleId).catch(e => {
                console.error(`[AutoRole] Failed to add role to ${member.user.tag} in ${member.guild.name}:`, e.message);
            });
        }
    } catch (err) {
        console.error(`[GuildMemberAdd] Error for ${member.user.tag}:`, err);
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    await handleReactionAdd(reaction, user);
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    await handleReactionRemove(reaction, user);
});

client.on(Events.ChannelDelete, async (channel) => {
    try {
        if (!channel.guild) return;
        const { supabase } = require('@veyronix/database');
        
        // Kanalın pending bir kayıt bileti olup olmadığını kontrol et
        const { data, error } = await supabase
            .from('application_answers')
            .select('id, user_id')
            .eq('ticket_channel_id', channel.id)
            .eq('status', 'pending');
            
        if (data && data.length > 0) {
            // Eğer kanal silindiyse başvuruyu tamamen iptal et (sil)
            await supabase
                .from('application_answers')
                .delete()
                .eq('ticket_channel_id', channel.id)
                .eq('status', 'pending');
                
            console.log(`[Registration] Pending ticket channel deleted for user ${data[0].user_id}. Registration cancelled.`);
        }
    } catch (err) {
        console.error(`[ChannelDelete] Error cancelling pending registration:`, err.message);
    }
});

// messageCreate — Drop v2:
//   1. percent_based mod: her mesajda % şansla drop düşür
//   2. Aktif drop kodu varsa: yazılan mesajı kodla karşılaştır
// NOT: MessageContent intent Discord Developer Portal'da da açık olmalı!
client.on(Events.MessageCreate, async (message) => {
    try {
        if (message.author?.bot || !message.guild) return;

        const { getDropSettings } = require('@veyronix/database');
        const { publishDrop, getActiveDrops } = require('./services/dropEngine');
        const { shouldTriggerPercentDrop } = require('./services/activityTracker');
        const { handleDropCodeMessage } = require('./handlers/dropHandler');

        // ── 1. Aktif drop kodu kontrolü (tüm modlarda çalışır) ──────────────────────────
        const activeDrops = getActiveDrops();
        const mapKey = `${message.guild.id}:${message.channel.id}`;
        if (activeDrops.has(mapKey)) {
            await handleDropCodeMessage(message);
        }

        // ── 2. percent_based mod tetikleme ────────────────────────────────────
        const settings = await getDropSettings(message.guild.id);
        if (!settings?.is_enabled) return;
        if (settings.schedule_type !== 'percent_based') return;

        // Bu kanal izleme listesinde mi?
        let channelIds = settings.channel_ids;
        if (typeof channelIds === 'string') {
            try { channelIds = JSON.parse(channelIds); } catch (e) { channelIds = []; }
        }
        if (!Array.isArray(channelIds)) channelIds = [];
        if (channelIds.length > 0 && !channelIds.includes(message.channel.id)) return;

        // Bu kanalda zaten aktif bir drop var mı? Çift drop önle
        if (activeDrops.has(mapKey)) return;

        const triggerDrop = shouldTriggerPercentDrop(message.guild.id, message.channel.id, settings);
        if (!triggerDrop) return;

        const guildConfig = await getGuildConfig(message.guild.id);
        const lang = guildConfig?.language || 'tr';

        await publishDrop(client, settings, message.channel.id, 'percent_roll', lang);
    } catch (err) {
        console.error('[DropTracker] messageCreate error:', err.message);
    }
});

// Start the bot
startBot();
