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
