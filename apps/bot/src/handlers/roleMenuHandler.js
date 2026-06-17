async function handleRoleMenuSelect(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const selectedRoleIds = interaction.values; // Array of selected discord role IDs
        const member = interaction.member;
        
        // The select menu component contains all available options
        const allMenuOptions = interaction.component.options;
        const allManagedRoleIds = allMenuOptions.map(opt => opt.value);

        const rolesToAdd = [];
        const rolesToRemove = [];
        
        // For reporting
        const addedNames = [];
        const removedNames = [];

        // Check each role managed by this dropdown
        for (const option of allMenuOptions) {
            const roleId = option.value;
            const roleLabel = option.label;
            
            const memberHasRole = member.roles.cache.has(roleId);
            const shouldHaveRole = selectedRoleIds.includes(roleId);

            if (shouldHaveRole && !memberHasRole) {
                rolesToAdd.push(roleId);
                addedNames.push(roleLabel);
            } else if (!shouldHaveRole && memberHasRole) {
                rolesToRemove.push(roleId);
                removedNames.push(roleLabel);
            }
        }

        let hasError = false;

        if (rolesToAdd.length > 0) {
            try {
                await member.roles.add(rolesToAdd);
            } catch (addErr) {
                console.error('[RoleMenuHandler] Error adding roles:', addErr.message);
                hasError = true;
            }
        }
        
        if (rolesToRemove.length > 0) {
            try {
                await member.roles.remove(rolesToRemove);
            } catch (remErr) {
                console.error('[RoleMenuHandler] Error removing roles:', remErr.message);
                hasError = true;
            }
        }

        if (hasError) {
            return await interaction.editReply("❌ **Rolleriniz güncellenirken bir hata oluştu.** Botun yetkilerinin bu rollerin üzerinde olduğundan ve yönetici rolleri seçmeye çalışmadığınızdan emin olun.");
        }

        let responseMsg = "✅ **Rolleriniz başarıyla güncellendi!**\n";
        if (addedNames.length > 0) responseMsg += `\n➕ **Eklenen Roller:** ${addedNames.join(', ')}`;
        if (removedNames.length > 0) responseMsg += `\n➖ **Alınan Roller:** ${removedNames.join(', ')}`;
        
        if (addedNames.length === 0 && removedNames.length === 0) {
            responseMsg = "ℹ️ Rollerinizde bir değişiklik yapılmadı.";
        }

        await interaction.editReply(responseMsg);

    } catch (err) {
        console.error('[RoleMenuHandler] Error:', err);
        await interaction.editReply("❌ İşlem sırasında beklenmedik bir hata oluştu.").catch(() => {});
    }
}

module.exports = { handleRoleMenuSelect };
