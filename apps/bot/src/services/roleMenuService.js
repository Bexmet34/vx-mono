const { supabase } = require('@veyronix/database');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

async function setupGuildRoles(client, guildId) {
    console.log(`[RoleMenuService] Starting role setup for guild: ${guildId}`);
    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) throw new Error("Guild not found");

        const { data: globalRoles, error } = await supabase
            .from('global_roles')
            .select('*');

        if (error || !globalRoles) throw error;

        // Fetch existing guild roles from DB to avoid recreating them
        const { data: existingGuildRoles } = await supabase
            .from('guild_roles')
            .select('role_key, discord_role_id')
            .eq('guild_id', guildId);

        const existingMap = new Map();
        if (existingGuildRoles) {
            for (const gr of existingGuildRoles) {
                existingMap.set(gr.role_key, gr.discord_role_id);
            }
        }

        // Create roles in Discord and insert into guild_roles
        for (const gr of globalRoles) {
            let roleId = existingMap.get(gr.role_key);
            
            // Check if it actually exists in Discord
            if (roleId) {
                const discordRole = await guild.roles.fetch(roleId).catch(() => null);
                if (!discordRole) roleId = null; // Role was deleted in Discord
            }

            if (!roleId) {
                const newRole = await guild.roles.create({
                    name: gr.role_name,
                    color: gr.color || '#808080',
                    reason: 'Veyronix Bot - Automatic Role Menu Setup',
                    mentionable: false
                });

                roleId = newRole.id;
                
                // Save to DB
                await supabase
                    .from('guild_roles')
                    .upsert(
                        { guild_id: guildId, role_key: gr.role_key, discord_role_id: roleId },
                        { onConflict: 'guild_id, role_key' }
                    );
            }
        }

        // Set is_installed = true, trigger_roles_setup = false
        await supabase
            .from('guild_role_menus')
            .update({ is_installed: true, trigger_roles_setup: false })
            .eq('guild_id', guildId);

        console.log(`[RoleMenuService] Role setup complete for guild: ${guildId}`);
    } catch (err) {
        console.error(`[RoleMenuService] Setup error for ${guildId}:`, err);
        // Turn off trigger even on error to prevent infinite loop
        await supabase.from('guild_role_menus').update({ trigger_roles_setup: false }).eq('guild_id', guildId);
    }
}

async function sendRoleMenu(client, guildId) {
    console.log(`[RoleMenuService] Sending menu for guild: ${guildId}`);
    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) throw new Error("Guild not found");

        const { data: menuSettings, error } = await supabase
            .from('guild_role_menus')
            .select('*')
            .eq('guild_id', guildId)
            .single();

        if (error || !menuSettings || !menuSettings.channel_id) throw new Error("Settings or channel missing");

        const channel = await guild.channels.fetch(menuSettings.channel_id);
        if (!channel) throw new Error("Channel not found in Discord");

        const { data: globalRoles } = await supabase
            .from('global_roles')
            .select('*')
            .order('created_at', { ascending: true });

        const activeRoleKeys = menuSettings.active_roles || [];
        if (activeRoleKeys.length === 0) throw new Error("No active roles configured");

        const activeGlobalRoles = globalRoles.filter(r => activeRoleKeys.includes(r.role_key));
        
        // Group them
        const combatRoles = activeGlobalRoles.filter(r => r.category === 'combat');
        const economyRoles = activeGlobalRoles.filter(r => r.category === 'economy' || r.category === 'gathering');
        const craftingRoles = activeGlobalRoles.filter(r => r.category === 'crafting');

        const limits = menuSettings.category_limits || { combat: 5, economy: 5, crafting: 5 };

        const embed = new EmbedBuilder()
            .setTitle('🎭 Role Selection / Rol Seçimi')
            .setDescription('**Select your roles from the dropdown menus below to access specific channels and get notified for events.**\n\n*Aşağıdaki menülerden rollerinizi seçerek ilgili etkinliklerden haberdar olabilirsiniz.*')
            .setColor('#fca311');

        if (menuSettings.header_image_url) {
            embed.setImage(menuSettings.header_image_url);
        }

        const components = [];

        // Build Combat Menu
        if (combatRoles.length > 0) {
            const combatMenu = new StringSelectMenuBuilder()
                .setCustomId('role_menu_combat')
                .setPlaceholder('⚔️ Savaş Rolleri / Combat Roles')
                .setMinValues(0)
                .setMaxValues(Math.min(combatRoles.length, limits.combat || 5))
                .addOptions(combatRoles.map(r => ({
                    label: r.role_name,
                    value: r.role_key,
                    emoji: r.icon_emoji || '⚔️'
                })));
            components.push(new ActionRowBuilder().addComponents(combatMenu));
        }

        // Build Economy Menu
        if (economyRoles.length > 0) {
            const economyMenu = new StringSelectMenuBuilder()
                .setCustomId('role_menu_economy')
                .setPlaceholder('🌾 Ekonomi & Toplayıcı / Economy & Gathering')
                .setMinValues(0)
                .setMaxValues(Math.min(economyRoles.length, limits.economy || 5))
                .addOptions(economyRoles.map(r => ({
                    label: r.role_name,
                    value: r.role_key,
                    emoji: r.icon_emoji || '🌾'
                })));
            components.push(new ActionRowBuilder().addComponents(economyMenu));
        }

        // Build Crafting Menu
        if (craftingRoles.length > 0) {
            const craftingMenu = new StringSelectMenuBuilder()
                .setCustomId('role_menu_crafting')
                .setPlaceholder('⚒️ Zanaat Rolleri / Crafting Roles')
                .setMinValues(0)
                .setMaxValues(Math.min(craftingRoles.length, limits.crafting || 5))
                .addOptions(craftingRoles.map(r => ({
                    label: r.role_name,
                    value: r.role_key,
                    emoji: r.icon_emoji || '⚒️'
                })));
            components.push(new ActionRowBuilder().addComponents(craftingMenu));
        }

        if (components.length === 0) throw new Error("No menus generated");

        let sentMessage;
        if (menuSettings.message_id) {
            try {
                const existingMsg = await channel.messages.fetch(menuSettings.message_id);
                sentMessage = await existingMsg.edit({ embeds: [embed], components });
            } catch (e) {
                // message deleted or not found
                sentMessage = await channel.send({ embeds: [embed], components });
            }
        } else {
            sentMessage = await channel.send({ embeds: [embed], components });
        }

        await supabase
            .from('guild_role_menus')
            .update({ 
                message_id: sentMessage.id, 
                trigger_roles_menu_send: false 
            })
            .eq('guild_id', guildId);

        console.log(`[RoleMenuService] Menu sent successfully for guild: ${guildId}`);
    } catch (err) {
        console.error(`[RoleMenuService] Menu send error for ${guildId}:`, err);
        await supabase.from('guild_role_menus').update({ trigger_roles_menu_send: false }).eq('guild_id', guildId);
    }
}

module.exports = { setupGuildRoles, sendRoleMenu };
