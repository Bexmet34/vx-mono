const db = require('../services/db');

/**
 * Handles reaction additions for objectives
 */
async function handleReactionAdd(reaction, user) {
    if (user.bot) return;

    // Ensure reaction is fetched if partial
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('[ReactionHandler] Fetch Error:', error);
            return;
        }
    }

    if (reaction.emoji.name === '💪') {
        const messageId = reaction.message.id;
        
        // Find objective by messageId
        const obj = await db.get('SELECT id FROM objectives WHERE message_id = ?', [messageId]);
        if (obj) {
            await db.run('INSERT OR IGNORE INTO objective_participants (objective_id, user_id) VALUES (?, ?)', [obj.id, user.id]);
            console.log(`[ReactionHandler] User ${user.tag} joined objective ${obj.id}`);
        }
    }
}

/**
 * Handles reaction removals for objectives
 */
async function handleReactionRemove(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) { return; }
    }

    if (reaction.emoji.name === '💪') {
        const messageId = reaction.message.id;
        
        const obj = await db.get('SELECT id FROM objectives WHERE message_id = ?', [messageId]);
        if (obj) {
            await db.run('DELETE FROM objective_participants WHERE objective_id = ? AND user_id = ?', [obj.id, user.id]);
            console.log(`[ReactionHandler] User ${user.tag} left objective ${obj.id}`);
        }
    }
}

module.exports = {
    handleReactionAdd,
    handleReactionRemove
};
