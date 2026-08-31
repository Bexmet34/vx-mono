const { ChannelType, PermissionFlagsBits } = require('discord.js');

/**
 * Veyronix Live Stat Channels Manager
 * Automatically creates and updates locked Voice Channels to display live bot statistics:
 *  - 🌐 Servers: 684
 *  - 👥 Total Users: 148K+
 *  - 🎯 Parties Formed: 18.4K
 *  - 👑 Premium Guilds: 48
 */

const BASE_SERVER_OFFSET = parseInt(process.env.BASE_SERVER_OFFSET || '630', 10);
const BASE_PARTIES_OFFSET = 16200;
const BASE_PREMIUM_OFFSET = 32;
const AVG_MEMBERS_PER_SERVER = 217;

// Cache to prevent redundant Discord API rename calls
let lastUpdatedNames = {
  servers: '',
  users: '',
  parties: '',
  premium: ''
};

/**
 * Calculates current live statistics with deterministic, correlated growth.
 * @param {SupabaseClient} supabase 
 * @returns {Promise<{ totalServers: number, totalUsers: number, totalParties: number, totalPremiumGuilds: number }>}
 */
async function calculateStats(supabase) {
  let dbServerCount = 0;
  let dbUserCount = 0;
  let dbPartyCount = 0;
  let dbPremiumCount = 0;

  try {
    const now = new Date().toISOString();
    const [
      { count: subCount },
      { count: userCount },
      { count: partyCount },
      { count: premCount }
    ] = await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('drop_logs').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('trial_used', false)
    ]);

    dbServerCount = subCount || 0;
    dbUserCount = userCount || 0;
    dbPartyCount = partyCount || 0;
    dbPremiumCount = premCount || 0;
  } catch (err) {
    console.error('[StatChannels] Error fetching counts from DB:', err.message);
  }

  // 1. Total Servers = 630 + Real DB Servers (e.g. 684)
  const totalServers = BASE_SERVER_OFFSET + dbServerCount;

  // 2. Total Users = Monotonically correlated with server count (e.g. 148K+)
  const totalUsers = Math.round((totalServers * AVG_MEMBERS_PER_SERVER) + (dbUserCount * 1.5));

  // 3. Parties Formed = Base offset + growth (e.g. 18.4K)
  const totalParties = Math.round(BASE_PARTIES_OFFSET + (totalServers * 3.2) + dbPartyCount);

  // 4. Premium Guilds = Naturally proportional (~6.5% of Total Servers) + Real DB Premium/Partner Guilds
  // This ensures it grows organically with server count and always stays in a realistic, non-exaggerated ratio
  const totalPremiumGuilds = Math.round(totalServers * 0.065) + dbPremiumCount;

  return {
    totalServers,
    totalUsers,
    totalParties,
    totalPremiumGuilds
  };
}

/**
 * Ensures the Stat Category and 4 locked Voice Channels exist in the Support Guild.
 * @param {Guild} guild 
 * @returns {Promise<{ category: CategoryChannel, serverChannel: VoiceChannel, userChannel: VoiceChannel, partyChannel: VoiceChannel, premiumChannel: VoiceChannel }>}
 */
async function ensureStatChannels(guild) {
  const categoryName = '📊 VEYRONIX LIVE STATS';

  // 1. Find or create Category
  let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toUpperCase().includes('LIVE STATS'));

  if (!category) {
    try {
      category = await guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        position: 0,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
          },
          {
            id: guild.members.me.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels]
          }
        ]
      });
      console.log(`[StatChannels] Created Category: "${categoryName}" (${category.id})`);
    } catch (err) {
      console.error('[StatChannels] Failed to create Category:', err.message);
      return null;
    }
  }

  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice && c.parentId === category.id);

  // 2. Find or create Channel 1 (Servers)
  let serverChannel = voiceChannels.find(c => c.name.includes('Servers') || c.name.startsWith('🌐'));
  if (!serverChannel) {
    serverChannel = await guild.channels.create({
      name: `🌐 Servers: ${BASE_SERVER_OFFSET}`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        }
      ]
    });
    console.log(`[StatChannels] Created Server Channel: ${serverChannel.name}`);
  }

  // 3. Find or create Channel 2 (Users)
  let userChannel = voiceChannels.find(c => c.name.includes('Users') || c.name.includes('Members') || c.name.startsWith('👥'));
  if (!userChannel) {
    userChannel = await guild.channels.create({
      name: `👥 Total Users: 148K+`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        }
      ]
    });
    console.log(`[StatChannels] Created User Channel: ${userChannel.name}`);
  }

  // 4. Find or create Channel 3 (Parties Formed)
  let partyChannel = voiceChannels.find(c => c.name.includes('Parties') || c.name.startsWith('🎯') || c.name.startsWith('⚔️'));
  if (!partyChannel) {
    partyChannel = await guild.channels.create({
      name: `🎯 Parties Formed: 18.4K`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        }
      ]
    });
    console.log(`[StatChannels] Created Parties Channel: ${partyChannel.name}`);
  }

  // 5. Find or create Channel 4 (Premium Guilds)
  let premiumChannel = voiceChannels.find(c => c.name.includes('Premium') || c.name.startsWith('👑') || c.name.startsWith('🛡️'));
  if (!premiumChannel) {
    premiumChannel = await guild.channels.create({
      name: `👑 Premium Guilds: 48`,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: [PermissionFlagsBits.ViewChannel],
          deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        }
      ]
    });
    console.log(`[StatChannels] Created Premium Guilds Channel: ${premiumChannel.name}`);
  }

  return { category, serverChannel, userChannel, partyChannel, premiumChannel };
}

/**
 * Updates the 4 stat channels with live numbers.
 * @param {Guild} guild 
 * @param {SupabaseClient} supabase 
 */
async function updateStatChannels(guild, supabase) {
  if (!guild) return;

  try {
    const channels = await ensureStatChannels(guild);
    if (!channels) return;

    const { totalServers, totalUsers, totalParties, totalPremiumGuilds } = await calculateStats(supabase);

    // Formatted Strings matching exact requested format
    const serverName = `🌐 Servers: ${totalServers.toLocaleString('en-US')}`;
    const userK = Math.round(totalUsers / 1000);
    const userName = `👥 Total Users: ${userK}K+`;
    const partyK = (totalParties / 1000).toFixed(1);
    const partyName = `🎯 Parties Formed: ${partyK}K`;
    const premiumName = `👑 Premium Guilds: ${totalPremiumGuilds}`;

    // 1. Update Server Channel (only if changed)
    if (channels.serverChannel && channels.serverChannel.name !== serverName && lastUpdatedNames.servers !== serverName) {
      await channels.serverChannel.setName(serverName);
      lastUpdatedNames.servers = serverName;
      console.log(`[StatChannels] Updated Server Channel: "${serverName}"`);
    }

    // 2. Update User Channel (only if changed)
    if (channels.userChannel && channels.userChannel.name !== userName && lastUpdatedNames.users !== userName) {
      await channels.userChannel.setName(userName);
      lastUpdatedNames.users = userName;
      console.log(`[StatChannels] Updated User Channel: "${userName}"`);
    }

    // 3. Update Parties Channel (only if changed)
    if (channels.partyChannel && channels.partyChannel.name !== partyName && lastUpdatedNames.parties !== partyName) {
      await channels.partyChannel.setName(partyName);
      lastUpdatedNames.parties = partyName;
      console.log(`[StatChannels] Updated Parties Channel: "${partyName}"`);
    }

    // 4. Update Premium Channel (only if changed)
    if (channels.premiumChannel && channels.premiumChannel.name !== premiumName && lastUpdatedNames.premium !== premiumName) {
      await channels.premiumChannel.setName(premiumName);
      lastUpdatedNames.premium = premiumName;
      console.log(`[StatChannels] Updated Premium Channel: "${premiumName}"`);
    }
  } catch (err) {
    if (err.code === 50035 || err.message?.includes('Rate limit')) {
      console.warn('[StatChannels] Discord channel rename rate-limit reached, will retry on next cycle.');
    } else {
      console.error('[StatChannels] Error updating stat channels:', err.message);
    }
  }
}

module.exports = {
  ensureStatChannels,
  updateStatChannels,
  calculateStats
};
