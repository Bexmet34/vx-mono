export async function checkDiscordPresence(discordId, serverIds) {
    if (!serverIds || serverIds.length === 0) return false;
    for (const guildId of serverIds) {
        try {
            const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
                headers: { 'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}` }
            });
            if (res.ok) return true;
        } catch (e) {
            console.error(`Error checking presence for user ${discordId} in guild ${guildId}:`, e);
        }
    }
    return false;
}
