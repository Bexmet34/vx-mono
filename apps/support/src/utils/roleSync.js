/**
 * Syncs roles for a Discord member based on their status in the Supabase database.
 * @param {GuildMember} member - The Discord member to sync.
 * @param {SupabaseClient} supabase - The Supabase client instance.
 */
async function syncMemberRoles(member, supabase) {
  const { data: user, error } = await supabase
    .from('users') // Assuming 'users' table exists. Adjust table name if needed.
    .select('*')
    .eq('discord_id', member.id)
    .single();

  if (error || !user) {
    console.log(`No database entry found for ${member.user.tag}`);
    return;
  }

  const rolesToManage = {
    customer: process.env.CUSTOMER_ROLE_ID,
    premium: process.env.PREMIUM_ROLE_ID,
    unlimited: process.env.UNLIMITED_ROLE_ID,
  };

  const rolesToAdd = [];
  const rolesToRemove = [];

  // Müşteri (Customer) check - if they are in the DB, they are likely a customer
  if (rolesToManage.customer) {
    rolesToAdd.push(rolesToManage.customer);
  }

  // Premium check
  if (rolesToManage.premium) {
    const isPremium = user.premium_until && new Date(user.premium_until) > new Date();
    if (isPremium) {
      rolesToAdd.push(rolesToManage.premium);
    } else {
      rolesToRemove.push(rolesToManage.premium);
    }
  }

  // Unlimited check
  if (rolesToManage.unlimited) {
    if (user.is_unlimited) {
      rolesToAdd.push(rolesToManage.unlimited);
    } else {
      rolesToRemove.push(rolesToManage.unlimited);
    }
  }

  try {
    for (const roleId of rolesToAdd) {
      if (roleId && !member.roles.cache.has(roleId)) {
        await member.roles.add(roleId);
      }
    }
    for (const roleId of rolesToRemove) {
      if (roleId && member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
      }
    }
    console.log(`Synced roles for ${member.user.tag}`);
  } catch (err) {
    console.error(`Error syncing roles for ${member.user.tag}: ${err}`);
  }
}

module.exports = { syncMemberRoles };
