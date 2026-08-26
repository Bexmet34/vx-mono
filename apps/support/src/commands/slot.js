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
      message: '🌀 **BOOM! 3x Scatter!** 10 Free Spins + 5x Bet Won!',
      color: '#9B59B6'
    };
  } else if (scatterCount === 2) {
    return {
      won: bet,
      freeSpins: 3,
      type: 'SCATTER',
      message: '🌀 **2x Scatter!** Bet Refunded + 3 Free Spins Won!',
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
      message: '⭐ **SUPER WILD JACKPOT!** x15 Multiplier!',
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
      message: `🎉 **3x ${targetSymbol.emoji} Matched!** x${targetSymbol.multiplier} Multiplier!`,
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
      message: `✨ **2x ${matchSymbol.emoji} Matched!** You won ${wonAmount} Points!`,
      color: '#3498DB'
    };
  }

  // Kayıp
  return {
    won: 0,
    freeSpins: 0,
    type: 'LOSE',
    message: '💥 **Ouch!** No combinations matched.',
    color: '#E74C3C'
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('🎰 Advanced Slot Machine')
    .addIntegerOption(option => 
      option.setName('bet')
        .setDescription('Amount of points to bet')
        .setRequired(false)
    ),

  async execute(interaction) {
    let bet = interaction.options.getInteger('bet') || 10;
    let mockBalance = 500;

    if (bet > mockBalance || bet <= 0) {
      return interaction.reply({ content: 'Invalid bet amount!', ephemeral: true });
    }

    const generateGrid = (c1, c2, c3) => {
      const getCol = (val) => {
        if (val === 'spin') {
          return [getRandomSymbol().emoji, getRandomSymbol().emoji, getRandomSymbol().emoji];
        } else {
          return [getRandomSymbol().emoji, val.emoji, getRandomSymbol().emoji];
        }
      };

      const col1 = getCol(c1);
      const col2 = getCol(c2);
      const col3 = getCol(c3);

      // \u2800 is a Braille blank (invisible) used to align the top/bottom rows with the middle row that has ▶
      return `\u2800\u2800\u2800${col1[0]} ┊ ${col2[0]} ┊ ${col3[0]}
▶ **${col1[1]} ┊ ${col2[1]} ┊ ${col3[1]}** ◀
\u2800\u2800\u2800${col1[2]} ┊ ${col2[2]} ┊ ${col3[2]}`;
    };

    const playSlot = async (currentInteraction, isEdit = false) => {
      // Slot Dönüş Animasyonu Embed
      const embed = new EmbedBuilder()
        .setTitle('🎰 Veyronix Casino Slot')
        .setColor('#F39C12')
        .setDescription(`\n${generateGrid('spin', 'spin', 'spin')}\n\n*🎰 Reels are starting to spin...*`)
        .setFooter({ text: `Bet: ${bet} Points | Balance: ${mockBalance}` });

      let responseMsg;
      if (isEdit) {
        responseMsg = await currentInteraction.update({ embeds: [embed], components: [] });
      } else {
        responseMsg = await currentInteraction.reply({ embeds: [embed], withResponse: true });
      }

      const s1 = getRandomSymbol();
      const s2 = getRandomSymbol();
      const s3 = getRandomSymbol();

      // Animasyon Kare 1 (Hepsi Dönüyor - Göz yanılması için)
      await delay(600);
      embed.setDescription(`\n${generateGrid('spin', 'spin', 'spin')}\n\n*🎰 Reels are spinning fast...*`);
      await currentInteraction.editReply({ embeds: [embed] });

      // Kare 2 (1. Çark Durdu)
      await delay(700);
      embed.setDescription(`\n${generateGrid(s1, 'spin', 'spin')}\n\n*🎰 Reel 1 locked...*`);
      await currentInteraction.editReply({ embeds: [embed] });

      // Kare 3 (2. Çark Durdu)
      await delay(700);
      embed.setDescription(`\n${generateGrid(s1, s2, 'spin')}\n\n*🎰 Waiting for the final reel...*`);
      await currentInteraction.editReply({ embeds: [embed] });

      // Kare 4 (Sonuç)
      await delay(900);
      const result = calculatePayout(s1, s2, s3, bet);
      mockBalance = mockBalance - bet + result.won;

      embed.setColor(result.color)
        .setDescription(`
${generateGrid(s1, s2, s3)}

${result.message}

💵 **Won:** \`${result.won} Points\`
💳 **New Balance:** \`${mockBalance} Points\`
${result.freeSpins > 0 ? `🎁 **Free Spins Won:** \`${result.freeSpins}\`` : ''}
        `);

      // Discord Butonları
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('respin')
          .setLabel('Respin')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setCustomId('double_down')
          .setLabel('2x Bet')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🚀'),
        new ButtonBuilder()
          .setCustomId('payouts')
          .setLabel('Payouts')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📜')
      );

      const finalMsg = await currentInteraction.editReply({ embeds: [embed], components: [row] });

      // Buton Dinleyici (Collector)
      const collector = finalMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000 // 30 Saniye aktif kalır
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'Only the command initiator can use this button.', ephemeral: true });
        }

        if (i.customId === 'payouts') {
          const payoutEmbed = new EmbedBuilder()
            .setTitle('📜 Slot Payouts')
            .setColor('#3498DB')
            .setDescription(
              SYMBOLS.map(s => {
                let desc = `**3x** = x${s.multiplier}`;
                if (s.type === 'WILD') desc = '**WILD** (Substitutes any, 3x = x15)';
                if (s.type === 'SCATTER') desc = '**SCATTER** (2x = 3 Free Spins, 3x = 10 Free Spins)';
                return `${s.emoji} : ${desc}`;
              }).join('\\n\\n')
            );
          return i.reply({ embeds: [payoutEmbed], ephemeral: true });
        }

        if (i.customId === 'double_down') {
          bet = bet * 2;
        }

        if (mockBalance < bet) {
          return i.reply({ content: 'Insufficient balance! Bet reset.', ephemeral: true });
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
