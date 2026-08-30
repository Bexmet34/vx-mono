import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllCryptoPayments, getCryptoPaymentById, updateCryptoPayment, getUserProfile, upsertUser, getSubscriptionByGuildId, updateSubscription, createSubscription, queueMessage, getParsedTemplate } from "@veyronix/database";
import { sendSupportMessage } from '@/lib/discordApi';

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const ADMIN_ID_2 = process.env.NEXT_PUBLIC_ADMIN_ID_2 || "407234961582587916";

const isAdminUser = (id) => id && (id === ADMIN_ID || id === ADMIN_ID_2);

// getParsedTemplate imported from @veyronix/database

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminUser(session.user?.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getAllCryptoPayments('havale');
    
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
    let payment;
    try {
      payment = await getCryptoPaymentById(id);
    } catch (e) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === 'paid' && status === 'paid') {
       return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Durum tutarlılığı: rejected/cancel → 'rejected' olarak kaydet
    const dbStatus = status === 'cancel' ? 'rejected' : status;

    // 2. Durumu güncelle
    await updateCryptoPayment(id, { status: dbStatus });

    // 3. Eğer onaylandıysa aboneliği uzat
    if (status === 'paid') {
      const isUserPlan = payment.plan_type === 'user';

      if (isUserPlan) {
        // Bireysel Oylama Muafiyeti (User Premium)
        let userProfile = null;
        try {
          userProfile = await getUserProfile(payment.user_id);
        } catch (e) {}

        const now = new Date();
        let currentExpiry = now;
        if (userProfile && userProfile.premium_until) {
          const profileExpiry = new Date(userProfile.premium_until);
          if (profileExpiry > now) {
            currentExpiry = profileExpiry;
          }
        }

        currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

        await upsertUser({
            discord_id: payment.user_id,
            premium_until: currentExpiry.toISOString(),
            is_unlimited: userProfile?.is_unlimited || false
          });

        console.log(`[Admin Manual Payment] Approved User plan for ${payment.user_id} (+${payment.duration_days} days).`);
      } else {
        // Sunucu Premium (Server/Guild Premium)
        let subscription = null;
        try {
          subscription = await getSubscriptionByGuildId(payment.guild_id);
        } catch (e) {}

        if (subscription) {
          const now = new Date();
          let currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : now;

          if (isNaN(currentExpiry.getTime()) || currentExpiry < now) {
            currentExpiry = now;
          }

          currentExpiry.setDate(currentExpiry.getDate() + payment.duration_days);

          await updateSubscription(subscription.guild_id, { 
              expires_at: currentExpiry.toISOString(),
              is_active: true,
              is_unlimited: subscription.is_unlimited || false,
              trial_used: false,
              owner_id: subscription.owner_id || payment.user_id || null,
              updated_at: new Date().toISOString()
            });

          console.log(`[Admin Manual Payment] Order ${payment.order_id} approved. Guild ${payment.guild_id} extended by ${payment.duration_days} days.`);
        } else {
          // Abonelik hiç yoksa yeni oluştur
          const now = new Date();
          now.setDate(now.getDate() + payment.duration_days);

          await createSubscription({
              guild_id: payment.guild_id,
              guild_name: payment.guild_name || 'Bilinmeyen Sunucu',
              owner_id: payment.user_id || null,
              expires_at: now.toISOString(),
              is_active: true,
              is_unlimited: false,
              trial_used: false
            });
          
          console.log(`[Admin Manual Payment] Order ${payment.order_id} approved. Guild ${payment.guild_id} NEW subscription created for ${payment.duration_days} days.`);
        }
      }

      // Queue Approval Notification (Bot DM)
      const parsed = await getParsedTemplate('manual_payment_approved', { 
        sunucu: payment.guild_name || 'Sunucu',
        gun: payment.duration_days 
      });
      if (parsed && payment.user_id) {
        await queueMessage({
          guild_id: payment.guild_id,
          owner_id: payment.user_id,
          message_content: JSON.stringify({
            embeds: [{
              title: parsed.title,
              description: parsed.content,
              color: parsed.color ? parseInt(parsed.color.replace('#', ''), 16) : 0x2ecc71,
              timestamp: new Date().toISOString()
            }]
          })
        });
      }

      // #8 — Discord Destek Kanalına Admin Bildirimi
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (botToken) {
        try {
          const planDetailText = payment.plan_type === 'user'
            ? `**Bireysel Oylama Muafiyeti (${payment.duration_days} Günlük)**`
            : `**${payment.guild_name || 'Sunucu'}** için ${payment.duration_days} günlük Sunucu Premium`;

          await sendSupportMessage({
              content: `✅ **Havale/EFT Onaylandı!**\n<@${payment.user_id}> — ${planDetailText} onaylandı.\n📋 Kod: \`${payment.description_code}\` | 🏦 Banka: ${payment.target_bank || 'Bilinmiyor'}`
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
        await queueMessage({
          guild_id: payment.guild_id,
          owner_id: payment.user_id,
          message_content: JSON.stringify({
            embeds: [{
              title: parsedRej.title,
              description: parsedRej.content,
              color: parsedRej.color ? parseInt(parsedRej.color.replace('#', ''), 16) : 0xe74c3c,
              timestamp: new Date().toISOString()
            }]
          })
        });
      }
    }

    return NextResponse.json({ success: true, status: dbStatus });
  } catch (error) {
    console.error("Admin Manual Payments PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error", details: error }, { status: 500 });
  }
}
