const { getClient } = require('./client');

async function getAutoPremiumUsers() {
    const supabase = getClient();
    const { data: users, error } = await supabase
        .from('users')
        .select('discord_id, is_unlimited, premium_until, is_auto_premium')
        .eq('is_auto_premium', true);
    if (error) throw error;
    return users;
}

async function revokeAutoPremium(discordId) {
    const supabase = getClient();
    const { error } = await supabase.from('users').update({
        premium_until: null,
        is_unlimited: false,
        is_auto_premium: false
    }).eq('discord_id', discordId);
    if (error) throw error;
}

async function getAutoPremiumRules() {
    const supabase = getClient();
    const { data: rules, error } = await supabase.from('auto_premium_rules').select('*');
    if (error) throw error;
    return rules;
}

module.exports = {
    getAutoPremiumUsers,
    revokeAutoPremium,
    getAutoPremiumRules
};
