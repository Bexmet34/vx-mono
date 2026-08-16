export async function checkDiscordPresence(discordId, serverIds) {
    if (!serverIds || serverIds.length === 0) return false;
    for (const guildId of serverIds) {
        try {
            const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
                headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
            });
            if (!res.ok) return false; // Eğer herhangi bir sunucuda yoksa false döner (VE mantığı)
        } catch (e) {
            console.error(`Error checking presence for user ${discordId} in guild ${guildId}:`, e);
            return false;
        }
    }
    return true; // Tüm sunucularda varsa true döner
}

export async function getDiscordUser(discordId) {
    const res = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
        headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Discord user API error: ${res.status}`);
    return await res.json();
}

export async function getGuildMember(guildId, discordId) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
        headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Discord member API error: ${res.status}`);
    return await res.json();
}

export async function getGuildRoles(guildId) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Discord roles API error: ${res.status}`);
    return await res.json();
}

export async function getGuildMembers(guildId, limit = 1000) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=${limit}`, {
        headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Discord members list API error: ${res.status}`);
    return await res.json();
}

export async function getGuildChannels(guildId) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Discord channels API error: ${res.status}`);
    return await res.json();
}

export async function sendChannelMessage(channelId, messagePayload) {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
    });
    if (!res.ok) throw new Error(`Discord send message API error: ${res.status}`);
    return await res.json();
}

export async function deleteChannelMessage(channelId, messageId) {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
    });
    if (!res.ok && res.status !== 404) throw new Error(`Discord delete message API error: ${res.status}`);
    return true;
}

export async function createDMChannel(userId) {
    const res = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient_id: userId })
    });
    if (!res.ok) throw new Error(`Discord create DM API error: ${res.status}`);
    return await res.json();
}

export async function sendSupportMessage(messagePayload) {
    return await sendChannelMessage('1490798764427051088', messagePayload);
}
