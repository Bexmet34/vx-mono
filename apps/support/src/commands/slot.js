const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType 
} = require('discord.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Sembol Tanımlamaları ve Ağırlıklar (RTP Dengeli)
const SYMBOLS = [
  { emoji: '🍒', weight: 40, multiplier: 2, isSpecial: false },
  { emoji: '🍋', weight: 30, multiplier: 3, isSpecial: false },
  { emoji: '🍇', weight: 15, multiplier: 5, isSpecial: false },
  { emoji: '🔔', weight: 10, multiplier: 10, isSpecial: false },
  { emoji: '💎', weight: 4,  multiplier: 25, isSpecial: false },
  { emoji: '7️⃣', weight: 1,  multiplier: 100, isSpecial: false },
  { emoji: '⭐', weight: 5,  multiplier: 15, isSpecial: true, type: 'WILD' },
  { emoji: '🌀', weight: 5,  multiplier: 0,  isSpecial: true, type: 'SCATTER' }
];

// Ağırlıklı Rastgele Sembol Seçimi
function getRandomSymbol() {
  const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);

  for (const symbol of SYMBOLS) {
    if (random < symbol.weight) return symbol;
    random -= symbol.weight;
  }
}

// Ödül ve Kombinasyon Hesaplama Mantığı
function calculatePayout(s1, s2, s3, bet) {
  const line = [s1, s2, s3];
  const scatterCount = line.filter(s => s.type === 'SCATTER').length;

  // 1. SCATTER KONTROLÜ (Öncelikli)
  if (scatterCount === 3) {
    return {
      won: bet * 5,
      freeSpins: 10,
      type: 'SCATTER',
      message: '🌀 **BOOM! 3x Scatter!** 10 Free Spin + 5x Bahis Kazandın!',
      color: '#9B59B6'
    };
  } else if (scatterCount === 2) {
    return {
      won: bet,
      freeSpins: 3,
      type: 'SCATTER',
      message: '🌀 **2x Scatter!** Bahsin İade Edildi + 3 Free Spin Kazandın!',
      color: '#8E44AD'
    };
  }

  // 2. WILD (JOKER) HESAPLAMASI
  const nonWilds = line.filter(s => s.type !== 'WILD' && s.type !== 'SCATTER');

  // Hepsi Wild ise
  if (line.every(s => s.type === 'WILD')) {
    return {
      won: bet * 15,
      freeSpins: 0,
      type: 'JACKPOT',
      message: '⭐ **SUPER WILD JACKPOT!** x15 Çarpan!',
      color: '#F1C40F'
    };
  }

  // 3'lü Eşleşme (Wild Destekli)
  const targetSymbol = nonWilds[0] || s1;
  const isTriple = line.every(s => s.emoji === targetSymbol.emoji || s.type === 'WILD');

  if (isTriple) {
    const wonAmount = bet * targetSymbol.multiplier;
    return {
      won: wonAmount,
      freeSpins: 0,
      type: 'JACKPOT',
      message: `🎉 **3x ${targetSymbol.emoji} Eşleşti!** x${targetSymbol.multiplier} Çarpan!`,
      color: '#2ECC71'
    };
  }

  // 2'li Eşleşme (Wild Destekli)
  const isDouble = 
    (s1.emoji === s2.emoji || s1.type === 'WILD' || s2.type === 'WILD') &&
    (s2.emoji === s3.emoji || s2.type === 'WILD' || s3.type === 'WILD') ||
    (s1.emoji === s3.emoji || s1.type === 'WILD' || s3.type === 'WILD');

  if (isDouble && nonWilds.length > 0) {
    const matchSymbol = nonWilds[0];
    const matchMultiplier = Math.max(1.5, matchSymbol.multiplier / 2);
    const wonAmount = Math.floor(bet * matchMultiplier);
    return {
      won: wonAmount,
      freeSpins: 0,
      type: 'WIN',
      message: `✨ **2x ${matchSymbol.emoji} Eşleşti!** ${wonAmount} Puan Kazandın!`,
      color: '#3498DB'
    };
  }

  // Kayıp
  return {
    won: 0,
    freeSpins: 0,
    type: 'LOSE',
    message: '💥 **Tüh!** Hiçbir kombinasyon yakalanamadı.',
    color: '#E74C3C'
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('🎰 Gelişmiş Slot Makinesi')
    .addIntegerOption(option => 
      option.setName('bahis')
        .setDescription('Yatıralacak puan miktarı')
        .setRequired(false)
    ),

  async execute(interaction) {
    let bet = interaction.options.getInteger('bahis') || 10;
    let mockBalance = 500;

    if (bet > mockBalance || bet <= 0) {
      return interaction.reply({ content: 'Geçersiz bahis miktarı!', ephemeral: true });
    }

    const playSlot = async (currentInteraction, isEdit = false) => {
      // Slot Dönüş Animasyonu Embed
      const embed = new EmbedBuilder()
        .setTitle('🎰 Veyronix Casino Slot')
        .setColor('#F39C12')
        .setDescription('**[ 🔄 | 🔄 | 🔄 ]**\n\n*Çarklar dönüyor...*')
        .setFooter({ text: `Bahis: ${bet} Puan | Bakiye: ${mockBalance}` });

      let responseMsg;
      if (isEdit) {
        responseMsg = await currentInteraction.update({ embeds: [embed], components: [] });
      } else {
        responseMsg = await currentInteraction.reply({ embeds: [embed], fetchReply: true });
      }

      const s1 = getRandomSymbol();
      const s2 = getRandomSymbol();
      const s3 = getRandomSymbol();

      // Kare 1
      await delay(800);
      embed.setDescription(`**[ ${s1.emoji} | 🔄 | 🔄 ]**\n\n*Çarklar dönüyor...*`);
      await currentInteraction.editReply({ embeds: [embed] });

      // Kare 2
      await delay(800);
      embed.setDescription(`**[ ${s1.emoji} | ${s2.emoji} | 🔄 ]**\n\n*Çarklar dönüyor...*`);
      await currentInteraction.editReply({ embeds: [embed] });

      // Kare 3 (Sonuç)
      await delay(1000);
      const result = calculatePayout(s1, s2, s3, bet);
      mockBalance = mockBalance - bet + result.won;

      embed.setColor(result.color)
        .setDescription(`
**[ ${s1.emoji} | ${s2.emoji} | ${s3.emoji} ]**

${result.message}

💵 **Kazanılan:** \`${result.won} Puan\`
💳 **Yeni Bakiye:** \`${mockBalance} Puan\`
${result.freeSpins > 0 ? `🎁 **Kazandığınız Free Spin:** \`${result.freeSpins}\`` : ''}
        `);

      // Discord Butonları
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('respin')
          .setLabel('Tekrar Çevir')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setCustomId('double_down')
          .setLabel('2x Bahis')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🚀')
      );

      const finalMsg = await currentInteraction.editReply({ embeds: [embed], components: [row] });

      // Buton Dinleyici (Collector)
      const collector = finalMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000 // 30 Saniye aktif kalır
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'Bu butonu sadece komutu başlatan kullanabilir.', ephemeral: true });
        }

        if (i.customId === 'double_down') {
          bet = bet * 2;
        }

        if (mockBalance < bet) {
          return i.reply({ content: 'Yetersiz bakiye! Bahis sıfırlandı.', ephemeral: true });
        }

        collector.stop();
        await playSlot(i, true);
      });

      collector.on('end', (_, reason) => {
        if (reason !== 'user') {
          // Süre dolduğunda butonları devre dışı bırak
          row.components.forEach(c => c.setDisabled(true));
          currentInteraction.editReply({ components: [row] }).catch(() => {});
        }
      });
    };

    await playSlot(interaction);
  }
};
