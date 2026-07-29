const { MessageFlags } = require('discord.js');
const { getGuildConfig } = require('../services/guildConfig');

async function handleRoleMenuSelect(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const guildConfig = await getGuildConfig(interaction.guildId);
        const lang = guildConfig?.language || 'tr';

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
            return await interaction.editReply(lang === 'tr' 
                ? "❌ **Rolleriniz güncellenirken bir hata oluştu.** Botun yetkilerinin bu rollerin üzerinde olduğundan ve yönetici rolleri seçmeye çalışmadığınızdan emin olun."
                : "❌ **An error occurred while updating your roles.** Ensure bot permissions are higher than these roles.");
        }

        let responseMsg = lang === 'tr' ? "✅ **Rolleriniz başarıyla güncellendi!**\n" : "✅ **Your roles have been updated successfully!**\n";
        if (addedNames.length > 0) responseMsg += lang === 'tr' ? `\n➕ **Eklenen Roller:** ${addedNames.join(', ')}` : `\n➕ **Added Roles:** ${addedNames.join(', ')}`;
        if (removedNames.length > 0) responseMsg += lang === 'tr' ? `\n➖ **Alınan Roller:** ${removedNames.join(', ')}` : `\n➖ **Removed Roles:** ${removedNames.join(', ')}`;
        
        if (addedNames.length === 0 && removedNames.length === 0) {
            responseMsg = lang === 'tr' ? "ℹ️ Rollerinizde bir değişiklik yapılmadı." : "ℹ️ No changes were made to your roles.";
        }

        await interaction.editReply(responseMsg);

    } catch (err) {
        console.error('[RoleMenuHandler] Error:', err);
        const guildConfig = await getGuildConfig(interaction.guildId).catch(()=>null);
        const lang = guildConfig?.language || 'tr';
        await interaction.editReply(lang === 'tr' ? "❌ İşlem sırasında beklenmedik bir hata oluştu." : "❌ An unexpected error occurred.").catch(() => {});
    }
}


module.exports = { handleRoleMenuSelect };
