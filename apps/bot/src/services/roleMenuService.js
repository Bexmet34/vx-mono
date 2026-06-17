const { supabase } = require('@veyronix/database');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

async function sendRoleMenu(client, menuId, guildId) {
    console.log(`[RoleMenuService] Sending custom menu ${menuId} for guild: ${guildId}`);
    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) throw new Error("Guild not found");

        const { data: menuConfig, error } = await supabase
            .from('custom_role_menus')
            .select('*')
            .eq('id', menuId)
            .eq('guild_id', guildId)
            .single();

        if (error || !menuConfig || !menuConfig.channel_id) throw new Error("Settings or channel missing");

        const channel = await guild.channels.fetch(menuConfig.channel_id);
        if (!channel) throw new Error("Channel not found in Discord");

        const menus = menuConfig.menus || [];
        if (menus.length === 0) throw new Error("No menus configured");

        const embed = new EmbedBuilder()
            .setTitle(menuConfig.embed_title || 'Role Selection / Rol Seçimi')
            .setDescription(menuConfig.embed_description || '**Select your roles from the dropdown menus below.**\n\n*Aşağıdaki menülerden rollerinizi seçebilirsiniz.*')
            .setColor(menuConfig.embed_color || '#fca311');

        if (menuConfig.embed_image_url) {
            embed.setImage(menuConfig.embed_image_url);
        }

        const components = [];

        // Build each menu into an ActionRow
        for (const menu of menus) {
            if (!menu.options || menu.options.length === 0) continue;

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(menu.custom_id)
                .setPlaceholder(menu.placeholder || 'Select Roles...')
                .setMinValues(0)
                .setMaxValues(Math.min(menu.options.length, 25))
                .addOptions(menu.options.map(opt => ({
                    label: opt.label || 'Role',
                    value: opt.value,
                    emoji: opt.emoji || undefined
                })));

            components.push(new ActionRowBuilder().addComponents(selectMenu));

            if (components.length >= 5) break; // Discord limit is 5 action rows
        }

        if (components.length === 0) throw new Error("No valid menus to display");

        let sentMessage;
        if (menuConfig.message_id) {
            try {
                const existingMsg = await channel.messages.fetch(menuConfig.message_id);
                sentMessage = await existingMsg.edit({ embeds: [embed], components });
            } catch (e) {
                // message deleted or not found
                sentMessage = await channel.send({ embeds: [embed], components });
            }
        } else {
            sentMessage = await channel.send({ embeds: [embed], components });
        }

        await supabase
            .from('custom_role_menus')
            .update({ 
                message_id: sentMessage.id, 
                trigger_menu_send: false 
            })
            .eq('id', menuId);

        console.log(`[RoleMenuService] Menu sent successfully for guild: ${guildId}`);
    } catch (err) {
        console.error(`[RoleMenuService] Menu send error for ${guildId}:`, err);
        await supabase.from('custom_role_menus').update({ trigger_menu_send: false }).eq('id', menuId);
    }
}

module.exports = { sendRoleMenu };
