const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType 
} = require('discord.js');

// Prototip için sahte bakiye
let mockBalance = 500;

// Kart Takımları ve Değerleri
const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// İleride özel emojiler eklediğinizde bu fonksiyonu güncelleyebilirsiniz.
// Örn: if(card.rank === '10' && card.suit === '♦️') return '<:10D:1234567890>';
const getCardString = (card, hidden = false) => {
  if (hidden) return '🂠 `?`'; // Ters dönmüş kart
  return `\`${card.rank}\` ${card.suit}`;
};

// Deste oluştur ve karıştır
const createDeck = () => {
  let deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = parseInt(rank);
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      if (rank === 'A') value = 11;
      deck.push({ suit, rank, value });
    }
  }
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// El değerini hesapla (As mantığı)
const calculateHand = (hand) => {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    value += card.value;
    if (card.rank === 'A') aces += 1;
  }
  
  // Eğer değer 21'i geçiyorsa ve As varsa, As'ı 1 olarak say
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  
  return value;
};

// Embed oluşturucu
const buildEmbed = (playerHand, dealerHand, bet, status, hideDealer = true) => {
  const playerValue = calculateHand(playerHand);
  const dealerValue = calculateHand(hideDealer ? [dealerHand[0]] : dealerHand);
  
  let playerString = playerHand.map(c => getCardString(c)).join('  ');
  let dealerString = hideDealer 
    ? `${getCardString(dealerHand[0])}  ${getCardString(null, true)}` 
    : dealerHand.map(c => getCardString(c)).join('  ');

  let color = '#3498DB'; // Devam ediyor
  if (status === 'WIN' || status === 'BLACKJACK') color = '#2ECC71';
  if (status === 'LOSE' || status === 'BUST') color = '#E74C3C';
  if (status === 'TIE') color = '#F1C40F';

  const embed = new EmbedBuilder()
    .setTitle('🃏 Veyronix Casino | Blackjack')
    .setColor(color)
    .addFields(
      { name: `🧑 Player Hand (Value: ${playerValue})`, value: playerString, inline: true },
      { name: `🕴️ Dealer Hand (Value: ${hideDealer ? '?' : dealerValue})`, value: dealerString, inline: true }
    )
    .setFooter({ text: `Bet: ${bet} Points | Balance: ${mockBalance} Points` });

  return embed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('🃏 Play a game of Blackjack!')
    .addIntegerOption(option => 
      option.setName('bet')
        .setDescription('Amount of points to bet')
        .setRequired(true)
        .setMinValue(10)
    ),

  async execute(interaction) {
    let bet = interaction.options.getInteger('bet');

    if (bet > mockBalance) {
      return interaction.reply({ content: '❌ Insufficient balance!', ephemeral: true });
    }

    let deck = createDeck();
    let playerHand = [deck.pop(), deck.pop()];
    let dealerHand = [deck.pop(), deck.pop()];
    let status = 'PLAYING';
    
    // Anında Blackjack kontrolü
    let pValue = calculateHand(playerHand);
    let dValue = calculateHand(dealerHand);
    
    if (pValue === 21 && dValue === 21) {
      status = 'TIE';
    } else if (pValue === 21) {
      status = 'BLACKJACK';
      mockBalance += bet * 1.5; // Blackjack ödülü 1.5x
    } else if (dValue === 21) {
      status = 'LOSE';
      mockBalance -= bet;
    }

    const getRow = (disabled = false) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('hit')
          .setLabel('Hit')
          .setStyle(ButtonStyle.Success)
          .setEmoji('➕')
          .setDisabled(disabled),
        new ButtonBuilder()
          .setCustomId('stand')
          .setLabel('Stand')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🛑')
          .setDisabled(disabled),
        new ButtonBuilder()
          .setCustomId('double')
          .setLabel('Double Down')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('💸')
          .setDisabled(disabled || playerHand.length > 2 || mockBalance < bet * 2) // Sadece ilk turda ve para yeterliyse
      );
    };

    let embed = buildEmbed(playerHand, dealerHand, bet, status, status === 'PLAYING');
    
    // Oyun bittiyse sonuca göre mesaj ekle
    if (status !== 'PLAYING') {
      let resultMsg = '';
      if (status === 'BLACKJACK') resultMsg = `🎉 **BLACKJACK!** You won \`${bet * 1.5}\` Points!`;
      if (status === 'LOSE') resultMsg = `💀 **Dealer has Blackjack.** You lost \`${bet}\` Points.`;
      if (status === 'TIE') resultMsg = `🤝 **Push!** Bet refunded.`;
      
      embed.setDescription(resultMsg);
      return interaction.reply({ embeds: [embed], components: [] });
    }

    const response = await interaction.reply({ 
      embeds: [embed], 
      components: [getRow()], 
      withResponse: true 
    });

    const collector = response.resource.message.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 60000 
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Only the command initiator can play.', ephemeral: true });
      }

      await i.deferUpdate();

      if (i.customId === 'hit') {
        playerHand.push(deck.pop());
        let val = calculateHand(playerHand);
        
        if (val > 21) {
          status = 'BUST';
          mockBalance -= bet;
          embed = buildEmbed(playerHand, dealerHand, bet, status, false);
          embed.setDescription(`💥 **BUST!** You went over 21. Lost \`${bet}\` Points.`);
          collector.stop();
          return i.editReply({ embeds: [embed], components: [getRow(true)] });
        } else if (val === 21) {
          // Otomatik Stand
          i.customId = 'stand';
        } else {
          embed = buildEmbed(playerHand, dealerHand, bet, status, true);
          return i.editReply({ embeds: [embed], components: [getRow()] });
        }
      }

      if (i.customId === 'double') {
        bet *= 2;
        playerHand.push(deck.pop());
        let val = calculateHand(playerHand);
        
        if (val > 21) {
          status = 'BUST';
          mockBalance -= bet;
          embed = buildEmbed(playerHand, dealerHand, bet, status, false);
          embed.setDescription(`💥 **BUST!** You went over 21. Lost \`${bet}\` Points.`);
          collector.stop();
          return i.editReply({ embeds: [embed], components: [getRow(true)] });
        }
        // Double yapınca otomatik stand olur, o yüzden koda devam et
        i.customId = 'stand';
      }

      if (i.customId === 'stand') {
        let dVal = calculateHand(dealerHand);
        
        // Kurpiyer kuralı: 17'den küçükse kart çeker
        while (dVal < 17) {
          dealerHand.push(deck.pop());
          dVal = calculateHand(dealerHand);
        }

        let pVal = calculateHand(playerHand);
        let resultMsg = '';

        if (dVal > 21) {
          status = 'WIN';
          mockBalance += bet;
          resultMsg = `🎉 **Dealer Busts!** You won \`${bet}\` Points!`;
        } else if (dVal > pVal) {
          status = 'LOSE';
          mockBalance -= bet;
          resultMsg = `💀 **Dealer Wins.** You lost \`${bet}\` Points.`;
        } else if (pVal > dVal) {
          status = 'WIN';
          mockBalance += bet;
          resultMsg = `🎉 **You Win!** You won \`${bet}\` Points!`;
        } else {
          status = 'TIE';
          resultMsg = `🤝 **Push!** Bet refunded.`;
        }

        embed = buildEmbed(playerHand, dealerHand, bet, status, false);
        embed.setDescription(resultMsg);
        collector.stop();
        return i.editReply({ embeds: [embed], components: [getRow(true)] });
      }
    });

    collector.on('end', collected => {
      if (status === 'PLAYING') {
        // Zaman aşımı
        embed.setDescription('⏳ **Game expired.** Bet refunded.');
        interaction.editReply({ embeds: [embed], components: [getRow(true)] }).catch(() => {});
      }
    });
  },
};
