import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/utils/supabase";

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

async function getDiscordUser(discordId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return { username: `Kullanıcı (${discordId})`, avatar_url: null };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    const res = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
      headers: {
        'Authorization': `Bot ${token}`
      },
      signal: controller.signal,
      next: { revalidate: 3600 } // cache for 1 hour
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { username: `Kullanıcı (${discordId})`, avatar_url: null };
    }

    const data = await res.json();
    let avatarUrl = null;
    if (data.avatar) {
      const isGif = data.avatar.startsWith('a_');
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${data.avatar}.${isGif ? 'gif' : 'png'}`;
    } else {
      const defaultIdx = Number((BigInt(discordId) >> 22n) % 6n);
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
    }

    return {
      username: data.global_name || data.username || `Kullanıcı (${discordId})`,
      avatar_url: avatarUrl
    };
  } catch (error) {
    return { username: `Kullanıcı (${discordId})`, avatar_url: null };
  }
}

async function getParsedTemplate(templateId, placeholders = {}) {
  try {
    const { data: template } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) return null;

    let title = template.title_tr; 
    let content = template.content_tr;

    Object.keys(placeholders).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      title = title?.replace(regex, placeholders[key]);
      content = content?.replace(regex, placeholders[key]);
    });

    return { title, content, color: template.color, is_embed: template.is_embed };
  } catch (err) {
    return null;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('discord_id', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fast parallel enrichment with timeouts using Promise.allSettled
  const results = await Promise.allSettled((data || []).map(async (u) => {
    const discordProfile = await getDiscordUser(u.discord_id);
    
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
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discord_id)
      .single();

    let updateData = { discord_id };
    let expiryDateStr = "";

    if (is_unlimited) {
      updateData.is_unlimited = true;
      updateData.premium_until = null;
    } else {
      const days = parseInt(duration_days) || 0;
      const now = new Date();
      let currentExpiry = now;

      if (!userError && userProfile && userProfile.premium_until) {
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

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(updateData, { onConflict: 'discord_id' });

    if (upsertError) throw upsertError;

    // Queue DM notification to User with clear timing details (Bilingual TR + EN)
    try {
      let embedTitle = is_unlimited 
        ? "💎 Veyronix Sınırsız Bireysel Premium / Unlimited Individual Premium" 
        : "⚡ Veyronix Bireysel Premium Aktif / Individual Premium Activated";
      
      let embedDescription = "";
      if (is_unlimited) {
        embedDescription = `Bireysel premium aboneliğiniz tanımlandı! / Your individual premium subscription has been defined!\n\n` +
          `• **Paket Türü / Plan Type:** Sınırsız (Ömür Boyu) / Unlimited (Lifetime)\n` +
          `• **Top.gg Oy Verme Zorunluluğu / Top.gg Vote Requirement:** Süresiz olarak kaldırıldı / Permanently removed.\n` +
          `• Botu tüm sunucularda oylama yapmadan sınırsız kullanabilirsiniz. / You can use the bot on all servers without voting.\n` +
          `• **Web Sitesi / Website:** https://veyronix.com.tr/`;
      } else {
        embedDescription = `Bireysel premium aboneliğiniz tanımlandı! / Your individual premium subscription has been defined!\n\n` +
          `• **Paket Türü / Plan Type:** Süreli Bireysel Premium / Timed Individual Premium\n` +
          `• **Tanımlanan Süre / Duration:** ${duration_days} Gün / ${duration_days} Days\n` +
          `• **Son Kullanma Tarihi / Expiration Date:** ${expiryDateStr}\n` +
          `• **Top.gg Oy Verme Zorunluluğu / Top.gg Vote Requirement:** Belirtilen süre boyunca kaldırıldı / Removed during this period.\n` +
          `• **Web Sitesi / Website:** https://veyronix.com.tr/`;
      }

      await supabase.from('message_queue').insert({
        owner_id: discord_id,
        message_content: JSON.stringify({
          embeds: [{
            title: embedTitle,
            description: embedDescription,
            color: is_unlimited ? 0xfca311 : 0x2ecc71,
            timestamp: new Date().toISOString()
          }]
        }),
        status: 'pending'
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

    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discord_id)
      .single();

    if (fetchError || !userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData = {};
    let isUnlimited = false;
    let newExpiryDate = null;

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

      if (action === 'add_days' && baseDate < now) baseDate = now;

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

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('discord_id', discord_id);

    if (updateError) throw updateError;

    // Queue DM notification to User (Bilingual TR + EN)
    try {
      let embedTitle = isUnlimited 
        ? "💎 Veyronix Sınırsız Bireysel Premium Güncellendi / Unlimited Individual Premium Updated" 
        : "⚡ Veyronix Bireysel Premium Güncellendi / Individual Premium Updated";
      let embedDescription = "";

      if (isUnlimited) {
        embedDescription = `Bireysel premium durumunuz güncellendi! / Your individual premium status has been updated!\n\n` +
          `• **Paket Türü / Plan Type:** Sınırsız (Ömür Boyu) / Unlimited (Lifetime)\n` +
          `• **Top.gg Oy Verme Zorunluluğu / Top.gg Vote Requirement:** Süresiz olarak kaldırıldı / Permanently removed.\n` +
          `• **Web Sitesi / Website:** https://veyronix.com.tr/`;
      } else {
        const dateStr = newExpiryDate ? newExpiryDate.toLocaleDateString('tr-TR') : 'Belirtilmedi';
        embedDescription = `Bireysel premium süreniz güncellendi! / Your individual premium duration has been updated!\n\n` +
          `• **Paket Türü / Plan Type:** Süreli Bireysel Premium / Timed Individual Premium\n` +
          `• **Son Kullanma Tarihi / Expiration Date:** ${dateStr}\n` +
          `• **Top.gg Oy Verme Zorunluluğu / Top.gg Vote Requirement:** Belirtilen tarihe kadar kaldırıldı / Removed until expiration date.\n` +
          `• **Web Sitesi / Website:** https://veyronix.com.tr/`;
      }

      await supabase.from('message_queue').insert({
        owner_id: discord_id,
        message_content: JSON.stringify({
          embeds: [{
            title: embedTitle,
            description: embedDescription,
            color: isUnlimited ? 0xfca311 : 0x3498db,
            timestamp: new Date().toISOString()
          }]
        }),
        status: 'pending'
      });
    } catch (queueErr) {
      console.error("[Admin Users PATCH] Error queueing DM notification:", queueErr.message);
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

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('discord_id', discordId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Users DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
