const { Events, MessageFlags } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
        }
      }
    }

    // String Select Menu handling
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_category_select') {
        const category = interaction.values[0];
        const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

        const ticketCategoryId = process.env.TICKET_CATEGORY_ID;
        const supportRoleId = process.env.SUPPORT_TEAM_ROLE_ID;

        try {
          // Bir kişinin zaten açık bir ticketi olup olmadığını kontrol etme
          const channelName = `ticket-${interaction.user.username}`.toLowerCase().substring(0, 32);
          const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName && c.parentId === ticketCategoryId);

          if (existingChannel) {
            return await interaction.reply({ content: `You already have an open support ticket: <#${existingChannel.id}>. Please use your existing ticket before opening a new one.`, flags: [MessageFlags.Ephemeral] });
          }

          const categoryMapping = {
            'genel_destek': 'General Support',
            'bot_kurulum': 'Bot Installation',
            'premium_odeme': 'Premium / Billing',
            'bug_bildirimi': 'Bug Report',
            'oneri_geribildirim': 'Suggestion / Feedback',
            'partnerlik': 'Partnership / Business'
          };
// ... (rest of creation logic remains similar)
          const categoryLabel = categoryMapping[category] || 'General Inquiry';

          const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: ticketCategoryId || null,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks],
              },
              ...(supportRoleId ? [{
                id: supportRoleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks],
              }] : []),
            ],
          });

          const ticketEmbed = new EmbedBuilder()
            .setTitle(`Private Support Ticket - ${categoryLabel}`)
            .setDescription(`Hello <@${interaction.user.id}>, welcome to your support ticket!\n\n` +
                            `Please describe your issue or question in detail. A member of our staff team (<@&${supportRoleId || 'Support'}>) will assist you as soon as they are available.\n\n` +
                            `**Category:** ${categoryLabel}\n` +
                            `**Ticket ID:** ${channel.id}`)
            .setColor('#ffff00')
            .setFooter({ text: 'Veyronix Support System' })
            .setTimestamp();

          const closeButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Close Ticket')
              .setStyle(ButtonStyle.Danger)
          );

          await channel.send({ content: `<@${interaction.user.id}> ${supportRoleId ? `<@&${supportRoleId}>` : ''}`, embeds: [ticketEmbed], components: [closeButton] });

          await interaction.reply({ content: `Your ticket has been created: <#${channel.id}>`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
          console.error(`Ticket creation error: ${error}`);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred while creating your ticket.', flags: [MessageFlags.Ephemeral] });
          }
        }
      }
    }

    // Button and Modal handling (Updated to include close_ticket)
    if (interaction.isButton()) {
      if (interaction.customId === 'close_ticket') {
        const supportRoleId = process.env.SUPPORT_TEAM_ROLE_ID;
        const isStaff = interaction.member.roles.cache.has(supportRoleId) || interaction.member.permissions.has('Administrator');

        if (!isStaff) {
            return await interaction.reply({ content: 'Sorry, only staff members can close support tickets.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.reply('This ticket will be closed in 5 seconds...');
        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch (err) {
            console.error('Failed to delete channel:', err);
          }
        }, 5000);
      } else if (interaction.customId === 'verify_button') {
        const { syncMemberRoles } = require('../utils/roleSync');
        const member = interaction.member;

        const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;
        const verifiedRoleId = process.env.VERIFIED_ROLE_ID;

        try {
          if (unverifiedRoleId && member.roles.cache.has(unverifiedRoleId)) {
            await member.roles.remove(unverifiedRoleId);
          }
          if (verifiedRoleId && !member.roles.cache.has(verifiedRoleId)) {
            await member.roles.add(verifiedRoleId);
          }

          // Sync with Supabase
          await syncMemberRoles(member, client.supabase);

          await interaction.reply({ content: 'You have been verified and your roles have been synced!', flags: [MessageFlags.Ephemeral] });
        } catch (error) {
          console.error(`Verification error: ${error}`);
          await interaction.reply({ content: 'An error occurred during verification.', flags: [MessageFlags.Ephemeral] });
        }
      }
    }
  },
};
