const fs = require('fs');
const path = require('path');
const { getClient } = require('@veyronix/database');

const QUEUE_FILE = path.join(__dirname, '../data/offline_queue.json');

/**
 * Ensures the data directory exists
 */
function ensureDataDir() {
    const dataDir = path.dirname(QUEUE_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

/**
 * Loads the queue from the JSON file safely
 */
function loadQueue() {
    if (fs.existsSync(QUEUE_FILE)) {
        try {
            const data = fs.readFileSync(QUEUE_FILE, 'utf8');
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('[QueueService] Error reading offline_queue.json:', e.message);
            return [];
        }
    }
    return [];
}

/**
 * Saves the queue back to the JSON file
 */
function saveQueue(queue) {
    try {
        ensureDataDir();
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf8');
    } catch (e) {
        console.error('[QueueService] Error saving offline_queue.json:', e.message);
    }
}

/**
 * Adds a failed operation to the queue to be retried later
 * @param {Object} target 
 * @param {string} target.table The table to modify (e.g., 'guild_settings')
 * @param {string} target.action The action to perform: 'update', 'insert', 'upsert'
 * @param {Object} target.payload The data payload
 * @param {Object} [target.match] The match criteria for updates (e.g., { id: '123' })
 * @param {string} [target.onConflict] The conflict column for upsert
 */
async function enqueueOperation(target) {
    const queue = loadQueue();
    queue.push({
        ...target,
        timestamp: Date.now(),
        retries: 0
    });
    saveQueue(queue);
    console.log(`[QueueService] Operation queued for table ${target.table} (Action: ${target.action}). Total in queue: ${queue.length}`);
}

let isProcessing = false;

/**
 * Processes the queue, trying to execute operations on Supabase
 */
async function processQueue() {
    if (isProcessing) return;
    const queue = loadQueue();
    if (queue.length === 0) return;

    isProcessing = true;
    const supabase = getClient();
    const newQueue = [];
    let successCount = 0;

    for (const item of queue) {
        // Drop items that have failed too many times to prevent infinite loops (e.g. 100 tries ~ 3+ hours)
        if (item.retries > 100) {
            console.error(`[QueueService] Dropping operation for ${item.table} after 100 failed retries.`);
            continue;
        }

        try {
            let res;
            if (item.action === 'update') {
                let query = supabase.from(item.table).update(item.payload);
                if (item.match) query = query.match(item.match);
                res = await query;
            } else if (item.action === 'insert') {
                res = await supabase.from(item.table).insert(item.payload);
            } else if (item.action === 'upsert') {
                res = await supabase.from(item.table).upsert(item.payload, { onConflict: item.onConflict || 'id' });
            }

            if (res && res.error) {
                // If it's a network error or fetch failure, put it back in queue
                if (res.error.message?.includes('fetch failed') || res.error.message?.includes('JSON') || res.error.message?.includes('525')) {
                    item.retries++;
                    newQueue.push(item);
                } else {
                    // Logic error (e.g. invalid column), drop it
                    console.error(`[QueueService] Database logic error, dropping operation for ${item.table}:`, res.error.message);
                }
            } else {
                successCount++;
            }
        } catch (err) {
            item.retries++;
            newQueue.push(item);
        }
    }

    if (successCount > 0) {
        console.log(`[QueueService] Successfully processed ${successCount} queued operations.`);
    }

    // Save only the items that failed with network errors
    if (newQueue.length !== queue.length || successCount > 0) {
        saveQueue(newQueue);
    }
    
    isProcessing = false;
}

module.exports = {
    enqueueOperation,
    processQueue
};
