const { MessageFlags, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');
const { getActivePartyCount, setActiveParty } = require('../services/partyManager');
const { getGuildConfig } = require('../services/guildConfig');
const { t } = require('../services/i18n');
const config = require('../config/config');
const { Api } = require('@top-gg/sdk');

let topggApi = null;
if (config.TOPGG_TOKEN) {
    topggApi = new Api(config.TOPGG_TOKEN);
    console.log('[PartikurHandler] Top.gg API initialized. Token prefix:', config.TOPGG_TOKEN.substring(0, 20) + '...');
} else {
    console.warn('[PartikurHandler] WARNING: TOPGG_TOKEN is missing! Vote checks will BLOCK all users.');
}

const { isSubscriptionActive, getSubscription, supabase, isUserPremium, getUserTemplates, getUserTemplateById } = require('@veyronix/database');
const { createPartikurEmbed, buildRolesFields, addFooterFields } = require('../builders/embedBuilder');
const { createCustomPartyComponents } = require('../builders/componentBuilder');
const db = require('../services/db');

/**
 * Custom Vote Checker (Supabase Cache + Top.gg)
 */
async function checkWeeklyVote(userId) {
    if (!topggApi) {
        console.warn(`[checkWeeklyVote] topggApi is null — blocking user ${userId} (no token configured)`);
        return false;
    }
    
    // 1. Get configured cooldown (default 168 hours = 7 days)
    let cooldownHours = 168;
    try {
        const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'vote_cooldown_hours').single();
        if (setting && setting.value) {
            cooldownHours = parseInt(setting.value, 10);
            if (isNaN(cooldownHours) || cooldownHours < 0) cooldownHours = 168;
        }
    } catch (e) {
        console.error('[checkWeeklyVote] Error fetching cooldown', e.message);
    }

    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const now = Date.now();

    // 2. Check Supabase DB cache
    try {
        const { data: row } = await supabase.from('user_votes').select('expires_at, last_vote_time').eq('user_id', userId).single();
        if (row) {
            // Check new expires_at system
            if (row.expires_at && now < row.expires_at) {
                return true;
            }
            // Fallback to legacy system for backwards compatibility
            if (!row.expires_at && row.last_vote_time && (now - row.last_vote_time < cooldownMs)) {
                return true;
            }
        }
    } catch (e) {
        // If row doesn't exist, Supabase returns error. We ignore it.
    }

    // 3. Fallback to Top.gg API (if webhook missed it)
    try {
        const hasVoted = await topggApi.hasVoted(userId);
        if (hasVoted) {
            // Update Supabase cache: give them the default cooldown from right now
            const newExpiresAt = now + cooldownMs;
            await supabase.from('user_votes').upsert({
                user_id: userId,
                last_vote_time: now,
                expires_at: newExpiresAt
            }, { onConflict: 'user_id' });
            return true;
        }
    } catch (err) {
        if (err.message?.includes('404') || err.message?.includes('Not Found')) {
            console.warn("[checkWeeklyVote] Top.gg 404 — (Uyarı: Bot Top.gg'de onaylıysa .env içindeki TOPGG_TOKEN'i kontrol edin)");
        } else {
            console.error('[checkWeeklyVote] Top.gg API error:', err.message || err);
        }
    }

    return false;
}

/**
 * Handles /createparty command
 */
async function handleCreatePartyCommand(interaction) {
    const [guildConfig, userPremium] = await Promise.all([
        getGuildConfig(interaction.guildId).catch(() => null),
        isUserPremium(interaction.user.id).catch(() => false)
    ]);

    const lang = guildConfig?.language || 'tr';
    const userId = interaction.user.id;
    const isOwner = userId === interaction.guild.ownerId;
    const isDeveloper = config.WHITELIST_USERS.includes(userId);

    // Vote check is moved to Modal Submit (modalHandler) to prevent Discord 3-second timeout!

    
    const partyCount = getActivePartyCount(userId);
    let limit = 1;
    if (isOwner || isDeveloper || userPremium) limit = 999;

    if (partyCount >= limit) {
        let errorMsg = `❌ **${t('party.already_active', lang)}**\n\n${t('party.limit_desc_normal', lang)}`;

        return await interaction.reply({
            content: errorMsg,
            flags: [MessageFlags.Ephemeral]
        });
    }

    const modal = new ModalBuilder()
        .setCustomId(`parti_modal:genel`)
        .setTitle(t('party.create_party_title', lang));

    const headerInput = new TextInputBuilder()
        .setCustomId('party_header')
        .setLabel(t('party.party_header_label', lang))
        .setPlaceholder(t('party.party_header_placeholder', lang))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const rolesInput = new TextInputBuilder()
        .setCustomId('party_roles')
        .setLabel(t('party.party_roles_label', lang))
        .setPlaceholder(t('party.party_roles_placeholder', lang))
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const descriptionInput = new TextInputBuilder()
        .setCustomId('party_description')
        .setLabel(t('party.party_desc_label', lang))
        .setPlaceholder(t('party.party_desc_placeholder', lang))
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(headerInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(rolesInput)
    );

    try {
        await interaction.showModal(modal);
    } catch (err) {
        console.error(`[PartikurHandler] Failed to show modal (Interaction expired): ${err.message}`);
    }
}

async function handleTempAutocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const guildConfig = await getGuildConfig(interaction.guildId);
    const userId = interaction.user.id;
    const lang = guildConfig?.language || 'tr';

    let userTemplates = [];
    try {
        userTemplates = await getUserTemplates(userId);
    } catch(e) {}

    const templatesStr = guildConfig?.party_templates;
    let serverTemplates = [];
    try {
        if (templatesStr) serverTemplates = typeof templatesStr === 'string' ? JSON.parse(templatesStr) : templatesStr;
    } catch(e) {}

    if (!Array.isArray(serverTemplates)) serverTemplates = [];

    const choices = [];

    userTemplates.forEach(t => {
        choices.push({
            name: `👤 ${t.template_name}`.substring(0, 100),
            value: `user:${t.id}`
        });
    });

    if (serverTemplates.length > 0) {
        choices.push({
            name: lang === 'tr' ? '--- Sunucu Şablonları ---' : '--- Server Templates ---',
            value: 'separator'
        });
    }

    serverTemplates.forEach((t, index) => {
        choices.push({
            name: `🌐 ${(t.name || t.header || `Template ${index + 1}`)}`.substring(0, 100),
            value: `guild:${index}`
        });
    });
    
    const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
    await interaction.respond(filtered);
}

async function handleTempCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const userId = interaction.user.id;
    const isOwner = userId === interaction.guild?.ownerId;
    const isDeveloper = config.WHITELIST_USERS?.includes(userId);

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    // 0. Subscription & Vote Check
    const userPremium = await isUserPremium(userId);

    // Everyone must vote, EXCEPT developers or global premium users.
    const needsVote = !(isDeveloper || userPremium);

    if (needsVote) {
        let hasVoted = false;
        if (topggApi) {
            try {
                hasVoted = await topggApi.hasVoted(userId);
                console.log(`[PartikurHandler] Vote check for ${userId}: ${hasVoted}`);
            } catch (err) {
                if (err.message?.includes('404') || err.message?.includes('Not Found')) {
                    console.warn('[PartikurHandler] Top.gg 404 — (Uyarı: Bot Top.gg\'de onaylıysa .env içindeki TOPGG_TOKEN\'i kontrol edin)');
                } else {
                    console.error('[PartikurHandler] Top.gg API error:', err.message || err);
                }
                hasVoted = false;
            }
        } else {
            console.warn(`[PartikurHandler] topggApi is null — blocking user ${userId} (no token configured)`);
        }

        if (!hasVoted) {
            const voteEmbed = new EmbedBuilder()
                .setTitle(t('subscription.vote_required_title', lang))
                .setDescription(t('subscription.vote_required_desc', lang))
                .setColor('#5865F2')
                .setFooter({ text: 'Veyronix Party Master • Top.gg System' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(t('subscription.vote_button', lang))
                    .setURL(config.TOPGG_LINK || 'https://top.gg/bot/816241059941646336')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel(lang === 'tr' ? 'Satın Al / Web Sitesi' : 'Buy Premium / Website')
                    .setURL(config.WEBSITE_LINK || 'https://veyronix.com.tr')
                    .setStyle(ButtonStyle.Link)
            );

            return await interaction.editReply({
                embeds: [voteEmbed],
                components: [row]
            });
        }
    }

    const partyCount = getActivePartyCount(userId);
    let limit = 1;
    if (isOwner || isDeveloper || userPremium) limit = 999;

    if (partyCount >= limit) {
        let errorMsg = `❌ **${t('party.already_active', lang)}**\n\n${t('party.limit_desc_normal', lang)}`;

        return await interaction.reply({
            content: errorMsg,
            flags: [MessageFlags.Ephemeral]
        });
    }

function getTemplateByIndex(templatesStr, indexStr) {
    try {
        let templates = typeof templatesStr === 'string' ? JSON.parse(templatesStr) : templatesStr;
        const i = parseInt(indexStr, 10);
        return templates[i];
    } catch(e) {
        return null;
    }
}

    let templateValue = null;

    if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
        templateValue = interaction.options.getString('template');
    } else if (interaction.isStringSelectMenu && interaction.isStringSelectMenu()) {
        templateValue = interaction.values[0];
        await interaction.update({ content: '⏳ Şablon yükleniyor ve parti oluşturuluyor...', components: [] }).catch(()=>{});
    } else if (interaction.isButton && interaction.isButton()) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(()=>{});
        
        const { getUserTemplates } = require('@veyronix/database');
        const userTemplates = await getUserTemplates(userId) || [];
        const guildTemplates = guildConfig?.party_templates || [];

        if (userTemplates.length === 0 && guildTemplates.length === 0) {
            return await interaction.editReply({
                content: lang === 'tr' ? '❌ Hiç şablon bulunamadı.' : '❌ No templates found.'
            });
        }

        const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('fc_temp_select')
            .setPlaceholder(lang === 'tr' ? 'Oluşturmak istediğiniz şablonu seçin...' : 'Select a template to create...');

        if (userTemplates.length > 0) {
            userTemplates.slice(0, 12).forEach(t => {
                selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel(`👤 ${t.template_name || t.party_header || 'Şablon'}`.substring(0, 100))
                    .setValue(`user:${t.id}`)
                    .setDescription((t.party_header || 'Kişisel Şablon').substring(0, 100))
                );
            });
        }

        if (guildTemplates.length > 0) {
            if (userTemplates.length > 0) {
                selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel(lang === 'tr' ? '--- Sunucu Şablonları ---' : '--- Server Templates ---')
                    .setValue('separator')
                );
            }
            guildTemplates.slice(0, 12).forEach((t, i) => {
                selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel(`🌐 ${t.name || t.header || 'Şablon'}`.substring(0, 100))
                    .setValue(`guild:${i}`)
                    .setDescription((t.description || t.header || 'Sunucu Şablonu').substring(0, 100))
                );
            });
        }

        const row = new ActionRowBuilder().addComponents(selectMenu);
        return await interaction.editReply({
            content: `**${lang === 'tr' ? 'Şablon Seçimi' : 'Select Template'}**\n${lang === 'tr' ? 'Aşağıdaki listeden bir şablon seçerek partiyi oluşturun:' : 'Select a template below to create the party:'}`,
            components: [row]
        });
    }

    if (!templateValue || templateValue === 'separator') {
        const msg = '❌ Lütfen geçerli bir şablon seçin.';
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply({ content: msg }).catch(()=>{});
        } else {
            return await interaction.reply({ content: msg, flags: [MessageFlags.Ephemeral] }).catch(()=>{});
        }
    }

    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] }).catch(()=>{});
    }

    let template = null;

    if (templateValue.startsWith('user:')) {
        const templateId = templateValue.split(':')[1];
        const userTemplate = await getUserTemplateById(templateId, userId);
        if (userTemplate) {
            template = {
                header: userTemplate.party_header,
                description: userTemplate.party_description,
                rolesRaw: userTemplate.party_roles
            };
        }
    } else if (templateValue.startsWith('guild:')) {
        const indexStr = templateValue.split(':')[1];
        template = getTemplateByIndex(guildConfig?.party_templates, indexStr);
    } else {
        template = getTemplateByIndex(guildConfig?.party_templates, templateValue);
    }
    
    if (!template) {
        return await interaction.editReply({ content: '❌ Hata: Şablon bulunamadı!' });
    }

    const header = template.header || template.name || 'Parti';
    let rolesRaw = template.roles || template.rolesRaw || '';
    if (Array.isArray(template.roles)) {
        rolesRaw = template.roles.join('\n');
    }
    
    // Support new template format from Dashboard
    if (Array.isArray(template.required_roles) || Array.isArray(template.optional_roles)) {
        let allRoles = [];
        if (Array.isArray(template.required_roles)) allRoles.push(...template.required_roles);
        if (Array.isArray(template.optional_roles)) allRoles.push(...template.optional_roles);
        if (allRoles.length > 0) {
            rolesRaw = allRoles.join('\n');
        }
    }

    const description = template.description || '';

    const rolesList = rolesRaw.split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

    if (rolesList.length === 0) {
        return await interaction.editReply({ content: '❌ Bu şablonda hiç rol tanımlanmamış.' });
    }

    await interaction.editReply({ content: '⏳ Şablon yükleniyor ve parti oluşturuluyor...' });

    // Use shared creation logic
    const embed = createPartikurEmbed(header, rolesList, description, '', 0, interaction.guild, lang, userId, guildConfig?.embed_thumbnail_url);
    const rolesWithMembers = rolesList.map(role => ({ role, userId: null }));
    const components = createCustomPartyComponents(rolesList, userId, lang, rolesWithMembers);
    
    embed.addFields(...buildRolesFields(rolesWithMembers, lang, interaction.guild));

    const actualRoles = rolesList.filter(r => !r.startsWith('#HEADER:') && !r.startsWith('#'));
    addFooterFields(embed, 0, actualRoles.length, lang);

    let targetChannel = interaction.channel;
    if (guildConfig?.system_mode === 'fixed_channel' && guildConfig?.target_category_id) {
        try {
            let channelName = 'content';
            let rawName = (interaction.member?.nickname || interaction.member?.displayName || interaction.user.globalName || interaction.user.username);
            let extractedName = rawName.replace(/^[\[\(].*?[\]\)]\s*/, '');
            extractedName = extractedName.split(/[-|/]/)[0].trim();
            if (!extractedName) extractedName = rawName;
            
            const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
            extractedName = extractedName.replace(/[çğıöşüÇĞİÖŞÜ]/g, m => trMap[m]);
            const userName = extractedName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() || 'user';
            let safeHeader = header.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ ]/g, '').replace(/\s+/g, '-').toLowerCase() || 'content';
            if (safeHeader.length > 15) {
                safeHeader = safeHeader.substring(0, 15).replace(/-+$/, '');
            }
            const format = guildConfig.channel_name_format || 'name_title';

            if (format === 'name_title') channelName = `${userName}-${safeHeader}`;
            else if (format === 'title_only') channelName = safeHeader;
            else if (format === 'title_name') channelName = `${safeHeader}-${userName}`;
            else if (format === 'type_title') channelName = `party-${safeHeader}`;

            targetChannel = await interaction.guild.channels.create({
                name: channelName.substring(0, 100),
                type: ChannelType.GuildText,
                parent: guildConfig.target_category_id,
            });
        } catch (err) {
            console.error('[PartikurHandler] Error creating fixed channel:', err);
            targetChannel = interaction.channel;
        }
    }

    const msg = await targetChannel.send({ content: '@everyone', embeds: [embed], components: components });

    const msgId = msg?.id;
    const chanId = msg?.channelId || targetChannel.id;

    if (msgId) {
        setActiveParty(userId, msgId, chanId);

        try {
            const result = await db.run(
                'INSERT INTO parties (message_id, channel_id, owner_id, type, title, party_time) VALUES (?, ?, ?, ?, ?, ?)',
                [msgId, chanId, userId, 'genel', header, null]
            );
            const partyDbId = result.lastInsertRowid;

            for (const role of rolesList) {
                await db.run(
                    'INSERT INTO party_members (party_id, user_id, role, status) VALUES (?, ?, ?, ?)',
                    [partyDbId, null, role, 'joined']
                );
            }
        } catch (err) {
            console.error('[PartikurHandler] DB Error:', err.message);
        }
        
        await interaction.editReply({ content: '✅ Başarıyla oluşturuldu!' }).catch(()=>{});
    } else {
         await interaction.editReply({ content: '❌ Parti oluşturulamadı (Mesaj gönderilemedi)!' }).catch(()=>{});
    }
}

async function handleMyTempsCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const userId = interaction.user.id;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const templates = await getUserTemplates(userId);

    if (!templates || templates.length === 0) {
        return await interaction.editReply({
            content: lang === 'tr' 
                ? 'ℹ️ **Henüz kayıtlı bireysel şablonunuz yok.**\n\n📌 Şablon kaydetmek için:\n1. `/createparty` komutu ile yeni bir parti oluşturun\n2. Embedin altındaki **⚙️ Ayarlar** butonuna tıklayın\n3. Açılan panelde **💾 Şablonu Kaydet** butonuna basın'
                : 'ℹ️ **You have no saved personal templates.**\n\n📌 To save a template:\n1. Create a new party using the `/createparty` command\n2. Click the **⚙️ Settings** button under the embed\n3. Click the **💾 Save Template** button in the panel'
        });
    }

    const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('mytemps_select')
        .setPlaceholder(lang === 'tr' ? 'Şablon Seçin' : 'Select a Template')
        .addOptions(
            templates.map(t => new StringSelectMenuOptionBuilder()
                .setLabel(t.template_name)
                .setValue(t.id)
                .setDescription(t.party_header.substring(0, 100))
                .setEmoji('📝')
            )
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
        content: `**${lang === 'tr' ? 'Bireysel Şablon Yönetimi' : 'Personal Template Management'}**\n${lang === 'tr' ? 'Silmek veya düzenlemek istediğiniz şablonu seçin:' : 'Select the template you want to delete or edit:'}`,
        components: [row]
    });
}

module.exports = {
    handleCreatePartyCommand,
    handleTempCommand,
    handleTempAutocomplete,
    handleMyTempsCommand,
    checkWeeklyVote,
    topggApi
};
