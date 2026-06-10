const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables
 */
function initDb() {
    return new Promise((resolve, reject) => {
        try {
            // Parties table
            db.exec(`CREATE TABLE IF NOT EXISTS parties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE,
                channel_id TEXT,
                owner_id TEXT,
                type TEXT, -- pve, pvp
                title TEXT,
                status TEXT DEFAULT 'active', -- active, closed, pending, verified
                party_time TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Party gear table to store full role details (used for ephemeral gear messages)
            db.exec(`CREATE TABLE IF NOT EXISTS party_gear (
                message_id TEXT PRIMARY KEY,
                gear_json TEXT
            )`);

            // Party members table (attendance)
            db.exec(`CREATE TABLE IF NOT EXISTS party_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                party_id INTEGER,
                user_id TEXT,
                role TEXT,
                status TEXT DEFAULT 'joined', -- joined, confirmed, no_show, cancelled
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(party_id) REFERENCES parties(id) ON DELETE CASCADE
            )`);

            // System settings for persistent configs
            db.exec(`CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )`);

            // Custom vote cache table for Top.gg
            db.exec(`CREATE TABLE IF NOT EXISTS user_votes (
                user_id TEXT PRIMARY KEY,
                last_vote_time INTEGER,
                expires_at INTEGER
            )`);

            // User stats for prestige
            db.exec(`CREATE TABLE IF NOT EXISTS user_stats (
                user_id TEXT PRIMARY KEY,
                confirmed_count INTEGER DEFAULT 0,
                no_show_count INTEGER DEFAULT 0,
                pve_confirmed INTEGER DEFAULT 0,
                pvp_confirmed INTEGER DEFAULT 0,
                total_participated INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.exec(`CREATE TABLE IF NOT EXISTS guild_configs (
                guild_id TEXT PRIMARY KEY,
                guild_name TEXT,
                albion_guild_id TEXT,
                log_channel_id TEXT,
                objective_channel_id TEXT,
                objective_notify_channel_id TEXT,
                albion_guild_name TEXT,
                killboard_channel_id TEXT,
                killboard_time TEXT DEFAULT '06:00',
                last_killboard_date TEXT,
                trigger_killboard INTEGER DEFAULT 0,
                language TEXT DEFAULT 'tr',
                welcome_message TEXT DEFAULT 'Selam, Hoşgeldiniz!',
                embed_thumbnail_url TEXT,
                setup_completed INTEGER DEFAULT 0
            )`);

            // Objectives table
            db.exec(`CREATE TABLE IF NOT EXISTS objectives (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                channel_id TEXT,
                message_id TEXT,
                map_name TEXT,
                event_name TEXT,
                expires_at DATETIME,
                reminder_sent INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active'
            )`);

            // Objective Participants
            db.exec(`CREATE TABLE IF NOT EXISTS objective_participants (
                objective_id INTEGER,
                user_id TEXT,
                PRIMARY KEY (objective_id, user_id),
                FOREIGN KEY(objective_id) REFERENCES objectives(id) ON DELETE CASCADE
            )`);

            // Per-guild whitelist for party limit bypass
            db.exec(`CREATE TABLE IF NOT EXISTS guild_whitelist (
                guild_id TEXT,
                user_id TEXT,
                PRIMARY KEY (guild_id, user_id)
            )`);

            // Migrations for existing tables (safe to run multiple times)
            const safeAlter = (sql) => {
                try { db.exec(sql); } catch (e) { /* column already exists */ }
            };
            safeAlter("ALTER TABLE user_stats ADD COLUMN pve_confirmed INTEGER DEFAULT 0");
            safeAlter("ALTER TABLE user_stats ADD COLUMN pvp_confirmed INTEGER DEFAULT 0");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN language TEXT DEFAULT 'tr'");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN welcome_message TEXT DEFAULT 'Selam, Hoşgeldiniz!'");
            safeAlter("ALTER TABLE parties ADD COLUMN party_time TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN objective_channel_id TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN objective_notify_channel_id TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN albion_guild_name TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN killboard_channel_id TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN killboard_time TEXT DEFAULT '06:00'");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN last_killboard_date TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN trigger_killboard INTEGER DEFAULT 0");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN registration_channel_id TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN registration_staff_role_ids TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN registration_category_id TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN registration_welcome_message TEXT");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN registration_enabled INTEGER DEFAULT 0");
            safeAlter("ALTER TABLE guild_configs ADD COLUMN embed_thumbnail_url TEXT");
            safeAlter("ALTER TABLE user_votes ADD COLUMN expires_at INTEGER");

            // Set default settings if not exists
            try {
                db.exec(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('vote_cooldown_hours', '168')`); // 1 week default
            } catch (e) {}

            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Execute a query with parameters (Run)
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Get a single row
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(sql);
            const row = stmt.get(...params);
            resolve(row);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Get multiple rows
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            resolve(rows);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    initDb,
    run,
    get,
    all
};
