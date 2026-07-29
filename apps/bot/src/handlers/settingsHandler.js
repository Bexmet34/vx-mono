const { ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const { getGuildConfig, updateGuildConfig } = require('../services/guildConfig');
const { t } = require('../services/i18n');

/**
 * Handles language selection from the settings menu
 */
async function handleSettingsLanguageSelect(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'settings_lang_select') return;

    const lang = interaction.values[0];
    const success = await updateGuildConfig(interaction.guildId, { language: lang });

    if (success) {
        // Update the embed to show success
        const embed = new EmbedBuilder()
            .setTitle(t('settings.settings_title', lang) || (lang === 'tr' ? '⚙️ Bot Ayarları' : '⚙️ Bot Settings'))
            .setDescription(`✅ ${t('settings.success', lang)}`)
            .setColor(3447003)
            .addFields(
                { name: t('settings.lang_set', lang), value: lang === 'tr' ? '🇹🇷 Türkçe' : '🇺🇸 English', inline: true }
            );

        await interaction.update({
            embeds: [embed],
            components: []
        });
    } else {
        await interaction.reply({ content: `❌ ${t('settings.error_saving', lang)}`, flags: [MessageFlags.Ephemeral] });
    }

}

module.exports = {
    handleSettingsLanguageSelect
};
