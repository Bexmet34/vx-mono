const { ChannelType, PermissionFlagsBits, OverwriteType } = require('discord.js');

// Memory map to track active temp channels: Map<channelId, { ownerId: string, creatorId: string }>
const activeTempChannels = new Map();

/**
 * Parses the channel name from the given format
 */
function parseChannelName(format, member, currentCount) {
    let name = format || "Kanal - {NUMBER}";
    name = name.replace(/{NUMBER}/g, currentCount.toString());
    name = name.replace(/{OWNER_USERNAME}/g, member.user.username);
    return name;
}

/**
 * Handles logic when a user joins a creator channel
 */
async function handleCreatorJoin(newState, creatorConfig) {
    const member = newState.member;
    const guild = newState.guild;
    const categoryId = creatorConfig.categoryId || null;

    try {
        // Calculate the next number for {NUMBER} variable
        let tempChannelCount = 1;
        if (categoryId) {
            tempChannelCount = guild.channels.cache.filter(c => c.parentId === categoryId && c.type === ChannelType.GuildVoice).size + 1;
        } else {
            tempChannelCount = activeTempChannels.size + 1;
        }

        const channelName = parseChannelName(creatorConfig.channelNameFormat, member, tempChannelCount);

        // Prepare Permissions
        const permissionOverwrites = [];

        // 1. Sync Mode (Category or Creator)
        if (creatorConfig.permissionSyncMode === 'creator' && newState.channel) {
            newState.channel.permissionOverwrites.cache.forEach(ow => {
                permissionOverwrites.push({
                    id: ow.id,
                    allow: ow.allow.toArray(),
                    deny: ow.deny.toArray(),
                    type: ow.type
                });
            });
        } else if (creatorConfig.permissionSyncMode === 'category' && categoryId) {
            const category = guild.channels.cache.get(categoryId);
            if (category) {
                category.permissionOverwrites.cache.forEach(ow => {
                    permissionOverwrites.push({
                        id: ow.id,
                        allow: ow.allow.toArray(),
                        deny: ow.deny.toArray(),
                        type: ow.type
                    });
                });
            }
        }

        // 2. Privacy Mode applied to @everyone
        const filteredOverwrites = permissionOverwrites.filter(ow => ow.id !== guild.id);
        
        const everyoneAllow = [];
        const everyoneDeny = [];

        if (creatorConfig.privacyMode === 'locked') {
            everyoneDeny.push(PermissionFlagsBits.Connect);
            everyoneAllow.push(PermissionFlagsBits.ViewChannel);
        } else if (creatorConfig.privacyMode === 'hidden') {
            everyoneDeny.push(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect);
        } else {
            // public
            everyoneAllow.push(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect);
        }

        filteredOverwrites.push({
            id: guild.id,
            allow: everyoneAllow,
            deny: everyoneDeny,
            type: OverwriteType.Role
        });

        // 3. Allowed Roles
        if (Array.isArray(creatorConfig.allowedRoles)) {
            for (const roleId of creatorConfig.allowedRoles) {
                const idx = filteredOverwrites.findIndex(ow => ow.id === roleId);
                if (idx > -1) filteredOverwrites.splice(idx, 1);

                filteredOverwrites.push({
                    id: roleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                    type: OverwriteType.Role
                });
            }
        }

        // 4. Owner Permissions
        const ownerAllow = [];
        if (Array.isArray(creatorConfig.ownerPermissions)) {
            const permMap = {
                'manage_roles': PermissionFlagsBits.ManageRoles,
                'manage_channels': PermissionFlagsBits.ManageChannels,
                'manage_messages': PermissionFlagsBits.ManageMessages,
                'disconnect_members': PermissionFlagsBits.MoveMembers,
                'create_invite': PermissionFlagsBits.CreateInstantInvite,
                'create_poll': PermissionFlagsBits.SendPolls,
                'send_voice_messages': PermissionFlagsBits.SendVoiceMessages,
                'stream': PermissionFlagsBits.Stream,
                'priority_speaker': PermissionFlagsBits.PrioritySpeaker,
                'use_voice_activity': PermissionFlagsBits.UseVAD,
                'set_voice_channel_status': PermissionFlagsBits.SetVoiceChannelStatus,
                'use_soundboard': PermissionFlagsBits.UseSoundboard
            };

            for (const p of creatorConfig.ownerPermissions) {
                if (permMap[p]) ownerAllow.push(permMap[p]);
            }
        }
        ownerAllow.push(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect);

        filteredOverwrites.push({
            id: member.id,
            allow: ownerAllow,
            type: OverwriteType.Member
        });

        // Create the channel
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: categoryId || null,
            bitrate: creatorConfig.bitrate === '128kbps' ? 128000 : (creatorConfig.bitrate === '96kbps' ? 96000 : 64000),
            userLimit: parseInt(creatorConfig.userLimit) || 0,
            permissionOverwrites: filteredOverwrites,
            reason: 'TempVoice channel created'
        });

        // Store in memory
        activeTempChannels.set(newChannel.id, {
            ownerId: member.id,
            creatorId: creatorConfig.id
        });

        // Move the user
        await member.voice.setChannel(newChannel.id).catch(err => {
            console.error(`[TempVoice] Failed to move user ${member.id}:`, err.message);
            setTimeout(() => {
                if (newChannel.members.size === 0) {
                    activeTempChannels.delete(newChannel.id);
                    newChannel.delete().catch(() => {});
                }
            }, 3000);
        });

    } catch (err) {
        console.error(`[TempVoice] Error creating temp channel for ${member.user.tag}:`, err);
    }
}

/**
 * Handles logic when a user leaves a temp channel
 */
async function handleTempChannelLeave(oldState) {
    const channelId = oldState.channelId;
    if (!channelId) return;

    if (activeTempChannels.has(channelId)) {
        const channel = oldState.channel;
        if (!channel) {
            activeTempChannels.delete(channelId);
            return;
        }

        if (channel.members.size === 0) {
            try {
                await channel.delete('TempVoice channel empty');
                activeTempChannels.delete(channelId);
            } catch (err) {
                console.error(`[TempVoice] Failed to delete empty temp channel ${channelId}:`, err.message);
            }
        }
    }
}

module.exports = {
    handleCreatorJoin,
    handleTempChannelLeave,
    activeTempChannels
};
