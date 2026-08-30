import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllSubscriptions, getSubscriptionByGuildId, updateSubscription, upsertSubscription, queueMessage, getParsedTemplate } from '@veyronix/database';

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await getAllSubscriptions();
    
    // Enrich with actual guild names and owner IDs from Bot API
    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3005';
      const res = await fetch(`${botApiUrl}/api/bot-guilds`);
      if (res.ok) {
        const botData = await res.json();
        if (botData?.success && Array.isArray(botData.guilds)) {
          const guildMap = {};
          for (const g of botData.guilds) {
            guildMap[g.id] = g;
          }
          
          const dbGuildIds = new Set(data.map(d => d.guild_id));

          // Enhance existing subscriptions
          for (const d of data) {
            if (guildMap[d.guild_id]) {
              d.guild_name = d.guild_name || guildMap[d.guild_id].name;
              d.guild_icon = guildMap[d.guild_id].icon;
              if (!d.owner_id && guildMap[d.guild_id].owner_id) {
                d.owner_id = guildMap[d.guild_id].owner_id;
              }
            }
          }

          // Add bot guilds that are NOT in the database yet (freemium/unconfigured)
          for (const g of botData.guilds) {
            if (!dbGuildIds.has(g.id)) {
              data.push({
                id: g.id, 
                guild_id: g.id,
                owner_id: g.owner_id || null,
                guild_name: g.name,
                guild_icon: g.icon,
                is_active: false,
                is_unlimited: false,
                unlimited_party: false,
                expires_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (enrichError) {
      console.error("[AdminAPI] Error enriching guild names:", enrichError);
    }
    
  } catch (error) {
    console.error("[AdminAPI] Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get('id');
    if (!guildId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const supabase = require('@veyronix/database').getClient();

    // Reset subscription to freemium or delete
    const { error: subError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('guild_id', guildId);
        
    if (subError) throw subError;
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminUser(session.user?.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { guildId, action, value } = body;
  console.log(`[AdminAPI] Action: ${action}, Guild: ${guildId}, Value: ${value}`);

  if (!guildId || !action) {
    return NextResponse.json({ error: "Guild ID and action are required" }, { status: 400 });
  }

  // 1. Fetch current sub
  let currentSub = null;
  try {
    currentSub = await getSubscriptionByGuildId(guildId);
  } catch (fetchError) {
    console.error(`[AdminAPI] Fetch Error: ${fetchError?.message}`);
  }

  if (!currentSub) {
      // It's a freemium server without a subscription record yet. We will resolve owner and name.
      let fetchedOwner = null;
      let fetchedName = "Bilinmeyen Sunucu";
      
      // Database fallback (most reliable for owner_id)
      try {
          const supabase = require('@veyronix/database').getClient();
          const { data: gsData } = await supabase.from('guild_settings').select('owner_id').eq('guild_id', guildId).single();
          if (gsData && gsData.owner_id) {
              fetchedOwner = gsData.owner_id;
          }
      } catch (e) {
          console.error("Guild settings fallback error:", e);
      }

      // Bot API fetch (for name and as secondary fallback)
      try {
          const botApiUrl = process.env.BOT_API_URL || "http://localhost:3005";
          const botRes = await fetch(`${botApiUrl}/api/bot-guilds`);
          if (botRes.ok) {
              const bData = await botRes.json();
              if (bData.success && Array.isArray(bData.guilds)) {
                  const targetGuild = bData.guilds.find(g => g.id === guildId);
                  if (targetGuild) {
                      if (!fetchedOwner) fetchedOwner = targetGuild.owner_id;
                      fetchedName = targetGuild.name;
                  }
              }
          }
      } catch (e) {
          console.error("Guild fetch error fallback:", e);
      }
      currentSub = { 
        guild_id: guildId, 
        guild_name: fetchedName, 
        owner_id: fetchedOwner,
        is_active: false,
        is_unlimited: false,
        unlimited_party: false,
        expires_at: new Date().toISOString()
      };
  }

  let updateData = { updated_at: new Date().toISOString() };
  let templateId = '';
  let placeholders = { sunucu: currentSub.guild_name || 'Sunucu' };

  if (action === 'toggle_unlimited') {
    const isUnlimited = !!value;
    updateData.is_unlimited = isUnlimited;
    if (isUnlimited) {
      updateData.is_active = true;
      updateData.trial_used = false;
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 100);
      updateData.expires_at = farFuture.toISOString();
      templateId = 'sub_unlimited';
    } else {
      updateData.is_unlimited = false;
      // Sınırsız premium kapatıldığında 100 yıllık gün kalmaması için süreyi bugüne çekiyoruz
      updateData.expires_at = new Date().toISOString();
      updateData.trial_used = true;
      templateId = 'sub_suspended';
    }
  } else if (action === 'toggle_unlimited_party') {
    updateData.unlimited_party = !!value;
    if (!currentSub.expires_at) {
      updateData.expires_at = new Date().toISOString();
    }
  } else if (action === 'toggle_active') {
    updateData.is_active = !!value;
    if (!currentSub.expires_at) {
      updateData.expires_at = new Date().toISOString();
    }
    templateId = value ? 'sub_extended' : 'sub_suspended';
  } else if (action === 'add_days' || action === 'remove_days' || action === 'set_expiry') {
    const currentExpires = currentSub.expires_at ? new Date(currentSub.expires_at) : new Date();
    const now = new Date();
    
    let baseDate = isNaN(currentExpires.getTime()) || currentExpires < now ? now : currentExpires;
    let newExpiry;

    if (action === 'set_expiry') {
      newExpiry = new Date(value);
      if (isNaN(newExpiry.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      templateId = 'sub_extended';
    } else {
      const days = parseInt(value) || 0;
      if (action === 'add_days') {
        newExpiry = new Date(baseDate.getTime());
        newExpiry.setDate(newExpiry.getDate() + days);
        templateId = 'sub_extended';
      } else {
        newExpiry = new Date(baseDate.getTime());
        newExpiry.setDate(newExpiry.getDate() - days);
        templateId = 'sub_reduced';
      }
    }
    
    updateData.expires_at = newExpiry.toISOString();
    updateData.is_active = true;
    updateData.trial_used = false;
    updateData.is_unlimited = false;
    updateData.one_day_notified = false;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Populate date placeholders if needed
  if (templateId) {
    let finalExpiry = updateData.expires_at ? new Date(updateData.expires_at) : (currentSub.expires_at ? new Date(currentSub.expires_at) : new Date());
    let isUnlimitedFinal = updateData.is_unlimited !== undefined ? updateData.is_unlimited : currentSub.is_unlimited;

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
  }

  // 2. Upsert safe subscription
  let savedSub;
  try {
    const upsertData = {
      guild_id: guildId,
      guild_name: currentSub.guild_name || 'Sunucu',
      owner_id: currentSub.owner_id || null,
      expires_at: updateData.expires_at || currentSub.expires_at || new Date().toISOString(),
      is_active: updateData.is_active !== undefined ? updateData.is_active : (currentSub.is_active ?? true),
      is_unlimited: updateData.is_unlimited !== undefined ? updateData.is_unlimited : (currentSub.is_unlimited ?? false),
      unlimited_party: updateData.unlimited_party !== undefined ? updateData.unlimited_party : (currentSub.unlimited_party ?? false),
      trial_used: updateData.trial_used !== undefined ? updateData.trial_used : (currentSub.trial_used ?? false),
      updated_at: new Date().toISOString()
    };

    savedSub = await upsertSubscription(upsertData);
  } catch (updateError) {
    console.error(`[AdminAPI] Update Error: ${updateError.message}`);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Queue Notification
  if (templateId && currentSub.owner_id) {
    try {
      const parsed = await getParsedTemplate(templateId, placeholders);
      if (parsed) {
        await queueMessage({
          guild_id: guildId,
          owner_id: currentSub.owner_id,
          message_content: JSON.stringify({
            embeds: [{
              title: parsed.title,
              description: parsed.content,
              color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : 0x5865f2,
              timestamp: new Date().toISOString()
            }]
          })
        });
      }
    } catch (queueError) {
      console.error(`[AdminAPI] Queue Error: ${queueError.message}`);
    }
  }

  return NextResponse.json({ success: true, updatedData: savedSub });
}
