const { supabase } = require('@veyronix/database');
const { LINKS } = require('@veyronix/config');

/**
 * Supabase'deki system_settings tablosundan destek sunucusu davet linkini ceker.
 * Bulamazsa ya da hata olursa packages/config/src/index.js'deki sabit degere duser.
 * @returns {Promise<string>}
 */
async function getSupportServerLink() {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'discord_invite_url')
            .single();

        if (!error && data && data.value) {
            return data.value;
        }
    } catch (e) {
        // Sessizce hata yut, fallback'e dus
    }
    return LINKS.SUPPORT_SERVER;
}

module.exports = { getSupportServerLink };
