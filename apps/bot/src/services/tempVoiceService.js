const { ChannelType, PermissionFlagsBits, OverwriteType } = require('discord.js');
const { getGuildConfig } = require('./guildConfig');

// Memory map to track active temp channels: Map<channelId, { ownerId: string, creatorId: string, count: number }>
const activeTempChannels = new Map();
// Set to prevent duplicate concurrent creations for the same member
const creatingMembers = new Set();
// Timers map to prevent premature deletion during quick reconnects: Map<channelId, Timeout>
const pendingDeletions = new Map();

/**
 * Converts a number to Roman numerals
 */
function toRoman(num) {
    let n = Math.floor(Number(num));
    if (isNaN(n) || n <= 0 || !isFinite(n)) return 'I';
    var digits = String(n).split(""),
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
    let n = Math.floor(Number(num));
    if (isNaN(n) || n <= 0 || !isFinite(n)) return 'A';
    let safety = 0;
    while (n > 0 && safety++ < 10) {
        let mod = (n - 1) % 26;
        alpha = String.fromCharCode(65 + mod) + alpha;
        n = Math.floor((n - mod) / 26);
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

    // Prevent duplicate concurrent channel creations for the same user
    if (creatingMembers.has(member.id)) {
        console.log(`[VoiceForge] Ignored concurrent creator join for ${member.user.tag}`);
        return;
    }
    creatingMembers.add(member.id);

    try {
        const template = creatorConfig.channelNameFormat || creatorConfig.channelNameTemplate || creatorConfig.channelName || creatorConfig.nameFormat || "Kanal - {NUMBER}";
        const hasNumberToken = /{NUMBER(?:_ROMAN|_ALPHA|_EXPONENT|_DIGIT)?}/.test(template);
        let tempChannelCount = 1;
        let channelName = '';

        // Find the lowest available number that produces a unique channel name (max 50 attempts)
        for (let i = 1; i <= 50; i++) {
            let proposedName = parseChannelName(template, member, i);
            if (!hasNumberToken && i > 1) {
                proposedName = `${proposedName} (${i})`;
            }

            const nameExists = guild.channels.cache.some(ch => 
                ch.type === ChannelType.GuildVoice && ch.name.toLowerCase() === proposedName.toLowerCase()
            );

            if (!nameExists) {
                channelName = proposedName;
                tempChannelCount = i;
                break;
            }
        }

        if (!channelName) {
            const baseName = parseChannelName(template, member, 1);
            const randSuffix = Math.floor(Math.random() * 900) + 100;
            channelName = hasNumberToken ? `${baseName} - ${randSuffix}` : `${baseName} (${randSuffix})`;
            tempChannelCount = 1;
        }

        // Clamp channel name to valid Discord length (1-100 characters)
        channelName = channelName.trim().slice(0, 100) || `${member.user.username}'s channel`;

        // Determine category
        let categoryId = creatorConfig.categoryId;
        if (categoryId === 'Oluşturucunun kategorisi' || !categoryId) {
            categoryId = newState.channel ? newState.channel.parentId : null;
        }
        if (categoryId && !guild.channels.cache.has(categoryId)) {
            categoryId = newState.channel ? newState.channel.parentId : null;
        }

        // Determine bitrate safely within guild limits (prevent Discord 50035 error on unboosted guilds)
        let targetBitrate = 64000;
        if (creatorConfig.bitrate === '128kbps') targetBitrate = 128000;
        else if (creatorConfig.bitrate === '96kbps') targetBitrate = 96000;
        else if (creatorConfig.bitrate === '64kbps') targetBitrate = 64000;
        const maxBitrate = guild.maximumBitrate || 96000;
        const finalBitrate = Math.min(targetBitrate, maxBitrate);

        // Inherit RTC Region from creator channel or config
        const creatorChannel = newState.channel;
        const rtcRegion = creatorConfig.rtcRegion || creatorChannel?.rtcRegion || null;

        // User limit safely bounded
        const userLimit = Math.max(0, Math.min(99, parseInt(creatorConfig.userLimit, 10) || 0));

        // Build base permissions safely without duplicates
        const filteredOverwrites = [];
        const setOverwrite = (id, type, allow = [], deny = []) => {
            const idx = filteredOverwrites.findIndex(ow => ow.id === id);
            if (idx > -1) filteredOverwrites.splice(idx, 1);
            filteredOverwrites.push({ id, type, allow, deny });
        };

        // 1. Sync Mode (Category or Creator)
        if (creatorConfig.permissionSyncMode === 'creator' && newState.channel) {
            newState.channel.permissionOverwrites.cache.forEach(ow => {
                setOverwrite(ow.id, ow.type, ow.allow.toArray(), ow.deny.toArray());
            });
        } else if (creatorConfig.permissionSyncMode === 'category' && categoryId) {
            const category = guild.channels.cache.get(categoryId);
            if (category) {
                category.permissionOverwrites.cache.forEach(ow => {
                    setOverwrite(ow.id, ow.type, ow.allow.toArray(), ow.deny.toArray());
                });
            }
        }

        // Remove any pre-existing @everyone from sync; we set it definitively below
        const everyoneIdx = filteredOverwrites.findIndex(ow => ow.id === guild.id);
        if (everyoneIdx > -1) filteredOverwrites.splice(everyoneIdx, 1);

        // 2. Privacy Mode applied to @everyone
        const hasAllowedRoles = Array.isArray(creatorConfig.allowedRoles) && creatorConfig.allowedRoles.length > 0;
        const everyoneAllow = [];
        const everyoneDeny = [];

        if (creatorConfig.privacyMode === 'locked') {
            everyoneDeny.push(PermissionFlagsBits.Connect);
            everyoneAllow.push(PermissionFlagsBits.ViewChannel);
        } else if (creatorConfig.privacyMode === 'hidden') {
            everyoneDeny.push(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect);
        } else {
            // public
            if (hasAllowedRoles) {
                // If specific roles are allowed, restrict @everyone from connecting
                everyoneDeny.push(PermissionFlagsBits.Connect);
                everyoneAllow.push(PermissionFlagsBits.ViewChannel);
            } else {
                // Completely public room: grant full voice experience
                everyoneAllow.push(
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.Speak,
                    PermissionFlagsBits.Stream,
                    PermissionFlagsBits.UseVAD
                );
            }
        }

        setOverwrite(guild.id, OverwriteType.Role, everyoneAllow, everyoneDeny);

        // 3. Allowed Roles
        if (hasAllowedRoles) {
            for (const roleId of creatorConfig.allowedRoles) {
                setOverwrite(
                    roleId,
                    OverwriteType.Role,
                    [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                        PermissionFlagsBits.Stream,
                        PermissionFlagsBits.UseVAD
                    ],
                    []
                );
            }
        }

        // 4. Guarantee Bot Full Permissions (always can manage/move/connect)
        setOverwrite(
            guild.client.user.id,
            OverwriteType.Member,
            [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers,
                PermissionFlagsBits.ManageRoles
            ],
            []
        );

        // 5. Owner Permissions (ALWAYS include ViewChannel, Connect, Speak, Stream, UseVAD)
        const ownerAllow = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.Stream,
            PermissionFlagsBits.UseVAD
        ];

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
                if (permMap[p] && !ownerAllow.includes(permMap[p])) {
                    ownerAllow.push(permMap[p]);
                }
            }
        }

        setOverwrite(member.id, OverwriteType.Member, ownerAllow, []);

        const creatorChannelRef = newState.channel;
        let positionValue;

        if (creatorConfig.position === 'Üstte') {
            positionValue = 0;
        } else if (creatorConfig.position === 'Altta') {
            positionValue = 999;
        } else if (creatorConfig.position === 'Oluşturucunun hemen altında') {
            positionValue = creatorChannelRef ? creatorChannelRef.position + 1 : 999;
        } else {
            positionValue = creatorChannelRef ? creatorChannelRef.position + 1 : 999;
        }

        // Create the channel
        const channelOptions = {
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: categoryId || null,
            position: positionValue,
            bitrate: finalBitrate,
            userLimit: userLimit,
            permissionOverwrites: filteredOverwrites,
            reason: 'VoiceForge channel created'
        };
        if (rtcRegion) {
            channelOptions.rtcRegion = rtcRegion;
        }

        const newChannel = await guild.channels.create(channelOptions);

        // Store in memory
        activeTempChannels.set(newChannel.id, {
            ownerId: member.id,
            creatorId: creatorConfig.id,
            count: tempChannelCount
        });

        // Move the user if still connected to voice
        if (member.voice && member.voice.channelId) {
            await member.voice.setChannel(newChannel.id).catch(err => {
                console.error(`[VoiceForge] Failed to move user ${member.user.tag} to ${newChannel.name}:`, err.message);
            });
        }

        // Initial safety check after 8s: if user never joined, cleanup
        setTimeout(() => {
            const refreshed = guild.channels.cache.get(newChannel.id);
            if (refreshed && refreshed.members.size === 0) {
                activeTempChannels.delete(newChannel.id);
                refreshed.delete('VoiceForge initial empty check').catch(() => {});
            }
        }, 8000);

    } catch (err) {
        console.error(`[VoiceForge] Error creating temp channel for ${member.user.tag}:`, err);
    } finally {
        creatingMembers.delete(member.id);
    }
}

/**
 * Handles logic when a user leaves a voice channel (auto-cleanup empty temporary channels with grace period)
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

    if (isTempChannel) {
        const remainingMembers = channel.members.filter(m => m.id !== oldState.id);
        if (remainingMembers.size === 0) {
            // Cancel any existing pending deletion timer
            if (pendingDeletions.has(channelId)) {
                clearTimeout(pendingDeletions.get(channelId));
            }

            // Grace period of 3.5 seconds to avoid deleting during reconnect or WebRTC route change
            const timer = setTimeout(async () => {
                pendingDeletions.delete(channelId);
                try {
                    const refreshed = guild.channels.cache.get(channelId);
                    if (refreshed && refreshed.members.size === 0) {
                        activeTempChannels.delete(channelId);
                        await refreshed.delete('VoiceForge channel empty').catch(() => {});
                        console.log(`[VoiceForge] Cleaned up empty channel: ${refreshed.name} (${channelId}) in ${guild.name}`);
                    }
                } catch (err) {
                    console.error(`[VoiceForge] Failed to delete empty temp channel ${channelId}:`, err.message);
                }
            }, 3500);

            pendingDeletions.set(channelId, timer);
        } else {
            // Channel still has members; cancel any pending deletion
            if (pendingDeletions.has(channelId)) {
                clearTimeout(pendingDeletions.get(channelId));
                pendingDeletions.delete(channelId);
            }
        }
    }
}

/**
 * Scans all guilds and cleans up any abandoned empty temporary voice channels (e.g. on bot restart)
 */
async function cleanupEmptyTempChannels(client, isStartup = false) {
    try {
        if (isStartup) {
            console.log('[VoiceForge] Starting initial sweep for empty temporary voice channels...');
        }
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
                        await channel.delete('VoiceForge: sweep empty channel cleanup').catch(() => {});
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

        if (isStartup || deletedCount > 0) {
            console.log(`[VoiceForge] Sweep complete! Deleted ${deletedCount} empty channels, restored ${recoveredCount} active rooms.`);
        }
    } catch (err) {
        console.error('[VoiceForge] Error during temporary channel sweep:', err);
    }
}
async function updateOwnerPermissions(vc, newOwnerId, creatorId, guildId) {
    const { getGuildConfig } = require('./guildConfig');
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
    ownerAllowObj['Speak'] = true;
    ownerAllowObj['Stream'] = true;
    ownerAllowObj['UseVAD'] = true;
    
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
