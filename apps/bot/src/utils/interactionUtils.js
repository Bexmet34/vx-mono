const { MessageFlags, AttachmentBuilder } = require('discord.js');
const { LOGO_PATH, LOGO_NAME } = require('../constants/constants');

/**
 * Safely replies to an interaction and returns the message object when possible.
 * Guarantees that ephemeral messages are NEVER duplicated or leaked to channel.send fallback.
 */
async function safeReply(interaction, payload) {
    // Automatically add logo file ONLY if at least one embed uses it as a thumbnail
    if (payload.embeds && payload.embeds.length > 0) {
        const usesLogo = payload.embeds.some(embed => {
            const thumbnail = (embed.data && embed.data.thumbnail) || (typeof embed.thumbnail === 'object' ? embed.thumbnail : null);
            return thumbnail && thumbnail.url === `attachment://${LOGO_NAME}`;
        });

        if (usesLogo) {
            if (!payload.files) payload.files = [];
            if (!payload.files.some(f => f.name === LOGO_NAME || (typeof f === 'string' && f.includes(LOGO_NAME)))) {
                payload.files.push(new AttachmentBuilder(LOGO_PATH, { name: LOGO_NAME }));
            }
        }
    }

    const isEphemeral = Boolean(
        payload.ephemeral ||
        (Array.isArray(payload.flags) && payload.flags.includes(MessageFlags.Ephemeral)) ||
        payload.flags === MessageFlags.Ephemeral
    );

    const options = {
        ...payload,
        allowedMentions: { parse: ['everyone', 'roles', 'users'] }
    };

    let replySent = false;

    try {
        // 1. Send the response
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ ...options });
        } else {
            await interaction.reply({ ...options });
        }

        replySent = true;

        // Ephemeral messages cannot and should not be fetched as public message objects
        if (isEphemeral) {
            return null;
        }

        // For public messages, fetch the actual Message object
        return await interaction.fetchReply().catch(() => null);

    } catch (error) {
        // If the reply was already sent successfully or acknowledged, do nothing
        if (replySent || interaction.replied || interaction.deferred) {
            return null;
        }

        // If the interaction is already dead/acknowledged, ignore
        if (error.code === 10062 || error.code === 40060 || error.message?.includes('already acknowledged')) {
            return null;
        }

        // Fallback: ONLY for non-ephemeral messages when interaction completely failed before acknowledging
        if (!isEphemeral && interaction.channel) {
            try {
                const legacyMsg = await interaction.channel.send(options);
                return legacyMsg;
            } catch (sendError) {
                console.error('[SafeReply] Channel send fallback failed:', sendError.message);
            }
        }

        throw error;
    }
}


const { t } = require('../services/i18n');

/**
 * Handles interaction errors - Suppresses transient SSL warnings
 */
async function handleInteractionError(interaction, error, lang = 'tr') {
    const isSslError = error.code === 'ERR_SSL_INVALID_SESSION_ID' ||
        error.message?.includes('SSL') ||
        error.message?.includes('session id') ||
        error.message?.includes('fetch failed') ||
        error.message?.includes('JSON') ||
        error.message?.includes('525');

    const errorCode = error.code ?? error.errors?.[0]?.code;

    const isUnknownInteraction = error.message?.includes('Unknown interaction') ||
        error.message?.includes('already been acknowledged') ||
        error.message?.includes('Interaction has already been');

    const isIgnorable = isSslError ||
        errorCode === 10062 ||
        errorCode === 40060 ||
        errorCode === 'InteractionAlreadyReplied' ||
        isUnknownInteraction;

    if (isIgnorable) {
        return;
    }

    console.error(`[InteractionError] Real Error: ${error.message} (Code: ${errorCode ?? 'unknown'})`);

    let errorMessage = error.message || t('common.error', lang);
    if (errorCode === 50013) {
        errorMessage = lang === 'en' ? 'Bot lack permissions for this action.' : 'Botun bu işlemi yapmak için yetkisi yok (Yetki Hatası).';
    }

    const responseContent = `❌ **${t('party.error', lang) || t('common.error', lang)}**\n` +
        `**Summary:** ${errorMessage}\n\n` +
        `**✅ Solution:** Check bot permissions for **'Send Messages'**, **'Embed Links'**, and **'Mention @everyone'**.`;

    try {
        const errorOptions = { content: responseContent, flags: [MessageFlags.Ephemeral] };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorOptions).catch(() => { });
        } else {
            await interaction.reply(errorOptions).catch(() => { });
        }
    } catch (err) { }
}


module.exports = {
    safeReply,
    handleInteractionError
};
