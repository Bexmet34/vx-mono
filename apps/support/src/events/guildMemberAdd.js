const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;
    if (!unverifiedRoleId) return;

    try {
      const role = member.guild.roles.cache.get(unverifiedRoleId);
      if (role) {
        await member.roles.add(role);
        console.log(`Assigned Unverified role to ${member.user.tag}`);
      }
    } catch (error) {
      console.error(`Error assigning Unverified role: ${error}`);
    }

    // Welcome message in a specific channel
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    if (welcomeChannelId) {
      const channel = member.guild.channels.cache.get(welcomeChannelId);
      if (channel) {
        channel.send(`Welcome to the server, <@${member.id}>! Please go to the verify channel to get access.`);
      }
    }
  }
};
