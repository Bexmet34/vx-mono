/**
 * Veyronix Support Server Role Synchronization Engine
 * Auto-detects and synchronizes roles based on Supabase subscriptions, payments, and users tables.
 */

// Helper to find a role by name (fuzzy match) or ID
function findRole(guild, keywords, fallbackEnvId) {
  if (fallbackEnvId) {
    const byId = guild.roles.cache.get(fallbackEnvId);
    if (byId) return byId;
  }

  const keywordList = Array.isArray(keywords) ? keywords : [keywords];
  return guild.roles.cache.find(role => {
    const lowerName = role.name.toLowerCase();
    return keywordList.some(k => lowerName.includes(k.toLowerCase()));
  });
}

/**
 * Resolves or auto-creates required roles in the Discord Support Server.
 * @param {Guild} guild 
 * @returns {Promise<Object>} Map of resolved roles
 */
async function resolveSupportRoles(guild) {
  const roles = {
    supportStaff: findRole(guild, ['support staff', 'staff ekibi', 'destek ekibi'], process.env.STAFF_ROLE_ID),
    premiumGm: findRole(guild, ['premium gm', 'server premium owner', 'ücretli gm', 'paid gm']),
    partneredGm: findRole(guild, ['partnered gm', 'partner gm', 'anlaşmalı gm']),
    individualSupporter: findRole(guild, ['individual supporter', 'bireysel destekçi', 'supporter', 'bireysel premium'], process.env.PREMIUM_ROLE_ID),
    partnerAccess: findRole(guild, ['partner access', 'partner erişim', 'partner']),
    vipVoter: findRole(guild, ['vip voter role', 'vip voter', 'voter', 'oy veren']),
    verifiedUser: findRole(guild, ['verified user', 'verified', 'doğrulanmış'], process.env.CUSTOMER_ROLE_ID),
  };

  // If Premium GM role does not exist in the server, auto-create it
  if (!roles.premiumGm) {
    try {
      const created = await guild.roles.create({
        name: '👑 Premium GM',
        color: '#f59e0b',
        hoist: true,
        reason: 'Auto-created by Veyronix Support Bot for Paid Server Owners (Guild Masters)'
      });
      roles.premiumGm = created;
      console.log(`[RoleSync] Auto-created missing role: "👑 Premium GM" (${created.id})`);
    } catch (err) {
      console.warn(`[RoleSync] Could not auto-create "👑 Premium GM" role: ${err.message}`);
    }
  }

  return roles;
}

/**
 * Synchronizes roles for a single Discord member.
 * @param {GuildMember} member 
 * @param {SupabaseClient} supabase 
 * @param {Object} [cachedRoles] 
 * @returns {Promise<Object>} result report
 */
async function syncMemberRoles(member, supabase, cachedRoles = null) {
  if (!member || !member.guild) return { success: false, reason: 'Invalid member' };

  const roles = cachedRoles || await resolveSupportRoles(member.guild);
  const now = new Date();
  const userId = member.id;

  // 1. Fetch User Data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('discord_id', userId)
    .maybeSingle();

  // 2. Fetch Guild Subscriptions owned by this user
  const { data: ownedSubs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', userId);

  // 3. Fetch Payments made by this user
  const { data: payments } = await supabase
    .from('crypto_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'paid');

  // 4. Fetch Auto Premium / Partner Rules
  const { data: partnerRules } = await supabase
    .from('auto_premium_rules')
    .select('*');

  const activeSubs = (ownedSubs || []).filter(s => {
    if (!s.is_active || s.trial_used) return false;
    if (s.is_unlimited) return true;
    if (!s.expires_at) return false;
    return new Date(s.expires_at) > now;
  });

  const paidPayments = payments || [];
  const hasPaidServerPayment = paidPayments.some(p => p.plan_type === 'server' || !p.plan_type);
  const hasPaidUserPayment = paidPayments.some(p => p.plan_type === 'user');

  const targetRoles = new Set();
  const candidateRoles = new Set();

  // A. Verified User Role (All verified members in support server)
  if (roles.verifiedUser) {
    candidateRoles.add(roles.verifiedUser.id);
    targetRoles.add(roles.verifiedUser.id);
  }

  // B. Premium GM vs Partnered GM Check
  if (roles.premiumGm) candidateRoles.add(roles.premiumGm.id);
  if (roles.partneredGm) candidateRoles.add(roles.partneredGm.id);
  if (roles.partnerAccess) candidateRoles.add(roles.partnerAccess.id);

  if (activeSubs.length > 0) {
    // Check if the subscription was acquired by paid payment
    if (hasPaidServerPayment) {
      if (roles.premiumGm) targetRoles.add(roles.premiumGm.id);
    } else {
      // Free / Sponsored / Partnered GM
      if (roles.partneredGm) targetRoles.add(roles.partneredGm.id);
      if (roles.partnerAccess) targetRoles.add(roles.partnerAccess.id);
    }
  }

  // C. Individual Supporter (Bireysel Premium / Oylama Muafiyeti)
  if (roles.individualSupporter) {
    candidateRoles.add(roles.individualSupporter.id);
    const hasActiveUserPlan = user && (user.is_unlimited || (user.premium_until && new Date(user.premium_until) > now));
    if (hasActiveUserPlan || hasPaidUserPayment) {
      targetRoles.add(roles.individualSupporter.id);
    }
  }

  // D. VIP Voter Role Check
  if (roles.vipVoter) {
    candidateRoles.add(roles.vipVoter.id);
    // If user has vote flag or active vote record
    if (user?.has_voted || user?.vote_until && new Date(user.vote_until) > now) {
      targetRoles.add(roles.vipVoter.id);
    }
  }

  // Calculate Additions and Removals
  const currentRoleIds = new Set(member.roles.cache.keys());
  const rolesToAdd = [];
  const rolesToRemove = [];

  for (const roleId of candidateRoles) {
    if (targetRoles.has(roleId)) {
      if (!currentRoleIds.has(roleId)) {
        rolesToAdd.push(roleId);
      }
    } else {
      if (currentRoleIds.has(roleId)) {
        // Only remove if it is one of our managed candidate roles and not staff/admin
        rolesToRemove.push(roleId);
      }
    }
  }

  // Apply Changes
  const addedNames = [];
  const removedNames = [];

  if (rolesToAdd.length > 0) {
    await member.roles.add(rolesToAdd).catch(err => console.error(`[RoleSync] Error adding roles to ${member.user.tag}:`, err.message));
    rolesToAdd.forEach(id => {
      const r = member.guild.roles.cache.get(id);
      if (r) addedNames.push(r.name);
    });
  }

  if (rolesToRemove.length > 0) {
    await member.roles.remove(rolesToRemove).catch(err => console.error(`[RoleSync] Error removing roles from ${member.user.tag}:`, err.message));
    rolesToRemove.forEach(id => {
      const r = member.guild.roles.cache.get(id);
      if (r) removedNames.push(r.name);
    });
  }

  return {
    success: true,
    memberTag: member.user.tag,
    added: addedNames,
    removed: removedNames,
    activeSubsCount: activeSubs.length,
    isPaidGM: hasPaidServerPayment && activeSubs.length > 0,
    isPartnerGM: !hasPaidServerPayment && activeSubs.length > 0,
    isIndividualSupporter: targetRoles.has(roles.individualSupporter?.id)
  };
}

/**
 * Synchronizes all members in the Discord support guild in bulk.
 * @param {Guild} guild 
 * @param {SupabaseClient} supabase 
 * @returns {Promise<Object>} Summary of sync
 */
async function syncAllGuildMembers(guild, supabase) {
  if (!guild) return { success: false, reason: 'Guild not found' };

  console.log(`[RoleSync] Starting bulk member role sync for guild: ${guild.name} (${guild.id})...`);
  const roles = await resolveSupportRoles(guild);

  let members;
  try {
    members = await guild.members.fetch();
  } catch (e) {
    console.error('[RoleSync] Failed to fetch guild members:', e.message);
    return { success: false, error: e.message };
  }

  let syncedCount = 0;
  let addedTotal = 0;
  let removedTotal = 0;

  for (const [id, member] of members) {
    if (member.user.bot) continue;
    try {
      const result = await syncMemberRoles(member, supabase, roles);
      if (result.added.length > 0 || result.removed.length > 0) {
        addedTotal += result.added.length;
        removedTotal += result.removed.length;
        console.log(`[RoleSync] ${member.user.tag} -> Added: [${result.added.join(', ')}], Removed: [${result.removed.join(', ')}]`);
      }
      syncedCount++;
      // Sleep 50ms to prevent Discord rate-limits
      await new Promise(res => setTimeout(res, 50));
    } catch (err) {
      console.error(`[RoleSync] Error syncing member ${member.user.tag}:`, err.message);
    }
  }

  console.log(`[RoleSync] Bulk sync complete. Total Members Checked: ${syncedCount}, Total Roles Added: ${addedTotal}, Total Roles Removed: ${removedTotal}`);
  return {
    success: true,
    totalMembers: syncedCount,
    rolesAdded: addedTotal,
    rolesRemoved: removedTotal
  };
}

module.exports = {
  resolveSupportRoles,
  syncMemberRoles,
  syncAllGuildMembers
};
