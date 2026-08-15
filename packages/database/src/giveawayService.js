const { supabase } = require('./client');

/**
 * Creates a new giveaway in database
 */
async function createGiveaway(data) {
  const { data: giveaway, error } = await supabase
    .from('giveaways')
    .insert({
      guild_id: data.guild_id,
      channel_id: data.channel_id,
      title: data.title,
      description: data.description || '',
      winner_count: data.winner_count || 1,
      backup_count: data.backup_count || 1,
      required_role_ids: data.required_role_ids || [],
      excluded_role_ids: data.excluded_role_ids || [],
      role_match_mode: data.role_match_mode || 'any',
      role_multipliers: data.role_multipliers || [],
      reward_role_id: data.reward_role_id || null,
      reward_role_duration: data.reward_role_duration || 'permanent',
      image_url: data.image_url || null,
      auto_repeat: data.auto_repeat ?? false,
      secret_fairness: data.secret_fairness ?? true,
      starts_at: data.starts_at || new Date().toISOString(),
      ends_at: data.ends_at,
      status: 'active',
      created_by: data.created_by || null
    })
    .select()
    .single();

  if (error) {
    console.error('[GiveawayService] Error creating giveaway:', error);
    throw error;
  }
  return giveaway;
}

/**
 * Updates giveaway message_id
 */
async function updateGiveawayMessageId(id, messageId) {
  const { error } = await supabase
    .from('giveaways')
    .update({ message_id: messageId })
    .eq('id', id);

  if (error) {
    console.error('[GiveawayService] Error updating message_id:', error);
  }
}

/**
 * Toggles participant in a giveaway (join / leave)
 */
async function toggleGiveawayParticipant(giveawayId, guildId, userId) {
  // Check if already joined
  const { data: existing } = await supabase
    .from('giveaway_participants')
    .select('id')
    .eq('giveaway_id', giveawayId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // Leave
    await supabase
      .from('giveaway_participants')
      .delete()
      .eq('id', existing.id);
    return { joined: false };
  } else {
    // Join
    await supabase
      .from('giveaway_participants')
      .insert({
        giveaway_id: giveawayId,
        guild_id: guildId,
        user_id: userId
      });
    return { joined: true };
  }
}

/**
 * Gets participant count for a giveaway
 */
async function getGiveawayParticipantCount(giveawayId) {
  const { count, error } = await supabase
    .from('giveaway_participants')
    .select('id', { count: 'exact', head: true })
    .eq('giveaway_id', giveawayId);

  return count || 0;
}

/**
 * Gets all active giveaways for a guild
 */
async function getActiveGiveaways(guildId) {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('guild_id', guildId)
    .eq('status', 'active')
    .order('ends_at', { ascending: true });

  return data || [];
}

/**
 * Gets all ended giveaways for a guild
 */
async function getEndedGiveaways(guildId, limit = 20) {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('guild_id', guildId)
    .in('status', ['ended', 'cancelled'])
    .order('ends_at', { ascending: false })
    .limit(limit);

  return data || [];
}

/**
 * Gets giveaway by ID
 */
async function getGiveawayById(id) {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return data;
}

/**
 * Pick winners with Smart Fairness (Akıllı Adil Dağıtım)
 */
async function pickGiveawayWinners(giveawayId, winnerCount = 1, backupCount = 1, secretFairness = true) {
  const { data: giveaway } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', giveawayId)
    .single();

  if (!giveaway) return { winners: [], backups: [] };

  // Fetch all participants
  const { data: participants } = await supabase
    .from('giveaway_participants')
    .select('user_id')
    .eq('giveaway_id', giveawayId);

  if (!participants || participants.length === 0) {
    return { winners: [], backups: [] };
  }

  let pool = participants.map(p => p.user_id);

  if (secretFairness) {
    // 14-day history check
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentWinners } = await supabase
      .from('giveaway_history')
      .select('user_id')
      .eq('guild_id', giveaway.guild_id)
      .gte('won_at', fourteenDaysAgo);

    const recentWinnerUserIds = new Set((recentWinners || []).map(w => w.user_id));

    // Split participants into priorityPool (never won recently) and fallbackPool (won recently)
    const priorityPool = pool.filter(uid => !recentWinnerUserIds.has(uid));
    const fallbackPool = pool.filter(uid => recentWinnerUserIds.has(uid));

    // Shuffle both pools
    const shuffledPriority = shuffleArray(priorityPool);
    const shuffledFallback = shuffleArray(fallbackPool);

    // Combine with priority first
    pool = [...shuffledPriority, ...shuffledFallback];
  } else {
    pool = shuffleArray(pool);
  }

  const winners = pool.slice(0, winnerCount);
  const backups = pool.slice(winnerCount, winnerCount + backupCount);

  // Record history
  for (const uid of winners) {
    await supabase.from('giveaway_history').insert({
      guild_id: giveaway.guild_id,
      user_id: uid,
      giveaway_id: giveawayId
    });
  }

  // Update giveaway status
  await supabase
    .from('giveaways')
    .update({
      status: 'ended',
      winners: winners,
      backups: backups
    })
    .eq('id', giveawayId);

  return { winners, backups };
}

/**
 * Fisher-Yates shuffle helper
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Cancels a giveaway
 */
async function cancelGiveaway(id) {
  const { error } = await supabase
    .from('giveaways')
    .update({ status: 'cancelled' })
    .eq('id', id);

  return !error;
}

module.exports = {
  createGiveaway,
  updateGiveawayMessageId,
  toggleGiveawayParticipant,
  getGiveawayParticipantCount,
  getActiveGiveaways,
  getEndedGiveaways,
  getGiveawayById,
  pickGiveawayWinners,
  cancelGiveaway
};
