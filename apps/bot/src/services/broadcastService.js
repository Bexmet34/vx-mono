const { supabase } = require('@veyronix/database');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { LINKS } = require('../constants/constants');
const { getSupportServerLink } = require('../utils/settingsUtils');

/**
 * Starts the broadcast worker using Supabase Realtime.
 * Instead of polling every 10-15 seconds, we listen for INSERT events on
 * message_queue and campaign_logs — zero wasted egress when queues are empty.
 * @param {import('discord.js').Client} client
 */
function startBroadcastWorker(client) {
    console.log('[BroadcastService] Starting Realtime-based broadcast worker...');

    supabase
        .channel('broadcast_changes')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'message_queue' },
            async (payload) => {
                // Small delay to let DB commit settle before we process
                setTimeout(() => processMessageQueueItem(client, payload.new), 500);
            }
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'campaign_logs' },
            async (payload) => {
                setTimeout(() => processCampaignLogItem(client, payload.new), 500);
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('[BroadcastService] Realtime subscribed to message_queue & campaign_logs.');
                // On startup, drain any leftover pending items from before bot restart
                drainPendingMessages(client);
                drainPendingCampaigns(client);
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                console.warn(`[BroadcastService] Realtime status: ${status}`);
            }
        });
}

/**
 * On bot restart, process any pending items that arrived while bot was offline.
 */
async function drainPendingMessages(client) {
    try {
        const { data: messages } = await supabase
            .from('message_queue')
            .select('id, message_content, owner_id, guild_id, subscriptions(owner_id, guild_name, guild_id)')
            .eq('status', 'pending')
            .limit(50);

        if (!messages || messages.length === 0) return;
        console.log(`[BroadcastService] Draining ${messages.length} pending messages from queue...`);

        for (const msg of messages) {
            await processMessageQueueItem(client, msg);
            // Rate limit protection between messages
            await new Promise(r => setTimeout(r, 1000));
        }
    } catch (err) {
        console.error('[BroadcastService] Drain error:', err.message);
    }
}

async function drainPendingCampaigns(client) {
    try {
        const { data: logs } = await supabase
            .from('campaign_logs')
            .select(`id, guild_id, campaign_id, campaigns(id, title_tr, title_en, description_tr, description_en, promo_code, reward_days), subscriptions(owner_id, guild_name, language)`)
            .eq('status', 'pending')
            .limit(20);

        if (!logs || logs.length === 0) return;
        console.log(`[BroadcastService] Draining ${logs.length} pending campaign logs...`);

        for (const log of logs) {
            await processCampaignLogItem(client, log);
            await new Promise(r => setTimeout(r, 1500));
        }
    } catch (err) {
        console.error('[BroadcastService] Campaign drain error:', err.message);
    }
}

/**
 * Processes a single message_queue item.
 * Fetches full record if triggered by Realtime (payload may be partial).
 */
async function processMessageQueueItem(client, rawMsg) {
    try {
        // Fetch full record with joined subscription data
        const { data: messages, error } = await supabase
            .from('message_queue')
            .select('id, message_content, owner_id, guild_id, subscriptions(owner_id, guild_name, guild_id)')
            .eq('id', rawMsg.id)
            .eq('status', 'pending')
            .limit(1);

        if (error || !messages || messages.length === 0) return;

        const msg = messages[0];
        const ownerId = msg.owner_id || msg.subscriptions?.owner_id;
        const guildName = msg.subscriptions?.guild_name || 'Veyronix';

        if (!ownerId) {
            await supabase.from('message_queue')
                .update({ status: 'failed', error_message: 'Alıcı Discord ID (owner_id) bulunamadı.' })
                .eq('id', msg.id);
            return;
        }

        // Claim the message (race condition guard)
        const { data: updatedMsg, error: updateError } = await supabase
            .from('message_queue')
            .update({ status: 'processing', updated_at: new Date().toISOString() })
            .eq('id', msg.id)
            .eq('status', 'pending')
            .select();

        if (updateError || !updatedMsg || updatedMsg.length === 0) return;

        try {
            const finalMessageStr = msg.message_content.replace(/{sunucu}/g, guildName);

            let sendOptions;
            try {
                if (finalMessageStr.trim().startsWith('{')) {
                    sendOptions = JSON.parse(finalMessageStr);
                } else {
                    sendOptions = { content: finalMessageStr };
                }
            } catch (e) {
                sendOptions = { content: finalMessageStr };
            }

            const user = await client.users.fetch(ownerId);
            if (!user) throw new Error('Kullanıcı bulunamadı.');

            await user.send(sendOptions);

            await supabase.from('message_queue')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', msg.id);

            console.log(`[BroadcastService] Mesaj başarıyla gönderildi: ${user.tag} (Sunucu: ${guildName})`);
        } catch (dmError) {
            await supabase.from('message_queue')
                .update({ status: 'failed', error_message: dmError.message, updated_at: new Date().toISOString() })
                .eq('id', msg.id);

            console.error(`[BroadcastService] Mesaj gönderilemedi: ${ownerId} Error: ${dmError.message}`);
        }
    } catch (err) {
        console.error('[BroadcastService] processMessageQueueItem Error:', err.message);
    }
}

/**
 * Processes a single campaign_logs item.
 */
async function processCampaignLogItem(client, rawLog) {
    try {
        const { data: logs, error } = await supabase
            .from('campaign_logs')
            .select(`id, guild_id, campaign_id, campaigns(id, title_tr, title_en, description_tr, description_en, promo_code, reward_days), subscriptions(owner_id, guild_name, language)`)
            .eq('id', rawLog.id)
            .eq('status', 'pending')
            .limit(1);

        if (error || !logs || logs.length === 0) return;

        const log = logs[0];
        const campaign = log.campaigns;
        const sub = log.subscriptions;

        if (!campaign || !sub) {
            await supabase.from('campaign_logs').update({ status: 'failed', error_message: 'Veri eksik.' }).eq('id', log.id);
            return;
        }

        // Claim the log (race condition guard)
        const { data: updatedLog, error: updateError } = await supabase
            .from('campaign_logs')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', log.id)
            .eq('status', 'pending')
            .select();

        if (updateError || !updatedLog || updatedLog.length === 0) return;

        const lang = sub.language || 'tr';
        const title = lang === 'tr' ? campaign.title_tr : campaign.title_en;
        const desc = lang === 'tr' ? campaign.description_tr : campaign.description_en;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc.replace(/{sunucu}/g, sub.guild_name))
            .addFields(
                { name: lang === 'tr' ? '🎁 Ödül' : '🎁 Reward', value: `**${campaign.reward_days} ${lang === 'tr' ? 'Gün Premium' : 'Days Premium'}**`, inline: true },
                { name: lang === 'tr' ? '🔑 Kod' : '🔑 Code', value: `\`${campaign.promo_code}\``, inline: true }
            )
            .setColor('#fca311')
            .setFooter({ text: 'Veyronix Campaign Management' })
            .setTimestamp();

        const supportLink = await getSupportServerLink();
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(lang === 'tr' ? 'Dashboard\'a Git' : 'Go to Dashboard')
                .setURL(`${LINKS.WEBSITE}/dashboard/server/${log.guild_id}`)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel(lang === 'tr' ? 'Destek Sunucusu' : 'Support Server')
                .setURL(supportLink)
                .setStyle(ButtonStyle.Link)
        );

        try {
            const user = await client.users.fetch(sub.owner_id);
            if (user) {
                await user.send({ embeds: [embed], components: [row] });
                console.log(`[CampaignService] Message sent to ${user.tag} for campaign ${campaign.promo_code}`);
            }
        } catch (err) {
            await supabase.from('campaign_logs').update({ status: 'failed', error_message: err.message }).eq('id', log.id);
        }
    } catch (err) {
        console.error('[BroadcastService] processCampaignLogItem Error:', err.message);
    }
}

module.exports = { startBroadcastWorker };
