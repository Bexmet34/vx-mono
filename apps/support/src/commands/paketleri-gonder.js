const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { supabase } = require('@veyronix/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('paketleri-gonder')
    .setDescription('Veritabanındaki güncel fiyatlandırma paketlerini belirtilen kanala gönderir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => 
        option.setName('kanal')
            .setDescription('Mesajın gönderileceği kanal')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    ),

  async execute(interaction, client) {
    // deferReply to avoid interaction timeout if DB is slow
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
        // Fetch pricing plans from database
        const { data: plans, error } = await supabase
            .from('pricing_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error || !plans || plans.length === 0) {
            console.error('Veritabanından paketler çekilemedi:', error);
            return await interaction.editReply({ content: '❌ Paketler veritabanından çekilirken bir hata oluştu veya hiç paket bulunamadı.' });
        }

        const embed = new EmbedBuilder()
            .setTitle('💎 Veyronix Premium Paketleri | Pricing Packages')
            .setDescription('Sunucunuza ve botunuza güç katmak için aşağıdaki paketlerden birini seçebilirsiniz.\nYou can choose one of the packages below to empower your server and bot.\n\n🌐 **Satın almak için (To buy): [veyronix.com.tr](https://veyronix.com.tr)**')
            .setColor('#F1C40F')
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        // Add fields for each plan
        for (const plan of plans) {
            const featuresTr = Array.isArray(plan.features_tr) ? plan.features_tr.join(', ') : 'Belirtilmedi';
            const featuresEn = Array.isArray(plan.features_en) ? plan.features_en.join(', ') : 'Not specified';

            const fieldName = `🛒 ${plan.name_tr} | ${plan.name_en} - ${plan.amount} ${plan.currency || 'USDT'}`;
            const fieldValue = `🇹🇷 ${featuresTr}\n🇬🇧 ${featuresEn}`;

            embed.addFields({ name: fieldName, value: fieldValue, inline: false });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Satın Al / Buy')
                .setURL('https://veyronix.com.tr')
                .setStyle(ButtonStyle.Link)
        );

        const channel = interaction.options.getChannel('kanal');
        
        await channel.send({ embeds: [embed], components: [row] });
        
        await interaction.editReply({ content: `✅ Paketler başarıyla <#${channel.id}> kanalına gönderildi.` });

    } catch (err) {
        console.error('Paketleri Gönder komutu hatası:', err);
        await interaction.editReply({ content: `❌ Beklenmeyen bir hata oluştu: ${err.message}` });
    }
  },
};
