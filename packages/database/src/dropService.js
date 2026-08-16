const { supabase } = require('./client');

const dropSettingsCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 saniye

// ─── drop_settings ────────────────────────────────────────────────────────────

/**
 * Sunucunun drop ayarlarını getirir
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
 * Drop ayarlarını oluştur ya da güncelle (upsert)
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

// ─── drop_logs ────────────────────────────────────────────────────────────────

/**
 * Yeni drop log kaydı oluşturur (v2: drop_code, expires_at, points_given eklendi)
 */
async function createDropLog(data) {
  const { data: log, error } = await supabase
    .from('drop_logs')
    .insert({
      guild_id:      data.guild_id,
      channel_id:    data.channel_id,
      message_id:    data.message_id    || null,
      trigger_type:  data.trigger_type,
      drop_code:     data.drop_code     || null,
      expires_at:    data.expires_at    || null,
      points_given:  data.points_given  || 0,
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
 * Drop log kaydına Discord message_id yazar
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
 * ID ile drop log'u getirir
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
 * Sunucunun son drop geçmişini getirir
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

// ─── Kod ile atomik claim ─────────────────────────────────────────────────────

/**
 * Kodu ilk yazan kullanıcıya drop'u atar (atomik RPC).
 * Returns true = kazandı, false = zaten kapılmış / süresi geçmiş
 */
async function claimDropByCode(code, guildId, channelId, userId) {
  const { data, error } = await supabase.rpc('claim_drop_by_code', {
    p_code:       code,
    p_user_id:    userId,
    p_guild_id:   guildId,
    p_channel_id: channelId,
  });

  if (error) {
    console.error('[DropService] claimDropByCode RPC error:', error);
    return false;
  }

  return data === true;
}

// ─── Puan sistemi ─────────────────────────────────────────────────────────────

/**
 * Kullanıcıya puan ekler (UPSERT RPC)
 */
async function addDropPoints(guildId, userId, points) {
  const { error } = await supabase.rpc('add_drop_points', {
    p_guild_id: guildId,
    p_user_id:  userId,
    p_points:   points,
  });

  if (error) {
    console.error('[DropService] addDropPoints RPC error:', error);
  }
}

/**
 * Kullanıcının drop puanını getirir
 */
async function getUserDropPoints(guildId, userId) {
  const { data, error } = await supabase
    .from('drop_points')
    .select('total_points, win_count, last_win_at')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[DropService] getUserDropPoints error:', error);
    return null;
  }

  return data;
}

/**
 * Sunucunun drop liderlik tablosunu getirir (en iyi N kullanıcı)
 */
async function getDropLeaderboard(guildId, limit = 10) {
  const { data, error } = await supabase
    .from('drop_points')
    .select('user_id, total_points, win_count, last_win_at')
    .eq('guild_id', guildId)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DropService] getDropLeaderboard error:', error);
    return [];
  }

  return data || [];
}

module.exports = {
  // Settings
  getDropSettings,
  upsertDropSettings,
  // Logs
  createDropLog,
  updateDropMessageId,
  getDropLog,
  getDropHistory,
  // Claim
  claimDropByCode,
  // Points
  addDropPoints,
  getUserDropPoints,
  getDropLeaderboard,
};
