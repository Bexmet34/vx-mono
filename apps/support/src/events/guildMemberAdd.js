const { Events } = require('discord.js');
const { syncMemberRoles } = require('../utils/roleSync');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;
    if (unverifiedRoleId) {
      try {
        const role = member.guild.roles.cache.get(unverifiedRoleId);
        if (role) {
          await member.roles.add(role);
          console.log(`Assigned Unverified role to ${member.user.tag}`);
        }
      } catch (error) {
        console.error(`Error assigning Unverified role: ${error}`);
      }
    }

    // Auto-sync customer & GM roles from database
    try {
      const supabase = client?.supabase || require('@veyronix/database').supabase;
      await syncMemberRoles(member, supabase);
      console.log(`[SupportBot] Auto-synced roles for newly joined member: ${member.user.tag}`);
    } catch (err) {
      console.error(`[SupportBot] Error syncing roles on member join for ${member.user.tag}:`, err);
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
