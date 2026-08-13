const { searchGuild } = require('../services/albionApiService');
const { getGuildConfig } = require('../services/guildConfig');

/**
 * Handles autocomplete interactions
 */
async function handleAutocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const focusedValue = focusedOption.value;

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
    } else if (interaction.commandName === 'rd') {
        try {
            const guildConfig = await getGuildConfig(interaction.guildId);
            const choices = [];

            if (interaction.guild && interaction.guild.roles.cache.size === 0) {
                await interaction.guild.roles.fetch().catch(() => {});
            }

            const roleDefs = [
                { id: guildConfig?.registration_given_role_id, value: '1', label: 'Lonca Üyesi (Rol 1)' },
                { id: guildConfig?.registration_given_role_id_2, value: '2', label: 'Topluluk/İttifak (Rol 2)' },
                { id: guildConfig?.registration_given_role_id_3, value: '3', label: 'Rol 3' },
                { id: guildConfig?.registration_given_role_id_4, value: '4', label: 'Rol 4' },
                { id: guildConfig?.registration_given_role_id_5, value: '5', label: 'Rol 5' },
                { id: guildConfig?.registration_unregistered_role_id, value: 'temp', label: 'Misafir (Geçici Rol)' }
            ];

            for (const item of roleDefs) {
                if (item.id) {
                    const role = interaction.guild?.roles.cache.get(item.id);
                    const displayName = role ? `${role.name} (${item.label})` : item.label;
                    choices.push({
                        name: displayName.substring(0, 100),
                        value: item.value
                    });
                }
            }

            // Fallback if no specific roles are configured in DB yet
            if (choices.length === 0) {
                for (const item of roleDefs) {
                    choices.push({
                        name: item.label,
                        value: item.value
                    });
                }
            }

            const query = typeof focusedValue === 'string' ? focusedValue.toLowerCase() : '';
            const filteredChoices = choices.filter(c => c.name.toLowerCase().includes(query));

            await interaction.respond(filteredChoices.slice(0, 25));
        } catch (error) {
            console.error('[Autocomplete RD] Error:', error);
            await interaction.respond([]);
        }
    }
}

module.exports = { handleAutocomplete };
