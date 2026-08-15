const { supabase } = require('@veyronix/database');
const { publishDrop } = require('./dropEngine');
const { getGuildConfig } = require('./guildConfig');

/**
 * Parses channel_ids safely
 */
function getChannelIds(settings) {
    let ids = settings.channel_ids;
    if (typeof ids === 'string') {
        try { ids = JSON.parse(ids); } catch (e) { ids = []; }
    }
    return Array.isArray(ids) ? ids : [];
}

/**
 * Called every minute by cronService to process time-based drops
 */
async function processTimeBasedDrops(client) {
    try {
        const { data: allSettings, error } = await supabase
            .from('drop_settings')
            .select('*')
            .eq('is_enabled', true);

        if (error) {
            console.error('[DropScheduler] DB Error:', error);
            return;
        }

        if (!allSettings || allSettings.length === 0) return;

        const now = new Date();
        const currentMinute = now.getMinutes();

        for (const settings of allSettings) {
            try {
                // If bot is not in the guild, skip
                if (!client.guilds.cache.has(settings.guild_id)) continue;

                let shouldDrop = false;
                const scheduleType = settings.schedule_type || 'exact_minutes';

                if (scheduleType === 'exact_minutes') {
                    // Check if current minute is in the exact_minutes array
                    let exactMins = settings.exact_minutes;
                    if (typeof exactMins === 'string') {
                        try { exactMins = JSON.parse(exactMins); } catch (e) { exactMins = []; }
                    }
                    if (Array.isArray(exactMins) && exactMins.includes(currentMinute)) {
                        shouldDrop = true;
                    }

                } else if (scheduleType === 'hourly_chance') {
                    // Roll once per hour exactly at minute 0
                    if (currentMinute === 0) {
                        const chance = settings.hourly_chance_pct || 25;
                        const roll = Math.random() * 100;
                        if (roll < chance) {
                            shouldDrop = true;
                        }
                    }

                } else if (scheduleType === 'random_interval') {
                    // Check if next_random_drop_at has passed
                    const nextDropAt = settings.next_random_drop_at ? new Date(settings.next_random_drop_at) : null;
                    
                    if (!nextDropAt || now >= nextDropAt) {
                        shouldDrop = true;

                        // Calculate and save the next drop time
                        const min = settings.random_interval_min || 30;
                        const max = settings.random_interval_max || 120;
                        const range = Math.max(0, max - min);
                        const randomMinutes = min + Math.floor(Math.random() * range);
                        
                        const newNextDrop = new Date(now.getTime() + randomMinutes * 60000);
                        
                        // Async update without waiting, to not block the loop
                        supabase.from('drop_settings')
                            .update({ next_random_drop_at: newNextDrop.toISOString() })
                            .eq('guild_id', settings.guild_id)
                            .then(({error}) => {
                                if(error) console.error('[DropScheduler] Error updating next_random_drop_at:', error);
                            });
                    }
                }

                // If scheduled to drop, send to all configured channels (or just pick random? Usually drops are sent to all target channels)
                if (shouldDrop) {
                    const channelIds = getChannelIds(settings);
                    if (channelIds.length === 0) continue;

                    const guildConfig = await getGuildConfig(settings.guild_id);
                    const lang = guildConfig?.language || 'tr';

                    for (const channelId of channelIds) {
                        // We use triggerType = 'burst' visually for scheduled drops since it fits well, 
                        // or we can add a new visual type. For now, burst messages are generic enough.
                        await publishDrop(client, settings, channelId, 'burst', lang);
                    }
                }
            } catch (innerErr) {
                console.error(`[DropScheduler] Error processing guild ${settings.guild_id}:`, innerErr);
            }
        }
    } catch (err) {
        console.error('[DropScheduler] Fatal error:', err);
    }
}

module.exports = {
    processTimeBasedDrops
};
