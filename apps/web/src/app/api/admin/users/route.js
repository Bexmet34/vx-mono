import { LINKS } from '@veyronix/config';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllUsers, getUserProfile, upsertUser, updateUser, deleteUser, queueMessage, getParsedTemplate } from '@veyronix/database';
import { getDiscordUser } from '@/lib/discordApi';

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);



async function _getParsedTemplateWrapper(templateId, placeholders = {}) {
  // Use the service's getParsedTemplate
  return getParsedTemplate(templateId, placeholders);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await getAllUsers();
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fast parallel enrichment with timeouts using Promise.allSettled
  const results = await Promise.allSettled((data || []).map(async (u) => {
    let discordProfile = { username: `Kullanıcı (${u.discord_id})`, avatar_url: null };
    try {
      const data = await getDiscordUser(u.discord_id);
      let avatarUrl = null;
      if (data.avatar) {
        const isGif = data.avatar.startsWith('a_');
        avatarUrl = `https://cdn.discordapp.com/avatars/${u.discord_id}/${data.avatar}.${isGif ? 'gif' : 'png'}`;
      } else {
        const defaultIdx = Number((BigInt(u.discord_id) >> 22n) % 6n);
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
      }
      discordProfile = {
        username: data.global_name || data.username || `Kullanıcı (${u.discord_id})`,
        avatar_url: avatarUrl
      };
    } catch (e) {}
    
    let mutualGuilds = [];
    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3005';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const botRes = await fetch(`${botApiUrl}/api/mutual-guilds/${u.discord_id}`, {
        signal: controller.signal,
        next: { revalidate: 300 }
      });
      clearTimeout(timeoutId);
      if (botRes.ok) {
        const botData = await botRes.json();
        if (botData?.success && Array.isArray(botData.guilds)) {
          mutualGuilds = botData.guilds;
        }
      }
    } catch (botErr) {}

    return {
      ...u,
      username: discordProfile.username,
      avatar_url: discordProfile.avatar_url,
      mutual_guilds: mutualGuilds
    };
  }));

  const usersWithProfiles = results.map((res, index) => {
    if (res.status === 'fulfilled') return res.value;
    const u = data[index];
    return {
      ...u,
      username: `Kullanıcı (${u.discord_id})`,
      avatar_url: null,
      mutual_guilds: []
    };
  });

  return NextResponse.json(usersWithProfiles);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { discord_id, duration_days, is_unlimited } = await req.json();

    if (!discord_id) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }

    // Check if user already exists
    let userProfile = null;
    try {
      userProfile = await getUserProfile(discord_id);
    } catch (e) {}

    let updateData = { discord_id };
    let expiryDateStr = "";

    if (is_unlimited) {
      updateData.is_unlimited = true;
      updateData.premium_until = null;
    } else {
      const days = parseInt(duration_days) || 0;
      const now = new Date();
      let currentExpiry = now;

      if (userProfile && userProfile.premium_until) {
        const profileExpiry = new Date(userProfile.premium_until);
        if (profileExpiry > now) {
          currentExpiry = profileExpiry;
        }
      }

      currentExpiry.setDate(currentExpiry.getDate() + days);
      updateData.is_unlimited = false;
      updateData.premium_until = currentExpiry.toISOString();
      expiryDateStr = currentExpiry.toLocaleDateString('tr-TR');
    }

    try {
      await upsertUser(updateData);
    } catch (upsertError) {
      throw upsertError;
    }

    // Queue DM notification to User (Stacked EN top / TR bottom format)
    try {
      let embedTitle = is_unlimited 
        ? "💎 Veyronix Premium Activated / Aktif Edildi!" 
        : "✨ Veyronix Premium Activated / Aktif Edildi!";
      
      let embedDescription = "";
      if (is_unlimited) {
        embedDescription = 
          `🇬🇧 **Unlimited Premium Activated!**\n` +
          `Your individual premium subscription has been defined as Unlimited (Lifetime).\n` +
          `• **Status:** Active (Unlimited / Lifetime)\n` +
          `• **Expiration Date:** Never (Lifetime Access)\n` +
          `• **Top.gg Vote Requirement:** Permanently Removed\n` +
          `• **Website:** ${LINKS.WEBSITE}/\n` +
          `• **Support Server:** ${LINKS.SUPPORT_SERVER}\n\n` +
          `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +
          `🇹🇷 **Sınırsız Premium Aktif Edildi!**\n` +
          `Bireysel premium aboneliğiniz Ömür Boyu Sınırsız olarak tanımlandı.\n` +
          `• **Durum:** Aktif (Sınırsız / Ömür Boyu)\n` +
          `• **Son Kullanma Tarihi:** Süresiz (Ömür Boyu)\n` +
          `• **Top.gg Oy Verme Zorunluluğu:** Süresiz Kaldırıldı\n` +
          `• **Web Sitesi:** ${LINKS.WEBSITE}/\n` +
          `• **Destek Sunucusu:** ${LINKS.SUPPORT_SERVER}`;
      } else {
        embedDescription = 
          `🇬🇧 **Premium Subscription Activated!**\n` +
          `Your individual premium subscription has been defined by the Administrator.\n` +
          `• **Status:** Active (+${duration_days} Days Extended)\n` +
          `• **Expiration Date:** ${expiryDateStr}\n` +
          `• **Top.gg Vote Requirement:** Removed\n` +
          `• **Website:** ${LINKS.WEBSITE}/\n` +
          `• **Support Server:** ${LINKS.SUPPORT_SERVER}\n\n` +
          `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +
          `🇹🇷 **Premium Aboneliği Aktif Edildi!**\n` +
          `Bireysel premium aboneliğiniz Yönetici tarafından tanımlandı.\n` +
          `• **Durum:** Aktif (+${duration_days} Gün Uzatıldı)\n` +
          `• **Son Kullanma Tarihi:** ${expiryDateStr}\n` +
          `• **Top.gg Oy Verme Zorunluluğu:** Kaldırıldı\n` +
          `• **Web Sitesi:** ${LINKS.WEBSITE}/\n` +
          `• **Destek Sunucusu:** ${LINKS.SUPPORT_SERVER}`;
      }

      await queueMessage({
        owner_id: discord_id,
        message_content: JSON.stringify({
          embeds: [{
            title: embedTitle,
            description: embedDescription,
            color: is_unlimited ? 0xfca311 : 0x2ecc71,
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (queueErr) {
      console.error("[Admin Users POST] Error queueing DM notification:", queueErr.message);
    }

    return NextResponse.json({ success: true, user: updateData });
  } catch (error) {
    console.error("Admin Users POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { discord_id, action, value } = await req.json();

    if (!discord_id || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    let userProfile = null;
    try {
      userProfile = await getUserProfile(discord_id);
    } catch (fetchError) {
      console.error(`[AdminAPI] Fetch Error: ${fetchError?.message}`);
    }

    if (!userProfile) {
      userProfile = { discord_id: discord_id, premium_until: null, is_unlimited: false };
    }

    let updateData = {};
    let isUnlimited = false;
    let newExpiryDate = null;
    let actionType = 'extended';

    if (action === 'toggle_unlimited') {
      updateData.is_unlimited = !!value;
      isUnlimited = updateData.is_unlimited;
      if (updateData.is_unlimited) {
        updateData.premium_until = null;
      } else {
        updateData.premium_until = userProfile.premium_until || new Date().toISOString();
        newExpiryDate = new Date(updateData.premium_until);
      }
    } else if (action === 'add_days' || action === 'remove_days') {
      const days = parseInt(value) || 0;
      const now = new Date();
      const currentExpires = userProfile.premium_until ? new Date(userProfile.premium_until) : now;
      let baseDate = isNaN(currentExpires.getTime()) ? now : currentExpires;

      if (action === 'add_days') {
        if (baseDate < now) baseDate = now;
        actionType = 'extended';
      } else {
        actionType = 'reduced';
      }

      let newExpiry = new Date(baseDate.getTime());
      if (action === 'add_days') {
        newExpiry.setDate(newExpiry.getDate() + days);
      } else {
        newExpiry.setDate(newExpiry.getDate() - days);
      }

      updateData.premium_until = newExpiry.toISOString();
      updateData.is_unlimited = false;
      isUnlimited = false;
      newExpiryDate = newExpiry;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    try {
      updateData.discord_id = discord_id;
      await upsertUser(updateData);
    } catch (updateError) {
      throw updateError;
    }

    // Queue DM notification to User using Database Templates
    let templateId = '';
    if (action === 'toggle_unlimited') {
      templateId = value ? 'user_sub_unlimited' : 'user_sub_extended';
    } else if (action === 'add_days') {
      templateId = 'user_sub_extended';
    } else if (action === 'remove_days') {
      templateId = 'user_sub_reduced';
    }

    if (templateId) {
      let placeholders = { kullanici: `<@${discord_id}>` };
      
      let finalExpiry = updateData.premium_until ? new Date(updateData.premium_until) : (userProfile.premium_until ? new Date(userProfile.premium_until) : new Date());
      let isUnlimitedFinal = updateData.is_unlimited !== undefined ? updateData.is_unlimited : userProfile.is_unlimited;

      if (isUnlimitedFinal) {
        placeholders.tarih = 'Süresiz';
        placeholders.saat = 'Süresiz';
        placeholders.gun = 0;
      } else if (finalExpiry && !isNaN(finalExpiry.getTime())) {
        const trTime = new Date(finalExpiry.getTime() + (3 * 60 * 60 * 1000));
        const dd = String(trTime.getUTCDate()).padStart(2, '0');
        const mm = String(trTime.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = trTime.getUTCFullYear();
        const hh = String(trTime.getUTCHours()).padStart(2, '0');
        const min = String(trTime.getUTCMinutes()).padStart(2, '0');
        
        placeholders.tarih = `${dd}.${mm}.${yyyy}`;
        placeholders.saat = `${hh}:${min}`;
        
        const now = new Date();
        placeholders.gun = Math.abs(Math.round((finalExpiry - now) / (1000 * 60 * 60 * 24)));
      }

      const parsed = await getParsedTemplate(templateId, placeholders);
      if (parsed) {
        try {
          await queueMessage({
            owner_id: discord_id,
            message_content: JSON.stringify({
              embeds: [{
                title: parsed.title,
                description: parsed.content,
                color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : (isUnlimitedFinal ? 0xfca311 : 0x3498db),
                timestamp: new Date().toISOString()
              }]
            })
          });
        } catch (queueErr) {
          console.error("[Admin Users PATCH] Error queueing DM notification:", queueErr.message);
        }
      } else {
        console.warn(`[Admin Users PATCH] Template ${templateId} not found in database. Notification skipped.`);
      }
    }

    return NextResponse.json({ success: true, updatedData: updateData });
  } catch (error) {
    console.error("Admin Users PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const discordId = searchParams.get('id');

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 });
    }

    // Queue cancellation notification before deleting using Database Template
    try {
      const placeholders = { kullanici: `<@${discordId}>`, tarih: 'İptal Edildi', saat: '-', gun: 0 };
      const parsed = await getParsedTemplate('user_sub_cancelled', placeholders);
      
      if (parsed) {
        await queueMessage({
          owner_id: discordId,
          message_content: JSON.stringify({
            embeds: [{
              title: parsed.title,
              description: parsed.content,
              color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : 0xe74c3c,
              timestamp: new Date().toISOString()
            }]
          })
        });
      } else {
        console.warn(`[Admin Users DELETE] Template user_sub_cancelled not found in database. Notification skipped.`);
      }
    } catch (cancelQueueErr) {
      console.error("[Admin Users DELETE] Error queueing cancellation DM:", cancelQueueErr.message);
    }

    try {
      await deleteUser(discordId);
    } catch (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Users DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
