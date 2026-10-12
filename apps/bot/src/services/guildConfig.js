const db = require('./db');
const { getSupabaseGuildSettings, updateGuildLanguage, updateSupabaseGuildSettings } = require('@veyronix/database');

const configCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika (Realtime ile senkronize)
const NEGATIVE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika (Ayarı olmayan sunucuların Supabase'i spamlamasını önler)

/**
 * Toplu olarak Realtime veya başlangıçta ayarları önbelleğe doldurur
 */
function setCachedGuildSettings(guildId, settings) {
    if (!guildId) return;
    configCache.set(guildId, {
        data: settings,
        timestamp: Date.now(),
        isNegative: !settings
    });
}

/**
 * Gets configuration for a specific guild with intelligent in-memory & negative caching
 * @param {string} guildId
 * @param {object} options
 * @param {boolean} [options.forceRefresh=false] - Önbelleği atlayıp veritabanından taze veri çeker
 */
async function getGuildConfig(guildId, options = {}) {
    if (!guildId) return null;

    if (!options.forceRefresh) {
        const cached = configCache.get(guildId);
        if (cached) {
            const ttl = cached.isNegative ? NEGATIVE_CACHE_TTL_MS : CACHE_TTL_MS;
            if (Date.now() - cached.timestamp < ttl) {
                return cached.data;
            }
        }
    }

    let row = null;
    try {
        row = await db.get('SELECT * FROM guild_configs WHERE guild_id = ?', [guildId]);
        let configResult = row || {};

        if (row && row.tempvoice_creators) {
            try {
                configResult.tempvoice_creators = typeof row.tempvoice_creators === 'string' 
                    ? JSON.parse(row.tempvoice_creators) 
                    : row.tempvoice_creators;
            } catch (e) {
                configResult.tempvoice_creators = [];
            }
        }

        // Supabase sorgusu
        let sbSettings = null;
        try {
            sbSettings = await getSupabaseGuildSettings(guildId);
        } catch (err) {
            sbSettings = null;
        }

        if (sbSettings) {
            configResult = { ...configResult, ...sbSettings };
            if (sbSettings.language) {
                configResult.language = sbSettings.language;
            }

            if (sbSettings.tempvoice_creators !== undefined) {
                const tvJson = typeof sbSettings.tempvoice_creators === 'string' 
                    ? sbSettings.tempvoice_creators 
                    : JSON.stringify(sbSettings.tempvoice_creators);
                db.run('UPDATE guild_configs SET tempvoice_creators = ? WHERE guild_id = ?', [tvJson, guildId]).catch(() => {});
            }

            // Sync ticket settings to SQLite so local cache remains fully up-to-date
            if (sbSettings.ticket_system_enabled !== undefined) {
                const optJson = typeof sbSettings.ticket_options === 'string'
                    ? sbSettings.ticket_options
                    : JSON.stringify(sbSettings.ticket_options || []);
                db.run(`
                    INSERT INTO guild_configs (
                        guild_id, ticket_system_enabled, ticket_category_id, ticket_channel_id,
                        ticket_staff_roles, ticket_options, ticket_limit, ticket_name_format
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(guild_id) DO UPDATE SET
                        ticket_system_enabled = excluded.ticket_system_enabled,
                        ticket_category_id = excluded.ticket_category_id,
                        ticket_channel_id = excluded.ticket_channel_id,
                        ticket_staff_roles = excluded.ticket_staff_roles,
                        ticket_options = excluded.ticket_options,
                        ticket_limit = excluded.ticket_limit,
                        ticket_name_format = excluded.ticket_name_format
                `, [
                    guildId,
                    sbSettings.ticket_system_enabled ? 1 : 0,
                    sbSettings.ticket_category_id || null,
                    sbSettings.ticket_channel_id || null,
                    sbSettings.ticket_staff_roles || null,
                    optJson,
                    sbSettings.ticket_limit !== undefined ? parseInt(sbSettings.ticket_limit, 10) || 1 : 1,
                    sbSettings.ticket_name_format || 'topic-username'
                ]).catch(() => {});
            }

            if (sbSettings.registration_name_format !== undefined) {
                db.run('UPDATE guild_configs SET registration_name_format = ? WHERE guild_id = ?', [sbSettings.registration_name_format, guildId]).catch(() => {});
            }

            if (sbSettings.log_events) {
                try {
                    const ev = typeof sbSettings.log_events === 'string' ? JSON.parse(sbSettings.log_events) : sbSettings.log_events;
                    if (ev && typeof ev.auto_delete_party_hours !== 'undefined') {
                        configResult.auto_delete_party_hours = ev.auto_delete_party_hours;
                    }
                } catch(e) {}
            }
        }

        const finalConfig = Object.keys(configResult).length > 0 ? configResult : null;

        if (finalConfig && finalConfig.language) {
            finalConfig.language = finalConfig.language.toString().toLowerCase().trim() === 'en' ? 'en' : 'tr';
        }

        // Hem bulunan sonucu hem de bulunamayan sunucuları hafızada tut
        configCache.set(guildId, { 
            data: finalConfig, 
            timestamp: Date.now(),
            isNegative: !finalConfig
        });

        return finalConfig;

    } catch (error) {
        console.error(`[GuildConfig] Error fetching for ${guildId}:`, error);
        return row || null;
    }
}

/**
 * Updates or sets configuration for a guild
 */
async function updateGuildConfig(guildId, data) {
    configCache.delete(guildId);
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
        if (language) {
            await updateGuildLanguage(guildId, language);
        }

        // Other settings go through the generic upsert
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

module.exports = { getGuildConfig, updateGuildConfig, configCache, setCachedGuildSettings };
