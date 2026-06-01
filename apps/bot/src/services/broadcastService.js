const { supabase } = require('@veyronix/database');

/**
 * Starts the broadcast worker which polls the message_queue table.
 * @param {import('discord.js').Client} client 
 */
function startBroadcastWorker(client) {
    console.log('[BroadcastService] Worker started (processing 1 message every 10 seconds)...');

    setInterval(async () => {
        try {
            // 1. Durumu 'pending' olan 1 adet mesajı çek ve subscriptions tablosuyla BİRLEŞTİR (JOIN)
            const { data: messages, error } = await supabase
                .from('message_queue')
                .select(`
                    id,
                    message_content,
                    subscriptions (
                        owner_id,
                        guild_name,
                        guild_id
                    )
                `)
                .eq('status', 'pending')
                .limit(1);

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error("[BroadcastService] Queue Poll Error:", error.message);
                }
                return;
            }

            if (!messages || messages.length === 0) return; // Kuyruk boş

            const msg = messages[0];
            
            // Subscriptions tablosundan gelen veriler (JOIN sayesinde)
            const subscription = msg.subscriptions;
            if (!subscription) {
                // Eğer bağlı subscription bulunamazsa (silinmişse vb.) failed yap
                await supabase.from('message_queue')
                    .update({ status: 'failed', error_message: 'Bağlı sunucu kaydı bulunamadı.' })
                    .eq('id', msg.id);
                return;
            }

            const ownerId = subscription.owner_id;
            const guildName = subscription.guild_name;

            // 2. Başka bir bot/worker aynı mesajı almasın diye durumu 'processing' yap
            await supabase.from('message_queue')
                .update({ status: 'processing', updated_at: new Date().toISOString() })
                .eq('id', msg.id);

            try {
                // 3. Dinamik içerik değişimi: {sunucu} -> sunucu_adi
                const finalMessageStr = msg.message_content.replace(/{sunucu}/g, guildName);

                // 4. İçeriğin JSON (Embed) olup olmadığını kontrol et
                let sendOptions;
                try {
                    if (finalMessageStr.trim().startsWith('{')) {
                        sendOptions = JSON.parse(finalMessageStr);
                    } else {
                        sendOptions = { content: finalMessageStr };
                    }
                } catch (e) {
                    // JSON hatası varsa düz metin olarak gönder
                    sendOptions = { content: finalMessageStr };
                }

                // 5. Discord üzerinden mesajı gönder
                const user = await client.users.fetch(ownerId);
                if (!user) throw new Error('Kullanıcı bulunamadı.');

                await user.send(sendOptions);
                
                // 5. Başarılı olursa durumu 'completed' yap
                await supabase.from('message_queue')
                    .update({ status: 'completed', updated_at: new Date().toISOString() })
                    .eq('id', msg.id);
                
                console.log(`[BroadcastService] Mesaj başarıyla gönderildi: ${user.tag} (Sunucu: ${guildName})`);

            } catch (dmError) {
                // 6. Hata olursa (DM kapalı vb.) durumu 'failed' yap ve hatayı kaydet
                await supabase.from('message_queue')
                    .update({ 
                        status: 'failed', 
                        error_message: dmError.message,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', msg.id);
                
                console.error(`[BroadcastService] Mesaj gönderilemedi: ${ownerId} Error: ${dmError.message}`);
            }

        } catch (err) {
            console.error('[BroadcastService] Critical Error:', err.message);
        }
    }, 10000); // 10 saniyede bir

    // Campaign (Win-back & Gifts) Worker - 15 saniyede bir
    setInterval(async () => {
        try {
            const { data: logs, error } = await supabase
                .from('campaign_logs')
                .select(`
                    id,
                    guild_id,
                    campaign_id,
                    campaigns (
                        id,
                        title_tr, title_en,
                        description_tr, description_en,
                        promo_code,
                        reward_days
                    ),
                    subscriptions (
                        owner_id,
                        guild_name,
                        language
                    )
                `)
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

            // Update to processing
            await supabase.from('campaign_logs').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', log.id);

            const lang = sub.language || 'tr';
            const title = lang === 'tr' ? campaign.title_tr : campaign.title_en;
            const desc = lang === 'tr' ? campaign.description_tr : campaign.description_en;

            const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            const { LINKS } = require('../constants/constants');

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

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(lang === 'tr' ? 'Dashboard\'a Git' : 'Go to Dashboard')
                    .setURL(`${LINKS.WEBSITE}/dashboard/server/${log.guild_id}`)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel(lang === 'tr' ? 'Destek Sunucusu' : 'Support Server')
                    .setURL(LINKS.SUPPORT_SERVER)
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
            console.error('[BroadcastService] Campaign Worker Error:', err.message);
        }
    }, 15000);
}

module.exports = { startBroadcastWorker };
