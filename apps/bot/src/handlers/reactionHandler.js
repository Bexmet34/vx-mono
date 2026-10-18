const db = require('../services/db');

/**
 * Handles reaction additions for objectives
 */
async function handleReactionAdd(reaction, user) {
    if (user?.bot) return;

    // Fast-path: Only handle '💪' reactions for Albion objectives
    if (reaction.emoji?.name !== '💪') return;

    const messageId = reaction.message?.id;
    if (!messageId) return;

    try {
        // Find objective by messageId in local SQLite
        const obj = await db.get('SELECT id FROM objectives WHERE message_id = ?', [messageId]);
        if (obj) {
            await db.run('INSERT OR IGNORE INTO objective_participants (objective_id, user_id) VALUES (?, ?)', [obj.id, user.id]);
            console.log(`[ReactionHandler] User ${user.tag || user.id} joined objective ${obj.id}`);
        }
    } catch (err) {
        console.error('[ReactionHandler] Error handling reaction add:', err.message);
    }
}

/**
 * Handles reaction removals for objectives
 */
async function handleReactionRemove(reaction, user) {
    if (user?.bot) return;

    // Fast-path: Only handle '💪' reactions for Albion objectives
    if (reaction.emoji?.name !== '💪') return;

    const messageId = reaction.message?.id;
    if (!messageId) return;

    try {
        const obj = await db.get('SELECT id FROM objectives WHERE message_id = ?', [messageId]);
        if (obj) {
            await db.run('DELETE FROM objective_participants WHERE objective_id = ? AND user_id = ?', [obj.id, user.id]);
            console.log(`[ReactionHandler] User ${user.tag || user.id} left objective ${obj.id}`);
        }
    } catch (err) {
        console.error('[ReactionHandler] Error handling reaction remove:', err.message);
    }
}

module.exports = {
    handleReactionAdd,
    handleReactionRemove
};

