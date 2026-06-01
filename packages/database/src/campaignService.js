const { supabase } = require('./client');

/**
 * Creates a new campaign
 */
async function createCampaign(campaignData) {
    const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single();
    
    if (error) {
        console.error('[CampaignService] Create Error:', error.message);
        return null;
    }
    return data;
}

/**
 * Gets all active campaigns
 */
async function getActiveCampaigns() {
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('[CampaignService] Fetch Error:', error.message);
        return [];
    }
    return data;
}

/**
 * Validates and redeems a promo code for a guild
 */
async function redeemCode(promoCode, guildId, userId) {
    // 1. Find campaign
    const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('promo_code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();
    
    if (fetchError || !campaign) return { success: false, message: 'Geçersiz veya süresi dolmuş kod.' };

    // 2. Check limits (usage_limit 0 means unlimited)
    if (campaign.usage_limit > 0 && campaign.current_usage >= campaign.usage_limit) {
        return { success: false, message: 'Bu kodun kullanım sınırı dolmuştur.' };
    }

    // 3. Check if guild already used it
    const { data: existingUsage } = await supabase
        .from('promo_usages')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('guild_id', guildId)
        .single();
    
    if (existingUsage) return { success: false, message: 'Bu sunucu bu kodu zaten kullanmış.' };

    // 4. Start transaction (Manual update steps)
    // Add usage
    const { error: usageError } = await supabase
        .from('promo_usages')
        .insert([{ campaign_id: campaign.id, guild_id: guildId, user_id: userId }]);
    
    if (usageError) return { success: false, message: 'Kod kullanılırken hata oluştu.' };

    // Update campaign count
    await supabase
        .from('campaigns')
        .update({ current_usage: campaign.current_usage + 1 })
        .eq('id', campaign.id);

    // Update guild subscription
    const { addSubscriptionDays } = require('./subscriptionService');
    const success = await addSubscriptionDays(guildId, campaign.reward_days);

    return { 
        success: success, 
        message: success ? `Tebrikler! Sunucunuza ${campaign.reward_days} gün eklendi.` : 'Süre eklenirken hata oluştu.' 
    };
}

/**
 * Queue campaign messages for delivery
 */
async function queueCampaignMessages(campaignId, targetGuildIds) {
    const logs = targetGuildIds.map(gid => ({
        campaign_id: campaignId,
        guild_id: gid,
        status: 'pending'
    }));

    const { error } = await supabase
        .from('campaign_logs')
        .insert(logs);
    
    return !error;
}

module.exports = {
    createCampaign,
    getActiveCampaigns,
    redeemCode,
    queueCampaignMessages
};
