const { getClient } = require('./client');

async function getAllUsers() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('discord_id', { ascending: true });
    if (error) throw error;
    return data || [];
}

async function getUserProfile(discordId) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('discord_id', discordId)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // ignore not found
    return data;
}

async function upsertUser(updateData) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('users')
        .upsert(updateData, { onConflict: 'discord_id' });
    if (error) throw error;
    return data;
}

async function updateUser(discordId, updateData) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('discord_id', discordId);
    if (error) throw error;
    return data;
}

async function deleteUser(discordId) {
    const supabase = getClient();
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('discord_id', discordId);
    if (error) throw error;
}

async function queueMessage(payload) {
    const supabase = getClient();
    const { error } = await supabase.from('message_queue').insert({
        ...payload,
        status: 'pending'
    });
    if (error) throw error;
}

async function getNotificationTemplate(templateId) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function getParsedTemplate(templateId, placeholders = {}) {
    const template = await getNotificationTemplate(templateId);
    if (!template) return null;

    let title = template.title_tr || '';
    let content = template.content_tr || '';

    Object.keys(placeholders).forEach(key => {
        const searchVal = `{${key}}`;
        const replaceVal = String(placeholders[key]);
        title = title.split(searchVal).join(replaceVal);
        content = content.split(searchVal).join(replaceVal);
    });

    return { title, content, color: template.color, is_embed: template.is_embed };
}

async function getAllSubscriptions() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

async function getSubscriptionByGuildId(guildId) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('guild_id', guildId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function updateSubscription(guildId, updateData) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('guild_id', guildId);
    if (error) throw error;
    return data;
}

async function getAutoPremiumRules() {
    const supabase = getClient();
    const { data, error } = await supabase.from('auto_premium_rules').select('*');
    if (error) throw error;
    return data || [];
}

async function getAutoPremiumRulesOnlyGuilds() {
    const supabase = getClient();
    const { data, error } = await supabase.from('auto_premium_rules').select('albion_guilds');
    if (error) throw error;
    return data || [];
}

async function upsertCachedGuildMembers(members) {
    if (!members || members.length === 0) return;
    const supabase = getClient();
    // Chunking to avoid large payload issues
    const chunkSize = 500;
    for (let i = 0; i < members.length; i += chunkSize) {
        const chunk = members.slice(i, i + chunkSize);
        const { error } = await supabase.from('cached_guild_members').upsert(chunk, { onConflict: 'ign' });
        if (error) throw error;
    }
}

async function deleteOldCachedGuildMembers(dateString) {
    const supabase = getClient();
    const { error } = await supabase.from('cached_guild_members').delete().lt('last_seen', dateString);
    if (error) throw error;
}

async function createCampaignLog(logs) {
    const supabase = getClient();
    const { error } = await supabase.from('campaign_logs').insert(logs);
    if (error) throw error;
}

async function updateCampaign(id, updates) {
    const supabase = getClient();
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

async function createAutoPremiumRule(rule) {
    const supabase = getClient();
    const { data, error } = await supabase.from('auto_premium_rules').insert([rule]).select();
    if (error) throw error;
    return data;
}

async function updateAutoPremiumRule(id, rule) {
    const supabase = getClient();
    const { data, error } = await supabase.from('auto_premium_rules').update(rule).eq('id', id).select();
    if (error) throw error;
    return data;
}

async function deleteAutoPremiumRule(id) {
    const supabase = getClient();
    const { error } = await supabase.from('auto_premium_rules').delete().eq('id', id);
    if (error) throw error;
}

async function getAllCryptoPayments(method) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('payment_method', method)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

async function getCryptoPaymentById(id) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('id', id)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function updateCryptoPayment(id, updates) {
    const supabase = getClient();
    const { error } = await supabase
        .from('crypto_payments')
        .update(updates)
        .eq('id', id);
    if (error) throw error;
}

async function updateCryptoPaymentByOrderId(orderId, updates) {
    const supabase = getClient();
    const { error } = await supabase
        .from('crypto_payments')
        .update(updates)
        .eq('order_id', orderId);
    if (error) throw error;
}

async function getCryptoPaymentByOrderId(orderId) {
    const supabase = getClient();
    const { data, error } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('order_id', orderId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}


module.exports = {
    getAllUsers,
    getUserProfile,
    upsertUser,
    updateUser,
    deleteUser,
    queueMessage,
    getNotificationTemplate,
    getParsedTemplate,
    getAllSubscriptions,
    getSubscriptionByGuildId,
    updateSubscription,
    getAutoPremiumRules,
    getAutoPremiumRulesOnlyGuilds,
    upsertCachedGuildMembers,
    deleteOldCachedGuildMembers,
    createCampaignLog,
    updateCampaign,
    createAutoPremiumRule,
    updateAutoPremiumRule,
    deleteAutoPremiumRule,
    getAllCryptoPayments,
    getCryptoPaymentById,
    updateCryptoPayment,
    updateCryptoPaymentByOrderId,
    getCryptoPaymentByOrderId
};

