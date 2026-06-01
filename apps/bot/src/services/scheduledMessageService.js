const cron = require('node-cron');
const { supabase } = require('@veyronix/database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

/**
 * Starts the scheduled message service
 * @param {import('discord.js').Client} client 
 */
function startScheduledMessageService(client) {
    console.log('[ScheduledMessageService] Service started (checking every minute)...');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            // TR timezone date
            const now = new Date();
            const trTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
            const currentHHmm = `${String(trTime.getUTCHours()).padStart(2, '0')}:${String(trTime.getUTCMinutes()).padStart(2, '0')}`;
            const currentDateString = trTime.toISOString().split('T')[0];

            const { data: messages, error } = await supabase
                .from('scheduled_messages')
                .select('*')
                .eq('is_active', true);

            if (error) {
                console.error("[ScheduledMessageService] Fetch Error:", error.message);
                return;
            }

            if (!messages || messages.length === 0) return;

            for (const msg of messages) {
                let shouldSend = false;

                if (msg.schedule_type === 'recurring') {
                    // Check if time matches exactly HH:mm
                    if (msg.send_time === currentHHmm) {
                        // Check if not sent today
                        const lastSent = msg.last_sent_at ? new Date(msg.last_sent_at) : null;
                        if (!lastSent || lastSent.toISOString().split('T')[0] !== currentDateString) {
                            shouldSend = true;
                        }
                    }
                } else if (msg.schedule_type === 'once') {
                    // msg.send_time is YYYY-MM-DD HH:mm
                    // Convert both to numbers to compare
                    const sendDateStr = msg.send_time.replace('T', ' '); // standardize
                    const currentFullStr = `${currentDateString} ${currentHHmm}`;
                    
                    if (currentFullStr >= sendDateStr && !msg.last_sent_at) {
                        shouldSend = true;
                    }
                }

                if (shouldSend) {
                    await broadcastMessage(client, msg);
                    
                    // Update last_sent_at
                    const updateData = { last_sent_at: new Date().toISOString() };
                    
                    // If 'once', disable it so it never runs again
                    if (msg.schedule_type === 'once') {
                        updateData.is_active = false;
                    }

                    await supabase
                        .from('scheduled_messages')
                        .update(updateData)
                        .eq('id', msg.id);
                }
            }

        } catch (err) {
            console.error('[ScheduledMessageService] Critical Error:', err.message);
        }
    });
}

/**
 * Broadcasts a scheduled message to all servers
 * @param {import('discord.js').Client} client 
 * @param {Object} msg 
 */
async function broadcastMessage(client, msg) {
    console.log(`[ScheduledMessageService] Broadcasting message ${msg.id} to all servers...`);
    
    // Prepare message content
    let content = msg.message_content;
    if (msg.ping_everyone) {
        content = `@everyone\n\n${content}`;
    }

    // Prepare buttons if any
    const components = [];
    if (msg.buttons && msg.buttons.length > 0) {
        const row = new ActionRowBuilder();
        for (const btn of msg.buttons) {
            if (btn.label && btn.url) {
                // simple URL validation
                const url = btn.url.startsWith('http') ? btn.url : `https://${btn.url}`;
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel(btn.label)
                        .setURL(url)
                        .setStyle(ButtonStyle.Link)
                );
            }
        }
        if (row.components.length > 0) {
            components.push(row);
        }
    }

    const payload = { content };
    if (components.length > 0) payload.components = components;

    let successCount = 0;
    let failCount = 0;

    // Iterate through all guilds
    for (const guild of client.guilds.cache.values()) {
        try {
            // Criteria: A text channel where everyone can see and the bot has SEND_MESSAGES permission
            const canBotSend = (c) => {
                const perms = c.permissionsFor(guild.members.me);
                return perms && perms.has('SendMessages') && perms.has('ViewChannel');
            };
            const isPublicChannel = (c) => {
                const perms = c.permissionsFor(guild.roles.everyone);
                return perms && perms.has('ViewChannel');
            };

            const preferredNames = ['duyuru', 'announcements', 'genel', 'chat', 'sohbet', 'general'];
            
            // 1. Try to find a public channel with a common name
            let channel = guild.channels.cache.find(c => 
                c.type === ChannelType.GuildText && 
                canBotSend(c) && 
                isPublicChannel(c) && 
                preferredNames.some(name => c.name.toLowerCase().includes(name))
            );

            // 2. Try the system channel if it's public
            if (!channel && guild.systemChannel && canBotSend(guild.systemChannel) && isPublicChannel(guild.systemChannel)) {
                channel = guild.systemChannel;
            }

            // 3. Try ANY public channel
            if (!channel) {
                channel = guild.channels.cache.find(c => 
                    c.type === ChannelType.GuildText && 
                    canBotSend(c) && 
                    isPublicChannel(c)
                );
            }

            // 4. Fallback to any channel the bot can send to (last resort)
            if (!channel) {
                channel = guild.channels.cache.find(c => 
                    c.type === ChannelType.GuildText && 
                    canBotSend(c)
                );
            }

            if (channel) {
                await channel.send(payload);
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            failCount++;
            // Silently fail for individual guilds so it doesn't break the loop
        }
        
        // Small delay to prevent rate limits
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`[ScheduledMessageService] Broadcast finished. Success: ${successCount}, Fail: ${failCount}`);
}

module.exports = { startScheduledMessageService };
