const { supabase } = require('./client');

/**
 * Gets subscription for a guild. If not exists, creates a 3-day trial.
 * @param {string} guildId 
 * @param {string} guildName 
 * @param {string} ownerId 
 */
async function getSubscription(guildId, guildName, ownerId) {
    try {
        // 1. Get from database
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('guild_id', guildId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
             console.error('[SubscriptionService] Fetch Error:', error.message);
             return null;
        }

        // 2. If exists, update guild_name/owner_id if outdated and return
        if (data) {
            const needsUpdate = (guildName && guildName !== 'Unknown' && data.guild_name !== guildName) ||
                                (ownerId && ownerId !== 'Unknown' && data.owner_id !== ownerId);
            if (needsUpdate) {
                await supabase
                    .from('subscriptions')
                    .update({ 
                        guild_name: guildName || data.guild_name, 
                        owner_id: ownerId || data.owner_id, 
                        updated_at: new Date().toISOString() 
                    })
                    .eq('guild_id', guildId);
                return { 
                    ...data, 
                    guild_name: guildName || data.guild_name, 
                    owner_id: ownerId || data.owner_id, 
                    created: false 
                };
            }
            return { ...data, created: false };
        }


        // 3. If not exists, create 3-day trial
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3);

        if (ownerId && ownerId !== 'Unknown') {
            await supabase.from('users').upsert([{ id: ownerId }], { onConflict: 'id' });
        }

        const { data: newData, error: insertError } = await supabase
            .from('subscriptions')
            .insert([
                { 
                    guild_id: guildId, 
                    guild_name: guildName || 'Unknown', 
                    owner_id: ownerId || 'Unknown',
                    expires_at: expiresAt.toISOString(),
                    trial_used: true
                }
            ])
            .select()
            .single();

        if (insertError) {
            if (insertError.code !== '23503') {
                console.error('[SubscriptionService] Trial Create Error:', insertError.message);
            }
            return null;
        }

        console.log(`[SubscriptionService] 3-Day Trial created for ${guildName} (${guildId})`);
        return { ...newData, created: true };

    } catch (err) {
        console.error('[SubscriptionService] Critical Error:', err.message);
        return null;
    }
}

/**
 * Checks if subscription is a PAID/PREMIUM active subscription.
 * Trial subscriptions do NOT count as paid — they only allow basic access.
 * Only unlimited (is_unlimited=true) or explicitly paid (trial_used=false) subs return true.
 * @param {string} guildId 
 * @param {string} guildName 
 * @param {string} ownerId 
 */
async function isSubscriptionActive(guildId, guildName, ownerId) {
    const sub = await getSubscription(guildId, guildName, ownerId);
    
    if (!sub) return false;

    // Must be explicitly premium (unlimited OR paid — not trial)
    const isPaid = sub.is_unlimited || (sub.trial_used === false);
    if (!isPaid) return false; // trial_used=true means it's just a trial → not premium

    if (!sub.is_active) return false;
    if (sub.is_unlimited) return true;

    const expiresAt = new Date(sub.expires_at);
    const now = new Date();

    return expiresAt > now;
}

/**
 * Adds days to subscription
 * @param {string} guildId 
 * @param {number} days 
 */
async function addSubscriptionDays(guildId, days) {
    // First get current
    const { data: current } = await supabase
        .from('subscriptions')
        .select('expires_at')
        .eq('guild_id', guildId)
        .single();
    
    let baseDate = new Date();
    if (current && new Date(current.expires_at) > baseDate) {
        baseDate = new Date(current.expires_at);
    }

    baseDate.setDate(baseDate.getDate() + parseInt(days));

    const { error } = await supabase
        .from('subscriptions')
        .update({ 
            expires_at: baseDate.toISOString(), 
            is_active: true,
            trial_used: false, // Mark as paid, not trial
            updated_at: new Date().toISOString() 
        })
        .eq('guild_id', guildId);

    return !error;
}

/**
 * Sets unlimited subscription
 */
async function setUnlimitedSubscription(guildId, value = true) {
    const { error } = await supabase
        .from('subscriptions')
        .update({ 
            is_unlimited: value, 
            is_active: true,
            updated_at: new Date().toISOString() 
        })
        .eq('guild_id', guildId);
    return !error;
}

/**
 * Removes days from subscription
 * @param {string} guildId 
 * @param {number} days 
 */
async function removeSubscriptionDays(guildId, days) {
    const { data: current } = await supabase
        .from('subscriptions')
        .select('expires_at')
        .eq('guild_id', guildId)
        .single();
    
    if (!current) return false;

    let baseDate = new Date(current.expires_at);
    baseDate.setDate(baseDate.getDate() - parseInt(days));

    const { error } = await supabase
        .from('subscriptions')
        .update({ 
            expires_at: baseDate.toISOString(), 
            updated_at: new Date().toISOString() 
        })
        .eq('guild_id', guildId);

    return !error;
}

/**
 * Sets subscription active status
 */
async function setSubscriptionActive(guildId, value = true) {
    const { error } = await supabase
        .from('subscriptions')
        .update({ 
            is_active: value,
            updated_at: new Date().toISOString() 
        })
        .eq('guild_id', guildId);
    return !error;
}



/**
 * Checks if a user has active global premium (Vote Bypass).
 * @param {string} userId 
 */
async function isUserPremium(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('premium_until, is_unlimited')
            .eq('discord_id', userId)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') {
                console.error('[SubscriptionService] User Fetch Error:', error.message);
            }
            return false;
        }

        if (!data) return false;
        if (data.is_unlimited) return true;
        if (!data.premium_until) return false;

        const expiresAt = new Date(data.premium_until);
        const now = new Date();
        return expiresAt > now;
    } catch (err) {
        console.error('[SubscriptionService] isUserPremium Error:', err.message);
        return false;
    }
}

module.exports = {
    getSubscription,
    isSubscriptionActive,
    addSubscriptionDays,
    removeSubscriptionDays,
    setUnlimitedSubscription,
    setSubscriptionActive,
    isUserPremium,
};
