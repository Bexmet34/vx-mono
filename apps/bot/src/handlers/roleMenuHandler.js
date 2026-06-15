const { supabase } = require('@veyronix/database');

async function handleRoleMenuSelect(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const selectedRoleKeys = interaction.values; // Array of selected values (role_key)
        const guildId = interaction.guildId;
        const member = interaction.member;
        
        // Find the category from the customId
        // customId is like 'role_menu_combat', 'role_menu_economy', 'role_menu_crafting'
        const categoryMatch = interaction.customId.replace('role_menu_', '');

        // Fetch all roles for this guild
        const { data: guildRoles, error } = await supabase
            .from('guild_roles')
            .select(`
                discord_role_id,
                role_key,
                global_roles!inner(category, role_name)
            `)
            .eq('guild_id', guildId);

        if (error || !guildRoles) {
            return interaction.editReply("Sunucu rol yapılandırması bulunamadı. Lütfen yetkililere bildirin.");
        }

        // We need to figure out which roles belong to the current dropdown
        // so we can remove the ones the user unselected, and add the ones they selected.
        let targetCategories = [];
        if (categoryMatch === 'combat') targetCategories = ['combat'];
        if (categoryMatch === 'economy') targetCategories = ['economy', 'gathering'];
        if (categoryMatch === 'crafting') targetCategories = ['crafting'];

        const rolesInMenu = guildRoles.filter(gr => targetCategories.includes(gr.global_roles.category));
        
        const rolesToAdd = [];
        const rolesToRemove = [];
        const addedNames = [];
        const removedNames = [];

        for (const gr of rolesInMenu) {
            const hasRole = member.roles.cache.has(gr.discord_role_id);
            const shouldHaveRole = selectedRoleKeys.includes(gr.role_key);

            if (shouldHaveRole && !hasRole) {
                rolesToAdd.push(gr.discord_role_id);
                addedNames.push(gr.global_roles.role_name);
            } else if (!shouldHaveRole && hasRole) {
                rolesToRemove.push(gr.discord_role_id);
                removedNames.push(gr.global_roles.role_name);
            }
        }

        if (rolesToAdd.length > 0) {
            await member.roles.add(rolesToAdd).catch(console.error);
        }
        if (rolesToRemove.length > 0) {
            await member.roles.remove(rolesToRemove).catch(console.error);
        }

        let responseMsg = "Rolleriniz başarıyla güncellendi!\n";
        if (addedNames.length > 0) responseMsg += `\n✅ **Eklenen Roller:** ${addedNames.join(', ')}`;
        if (removedNames.length > 0) responseMsg += `\n❌ **Alınan Roller:** ${removedNames.join(', ')}`;
        
        if (addedNames.length === 0 && removedNames.length === 0) {
            responseMsg = "Rollerinizde bir değişiklik yapılmadı.";
        }

        await interaction.editReply(responseMsg);

    } catch (err) {
        console.error('[RoleMenuHandler] Error:', err);
        await interaction.editReply("İşlem sırasında bir hata oluştu.").catch(() => {});
    }
}

module.exports = { handleRoleMenuSelect };
