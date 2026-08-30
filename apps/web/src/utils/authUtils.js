import { supabase } from '@veyronix/database';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

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

  const isSuperAdmin = userId === ADMIN_ID || userId === ADMIN_ID_2;

  try {
    // 1. Check Subscriptions table
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (sub) {
      const isOwner = sub.owner_id === userId || isSuperAdmin;
      
      // Parse authorized_users safely
      let authorizedUsers = [];
      if (sub.authorized_users) {
        if (Array.isArray(sub.authorized_users)) {
          authorizedUsers = sub.authorized_users;
        } else if (typeof sub.authorized_users === 'string') {
          try {
            authorizedUsers = JSON.parse(sub.authorized_users);
          } catch(e) {
            const stripped = sub.authorized_users.replace(/^{|}$/g, '');
            if (stripped) {
              authorizedUsers = stripped.split(',');
            }
          }
        }
      }

      const isAuthorized = authorizedUsers.includes(userId);

      if (isOwner || isAuthorized || isSuperAdmin) {
        // If owner_id was missing on existing sub, update it
        if (!sub.owner_id && (isOwner || isSuperAdmin)) {
          await supabase.from('subscriptions').update({ owner_id: userId }).eq('guild_id', guildId);
          sub.owner_id = userId;
        }
        return { hasAccess: true, isOwner, subscription: sub };
      }
    }

    // 2. Check guild_settings table fallback
    const { data: gsData } = await supabase
      .from('guild_settings')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    const isGuildSettingsOwner = gsData && gsData.owner_id === userId;

    // 3. Check Bot Guilds fallback
    let isBotGuildOwner = false;
    let botGuildName = gsData?.albion_guild_name || 'Sunucu';

    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3005';
      const botRes = await fetch(`${botApiUrl}/api/bot-guilds`);
      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData?.success && Array.isArray(botData.guilds)) {
          const matchedGuild = botData.guilds.find(g => g.id === guildId);
          if (matchedGuild) {
            botGuildName = matchedGuild.name || botGuildName;
            if (matchedGuild.owner_id === userId) {
              isBotGuildOwner = true;
            }
          }
        }
      }
    } catch (botErr) {
      console.error('[authUtils] Bot API fetch error:', botErr.message);
    }

    // 4. Auto-heal: If user is verified owner or Super Admin, create default freemium subscription
    if (isGuildSettingsOwner || isBotGuildOwner || isSuperAdmin) {
      const autoSub = {
        guild_id: guildId,
        guild_name: sub?.guild_name || botGuildName,
        owner_id: userId,
        expires_at: sub?.expires_at || new Date().toISOString(),
        is_active: true,
        is_unlimited: false,
        unlimited_party: false,
        trial_used: true,
        authorized_users: []
      };

      try {
        await supabase
          .from('subscriptions')
          .upsert(autoSub, { onConflict: 'guild_id' });
      } catch (upsertErr) {
        console.error('[authUtils] Auto-heal subscription upsert error:', upsertErr.message);
      }

      return { hasAccess: true, isOwner: true, subscription: autoSub };
    }

    return { hasAccess: false, isOwner: false, subscription: null };

  } catch (err) {
    console.error('[authUtils] Error checking access:', err);
    return { hasAccess: false, isOwner: false, subscription: null };
  }
}
