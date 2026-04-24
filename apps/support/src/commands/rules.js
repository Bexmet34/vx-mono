const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Sunucu kurallarını hem Türkçe hem İngilizce olarak gönderir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const rulesEmbed = new EmbedBuilder()
      .setTitle('📜 Sunucu Kuralları | Server Rules')
      .setDescription('Lütfen topluluğumuzun huzuru için aşağıdaki kurallara uyunuz.\nPlease follow the rules below for the peace of our community.')
      .setColor('#0099ff')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields(
        { 
          name: '1. Saygı | Respect', 
          value: 'TR: Herkese karşı saygılı olun. Taciz, zorbalık ve hakaret yasaktır.\nEN: Be respectful to everyone. Harassment, bullying, and insults are prohibited.',
          inline: false 
        },
        { 
          name: '2. Dil Kullanımı | Language', 
          value: 'TR: Küfür, argo ve uygunsuz dil kullanımı yasaktır.\nEN: Swearing, slang, and inappropriate language are prohibited.',
          inline: false 
        },
        { 
          name: '3. Spam & Reklam | Spam & Ads', 
          value: 'TR: Spam yapmak, kanal kirliliği oluşturmak ve izinsiz reklam yapmak yasaktır.\nEN: Spamming, creating channel clutter, and unauthorized advertising are prohibited.',
          inline: false 
        },
        { 
          name: '4. İçerik Paylaşımı | Content Sharing', 
          value: 'TR: NSFW (+18), rahatsız edici veya yasa dışı içerik paylaşımı yasaktır.\nEN: Sharing NSFW (18+), disturbing, or illegal content is prohibited.',
          inline: false 
        },
        { 
          name: '5. Kişisel Veriler | Privacy', 
          value: 'TR: Başkalarının kişisel bilgilerini (Doxxing) paylaşmak kesinlikle yasaktır.\nEN: Sharing others\' personal information (Doxxing) is strictly prohibited.',
          inline: false 
        },
        { 
          name: '6. Kanallar | Channels', 
          value: 'TR: Kanalları amacına uygun kullanın. Yanlış kanalda yanlış içerik paylaşmayın.\nEN: Use channels for their intended purpose. Do not share the wrong content in the wrong channel.',
          inline: false 
        },
        { 
          name: '7. Yetkililer | Staff', 
          value: 'TR: Yetkililere karşı gelmeyin ve boş yere etiketlemeyin.\nEN: Do not defy staff and do not tag them unnecessarily.',
          inline: false 
        },
        { 
          name: '8. Dolandırıcılık | Scams', 
          value: 'TR: Dolandırıcılık, hesap çalma veya sahte link paylaşımı kalıcı engel sebebidir.\nEN: Scams, account theft, or sharing fake links is a reason for a permanent ban.',
          inline: false 
        },
        { 
          name: '9. Siyasi ve Dini Tartışmalar | Politics & Religion', 
          value: 'TR: Hassas konulara giren siyasi ve dini tartışmalar yasaktır.\nEN: Political and religious discussions that enter sensitive topics are prohibited.',
          inline: false 
        },
        { 
          name: '10. Kuralların Kabulü | Agreement', 
          value: 'TR: Sunucuya katılan herkes bu kuralları okumuş ve kabul etmiş sayılır.\nEN: Everyone who joins the server is deemed to have read and accepted these rules.',
          inline: false 
        }
      )
      .setFooter({ text: `${interaction.guild.name} Yönetimi | Management`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [rulesEmbed] });
  },
};
