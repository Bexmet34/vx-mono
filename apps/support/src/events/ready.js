const { Events, ActivityType } = require('discord.js');
const { resolveSupportRoles, syncAllGuildMembers } = require('../utils/roleSync');
const { updateStatChannels } = require('../utils/statsChannels');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('Veyronix Support & Stats', { type: ActivityType.Watching });
    
    // Command Registration
    const targetGuildId = process.env.GUILD_ID;
    const guild = targetGuildId ? client.guilds.cache.get(targetGuildId) : client.guilds.cache.first();
    
    if (!guild) {
      console.warn('[SupportBot] GUILD_ID is not set or the bot is not in any server.');
      return;
    }

    const commandData = client.commands.map(cmd => cmd.data.toJSON());
    guild.commands.set(commandData)
      .then(() => console.log(`[SupportBot] Successfully registered ${commandData.length} guild commands in ${guild.name}.`))
      .catch(err => console.error('[SupportBot] Command registration error:', err));

    // 1. Initial Live Stat Channels Setup & Update
    try {
      console.log(`[SupportBot] Initializing Live Stat Channels for ${guild.name}...`);
      await updateStatChannels(guild, client.supabase);
    } catch (e) {
      console.error('[SupportBot] Initial stat channels setup error:', e);
    }

    // 2. Scheduled Live Stat Channels Update (Every 10 minutes - Discord safe rate limit)
    const STAT_INTERVAL = 10 * 60 * 1000;
    setInterval(async () => {
      try {
        await updateStatChannels(guild, client.supabase);
      } catch (err) {
        console.error('[SupportBot] Stat channels update error:', err);
      }
    }, STAT_INTERVAL);

    // 3. Initial Role Sync on Startup
    try {
      await resolveSupportRoles(guild);
      console.log(`[SupportBot] Triggering initial role synchronization for ${guild.name}...`);
      await syncAllGuildMembers(guild, client.supabase);
    } catch (e) {
      console.error('[SupportBot] Initial role sync error:', e);
    }

    // 4. Scheduled Periodic Role Sync (Every 2 Hours to prevent any rate-limit or CPU stress)
    const SYNC_INTERVAL = 2 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        console.log('[SupportBot] Running scheduled 2-hour role sync sweep...');
        await syncAllGuildMembers(guild, client.supabase);
      } catch (err) {
        console.error('[SupportBot] Scheduled role sync sweep error:', err);
      }
    }, SYNC_INTERVAL);
  }
};
