import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@veyronix/database";

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2;

const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

// Helper to fetch notification template
async function getParsedTemplate(templateId, placeholders = {}) {
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
}

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminUser(session.user?.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('payment_method', 'havale')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin Manual Payments GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminUser(session.user?.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Ödemeyi al
    const { data: payment, error: fetchError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === 'paid' && status === 'paid') {
       return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Durum tutarlılığı: rejected/cancel → 'rejected' olarak kaydet
    const dbStatus = status === 'cancel' ? 'rejected' : status;

    // 2. Durumu güncelle
    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update({ status: dbStatus })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Eğer onaylandıysa aboneliği uzat
    if (status === 'paid') {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('guild_id', payment.guild_id)
        .single();

      if (!subError && subscription) {
        const now = new Date();
        let currentExpiry = new Date(subscription.expires_at);

        if (currentExpiry < now) {
          currentExpiry = now;
        }

        currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

        await supabase
          .from('subscriptions')
          .update({ 
            expires_at: currentExpiry.toISOString(),
            is_active: true,
            is_unlimited: subscription.is_unlimited || false
          })
          .eq('id', subscription.id);

        console.log(`[Admin Manual Payment] Order ${payment.order_id} approved. Guild ${payment.guild_id} extended by ${payment.duration_days} days.`);
      } else {
        // Abonelik hiç yoksa yeni oluştur
        const now = new Date();
        now.setDate(now.getDate() + payment.duration_days);

        await supabase
          .from('subscriptions')
          .insert({
            guild_id: payment.guild_id,
            guild_name: payment.guild_name || 'Bilinmeyen Sunucu',
            expires_at: now.toISOString(),
            is_active: true,
            is_unlimited: false
          });
        
        console.log(`[Admin Manual Payment] Order ${payment.order_id} approved. Guild ${payment.guild_id} NEW subscription created for ${payment.duration_days} days.`);
      }

      // Queue Approval Notification (Bot DM)
      const parsed = await getParsedTemplate('manual_payment_approved', { 
        sunucu: payment.guild_name || 'Sunucu',
        gun: payment.duration_days 
      });
      if (parsed && payment.user_id) {
        await supabase.from('message_queue').insert({
          guild_id: payment.guild_id,
          owner_id: payment.user_id,
          message_content: JSON.stringify({
            embeds: [{
              title: parsed.title,
              description: parsed.content,
              color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : 0x2ecc71,
              timestamp: new Date().toISOString()
            }]
          }),
          status: 'pending'
        });
      }

      // #8 — Discord Destek Kanalına Admin Bildirimi
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (botToken) {
        try {
          await fetch('https://discord.com/api/v10/channels/1490798764427051088/messages', {
            method: 'POST',
            headers: {
              'Authorization': `Bot ${botToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              content: `✅ **Havale/EFT Onaylandı!**\n<@${payment.user_id}> — **${payment.guild_name || 'Sunucu'}** için ${payment.duration_days} günlük paket onaylandı.\n📋 Kod: \`${payment.description_code}\` | 🏦 Banka: ${payment.target_bank || 'Bilinmiyor'}`
            })
          });
        } catch (e) {
          console.error("[Admin Manual Payment] Discord notification error:", e);
        }
      }
    } else if (status === 'rejected') {
      // Queue Rejection Notification (Bot DM)
      const parsedRej = await getParsedTemplate('manual_payment_rejected', { 
        sunucu: payment.guild_name || 'Sunucu'
      });
      if (parsedRej && payment.user_id) {
        await supabase.from('message_queue').insert({
          guild_id: payment.guild_id,
          owner_id: payment.user_id,
          message_content: JSON.stringify({
            embeds: [{
              title: parsedRej.title,
              description: parsedRej.content,
              color: parsedRej.color ? parseInt(parsedRej.color.replace('#', ''), 16) : 0xe74c3c,
              timestamp: new Date().toISOString()
            }]
          }),
          status: 'pending'
        });
      }
    }

    return NextResponse.json({ success: true, status: dbStatus });
  } catch (error) {
    console.error("Admin Manual Payments PATCH Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
