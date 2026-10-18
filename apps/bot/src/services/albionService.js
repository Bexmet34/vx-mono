/**
 * albionService.js
 * Handles fetching player data from Albion Online Gameinfo API
 */

// Mapping of Albion regions: Europe (AMS), Americas (West), Asia (East/SGP)
const REGIONS = {
    EUROPE: 'https://gameinfo-ams.albiononline.com/api/gameinfo',
    WEST: 'https://gameinfo.albiononline.com/api/gameinfo',
    EAST: 'https://gameinfo-sgp.albiononline.com/api/gameinfo',

    // Friendly mappings matching dashboard settings
    'Europe': 'https://gameinfo-ams.albiononline.com/api/gameinfo',
    'Americas': 'https://gameinfo.albiononline.com/api/gameinfo',
    'Asia': 'https://gameinfo-sgp.albiononline.com/api/gameinfo'
};

/**
 * Searches for a player by name and returns their full data
 * @param {string} playerName 
 * @param {string} server 'Europe' | 'Americas' | 'Asia'
 */
async function getPlayerInfo(playerName, server = 'Europe') {
    try {
        const baseUrl = REGIONS[server] || REGIONS.Europe;
        
        // 1. Search for the player to get the ID
        const searchUrl = `${baseUrl}/search?q=${encodeURIComponent(playerName)}`;
        const searchResponse = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
        
        if (!searchResponse.ok) throw new Error('API_ERROR');
        
        const searchData = await searchResponse.json();
        
        if (!searchData.players || searchData.players.length === 0) {
            console.log(`[AlbionService] No players found for "${playerName}" in ${baseUrl}`);
            return null;
        }

        // Try exact match first, then case-insensitive
        let player = searchData.players.find(p => p.Name === playerName) || 
                     searchData.players.find(p => p.Name.toLowerCase() === playerName.toLowerCase());
        
        if (!player) return null;
        
        // 2. Get detailed player info
        const detailUrl = `${baseUrl}/players/${player.Id}`;
        const detailResponse = await fetch(detailUrl, { signal: AbortSignal.timeout(8000) });
        
        if (!detailResponse.ok) throw new Error('API_ERROR');
        
        const detailedData = await detailResponse.json();
        
        // 3. Get recent guilds from official API combat logs (to bypass Cloudflare and support all regions)
        try {
            const killsResponse = await fetch(`${baseUrl}/players/${player.Id}/kills`, { signal: AbortSignal.timeout(5000) });
            const deathsResponse = await fetch(`${baseUrl}/players/${player.Id}/deaths`, { signal: AbortSignal.timeout(5000) });
            
            let events = [];
            if (killsResponse.ok) {
                const kills = await killsResponse.json();
                events = events.concat(kills.map(k => ({ ...k, isKiller: true })));
            }
            if (deathsResponse.ok) {
                const deaths = await deathsResponse.json();
                events = events.concat(deaths.map(d => ({ ...d, isKiller: false })));
            }
            
            // Sort by timestamp desc
            events.sort((a, b) => new Date(b.TimeStamp) - new Date(a.TimeStamp));
            
            const recentGuilds = new Set();
            for (const ev of events) {
                const target = ev.isKiller ? ev.Killer : ev.Victim;
                if (target && target.Id === player.Id && target.GuildName) {
                    recentGuilds.add(target.GuildName);
                }
            }
            
            detailedData.RecentGuilds = Array.from(recentGuilds).slice(0, 5);
        } catch (e) {
            console.error(`[AlbionService] Error fetching combat history for ${player.Id}:`, e.message);
            detailedData.RecentGuilds = [];
        }
        
        console.log(`[AlbionService] Successfully fetched data for: ${detailedData.Name} on ${server}`);
        return detailedData;
    } catch (error) {
        console.error(`[AlbionService] Error fetching on server ${server}:`, error.message);
        throw error;
    }
}

/**
 * Formats large numbers for display (e.g. 1.2M, 500K)
 */
function formatFame(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

module.exports = {
    getPlayerInfo,
    formatFame
};
