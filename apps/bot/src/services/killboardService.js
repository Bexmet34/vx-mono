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

    const activeServers = [...new Set(configs.map(c => c.albion_server))];
    const serverGlobalEvents = {};
    const endpoints = {
      'americas': 'https://gameinfo.albiononline.com/api/gameinfo',
      'asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
      'europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo',
      'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
      'Asia': 'https://gameinfo-sg.albiononline.com/api/gameinfo',
      'Europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo'
    };

    for (const server of activeServers) {
      if (!server) continue;
      const baseUrl = endpoints[server] || endpoints['Europe'];
      serverGlobalEvents[server] = [];
      try {
        // Fetch up to 250 recent events globally to catch deaths (offset 0, 51, 102, 153, 204)
        for (let offset = 0; offset <= 204; offset += 51) {
          const res = await fetch(`${baseUrl}/events?limit=51&offset=${offset}`, { signal: AbortSignal.timeout(8000) });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length) serverGlobalEvents[server].push(...data);
          }
        }
      } catch (e) {
        console.error(`[Killboard] Error fetching global events for ${server}:`, e.message);
      }
    }

    // 2. Fetch events for each unique Albion Guild
    for (const [key, trackingInfo] of albionGuildMap.entries()) {
      const globalEvents = serverGlobalEvents[trackingInfo.albion_server] || [];
      await processAlbionGuildEvents(client, trackingInfo, globalEvents);
      
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
 * @param {Array} globalEvents
 */
async function processAlbionGuildEvents(client, trackingInfo, globalEvents = []) {
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
    
    let events = await res.json();
    if (!events) events = [];

    // Filter globalEvents for deaths where this guild is the victim
    const guildDeaths = globalEvents.filter(e => e.Victim?.GuildId === albion_guild_id);

    // Merge them and remove duplicates by EventId
    const eventMap = new Map();
    for (const e of events) {
      eventMap.set(e.EventId, e);
    }
    for (const e of guildDeaths) {
      eventMap.set(e.EventId, e);
    }

    events = Array.from(eventMap.values());
    if (events.length === 0) return;

    // Events are now merged. Sort by EventId ascending (oldest first) to process chronologically
    events.sort((a, b) => a.EventId - b.EventId);

    for (const config of discord_configs) {
      const lastEventId = config.killboard_last_event_id ? parseInt(config.killboard_last_event_id, 10) : 0;
      let newLastEventId = lastEventId;
      let eventsSent = 0;
      const isInitialRun = lastEventId === 0;

      for (const event of events) {
        // Track the highest ID seen so far
        if (event.EventId > newLastEventId) newLastEventId = event.EventId;

        // Skip if we already processed it
        if (!isInitialRun && event.EventId <= lastEventId) continue;
        
        const isKiller = event.Killer?.GuildId === albion_guild_id;
        const isVictim = event.Victim?.GuildId === albion_guild_id;

        // Skip if we are neither the killer nor victim (e.g. only assist)
        if (!isKiller && !isVictim) {
           if (event.EventId > newLastEventId) newLastEventId = event.EventId;
           continue;
        }

        // If it's the first run, process only the 20 most recent valid events
        if (isInitialRun) {
            // Find all valid events for this guild in the fetched array
            const validEvents = events.filter(e => e.Killer?.GuildId === albion_guild_id || e.Victim?.GuildId === albion_guild_id);
            // Check if current event is among the last 20 of the valid events
            const isOneOfLastTwenty = validEvents.indexOf(event) >= validEvents.length - 20;
            if (!isOneOfLastTwenty) {
               if (event.EventId > newLastEventId) newLastEventId = event.EventId;
               continue;
            }
        }

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

        const fameNum = event.TotalVictimKillFame || event.KillFame || 0;
        const embed = new EmbedBuilder()
          .setAuthor({ name: 'Albion Online PvP Event' })
          .setTitle(embedTitle)
          .setColor(color)
          .setDescription(
            `**Katil:** [${event.Killer.GuildName || 'Yok'}] ${event.Killer.Name} \`(IP: ${Math.round(event.Killer.AverageItemPower)})\`\n` +
            `**Kurban:** [${event.Victim.GuildName || 'Yok'}] ${event.Victim.Name} \`(IP: ${Math.round(event.Victim.AverageItemPower)})\`\n\n` +
            `🎯 **Fame:** ${fameNum.toLocaleString()} | 👥 **Katılımcı:** ${event.Participants ? event.Participants.length : 1}`
          )
          .setImage('attachment://killboard.png')
          .setURL(`https://albiononline.com/en/killboard/kill/${event.EventId}`)
          .setTimestamp(new Date(event.TimeStamp))
          .setFooter({ text: 'Veyronix Albion System' });

        if (assistText) {
          embed.addFields({ name: '🤝 Asistler', value: assistText, inline: false });
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

      // Update last event ID if it changed
      if (newLastEventId > lastEventId) {
        console.log(`[Killboard] Guild ${config.guild_id} processing complete. New LastEventID: ${newLastEventId}. Messages sent: ${eventsSent}`);
        await supabase
          .from('guild_settings')
          .update({ killboard_last_event_id: newLastEventId.toString() })
          .eq('guild_id', config.guild_id);
      } else {
         // console.log(`[Killboard] Guild ${config.guild_id} check complete. No new events (LastID: ${lastEventId}).`);
      }
    }
  } catch (err) {
    console.error(`[Killboard] Error processing Albion Guild ${trackingInfo.albion_guild_id}:`, err);
  }
}

module.exports = { runKillboardCheck };
