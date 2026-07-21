require('dotenv').config({ quiet: true });
const { ShardingManager } = require('discord.js');
const path = require('path');
const { AutoPoster } = require('topgg-autoposter');
const config = require('./config/config');
const { startApiServer } = require('./api/server');

const manager = new ShardingManager(path.join(__dirname, 'index.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto'
});

// Start internal API for web dashboard communication
startApiServer(manager);

manager.on('shardCreate', shard => {
    console.log(`[ShardingManager] Launched shard ${shard.id}`);
    
    shard.on('ready', () => {
        console.log(`[ShardingManager] Shard ${shard.id} is ready`);
    });

    shard.on('disconnect', () => {
        console.warn(`[ShardingManager] Shard ${shard.id} disconnected`);
    });

    shard.on('reconnecting', () => {
        console.log(`[ShardingManager] Shard ${shard.id} reconnecting`);
    });
});

if (config.TOPGG_TOKEN) {
    const ap = AutoPoster(config.TOPGG_TOKEN, manager);
    ap.on('posted', () => {
        console.log(`[Top.gg] Server count posted successfully from ShardingManager!`);
    });
    ap.on('error', (err) => {
        console.error('[Top.gg] AutoPoster Error in ShardingManager:', err.message);
    });
} else {
    console.warn('[ShardingManager] TOPGG_TOKEN is missing. Top.gg AutoPoster is disabled.');
}

manager.spawn().catch(error => {
    console.error('[ShardingManager] Failed to spawn shards:', error);
});
