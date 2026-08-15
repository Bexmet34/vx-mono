const { supabase } = require('./client');

const dropSettingsCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Get drop settings for a guild (creates default if not exists)
 */
async function getDropSettings(guildId) {
  if (!guildId) return null;
  const cached = dropSettingsCache.get(guildId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('drop_settings')
    .select('*')
    .eq('guild_id', guildId)
    .maybeSingle();

  if (error) {
    console.error('[DropService] Error fetching drop settings:', error);
    return null;
  }

  dropSettingsCache.set(guildId, { data, timestamp: Date.now() });
  return data;
}

/**
 * Upsert (create or update) drop settings for a guild
 */
async function upsertDropSettings(guildId, updates) {
  const { data, error } = await supabase
    .from('drop_settings')
    .upsert({ guild_id: guildId, ...updates }, { onConflict: 'guild_id' })
    .select()
    .single();

  if (error) {
    console.error('[DropService] Error upserting drop settings:', error);
    throw error;
  }

  dropSettingsCache.delete(guildId);
  return data;
}

/**
 * Create a new drop log entry (returns the new log record with its ID for the claim step)
 */
async function createDropLog(data) {
  const { data: log, error } = await supabase
    .from('drop_logs')
    .insert({
      guild_id:     data.guild_id,
      channel_id:   data.channel_id,
      message_id:   data.message_id || null,
      trigger_type: data.trigger_type,
      reward_type:  data.reward_type,
      reward_amount: data.reward_amount || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[DropService] Error creating drop log:', error);
    throw error;
  }

  return log;
}

/**
 * Update drop log with Discord message_id after the embed is sent
 */
async function updateDropMessageId(dropId, messageId) {
  const { error } = await supabase
    .from('drop_logs')
    .update({ message_id: messageId })
    .eq('id', dropId);

  if (error) {
    console.error('[DropService] Error updating drop message_id:', error);
  }
}

/**
 * Atomic claim — uses the claim_drop RPC function
 * Returns true if this user successfully claimed, false if someone else already did
 */
async function claimDrop(dropId, userId) {
  const { data, error } = await supabase.rpc('claim_drop', {
    p_drop_id: dropId,
    p_user_id: userId,
  });

  if (error) {
    console.error('[DropService] Error in claimDrop RPC:', error);
    return false;
  }

  return data === true;
}

/**
 * Get drop log by ID (to check claim status)
 */
async function getDropLog(dropId) {
  const { data } = await supabase
    .from('drop_logs')
    .select('*')
    .eq('id', dropId)
    .maybeSingle();

  return data;
}

/**
 * Get recent drop history for a guild
 */
async function getDropHistory(guildId, limit = 20) {
  const { data } = await supabase
    .from('drop_logs')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

module.exports = {
  getDropSettings,
  upsertDropSettings,
  createDropLog,
  updateDropMessageId,
  claimDrop,
  getDropLog,
  getDropHistory,
};
