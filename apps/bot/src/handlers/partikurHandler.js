const { MessageFlags, ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { getActivePartyCount, setActiveParty } = require('../services/partyManager');
const { isWhitelisted } = require('../services/whitelistManager');
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

const { isSubscriptionActive, getSubscription } = require('@veyronix/database');
const { createPartikurEmbed, buildRolesFields, addFooterFields } = require('../builders/embedBuilder');
const { createCustomPartyComponents } = require('../builders/componentBuilder');
const db = require('../services/db');

/**
 * Custom Vote Checker (Local DB Cache + Top.gg)
 */
async function checkWeeklyVote(userId) {
    if (!topggApi) {
        console.warn(`[checkWeeklyVote] topggApi is null — blocking user ${userId} (no token configured)`);
        return false;
    }
    
    // 1. Get configured cooldown (default 168 hours = 7 days)
    let cooldownHours = 168;
    try {
        const setting = await db.get("SELECT value FROM system_settings WHERE key = 'vote_cooldown_hours'");
        if (setting && setting.value) {
            cooldownHours = parseInt(setting.value, 10);
            if (isNaN(cooldownHours) || cooldownHours < 0) cooldownHours = 168;
        }
    } catch (e) {
        console.error('[checkWeeklyVote] Error fetching cooldown', e.message);
    }

    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const now = Date.now();

    // 2. Check local DB cache
    try {
        const row = await db.get("SELECT last_vote_time FROM user_votes WHERE user_id = ?", [userId]);
        if (row && row.last_vote_time) {
            if (now - row.last_vote_time < cooldownMs) {
                return true; // Still valid locally
            }
        }
    } catch (e) {
        console.error('[checkWeeklyVote] Error checking user_votes', e.message);
    }

    // 3. Fallback to Top.gg API
    try {
        const hasVoted = await topggApi.hasVoted(userId);
        if (hasVoted) {
            // Update local cache
            await db.run("INSERT OR REPLACE INTO user_votes (user_id, last_vote_time) VALUES (?, ?)", [userId, now]);
            return true;
        }
    } catch (err) {
        if (err.message?.includes('404') || err.message?.includes('Not Found')) {
            console.error('[checkWeeklyVote] Top.gg 404 — TOPGG_TOKEN yanlış bota ait veya bot Top.gg\\'de bulunamadı.');
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
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const userId = interaction.user.id;
    const isOwner = userId === interaction.guild.ownerId;
    const isDeveloper = config.WHITELIST_USERS.includes(userId);

    // 0. Subscription & Vote Check
    const active = await isSubscriptionActive(interaction.guildId, interaction.guild.name, interaction.guild.ownerId);
    
    // Everyone must vote, EXCEPT developers or the OWNER of a premium (active) server.
    const needsVote = !(isDeveloper || (active && isOwner));

    if (needsVote) {
        let hasVoted = await checkWeeklyVote(userId);

        if (!hasVoted) {
            const voteEmbed = new EmbedBuilder()
                .setTitle(t('subscription.vote_required_title', lang))
                .setDescription(t('subscription.vote_required_desc', lang))
                .setColor('#5865F2')
                .setFooter({ text: 'Veyronix Party Master • Top.gg System' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(t('subscription.vote_button', lang))
                    .setURL(config.TOPGG_LINK || 'https://top.gg/bot/1082239904169336902')
                    .setStyle(ButtonStyle.Link)
            );

            return await interaction.reply({
                embeds: [voteEmbed],
                components: [row],
                flags: [MessageFlags.Ephemeral]
            });
        }
    }

    const whitelisted = isOwner || isDeveloper || await isWhitelisted(userId, interaction.guildId);

    const sub = await getSubscription(interaction.guildId, interaction.guild.name, interaction.guild.ownerId);
    const isUnlimited = sub && sub.is_unlimited;
    const hasUnlimitedParty = sub && sub.unlimited_party;

    const partyCount = getActivePartyCount(userId);
    let limit = 1;
    if (whitelisted) limit = 3;
    if ((isUnlimited || hasUnlimitedParty) && (isOwner || isDeveloper)) limit = 999;

    if (partyCount >= limit) {
        let errorMsg = whitelisted
            ? `❌ **${t('party.limit_reached', lang)}**\n\n${t('party.limit_desc_whitelisted', lang)}`
            : `❌ **${t('party.already_active', lang)}**\n\n${t('party.limit_desc_normal', lang)}`;

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

    await interaction.showModal(modal);
}

async function handleTempAutocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const guildConfig = await getGuildConfig(interaction.guildId);
    
    // 0. Subscription Check (optional but good idea, wait, discord doesn't need it on autocomplete, just return templates)
    const templatesStr = guildConfig?.party_templates;
    let templates = [];
    try {
        if (templatesStr) templates = typeof templatesStr === 'string' ? JSON.parse(templatesStr) : templatesStr;
    } catch(e) {}

    // Safe fallback if templates is not an array somehow
    if (!Array.isArray(templates)) templates = [];

    const choices = templates.map((t, index) => ({
        name: (t.name || t.header || `Template ${index + 1}`).substring(0, 100),
        value: index.toString()
    }));
    
    const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
    await interaction.respond(filtered);
}

async function handleTempCommand(interaction) {
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    const userId = interaction.user.id;
    const isOwner = userId === interaction.guild?.ownerId;
    const isDeveloper = config.WHITELIST_USERS?.includes(userId);

    // 0. Subscription & Vote Check
    const active = await isSubscriptionActive(interaction.guildId, interaction.guild.name, interaction.guild.ownerId);

    // Everyone must vote, EXCEPT developers or the OWNER of a premium (active) server.
    const needsVote = !(isDeveloper || (active && isOwner));

    if (needsVote) {
        let hasVoted = false;
        if (topggApi) {
            try {
                hasVoted = await topggApi.hasVoted(userId);
                console.log(`[PartikurHandler] Vote check for ${userId}: ${hasVoted}`);
            } catch (err) {
                if (err.message?.includes('404') || err.message?.includes('Not Found')) {
                    console.error('[PartikurHandler] Top.gg 404 — TOPGG_TOKEN yanlış bota ait veya bot Top.gg\'de bulunamadı.');
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
                    .setURL(config.TOPGG_LINK || 'https://top.gg/bot/1082239904169336902')
                    .setStyle(ButtonStyle.Link)
            );

            return await interaction.reply({
                embeds: [voteEmbed],
                components: [row],
                flags: [MessageFlags.Ephemeral]
            });
        }
    }

    // Check Limits
    const whitelisted = isOwner || isDeveloper || await isWhitelisted(userId, interaction.guildId);

    const sub = await getSubscription(interaction.guildId, interaction.guild.name, interaction.guild.ownerId);
    const isUnlimited = sub && sub.is_unlimited;
    const hasUnlimitedParty = sub && sub.unlimited_party;

    const partyCount = getActivePartyCount(userId);
    let limit = 1;
    if (whitelisted) limit = 3;
    if ((isUnlimited || hasUnlimitedParty) && (isOwner || isDeveloper)) limit = 999;

    if (partyCount >= limit) {
        let errorMsg = whitelisted
            ? `❌ **${t('party.limit_reached', lang)}**\n\n${t('party.limit_desc_whitelisted', lang)}`
            : `❌ **${t('party.already_active', lang)}**\n\n${t('party.limit_desc_normal', lang)}`;

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

    const templateIndex = interaction.options.getString('template');
    const template = getTemplateByIndex(guildConfig?.party_templates, templateIndex);
    
    if (!template) {
        return await interaction.reply({ content: '❌ Hata: Şablon bulunamadı!', flags: [MessageFlags.Ephemeral] });
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
        return await interaction.reply({ content: '❌ Bu şablonda hiç rol tanımlanmamış.', flags: [MessageFlags.Ephemeral] });
    }

    // Defer reply instead of replying immediately so we can create the party message and reference it if we want to confirm ephemeral, 
    // Wait, the regular /createparty responds an ephemeral wait then creates a real message. Actually /createparty opens modal, then modal completes.
    // Let's send the actual party into the channel directly, and reply ephemeral with success.
    await interaction.reply({ content: '⏳ Şablon yükleniyor ve parti oluşturuluyor...', flags: [MessageFlags.Ephemeral] });

    // Use shared creation logic
    const embed = createPartikurEmbed(header, rolesList, description, '', 0, interaction.guild, lang, userId, guildConfig?.embed_thumbnail_url);
    const rolesWithMembers = rolesList.map(role => ({ role, userId: null }));
    const components = createCustomPartyComponents(rolesList, userId, lang, rolesWithMembers);
    
    embed.addFields(...buildRolesFields(rolesWithMembers, lang, interaction.guild));

    const actualRoles = rolesList.filter(r => !r.startsWith('#HEADER:') && !r.startsWith('#'));
    addFooterFields(embed, 0, actualRoles.length, lang);

    const msg = await interaction.channel.send({ content: '@everyone', embeds: [embed], components: components });

    const msgId = msg?.id;
    const chanId = msg?.channelId || interaction.channelId;

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

module.exports = {
    handleCreatePartyCommand,
    handleTempCommand,
    handleTempAutocomplete
};
