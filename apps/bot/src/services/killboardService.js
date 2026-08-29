const { supabase } = require('@veyronix/database');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateKillboardImage } = require('../utils/killboardImage');
const { getGuildConfig } = require('./guildConfig');
const { t } = require('./i18n');

/**
 * Run the killboard check for all configured guilds
 * @param {import('discord.js').Client} client 
 */
async function runKillboardCheck(client) {
  try {
    // 1. Fetch all guild settings that have an albion_guild_id and at least one channel configured
    const { data: configs, error } = await supabase
      .from('guild_settings')
      .select('guild_id, albion_guild_id, albion_server, killboard_kill_channel_id, killboard_death_channel_id, killboard_last_event_id, language')
      .not('albion_guild_id', 'is', null)
      .or('killboard_kill_channel_id.not.is.null,killboard_death_channel_id.not.is.null');

    if (error) {
      console.error('[Killboard] Error fetching guild settings:', error);
      return;
    }

    if (!configs || configs.length === 0) return;

    // We only want to fetch API once per unique Albion Guild + Server combination
    // to avoid rate limits if multiple discord servers track the same Albion guild.
    const albionGuildMap = new Map();
    for (const config of configs) {
      const key = `${config.albion_server}_${config.albion_guild_id}`;
      if (!albionGuildMap.has(key)) {
        albionGuildMap.set(key, {
          albion_guild_id: config.albion_guild_id,
          albion_server: config.albion_server,
          discord_configs: []
        });
      }
      albionGuildMap.get(key).discord_configs.push(config);
    }

    // 2. Fetch events for each unique Albion Guild
    for (const [key, trackingInfo] of albionGuildMap.entries()) {
      await processAlbionGuildEvents(client, trackingInfo);
      
      // Add a small delay between Albion API requests to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

  } catch (err) {
    console.error('[Killboard] Fatal error in runKillboardCheck:', err);
  }
}

/**
 * Fetch and process events for a single Albion Guild
 * @param {import('discord.js').Client} client 
 * @param {Object} trackingInfo 
 */
async function processAlbionGuildEvents(client, trackingInfo) {
  const { albion_guild_id, albion_server, discord_configs } = trackingInfo;
  
  const endpoints = {
    'americas': 'https://gameinfo.albiononline.com/api/gameinfo',
    'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
    'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo',
    // Fallback if older data
    'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
    'Asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
    'Europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo'
  };

  const baseUrl = endpoints[albion_server] || endpoints['Europe'];
  
  try {
    const res = await fetch(`${baseUrl}/events?guildId=${albion_guild_id}&limit=50`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.warn(`[Killboard] Failed to fetch events for ${albion_guild_id} on ${albion_server} (Status: ${res.status})`);
      return;
    }
    
    const events = await res.json();
    if (!events || events.length === 0) return;

    // Events come from newest to oldest. We want to process oldest first to maintain chronological order.
    events.reverse();

    for (const config of discord_configs) {
      const lastEventId = config.killboard_last_event_id ? parseInt(config.killboard_last_event_id, 10) : 0;
      let newLastEventId = lastEventId;
      let eventsSent = 0;
      const isInitialRun = lastEventId === 0;

      for (const event of events) {
        // Skip if we already processed it
        if (!isInitialRun && event.EventId <= lastEventId) continue;
        
        // If it's the first run, we only want to send the very latest event to avoid spamming 50 messages
        if (isInitialRun && eventsSent >= 1) {
            if (event.EventId > newLastEventId) newLastEventId = event.EventId;
            continue;
        }

        // Is our guild the killer or the victim?
        const isKiller = event.Killer.GuildId === albion_guild_id;
        const isVictim = event.Victim.GuildId === albion_guild_id;

        let targetChannelId = null;
        let color = '#000000';
        let embedTitle = '';

        if (isKiller && config.killboard_kill_channel_id) {
          targetChannelId = config.killboard_kill_channel_id;
          color = '#4ade80'; // Green
          embedTitle = `⚔️ ${event.Killer.Name} killed ${event.Victim.Name}`;
        } else if (isVictim && config.killboard_death_channel_id) {
          targetChannelId = config.killboard_death_channel_id;
          color = '#f87171'; // Red
          embedTitle = `💀 ${event.Victim.Name} was killed by ${event.Killer.Name}`;
        } else {
          // Both are members? Or neither (shouldn't happen on this endpoint)? Or channel not set.
          if (event.EventId > newLastEventId) newLastEventId = event.EventId;
          continue;
        }

        const discordGuild = client.guilds.cache.get(config.guild_id);
        if (!discordGuild) continue;

        const channel = discordGuild.channels.cache.get(targetChannelId) || await discordGuild.channels.fetch(targetChannelId).catch(() => null);
        if (!channel) continue;

        // Generate the Canvas image
        const imageBuffer = await generateKillboardImage(event);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'killboard.png' });

        // Generate Assist List
        let assistText = '';
        if (event.Participants && event.Participants.length > 1) {
          const assists = event.Participants.filter(p => p.Id !== event.Killer.Id);
          if (assists.length > 0) {
            assistText = assists.slice(0, 5).map(p => `• **${p.Name}** (${Math.round(p.AverageItemPower)} IP)`).join('\n');
            if (assists.length > 5) {
              assistText += `\n*+ ${assists.length - 5} more...*`;
            }
          }
        }

        const embed = new EmbedBuilder()
          .setTitle(embedTitle)
          .setColor(color)
          .setImage('attachment://killboard.png')
          .setURL(`https://albiononline.com/en/killboard/kill/${event.EventId}`)
          .setTimestamp(new Date(event.TimeStamp));

        if (assistText) {
          embed.addFields({ name: 'Assists', value: assistText, inline: false });
        }

        try {
          await channel.send({ embeds: [embed], files: [attachment] });
          eventsSent++;
          if (event.EventId > newLastEventId) newLastEventId = event.EventId;
          
          // 1.5s delay to avoid discord rate limits per channel
          await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
          console.error(`[Killboard] Error sending killboard message to ${targetChannelId}:`, err.message);
        }
      }

      // Update the last event ID in DB if it changed
      if (newLastEventId > lastEventId) {
        await supabase
          .from('guild_settings')
          .update({ killboard_last_event_id: newLastEventId.toString() })
          .eq('guild_id', config.guild_id);
      }
    }

  } catch (err) {
    console.error(`[Killboard] Error processing Albion Guild ${albion_guild_id}:`, err);
  }
}

module.exports = { runKillboardCheck };
