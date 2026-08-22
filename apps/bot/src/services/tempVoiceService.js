const { ChannelType, PermissionFlagsBits, OverwriteType } = require('discord.js');

// Memory map to track active temp channels: Map<channelId, { ownerId: string, creatorId: string }>
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
        const d = member.user.createdAt;
        name = name.replace(/{OWNER_CREATED}/g, `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`);
    }
    if (name.includes('{OWNER_JOINED}')) {
        const d = member.joinedAt;
        if (d) {
            name = name.replace(/{OWNER_JOINED}/g, `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`);
        } else {
            name = name.replace(/{OWNER_JOINED}/g, "Bilinmiyor");
        }
    }

    // Role variables
    if (name.includes('{ROLE_HIGHEST}')) {
        name = name.replace(/{ROLE_HIGHEST}/g, member.roles.highest ? member.roles.highest.name : "Yok");
    }
    if (name.includes('{ROLE_HOIST}')) {
        name = name.replace(/{ROLE_HOIST}/g, member.roles.hoist ? member.roles.hoist.name : "Yok");
    }

    // Activity variables (fallback for now, require presence intent)
    const activity = member.presence?.activities?.[0];
    name = name.replace(/{ACTIVITY_NAME}/g, activity ? activity.name : "Oyun Oynamıyor");
    name = name.replace(/{ACTIVITY_NAME_MAJORITY}/g, activity ? activity.name : "Oyun Oynamıyor");
    name = name.replace(/{ACTIVITY_DETAILS}/g, activity?.details ? activity.details : "");
    name = name.replace(/{ACTIVITY_STATE}/g, activity?.state ? activity.state : "");

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
        // Calculate the next number for {NUMBER} variable using activeTempChannels for this creator
        const tempChannelCount = guild.channels.cache.filter(c => 
            activeTempChannels.has(c.id) && 
            activeTempChannels.get(c.id).creatorId === creatorConfig.id
        ).size + 1;

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
            reason: 'TempVoice channel created'
        });

        // Store in memory
        activeTempChannels.set(newChannel.id, {
            ownerId: member.id,
            creatorId: creatorConfig.id,
            count: tempChannelCount
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
    activeTempChannels,
    parseChannelName
};
