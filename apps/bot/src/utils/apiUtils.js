/**
 * apiUtils.js
 * Utility functions for making external API requests.
 */

/**
 * Fetches members of an Albion Online guild.
 * @param {string} guildId 
 * @returns {Promise<Array>} Array of member objects or empty array if failed
 */
async function getGuildMembers(guildId) {
    if (!guildId) return [];
    
    // Try multiple Albion regions: Europe (AMS), Americas (West), Asia (East/SGP)
    const urls = [
        `https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/${guildId}/members`,
        `https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId}/members`,
        `https://gameinfo-sgp.albiononline.com/api/gameinfo/guilds/${guildId}/members`
    ];

    for (const url of urls) {
        try {
            const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data;
                }
            }
        } catch (e) {
            // Ignore fetch error and try next region
        }
    }
    
    return [];
}

module.exports = {
    getGuildMembers
};
