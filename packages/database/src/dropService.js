const { supabase } = require('./client');

// Bellek içi cache (performans için)
const dropSettingsCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 dakika

// ─── drop_settings ────────────────────────────────────────────────────────────

/**
 * Sunucunun drop ayarlarını getirir
 */
async function getDropSettings(guildId) {
  const cached = dropSettingsCache.get(guildId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
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
    .upsert({ guild_id: guildId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'guild_id' })
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
  const { data: created, error } = await supabase
    .from('drop_logs')
    .insert([{
      guild_id:      data.guild_id,
      channel_id:    data.channel_id,
      trigger_type:  data.trigger_type  || 'scheduled',
      drop_code:     data.drop_code     || null,
      expires_at:    data.expires_at    || null,
      points_given:  data.points_given  || 10,
      reward_type:   data.reward_type   || 'points',
      status:        'active',
      created_at:    new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('[DropService] Error creating drop log:', error);
    throw error;
  }

  return created;
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
 * Kodu ilk yazan kullanıcıya drop'u atar (atomik RPC veya direkt güvenli fallback).
 * Returns true = kazandı, false = zaten kapılmış / süresi geçmiş
 */
async function claimDropByCode(code, guildId, channelId, userId) {
  try {
    const { data, error } = await supabase.rpc('claim_drop_by_code', {
      p_code:       code,
      p_user_id:    userId,
      p_guild_id:   guildId,
      p_channel_id: channelId,
    });

    if (!error && typeof data === 'boolean') {
      return data;
    }
  } catch (rpcErr) {
    // RPC tanımlı değilse devam et ve fallback uygula
  }

  // Güvenli veritabanı fallback mantığı
  try {
    const { data: activeLog } = await supabase
      .from('drop_logs')
      .select('id, winner_user_id, expires_at')
      .eq('drop_code', code)
      .eq('guild_id', guildId)
      .eq('channel_id', channelId)
      .is('winner_user_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!activeLog) return false;
    if (activeLog.expires_at && new Date(activeLog.expires_at) < new Date()) return false;

    const { data: updated, error: updateErr } = await supabase
      .from('drop_logs')
      .update({ winner_user_id: userId, claimed_at: new Date().toISOString(), status: 'claimed' })
      .eq('id', activeLog.id)
      .is('winner_user_id', null)
      .select();

    return !updateErr && updated && updated.length > 0;
  } catch (fallbackErr) {
    console.error('[DropService] claimDropByCode fallback error:', fallbackErr);
    return false;
  }
}

// ─── Puan sistemi ─────────────────────────────────────────────────────────────

/**
 * Kullanıcıya puan ekler (RPC veya direkt güvenli upsert fallback)
 */
async function addDropPoints(guildId, userId, points = 10) {
  try {
    const { error } = await supabase.rpc('add_drop_points', {
      p_guild_id: guildId,
      p_user_id:  userId,
      p_points:   points,
    });

    if (!error) return;
  } catch (rpcErr) {
    // RPC hatasında fallback'e geç
  }

  try {
    const { data: existing } = await supabase
      .from('drop_points')
      .select('total_points, win_count')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('drop_points')
        .update({
          total_points: (existing.total_points || 0) + points,
          win_count: (existing.win_count || 0) + 1,
          last_win_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('guild_id', guildId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('drop_points')
        .insert([{
          guild_id: guildId,
          user_id: userId,
          total_points: points,
          win_count: 1,
          last_win_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
    }
  } catch (fallbackErr) {
    console.error('[DropService] addDropPoints fallback error:', fallbackErr);
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

/**
 * Sunucunun drop liderlik tablosunu sayfalama (pagination) ile getirir
 */
async function getDropLeaderboardPaginated(guildId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const { count, error: countError } = await supabase
    .from('drop_points')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', guildId);

  if (countError) {
    console.error('[DropService] getDropLeaderboardPaginated count error:', countError);
    return { data: [], total: 0 };
  }

  const { data, error } = await supabase
    .from('drop_points')
    .select('user_id, total_points, win_count, last_win_at')
    .eq('guild_id', guildId)
    .order('total_points', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[DropService] getDropLeaderboardPaginated data error:', error);
    return { data: [], total: count || 0 };
  }

  return { data: data || [], total: count || 0 };
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
  getDropLeaderboardPaginated,
};
