const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'apps', 'bot', 'data', 'database.sqlite');
const db = new Database(DB_PATH);

const guildId = '1181199769973047356';
const rows = db.prepare('SELECT * FROM guild_registrations WHERE guild_id = ?').all(guildId);

console.log(`\n--- Kayıtlı Kişiler (${rows.length} kişi) ---`);
rows.forEach(row => {
    console.log(`Kullanıcı ID: ${row.user_id} | Albion: ${row.albion_ign} (${row.albion_id}) | Kayıt Tarihi: ${row.created_at}`);
});
