const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { getGuildConfig } = require('../services/guildConfig');
const { t } = require('../services/i18n');
const db = require('../services/db');
const { supabase } = require('@veyronix/database');

async function handleTicketInteraction(interaction) {
    const customId = interaction.customId;
    const guildConfig = await getGuildConfig(interaction.guildId);
    const lang = guildConfig?.language || 'tr';
    
    if (!guildConfig || !guildConfig.ticket_system_enabled) {
        return interaction.reply({ content: t('ticket.not_enabled', lang), flags: [MessageFlags.Ephemeral] });
    }

    if (customId === 'ticket_open') {
        let options = guildConfig.ticket_options;
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch (e) { options = []; }
        }
        if (!options || !Array.isArray(options) || options.length === 0) {
            options = [{ label: lang === 'tr' ? "Genel Destek" : "General Support", value: "genel", description: lang === 'tr' ? "Genel konular hakkında destek alın" : "Get support on general topics", emoji: "📩" }];
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_topic_select')
            .setPlaceholder(t('ticket.select_topic_placeholder', lang))
            .addOptions(
                options.map(opt => new StringSelectMenuOptionBuilder()
                    .setLabel(opt.label)
                    .setDescription(opt.description || ' ')
                    .setValue(opt.value)
                    .setEmoji(opt.emoji || '📩')
                )
            );

        await interaction.reply({
            content: t('ticket.select_topic_prompt', lang),
            components: [new ActionRowBuilder().addComponents(selectMenu)],
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (customId === 'ticket_topic_select') {
        const topicValue = interaction.values[0];
        let options = guildConfig.ticket_options;
        if (typeof options === 'string') {
            try { options = JSON.parse(options); } catch (e) { options = []; }
        }
        if (!Array.isArray(options)) options = [];
        
        const topicObj = options.find(o => o.value === topicValue) || { label: topicValue };
        const topicLabel = topicObj.label;

        await interaction.update({ content: t('ticket.creating_channel', lang), components: [] });

        const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
        const rawName = (interaction.member?.nickname || interaction.member?.displayName || interaction.user.username).replace(/[çğıöşüÇĞİÖŞÜ]/g, m => trMap[m]);
        const safeName = rawName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() || 'user';
        const safeTopic = topicValue.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() || 'ticket';
        const channelName = `${safeTopic}-${safeName}`;

        const staffRoles = (guildConfig.ticket_staff_roles || "").split(',').map(r => r.trim()).filter(Boolean);

        const permissionOverwrites = [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            }
        ];

        staffRoles.forEach(roleId => {
            permissionOverwrites.push({
                id: roleId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            });
        });

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: guildConfig.ticket_category_id || null,
                permissionOverwrites
            });

            // SQLite'a kaydet (Active tickets)
            await db.run('INSERT INTO tickets (guild_id, channel_id, owner_id, topic, status) VALUES (?, ?, ?, ?, ?)', [
                interaction.guildId, ticketChannel.id, interaction.user.id, topicLabel, 'open'
            ]);

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(t('ticket.welcome_title', lang))
                .setDescription(t('ticket.welcome_desc', lang, { user: `<@${interaction.user.id}>` }))
                .addFields({ name: t('ticket.topic_field', lang), value: `**${topicLabel}**`, inline: true })
                .setColor('#2ecc71')
                .setTimestamp();

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel(t('ticket.close_button', lang))
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

            const staffMentions = staffRoles.map(id => `<@&${id}>`).join(' ');
            await ticketChannel.send({
                content: `<@${interaction.user.id}> ${staffMentions}`,
                allowedMentions: { parse: ['users', 'roles'] },
                embeds: [welcomeEmbed],
                components: [closeRow]
            });

            await interaction.followUp({ content: t('ticket.created_success', lang, { channel: `<#${ticketChannel.id}>` }), flags: [MessageFlags.Ephemeral] });

        } catch (err) {
            console.error('Ticket Create Error:', err);
            await interaction.followUp({ content: t('ticket.create_error', lang), flags: [MessageFlags.Ephemeral] });
        }
    }

    if (customId === 'ticket_close') {
        const ticketRow = await db.get('SELECT * FROM tickets WHERE channel_id = ?', [interaction.channelId]);
        if (!ticketRow) {
            return interaction.reply({ content: t('ticket.not_found', lang), flags: [MessageFlags.Ephemeral] });
        }

        // Check if user is staff or owner
        const staffRoles = (guildConfig.ticket_staff_roles || "").split(',').map(r => r.trim()).filter(Boolean);
        const isStaff = interaction.member.roles.cache.some(r => staffRoles.includes(r.id)) || interaction.member.permissions.has('Administrator');
        
        if (!isStaff) {
            return interaction.reply({ content: t('ticket.staff_only', lang), flags: [MessageFlags.Ephemeral] });
        }

        await interaction.reply({ content: t('ticket.closing', lang) });

        try {
            // Fetch messages for transcript
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const transcript = [];
            
            // Reverse so it's chronological
            Array.from(messages.values()).reverse().forEach(msg => {
                if (msg.author.bot && msg.embeds.length > 0 && msg.embeds[0].title?.includes(ticketRow.topic)) return; // Skip welcome message
                
                transcript.push({
                    author: msg.author.tag,
                    avatar: msg.author.displayAvatarURL(),
                    content: msg.content,
                    timestamp: msg.createdAt,
                    embeds: msg.embeds.map(e => ({ title: e.title, description: e.description }))
                });
            });

            // Fetch owner name
            let ownerName = ticketRow.owner_id;
            try {
                const ownerUser = await interaction.client.users.fetch(ticketRow.owner_id);
                ownerName = ownerUser.username;
            } catch (e) {}

            // Save to Supabase
            const { error: sbError } = await supabase.from('tickets').insert({
                guild_id: interaction.guildId,
                channel_id: ticketRow.channel_id,
                owner_id: ticketRow.owner_id,
                owner_name: ownerName,
                topic: ticketRow.topic,
                closed_by: interaction.user.username,
                closed_at: new Date().toISOString(),
                status: 'closed',
                transcript: transcript
            });

            if (sbError) console.error("Ticket Supabase Error:", sbError);

            // Delete from local SQLite
            await db.run('DELETE FROM tickets WHERE channel_id = ?', [interaction.channelId]);

            // Delete channel
            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 3000);

        } catch (err) {
            console.error('Ticket Close Error:', err);
            interaction.editReply({ content: t('ticket.close_error', lang) }).catch(()=>{});
        }
    }
}


module.exports = {
    handleTicketInteraction
};
