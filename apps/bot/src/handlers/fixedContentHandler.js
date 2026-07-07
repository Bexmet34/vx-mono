const { handleCreatePartyCommand, handleTempCommand, handleMyTempsCommand } = require('./partikurHandler');
const { handleClosePartyCommand } = require('./commandHandler');

/**
 * Handles interactions from the fixed channel message buttons.
 * Since the user explicitly requested that these buttons act exactly like typing the slash command,
 * we just map them directly to the command handler functions.
 * 
 * The button interaction provides all necessary context (user, guildId, etc) just like a ChatInputCommand interaction.
 */
async function handleFixedContentButtons(interaction) {
    const customId = interaction.customId;

    try {
        if (customId === 'fc_createparty') {
            await handleCreatePartyCommand(interaction);
        } else if (customId === 'fc_closeparty') {
            await handleClosePartyCommand(interaction);
        } else if (customId === 'fc_temp' || customId === 'fc_temp_select') {
            await handleTempCommand(interaction);
        } else if (customId === 'fc_mytemps') {
            await handleMyTempsCommand(interaction);
        } else {
            console.warn(`[FixedContentHandler] Unknown customId: ${customId}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Unknown button action.', ephemeral: true });
            }
        }
    } catch (err) {
        console.error(`[FixedContentHandler] Error handling ${customId}:`, err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred while processing this button.', ephemeral: true });
        }
    }
}

module.exports = {
    handleFixedContentButtons
};
