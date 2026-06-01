const { searchGuild } = require('../services/albionApiService');

/**
 * Handles autocomplete interactions
 */
async function handleAutocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    
    if (interaction.commandName === 'setup-guild') {
        if (!focusedValue || focusedValue.length < 3) {
            return await interaction.respond([]);
        }

        try {
            const results = await searchGuild(focusedValue);
            // Limit results to 25 (Discord limit)
            const choices = results.slice(0, 25).map(g => ({
                name: `${g.Name} [${g.AllianceName || 'No Alliance'}]`,
                value: `${g.Id}|${g.Name}` // Send both ID and Name
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('[Autocomplete] Error:', error);
            await interaction.respond([]);
        }
    }
}

module.exports = { handleAutocomplete };
