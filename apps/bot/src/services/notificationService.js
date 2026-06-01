const { supabase } = require('@veyronix/database');
const { EmbedBuilder } = require('discord.js');

/**
 * Fetches a notification template from Supabase and parses placeholders.
 * @param {string} templateId - The ID of the template (e.g., 'welcome_trial')
 * @param {string} lang - Language code ('tr' or 'en')
 * @param {Object} placeholders - Key-value pairs for placeholders
 * @returns {Promise<{embeds: EmbedBuilder[], content: string|null}>}
 */
async function getNotification(templateId, lang = 'tr', placeholders = {}) {
    try {
        const { data: template, error } = await supabase
            .from('notification_templates')
            .select('*')
            .eq('id', templateId)
            .single();

        if (error || !template) {
            console.error(`[NotificationService] Template not found: ${templateId}`);
            return null;
        }

        let title = lang === 'en' ? template.title_en : template.title_tr;
        let content = lang === 'en' ? template.content_en : template.content_tr;

        // Parse placeholders
        Object.keys(placeholders).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            title = title?.replace(regex, placeholders[key]);
            content = content?.replace(regex, placeholders[key]);
        });

        if (template.is_embed) {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(content)
                .setColor(template.color || '#2ECC71')
                .setTimestamp();
            
            return { embeds: [embed], content: null };
        } else {
            return { embeds: [], content: content };
        }
    } catch (err) {
        console.error(`[NotificationService] Error:`, err.message);
        return null;
    }
}

module.exports = { getNotification };
