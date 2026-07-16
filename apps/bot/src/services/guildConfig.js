const db = require('./db');
const { getSupabaseGuildSettings, updateGuildLanguage, updateSupabaseGuildSettings } = require('@veyronix/database');

/**
 * Gets configuration for a specific guild
 */
async function getGuildConfig(guildId) {
    let row = null;
    try {
        row = await db.get('SELECT * FROM guild_configs WHERE guild_id = ?', [guildId]);
        let configResult = row || {};
        
        const sbSettings = await getSupabaseGuildSettings(guildId);
        if (sbSettings) {
            // Merge SB settings into local config
            configResult = { ...configResult, ...sbSettings };
        }

        return Object.keys(configResult).length > 0 ? configResult : null;

    } catch (error) {
        console.error(`[GuildConfig] CRITICAL ERROR fetching for ${guildId}:`, error);
        // Fallback to local row even if Supabase fails
        return row || null;
    }
}

/**
 * Updates or sets configuration for a guild
 */
async function updateGuildConfig(guildId, data) {
    const { 
        guild_name, 
        albion_guild_id, 
        albion_guild_name,
        albion_server,
        log_channel_id, 
        objective_channel_id, 
        objective_notify_channel_id, 
        killboard_channel_id,
        killboard_time,
        language, 
        welcome_message,
        embed_thumbnail_url 
    } = data;

    try {
        // 1. Update Supabase (Source of truth for dashboard)
        // Language is handled separately via updateGuildLanguage which correctly
        // does UPDATE if row exists, INSERT with owner_id if it doesn't.
        if (language) {
            await updateGuildLanguage(guildId, language);
        }

        // Other settings go through the generic upsert (row should already exist)
        const sbData = {};
        if (albion_guild_id) sbData.albion_guild_id = albion_guild_id;
        if (albion_guild_name) sbData.albion_guild_name = albion_guild_name;
        if (albion_server) sbData.albion_server = albion_server;
        if (killboard_channel_id) sbData.killboard_channel_id = killboard_channel_id;
        if (killboard_time) sbData.killboard_time = killboard_time;
        if (log_channel_id) sbData.log_channel_id = log_channel_id;
        if (embed_thumbnail_url !== undefined) sbData.embed_thumbnail_url = embed_thumbnail_url;

        if (Object.keys(sbData).length > 0) {
            await updateSupabaseGuildSettings(guildId, sbData);
        }

        // 2. Update Local SQLite (For fast access by bot)
        await db.run(
            `INSERT INTO guild_configs (
                guild_id, guild_name, albion_guild_id, albion_guild_name, albion_server,
                log_channel_id, objective_channel_id, objective_notify_channel_id, 
                killboard_channel_id, killboard_time,
                language, welcome_message, embed_thumbnail_url, setup_completed, auto_delete_party_hours
            ) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?) 
             ON CONFLICT(guild_id) DO UPDATE SET 
                guild_name = COALESCE(excluded.guild_name, guild_name), 
                albion_guild_id = COALESCE(excluded.albion_guild_id, albion_guild_id), 
                albion_guild_name = COALESCE(excluded.albion_guild_name, albion_guild_name),
                albion_server = COALESCE(excluded.albion_server, albion_server),
                log_channel_id = COALESCE(excluded.log_channel_id, log_channel_id),
                objective_channel_id = COALESCE(excluded.objective_channel_id, objective_channel_id),
                objective_notify_channel_id = COALESCE(excluded.objective_notify_channel_id, objective_notify_channel_id),
                killboard_channel_id = COALESCE(excluded.killboard_channel_id, killboard_channel_id),
                killboard_time = COALESCE(excluded.killboard_time, killboard_time),
                language = COALESCE(excluded.language, language),
                welcome_message = COALESCE(excluded.welcome_message, welcome_message),
                embed_thumbnail_url = COALESCE(excluded.embed_thumbnail_url, embed_thumbnail_url),
                auto_delete_party_hours = COALESCE(excluded.auto_delete_party_hours, auto_delete_party_hours)`,
            [
                guildId, guild_name, albion_guild_id, albion_guild_name, albion_server || 'Europe',
                log_channel_id, objective_channel_id, objective_notify_channel_id, 
                killboard_channel_id, killboard_time || '06:00',
                language || 'tr', welcome_message || 'Selam, Hoşgeldiniz!',
                embed_thumbnail_url || null, data.auto_delete_party_hours || 0
            ]
        );
        return true;
    } catch (error) {
        console.error(`[GuildConfig] Error updating for ${guildId}:`, error);
        return false;
    }
}

module.exports = { getGuildConfig, updateGuildConfig };
