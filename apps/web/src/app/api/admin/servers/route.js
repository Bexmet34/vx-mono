import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

// Helper to fetch notification template
async function getParsedTemplate(templateId, placeholders = {}) {
  const { data: template } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (!template) return null;

  let title = template.title_tr; // Default to TR for now as per project context
  let content = template.content_tr;

  Object.keys(placeholders).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    title = title?.replace(regex, placeholders[key]);
    content = content?.replace(regex, placeholders[key]);
  });

  return { title, content, color: template.color, is_embed: template.is_embed };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.id === ADMIN_ID || session?.user?.id === "407234961582587916";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { guildId, action, value } = body;

  // 1. Fetch current sub
  const { data: currentSub } = await supabase.from('subscriptions').select('*').eq('guild_id', guildId).single();
  if (!currentSub) return NextResponse.json({ error: "Server not found" }, { status: 404 });

  let updateData = { updated_at: new Date().toISOString() };
  let templateId = '';
  let placeholders = { sunucu: currentSub.guild_name };

  if (action === 'toggle_unlimited') {
    updateData.is_unlimited = value;
    templateId = value ? 'sub_unlimited' : 'sub_extended';
  } else if (action === 'toggle_active') {
    updateData.is_active = value;
    templateId = value ? 'sub_extended' : 'sub_suspended';
  } else if (action === 'add_days') {
    const currentExpires = currentSub.expires_at ? new Date(currentSub.expires_at) : new Date();
    const now = new Date();
    
    // Geçerli bir tarih değilse 'now' kullan
    let baseDate = isNaN(currentExpires.getTime()) ? now : currentExpires;
    
    // Eğer süresi çoktan dolmuşsa (bugünden daha eski), bugünü baz al
    if (baseDate < now) {
      baseDate = now;
    }
    
    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + parseInt(value));
    
    updateData.expires_at = newExpiry.toISOString();
    updateData.one_day_notified = false;
    templateId = 'sub_extended';
    
    // Tarih formatını garantiye alalım (DD.MM.YYYY)
    const dd = String(newExpiry.getDate()).padStart(2, '0');
    const mm = String(newExpiry.getMonth() + 1).padStart(2, '0');
    const yyyy = newExpiry.getFullYear();
    const hh = String(newExpiry.getHours()).padStart(2, '0');
    const min = String(newExpiry.getMinutes()).padStart(2, '0');
    
    placeholders.tarih = `${dd}.${mm}.${yyyy}`;
    placeholders.saat = `${hh}:${min}`;
  }

  // 2. Update Subscription
  const { error: updateError } = await supabase.from('subscriptions').update(updateData).eq('guild_id', guildId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // 3. Queue Notification
  if (templateId) {
    const parsed = await getParsedTemplate(templateId, placeholders);
    if (parsed) {
      await supabase.from('message_queue').insert({
        guild_id: guildId,
        owner_id: currentSub.owner_id,
        message_content: JSON.stringify({
          embeds: [{
            title: parsed.title,
            description: parsed.content,
            color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : 0x5865f2,
            timestamp: new Date().toISOString()
          }]
        }),
        status: 'pending'
      });
    }
  }

  return NextResponse.json({ success: true, updatedData: updateData });
}
