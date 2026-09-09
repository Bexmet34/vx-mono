const Database = require('better-sqlite3');
const path = require('path');
const { supabase, updateSupabaseGuildSettings } = require('@veyronix/database');

const DB_PATH = path.join(__dirname, '..', 'src', 'data', 'database.sqlite');

async function syncCounts() {
    try {
        console.log(`Connecting to SQLite: ${DB_PATH}`);
        const db = new Database(DB_PATH, { readonly: true });
        
        const rows = db.prepare(`SELECT guild_id, COUNT(*) as count FROM guild_registrations GROUP BY guild_id`).all();
        console.log(`Found ${rows.length} guilds with registrations in local database.`);

        for (const row of rows) {
            console.log(`Updating guild ${row.guild_id} to ${row.count} registered members...`);
            await updateSupabaseGuildSettings(row.guild_id, { registered_count: row.count });
        }

        console.log('Sync completed successfully!');
    } catch (err) {
        console.error('Error during sync:', err);
    }
}

syncCounts();
