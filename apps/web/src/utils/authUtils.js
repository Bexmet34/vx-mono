import { supabase } from "@/utils/supabase";

/**
 * Checks if a user has access to a specific dashboard.
 * @param {string} guildId - The Discord Guild ID
 * @param {string} userId - The Discord User ID
 * @returns {Promise<{ hasAccess: boolean, isOwner: boolean, subscription: any }>}
 */
export async function checkDashboardAccess(guildId, userId) {
  if (!guildId || !userId) {
    return { hasAccess: false, isOwner: false, subscription: null };
  }

  try {
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (error || !sub) {
      return { hasAccess: false, isOwner: false, subscription: null };
    }

    const isOwner = sub.owner_id === userId;
    
    // Parse authorized_users safely
    let authorizedUsers = [];
    if (sub.authorized_users) {
        if (Array.isArray(sub.authorized_users)) {
            authorizedUsers = sub.authorized_users;
        } else if (typeof sub.authorized_users === 'string') {
            try {
                // In case it's stringified JSON array
                authorizedUsers = JSON.parse(sub.authorized_users);
            } catch(e) {
                // If it's a PostgreSQL text[] returned as string like '{123,456}'
                const stripped = sub.authorized_users.replace(/^{|}$/g, '');
                if (stripped) {
                    authorizedUsers = stripped.split(',');
                }
            }
        }
    }

    const isAuthorized = authorizedUsers.includes(userId);

    if (isOwner || isAuthorized) {
      return { hasAccess: true, isOwner, subscription: sub };
    }

    return { hasAccess: false, isOwner: false, subscription: null };

  } catch (err) {
    console.error('[authUtils] Error checking access:', err);
    return { hasAccess: false, isOwner: false, subscription: null };
  }
}
