/**
 * Veyronix Support Server Role Synchronization Engine
 * Auto-detects and synchronizes roles based on Supabase subscriptions, auto_premium_rules, payments, and users tables.
 * Optimized for high performance and rate-limit safety.
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

  // If Premium GM role does not exist in the server, auto-create it (Bot has Administrator permission)
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
 * Synchronizes roles for a single Discord member (On-demand / /sync / member join).
 * @param {GuildMember} member 
 * @param {SupabaseClient} supabase 
 * @param {Object} [cachedRoles] 
 * @returns {Promise<Object>} result report
 */
async function syncMemberRoles(member, supabase, cachedRoles = null) {
  if (!member || !member.guild || member.user.bot) return { success: false, reason: 'Invalid member or bot' };

  const roles = cachedRoles || await resolveSupportRoles(member.guild);
  const now = new Date();
  const userId = member.id;

  // 1. Fetch User Profile
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

  // 4. Fetch Auto Premium Rules (Kurallı Sistem)
  const { data: partnerRules } = await supabase
    .from('auto_premium_rules')
    .select('*');

  // Extract all partner server IDs from auto_premium_rules
  const partnerServerIds = new Set();
  (partnerRules || []).forEach(rule => {
    const servers = Array.isArray(rule.discord_servers) 
      ? rule.discord_servers 
      : (typeof rule.discord_servers === 'string' ? JSON.parse(rule.discord_servers || '[]') : []);
    servers.forEach(sId => partnerServerIds.add(String(sId)));
  });

  // Active subscriptions owned by this member
  const activeSubs = (ownedSubs || []).filter(s => {
    if (!s.is_active || s.trial_used) return false;
    if (s.is_unlimited) return true;
    if (!s.expires_at) return false;
    return new Date(s.expires_at) > now;
  });

  const paidPayments = payments || [];
  const hasPaidServerPayment = paidPayments.some(p => p.plan_type === 'server' || !p.plan_type);
  const hasPaidUserPayment = paidPayments.some(p => p.plan_type === 'user');

  // Check if member owns any server that is in auto_premium_rules (Kurallı Partner GM)
  const isRulePartnerGM = (ownedSubs || []).some(s => partnerServerIds.has(String(s.guild_id)));

  const targetRoles = new Set();
  const candidateRoles = new Set();

  // A. Verified User Role (All verified members in support server)
  if (roles.verifiedUser) {
    candidateRoles.add(roles.verifiedUser.id);
    targetRoles.add(roles.verifiedUser.id);
  }

  // B. GM Roles
  if (roles.premiumGm) candidateRoles.add(roles.premiumGm.id);
  if (roles.partneredGm) candidateRoles.add(roles.partneredGm.id);
  if (roles.partnerAccess) candidateRoles.add(roles.partnerAccess.id);

  if (activeSubs.length > 0 || isRulePartnerGM) {
    if (hasPaidServerPayment && !isRulePartnerGM) {
      // Parasıyla Sunucu Premium alan GM
      if (roles.premiumGm) targetRoles.add(roles.premiumGm.id);
    } else {
      // Kurallı / Sponsorluk / Partnerlik ile Premium alan GM
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
    if (user?.has_voted || (user?.vote_until && new Date(user.vote_until) > now)) {
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
    isPaidGM: targetRoles.has(roles.premiumGm?.id),
    isPartnerGM: targetRoles.has(roles.partneredGm?.id),
    isIndividualSupporter: targetRoles.has(roles.individualSupporter?.id)
  };
}

/**
 * Synchronizes all members in the Discord support guild in bulk.
 * Uses batch fetching and in-memory indexing to be ultra-fast and lightweight.
 * @param {Guild} guild 
 * @param {SupabaseClient} supabase 
 * @returns {Promise<Object>} Summary of sync
 */
async function syncAllGuildMembers(guild, supabase) {
  if (!guild) return { success: false, reason: 'Guild not found' };

  console.log(`[RoleSync] Starting batch member role sweep for guild: ${guild.name} (${guild.id})...`);
  const roles = await resolveSupportRoles(guild);
  const now = new Date();

  // 1. Batch fetch all required database tables once
  const [
    { data: allRules },
    { data: allSubs },
    { data: allPayments },
    { data: allUsers }
  ] = await Promise.all([
    supabase.from('auto_premium_rules').select('*'),
    supabase.from('subscriptions').select('*'),
    supabase.from('crypto_payments').select('*').eq('status', 'paid'),
    supabase.from('users').select('*')
  ]);

  // Index: Partner Discord Servers from Kurallı Sistem
  const partnerServerIds = new Set();
  (allRules || []).forEach(rule => {
    const servers = Array.isArray(rule.discord_servers) 
      ? rule.discord_servers 
      : (typeof rule.discord_servers === 'string' ? JSON.parse(rule.discord_servers || '[]') : []);
    servers.forEach(sId => partnerServerIds.add(String(sId)));
  });

  // Index: Partner GMs vs Paid GMs
  const paidServerUserIds = new Set();
  const paidServerGuildIds = new Set();
  const paidUserPlanUserIds = new Set();

  (allPayments || []).forEach(p => {
    if (p.plan_type === 'user') {
      if (p.user_id) paidUserPlanUserIds.add(p.user_id);
    } else {
      if (p.user_id) paidServerUserIds.add(p.user_id);
      if (p.guild_id) paidServerGuildIds.add(String(p.guild_id));
    }
  });

  const partnerGmUserIds = new Set();
  const paidGmUserIds = new Set();

  (allSubs || []).forEach(sub => {
    if (!sub.owner_id) return;
    const isServerPartner = partnerServerIds.has(String(sub.guild_id));

    if (isServerPartner) {
      partnerGmUserIds.add(sub.owner_id);
    } else {
      // Active check
      const isActive = sub.is_active && !sub.trial_used && (sub.is_unlimited || (sub.expires_at && new Date(sub.expires_at) > now));
      if (isActive) {
        const isPaid = paidServerUserIds.has(sub.owner_id) || paidServerGuildIds.has(String(sub.guild_id));
        if (isPaid) {
          paidGmUserIds.add(sub.owner_id);
        } else {
          partnerGmUserIds.add(sub.owner_id);
        }
      }
    }
  });

  // Index: Individual Supporter User IDs
  const individualSupporterUserIds = new Set();
  const vipVoterUserIds = new Set();

  (allUsers || []).forEach(u => {
    if (!u.discord_id) return;
    const isPremium = u.is_unlimited || (u.premium_until && new Date(u.premium_until) > now) || paidUserPlanUserIds.has(u.discord_id);
    if (isPremium) individualSupporterUserIds.add(u.discord_id);
    if (u.has_voted || (u.vote_until && new Date(u.vote_until) > now)) vipVoterUserIds.add(u.discord_id);
  });

  // Fetch all guild members
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

    const targetRoles = new Set();
    const candidateRoles = new Set();

    // A. Verified User
    if (roles.verifiedUser) {
      candidateRoles.add(roles.verifiedUser.id);
      targetRoles.add(roles.verifiedUser.id);
    }

    // B. GM Roles
    if (roles.premiumGm) candidateRoles.add(roles.premiumGm.id);
    if (roles.partneredGm) candidateRoles.add(roles.partneredGm.id);
    if (roles.partnerAccess) candidateRoles.add(roles.partnerAccess.id);

    if (paidGmUserIds.has(member.id)) {
      if (roles.premiumGm) targetRoles.add(roles.premiumGm.id);
    } else if (partnerGmUserIds.has(member.id)) {
      if (roles.partneredGm) targetRoles.add(roles.partneredGm.id);
      if (roles.partnerAccess) targetRoles.add(roles.partnerAccess.id);
    }

    // C. Individual Supporter
    if (roles.individualSupporter) {
      candidateRoles.add(roles.individualSupporter.id);
      if (individualSupporterUserIds.has(member.id)) {
        targetRoles.add(roles.individualSupporter.id);
      }
    }

    // D. VIP Voter
    if (roles.vipVoter) {
      candidateRoles.add(roles.vipVoter.id);
      if (vipVoterUserIds.has(member.id)) {
        targetRoles.add(roles.vipVoter.id);
      }
    }

    // Calculate changes
    const currentRoleIds = new Set(member.roles.cache.keys());
    const toAdd = [];
    const toRemove = [];

    for (const rId of candidateRoles) {
      if (targetRoles.has(rId)) {
        if (!currentRoleIds.has(rId)) toAdd.push(rId);
      } else {
        if (currentRoleIds.has(rId)) toRemove.push(rId);
      }
    }

    // Apply only if there is a delta
    if (toAdd.length > 0 || toRemove.length > 0) {
      try {
        if (toAdd.length > 0) {
          await member.roles.add(toAdd);
          addedTotal += toAdd.length;
        }
        if (toRemove.length > 0) {
          await member.roles.remove(toRemove);
          removedTotal += toRemove.length;
        }
        // Polite delay (100ms) only when Discord API role change is performed
        await new Promise(res => setTimeout(res, 100));
      } catch (err) {
        console.error(`[RoleSync] Error modifying roles for ${member.user.tag}:`, err.message);
      }
    }

    syncedCount++;
  }

  console.log(`[RoleSync] Batch sweep complete. Members: ${syncedCount}, Added: ${addedTotal}, Removed: ${removedTotal}`);
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
