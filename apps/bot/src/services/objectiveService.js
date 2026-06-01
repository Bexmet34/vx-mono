const db = require('./db');
const { createObjectiveEmbed } = require('../builders/embedBuilder');
const { createClosedObjectiveButtons } = require('../builders/componentBuilder');
const { getNow } = require('../utils/timeUtils');

/**
 * Initializes the objective service polling
 * @param {import('discord.js').Client} client 
 */
function initObjectiveService(client) {
    console.log('[ObjectiveService] Polling started (checking every 10 seconds)...');
    
    setInterval(async () => {
        try {
            await checkReminders(client);
            await checkExpirations(client);
        } catch (error) {
            console.error('[ObjectiveService] Loop Error:', error);
        }
    }, 10000); // Every 10 seconds (reduced from 60s to minimize expiration delay)
}

/**
 * Checks for objectives that expire in <= 5 minutes and sends a reminder
 */
async function checkReminders(client) {
    const now = getNow();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    // Find active objectives where reminder not sent and expiring between now and 5 minutes from now
    // Lower bound (> now) prevents sending reminders for already-expired objectives
    const objectives = await db.all(
        'SELECT * FROM objectives WHERE status = ? AND reminder_sent = 0 AND expires_at > ? AND expires_at <= ?',
        ['active', now.toISOString(), fiveMinutesFromNow.toISOString()]
    );

    for (const obj of objectives) {
        try {
            const channel = await client.channels.fetch(obj.channel_id).catch(() => null);
            if (channel) {
                const message = await channel.messages.fetch(obj.message_id).catch(() => null);
                if (message) {
                    await message.reply({
                        content: `@everyone **${obj.event_name}** (${obj.map_name}) başlamasına 5 dakika kaldı!`
                    });
                }
            }
            
            // Mark as reminder sent
            await db.run('UPDATE objectives SET reminder_sent = 1 WHERE id = ?', [obj.id]);
            console.log(`[ObjectiveService] Reminder sent for objective ${obj.id}`);
        } catch (err) {
            console.error(`[ObjectiveService] Error sending reminder for ${obj.id}:`, err);
        }
    }
}

/**
 * Checks for expired objectives and updates their embeds/buttons
 */
async function checkExpirations(client) {
    const now = getNow();
    
    // Find active objectives that have expired
    const objectives = await db.all(
        'SELECT * FROM objectives WHERE status = ? AND expires_at <= ?',
        ['active', now.toISOString()]
    );

    for (const obj of objectives) {
        try {
            const channel = await client.channels.fetch(obj.channel_id).catch(() => null);
            if (channel) {
                const message = await channel.messages.fetch(obj.message_id).catch(() => null);
                if (message) {
                    const expiresAt = new Date(obj.expires_at);
                    const closedEmbed = createObjectiveEmbed(obj.map_name, obj.event_name, expiresAt.getTime(), true);
                    const closedButtons = createClosedObjectiveButtons();
                    
                    await message.edit({
                        embeds: [closedEmbed],
                        components: closedButtons
                    });
                }
            }
            
            // Mark as expired
            await db.run('UPDATE objectives SET status = ? WHERE id = ?', ['expired', obj.id]);
            console.log(`[ObjectiveService] Objective ${obj.id} marked as expired`);
        } catch (err) {
            console.error(`[ObjectiveService] Error expiring objective ${obj.id}:`, err);
        }
    }
}

module.exports = {
    initObjectiveService
};
