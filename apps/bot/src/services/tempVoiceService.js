const { ChannelType, PermissionFlagsBits, OverwriteType } = require('discord.js');
const { getGuildConfig } = require('./guildConfig');

// Memory map to track active temp channels: Map<channelId, { ownerId: string, creatorId: string, count: number }>
const activeTempChannels = new Map();

/**
 * Converts a number to Roman numerals
 */
function toRoman(num) {
    if (isNaN(num)) return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

/**
 * Converts a number to Alphabet (1=A, 2=B, 27=AA)
 */
function toAlpha(num) {
    let alpha = '';
    while (num > 0) {
        let mod = (num - 1) % 26;
        alpha = String.fromCharCode(65 + mod) + alpha;
        num = Math.floor((num - mod) / 26);
    }
    return alpha || 'A';
}

/**
 * Converts a number to Superscript
 */
function toExponent(num) {
    const map = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
    return String(num).split('').map(c => map[c]).join('');
}

/**
 * Parses the channel name from the given format
 */
function parseChannelName(format, member, currentCount) {
    let name = format || "Kanal - {NUMBER}";
    
    // Numbers
    name = name.replace(/{NUMBER}/g, currentCount.toString());
    name = name.replace(/{NUMBER_ROMAN}/g, toRoman(currentCount));
    name = name.replace(/{NUMBER_ALPHA}/g, toAlpha(currentCount));
    name = name.replace(/{NUMBER_EXPONENT}/g, toExponent(currentCount));
    name = name.replace(/{NUMBER_DIGIT}/g, currentCount.toString().padStart(3, '0'));

    // Owner variables
    name = name.replace(/{OWNER_USERNAME}/g, member.user.username);
    name = name.replace(/{OWNER_NICKNAME}/g, member.displayName || member.user.username);
    
    if (name.includes('{OWNER_CREATED}')) {
        const createdDate = new Date(member.user.createdTimestamp);
        const day = String(createdDate.getDate()).padStart(2, '0');
        const month = String(createdDate.getMonth() + 1).padStart(2, '0');
        const year = createdDate.getFullYear();
        name = name.replace(/{OWNER_CREATED}/g, `${day}.${month}.${year}`);
    }
    
    if (name.includes('{OWNER_JOINED}')) {
        const joinedDate = new Date(member.joinedTimestamp);
        const day = String(joinedDate.getDate()).padStart(2, '0');
        const month = String(joinedDate.getMonth() + 1).padStart(2, '0');
        const year = joinedDate.getFullYear();
        name = name.replace(/{OWNER_JOINED}/g, `${day}.${month}.${year}`);
    }

    // Roles
    if (name.includes('{ROLE_HIGHEST}')) {
        const highestRole = member.roles?.highest?.name || '@everyone';
        name = name.replace(/{ROLE_HIGHEST}/g, highestRole);
    }
    if (name.includes('{ROLE_HOIST}')) {
        const hoistRole = member.roles?.hoist?.name || member.roles?.highest?.name || '@everyone';
        name = name.replace(/{ROLE_HOIST}/g, hoistRole);
    }

    // Default Game / Activity Name if available
    let gameName = "Oyun Yok";
    let gameDetails = "";
    let gameState = "";
    if (member.presence && member.presence.activities && member.presence.activities.length > 0) {
        const gameActivity = member.presence.activities.find(a => a.type === 0) || member.presence.activities[0];
        if (gameActivity) {
            if (gameActivity.name) gameName = gameActivity.name;
            if (gameActivity.details) gameDetails = gameActivity.details;
            if (gameActivity.state) gameState = gameActivity.state;
        }
    }
    name = name.replace(/{GAME_NAME}/g, gameName);
    name = name.replace(/{ACTIVITY_NAME}/g, gameName);
    name = name.replace(/{ACTIVITY_NAME_MAJORITY}/g, gameName);
    name = name.replace(/{ACTIVITY_DETAILS}/g, gameDetails);
    name = name.replace(/{ACTIVITY_STATE}/g, gameState);

    return name;
}

/**
 * Handles logic when a user joins a creator voice channel
 */
async function handleCreatorJoin(newState, creatorConfig) {
    const member = newState.member;
    const guild = newState.guild;

    if (!member || !creatorConfig) return;

    try {
        const template = creatorConfig.channelNameFormat || creatorConfig.channelNameTemplate || creatorConfig.channelName || creatorConfig.nameFormat || "Kanal - {NUMBER}";
        let tempChannelCount = 1;
        
        // Find the lowest available number that produces a unique channel name
        while (true) {
            const proposedName = parseChannelName(template, member, tempChannelCount);
            
            // Check if a channel with this exact name already exists
            const nameExists = guild.channels.cache.some(ch => 
                ch.type === ChannelType.GuildVoice && ch.name === proposedName
            );
            
            if (!nameExists) {
                break;
            }
            tempChannelCount++;
        }

        const channelName = parseChannelName(template, member, tempChannelCount);

        // Determine category
        let categoryId = creatorConfig.categoryId;
        if (categoryId === 'Oluşturucunun kategorisi' || !categoryId) {
            categoryId = newState.channel ? newState.channel.parentId : null;
        }

        // Build base permissions
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

        const creatorChannel = newState.channel;
        let positionValue;

        if (creatorConfig.position === 'Üstte') {
            positionValue = 0;
        } else if (creatorConfig.position === 'Altta') {
            positionValue = 999;
        } else if (creatorConfig.position === 'Oluşturucunun hemen altında') {
            positionValue = creatorChannel ? creatorChannel.position + 1 : 999;
        } else {
            positionValue = creatorChannel ? creatorChannel.position + 1 : 999;
        }

        // Create the channel
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: categoryId || null,
            position: positionValue,
            bitrate: creatorConfig.bitrate === '128kbps' ? 128000 : (creatorConfig.bitrate === '96kbps' ? 96000 : 64000),
            userLimit: parseInt(creatorConfig.userLimit) || 0,
            permissionOverwrites: filteredOverwrites,
            reason: 'VoiceForge channel created'
        });

        // Store in memory
        activeTempChannels.set(newChannel.id, {
            ownerId: member.id,
            creatorId: creatorConfig.id,
            count: tempChannelCount
        });

        // Move the user
        await member.voice.setChannel(newChannel.id).catch(err => {
            console.error(`[VoiceForge] Failed to move user ${member.user.tag} to ${newChannel.name}:`, err);
            // If move fails and channel is empty, cleanup
            setTimeout(() => {
                if (newChannel.members.size === 0) {
                    activeTempChannels.delete(newChannel.id);
                    newChannel.delete().catch(() => {});
                }
            }, 3000);
        });

    } catch (err) {
        console.error(`[VoiceForge] Error creating temp channel for ${member.user.tag}:`, err);
    }
}

/**
 * Handles logic when a user leaves a voice channel (auto-cleanup empty temporary channels)
 */
async function handleTempChannelLeave(oldState) {
    const channelId = oldState.channelId;
    if (!channelId) return;

    const guild = oldState.guild;
    const channel = oldState.channel || guild.channels.cache.get(channelId);
    if (!channel) {
        activeTempChannels.delete(channelId);
        return;
    }

    // Check if channel is a tracked temp channel OR an orphan temp channel created by VoiceForge
    let isTempChannel = activeTempChannels.has(channelId);

    if (!isTempChannel) {
        try {
            const config = await getGuildConfig(guild.id);
            if (config && Array.isArray(config.tempvoice_creators)) {
                const isCreatorItself = config.tempvoice_creators.some(c => c.channelId === channelId);
                if (!isCreatorItself) {
                    const isUnderCreatorCategory = config.tempvoice_creators.some(c => 
                        (c.categoryId && channel.parentId === c.categoryId) ||
                        (c.channelId && channel.parentId && channel.parentId === guild.channels.cache.get(c.channelId)?.parentId)
                    );
                    if (isUnderCreatorCategory) {
                        isTempChannel = true;
                    }
                }
            }
        } catch (e) {
            console.error('[VoiceForge] Error checking temp channel origin on leave:', e);
        }
    }

    if (isTempChannel && channel.members.size === 0) {
        try {
            activeTempChannels.delete(channelId);
            await channel.delete('VoiceForge channel empty');
            console.log(`[VoiceForge] Cleaned up empty channel: ${channel.name} (${channelId}) in ${guild.name}`);
        } catch (err) {
            console.error(`[VoiceForge] Failed to delete empty temp channel ${channelId}:`, err.message);
        }
    }
}

/**
 * Scans all guilds and cleans up any abandoned empty temporary voice channels (e.g. on bot restart)
 */
async function cleanupEmptyTempChannels(client) {
    try {
        console.log('[VoiceForge] Starting automatic sweep for empty temporary voice channels...');
        let deletedCount = 0;
        let recoveredCount = 0;

        for (const guild of client.guilds.cache.values()) {
            const config = await getGuildConfig(guild.id).catch(() => null);
            if (!config || !Array.isArray(config.tempvoice_creators) || config.tempvoice_creators.length === 0) {
                continue;
            }

            const creatorChannelIds = new Set(config.tempvoice_creators.map(c => c.channelId));
            const creatorCategoryIds = new Set(config.tempvoice_creators.map(c => c.categoryId).filter(Boolean));

            // Also include parent categories of creator channels
            config.tempvoice_creators.forEach(c => {
                const ch = guild.channels.cache.get(c.channelId);
                if (ch && ch.parentId) creatorCategoryIds.add(ch.parentId);
            });

            for (const channel of guild.channels.cache.values()) {
                if (channel.type !== ChannelType.GuildVoice) continue;
                if (creatorChannelIds.has(channel.id)) continue; // Never delete the creator join channel itself!

                // Check if this channel is in one of the creator categories
                if (channel.parentId && creatorCategoryIds.has(channel.parentId)) {
                    if (channel.members.size === 0) {
                        // EMPTY: Delete it!
                        activeTempChannels.delete(channel.id);
                        await channel.delete('VoiceForge: startup sweep empty channel cleanup').catch(() => {});
                        deletedCount++;
                    } else {
                        // ACTIVE: Register into activeTempChannels so room owner keeps full control
                        const memberOverwrite = channel.permissionOverwrites.cache.find(ow => ow.type === 1);
                        const firstMember = channel.members.first();
                        const ownerId = memberOverwrite ? memberOverwrite.id : firstMember?.id;

                        activeTempChannels.set(channel.id, {
                            ownerId: ownerId,
                            creatorId: config.tempvoice_creators[0]?.id,
                            count: 1
                        });
                        recoveredCount++;
                    }
                }
            }
        }

        console.log(`[VoiceForge] Sweep complete! Deleted ${deletedCount} empty channels, restored ${recoveredCount} active rooms.`);
    } catch (err) {
        console.error('[VoiceForge] Error during temporary channel sweep:', err);
    }
}
async function updateOwnerPermissions(vc, newOwnerId, creatorId, guildId) {
    const { getGuildConfig } = require('./db');
    const config = await getGuildConfig(guildId);
    const creators = Array.isArray(config?.tempvoice_creators) ? config.tempvoice_creators : [];
    const creatorConfig = creators.find(c => c.id === creatorId);
    
    const ownerAllowObj = {};
    if (creatorConfig && Array.isArray(creatorConfig.ownerPermissions)) {
        const permStrMap = {
            'manage_roles': 'ManageRoles',
            'manage_channels': 'ManageChannels',
            'manage_messages': 'ManageMessages',
            'disconnect_members': 'MoveMembers',
            'create_invite': 'CreateInstantInvite',
            'create_poll': 'SendPolls',
            'send_voice_messages': 'SendVoiceMessages',
            'stream': 'Stream',
            'priority_speaker': 'PrioritySpeaker',
            'use_voice_activity': 'UseVAD',
            'set_voice_channel_status': 'SetVoiceChannelStatus',
            'use_soundboard': 'UseSoundboard'
        };
        for (const p of creatorConfig.ownerPermissions) {
            if (permStrMap[p]) ownerAllowObj[permStrMap[p]] = true;
        }
    }
    ownerAllowObj['ViewChannel'] = true;
    ownerAllowObj['Connect'] = true;
    
    await vc.permissionOverwrites.edit(newOwnerId, ownerAllowObj);
}

module.exports = {
    handleCreatorJoin,
    handleTempChannelLeave,
    cleanupEmptyTempChannels,
    activeTempChannels,
    parseChannelName,
    updateOwnerPermissions
};
