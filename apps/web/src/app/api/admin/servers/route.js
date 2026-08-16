import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllSubscriptions, getSubscriptionByGuildId, updateSubscription, queueMessage, getParsedTemplate } from '@veyronix/database';

export const dynamic = "force-dynamic";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

// getParsedTemplate is now imported from @veyronix/database

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let data;
  try {
    data = await getAllSubscriptions();
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { guildId, action, value } = body;
  console.log(`[AdminAPI] Action: ${action}, Guild: ${guildId}, Value: ${value}`);

  // 1. Fetch current sub
  let currentSub;
  try {
    currentSub = await getSubscriptionByGuildId(guildId);
  } catch (fetchError) {
    console.error(`[AdminAPI] Fetch Error: ${fetchError?.message}`);
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }
  if (!currentSub) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  let updateData = { updated_at: new Date().toISOString() };
  let templateId = '';
  let placeholders = { sunucu: currentSub.guild_name };

  if (action === 'toggle_unlimited') {
    updateData.is_unlimited = value;
    templateId = value ? 'sub_unlimited' : 'sub_extended';
  } else if (action === 'toggle_unlimited_party') {
    updateData.unlimited_party = value;
    // No notification needed for this internal setting
  } else if (action === 'toggle_active') {
    updateData.is_active = value;
    templateId = value ? 'sub_extended' : 'sub_suspended';
  } else if (action === 'add_days' || action === 'remove_days' || action === 'set_expiry') {
    console.log(`[AdminAPI] Current Expiry from DB: ${currentSub.expires_at}`);
    
    const currentExpires = currentSub.expires_at ? new Date(currentSub.expires_at) : new Date();
    const now = new Date();
    
    let baseDate = isNaN(currentExpires.getTime()) ? now : currentExpires;
    let newExpiry;
    let dayDelta = 0;

    if (action === 'set_expiry') {
      newExpiry = new Date(value);
      if (isNaN(newExpiry.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      dayDelta = Math.round((newExpiry - baseDate) / (1000 * 60 * 60 * 24));
      templateId = 'sub_extended';
    } else {
      const days = parseInt(value) || 0;
      dayDelta = days;
      if (action === 'add_days' && baseDate < now) baseDate = now;
      
      newExpiry = new Date(baseDate.getTime());
      if (action === 'add_days') {
        newExpiry.setDate(newExpiry.getDate() + days);
        templateId = 'sub_extended';
      } else {
        newExpiry.setDate(newExpiry.getDate() - days);
        templateId = 'sub_reduced';
      }
    }
    
    console.log(`[AdminAPI] Calculated New Expiry: ${newExpiry.toISOString()}`);
    
    updateData.expires_at = newExpiry.toISOString();
    updateData.one_day_notified = false;
    
    // Format for notification (TR Timezone - assuming bot user is in TR)
    const trTime = new Date(newExpiry.getTime() + (3 * 60 * 60 * 1000));
    const dd = String(trTime.getUTCDate()).padStart(2, '0');
    const mm = String(trTime.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = trTime.getUTCFullYear();
    const hh = String(trTime.getUTCHours()).padStart(2, '0');
    const min = String(trTime.getUTCMinutes()).padStart(2, '0');
    
    placeholders.tarih = `${dd}.${mm}.${yyyy}`;
    placeholders.saat = `${hh}:${min}`;
    placeholders.gun = Math.abs(dayDelta);
    
    console.log(`[AdminAPI] Final Placeholders:`, placeholders);
  }

  // 2. Update Subscription
  try {
    await updateSubscription(guildId, updateData);
  } catch (updateError) {
    console.error(`[AdminAPI] Update Error: ${updateError.message}`);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 3. Queue Notification
  if (templateId) {
    const parsed = await getParsedTemplate(templateId, placeholders);
    if (parsed) {
      try {
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
      } catch (queueError) {
        console.error(`[AdminAPI] Queue Error: ${queueError.message}`);
      }
    }
  }

  return NextResponse.json({ success: true, updatedData: updateData });
}
