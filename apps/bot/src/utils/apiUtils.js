/**
 * apiUtils.js
 * Utility functions for making external API requests.
 */

/**
 * Fetches members of an Albion Online guild.
 * @param {string} guildId 
 * @param {string} server 'Europe' | 'Americas' | 'Asia'
 * @returns {Promise<Array>} Array of member objects or empty array if failed
 */
async function getGuildMembers(guildId, server = 'Europe') {
    if (!guildId) return [];
    
    const REGIONS = {
        'Europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo',
        'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
        'Asia': 'https://gameinfo-sgp.albiononline.com/api/gameinfo'
    };

    // Prioritize the configured server
    const targetUrl = `${REGIONS[server] || REGIONS.Europe}/guilds/${guildId}/members`;
    
    // Fill other regions as fallbacks
    const fallbackUrls = [
        `https://gameinfo-ams.albiononline.com/api/gameinfo/guilds/${guildId}/members`,
        `https://gameinfo.albiononline.com/api/gameinfo/guilds/${guildId}/members`,
        `https://gameinfo-sgp.albiononline.com/api/gameinfo/guilds/${guildId}/members`
    ].filter(url => url !== targetUrl);

    const urls = [targetUrl, ...fallbackUrls];

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
