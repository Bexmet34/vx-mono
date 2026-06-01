const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity('Support & Tickets', { type: ActivityType.Watching });
    
    // Command Registration
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
      console.warn('GUILD_ID is not set or the bot is not in the server.');
      return;
    }

    const commandData = client.commands.map(cmd => cmd.data.toJSON());
    guild.commands.set(commandData)
      .then(() => console.log('Successfully registered guild commands.'))
      .catch(console.error);
  }
};
