function getBotToken() {
    let token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN || process.env.TOKEN || process.env.BOT_TOKEN || '';
    token = token.trim();
    if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1).trim();
    if (token.startsWith("'") && token.endsWith("'")) token = token.slice(1, -1).trim();
    if (token.startsWith('Bot ')) token = token.substring(4).trim();
    return token;
}

export async function checkDiscordPresence(discordId, serverIds) {
    if (!serverIds || serverIds.length === 0) return false;
    const token = getBotToken();
    for (const guildId of serverIds) {
        try {
            const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
                headers: { 'Authorization': `Bot ${token}` }
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
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
        headers: { 'Authorization': `Bot ${token}` }
    });
    if (!res.ok) throw new Error(`Discord user API error: ${res.status}`);
    return await res.json();
}

export async function getGuildMember(guildId, discordId) {
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
        headers: { 'Authorization': `Bot ${token}` }
    });
    if (!res.ok) throw new Error(`Discord member API error: ${res.status}`);
    return await res.json();
}

export async function getGuildRoles(guildId) {
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: { 'Authorization': `Bot ${token}` }
    });
    if (!res.ok) throw new Error(`Discord roles API error: ${res.status}`);
    return await res.json();
}

export async function getGuildMembers(guildId, limit = 1000) {
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=${limit}`, {
        headers: { 'Authorization': `Bot ${token}` }
    });
    if (!res.ok) throw new Error(`Discord members list API error: ${res.status}`);
    return await res.json();
}

export async function getGuildChannels(guildId) {
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers: { 'Authorization': `Bot ${token}` }
    });
    if (!res.ok) throw new Error(`Discord channels API error: ${res.status}`);
    return await res.json();
}

export async function sendChannelMessage(channelId, messagePayload, files = []) {
    const token = getBotToken();
    if (files && files.length > 0) {
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(messagePayload));
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const blob = new Blob([file.buffer], { type: file.contentType || 'image/png' });
            formData.append(`files[${i}]`, blob, file.name || `file_${i}.png`);
        }
        const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${token}`
            },
            body: formData
        });
        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            throw new Error(`Discord send message API error: ${res.status} ${errorText}`);
        }
        return await res.json();
    }

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
    });
    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`Discord send message API error: ${res.status} ${errorText}`);
    }
    return await res.json();
}

export async function deleteChannelMessage(channelId, messageId) {
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bot ${token}`
        }
    });
    if (!res.ok && res.status !== 404) throw new Error(`Discord delete message API error: ${res.status}`);
    return true;
}

export async function createDMChannel(userId) {
    const token = getBotToken();
    const res = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${token}`,
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

export async function getApplicationEmojis() {
    try {
        const token = getBotToken();
        const appRes = await fetch(`https://discord.com/api/v10/oauth2/applications/@me`, {
            headers: { 'Authorization': `Bot ${token}` }
        });
        if (!appRes.ok) return {};
        const appData = await appRes.json();
        const appId = appData.id;

        const emojisRes = await fetch(`https://discord.com/api/v10/applications/${appId}/emojis`, {
            headers: { 'Authorization': `Bot ${token}` }
        });
        if (!emojisRes.ok) return {};
        const emojisData = await emojisRes.json();
        const items = emojisData.items || [];
        
        const emojiMap = {};
        for (const item of items) {
            emojiMap[item.name.toLowerCase()] = {
                id: item.id,
                name: item.name,
                url: `https://cdn.discordapp.com/emojis/${item.id}.png`
            };
        }
        return emojiMap;
    } catch (e) {
        console.error('Error fetching application emojis:', e);
        return {};
    }
}

