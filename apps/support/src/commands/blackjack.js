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

// Application emoji'lerin çekilip çekilmediğini takip eden bayrak
let appEmojisFetched = false;

// Discord Emojilerini isimlerinden (Örn: 10_of_clover) dinamik olarak bulur
const getCardString = (client, card, hidden = false) => {
  if (hidden) return '🂠'; // Ters dönmüş kart (H1 formatında daha büyük ve şık durması için düz unicode)
  
  const suitMap = {
    '♠️': 'spades',
    '♥️': 'hearts',
    '♦️': 'diamonds',
    '♣️': 'clover'
  };
  
  const emojiName = `${card.rank}_of_${suitMap[card.suit]}`.toLowerCase();
  
  let customEmoji = null;
  
  // 1. ÖNCELİK: Application Emojis (Developer Portal'a yüklenenler) - İzin gerektirmez, her yerde çalışır!
  if (client.application && client.application.emojis) {
    customEmoji = client.application.emojis.cache.find(e => e.name.toLowerCase() === emojiName);
  }
  
  // 2. ÖNCELİK: Eğer portalde yoksa Sunucu (Guild) Emojilerine bak
  if (!customEmoji) {
    customEmoji = client.emojis.cache.find(e => e.name.toLowerCase() === emojiName);
  }
  
  if (customEmoji) {
    return customEmoji.toString();
  }
  
  // Bulunamazsa fallback (eski stil)
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
const buildEmbed = (client, playerHand, dealerHand, bet, status, hideDealer = true) => {
  const playerValue = calculateHand(playerHand);
  const dealerValue = calculateHand(hideDealer ? [dealerHand[0]] : dealerHand);
  
  let playerString = playerHand.map(c => getCardString(client, c)).join(' ');
  let dealerString = hideDealer 
    ? `${getCardString(client, dealerHand[0])} ${getCardString(client, null, true)}` 
    : dealerHand.map(c => getCardString(client, c)).join(' ');

  let color = '#3498DB'; // Devam ediyor
  if (status === 'WIN' || status === 'BLACKJACK') color = '#2ECC71';
  if (status === 'LOSE' || status === 'BUST') color = '#E74C3C';
  if (status === 'TIE') color = '#F1C40F';

  // Kartları çok daha büyük (Jumbo) göstermek için Discord Markdown H1 (#) kullanıyoruz
  const embed = new EmbedBuilder()
    .setTitle('🃏 Veyronix Casino | Blackjack')
    .setColor(color)
    .setDescription(
      `🕴️ **Dealer Hand** (Value: ${hideDealer ? '?' : dealerValue})\n` +
      `# ${dealerString}\n\n` +
      `🧑 **Player Hand** (Value: ${playerValue})\n` +
      `# ${playerString}`
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
    // Developer Portal'a yüklenen (Application) Emojileri ilk kullanımda önbelleğe çek (Sadece 1 kere çalışır)
    if (!appEmojisFetched && interaction.client.application) {
      try {
        await interaction.client.application.emojis.fetch();
        appEmojisFetched = true;
      } catch (error) {
        console.error("Application emojileri çekilirken hata oluştu:", error);
      }
    }

    let initialBet = interaction.options.getInteger('bet');

    const playBlackjack = async (currentInteraction, bet, isEdit = false) => {
      if (bet > mockBalance) {
        const msg = { content: '❌ Insufficient balance! Your bet was reset or you cannot afford this.', ephemeral: true };
        if (isEdit) {
          return currentInteraction.followUp(msg);
        } else {
          return currentInteraction.reply(msg);
        }
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
        mockBalance += bet * 1.5;
      } else if (dValue === 21) {
        status = 'LOSE';
        mockBalance -= bet;
      }

      const getPlayingRow = (disabled = false) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle(ButtonStyle.Success).setEmoji('➕').setDisabled(disabled),
          new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle(ButtonStyle.Danger).setEmoji('🛑').setDisabled(disabled),
          new ButtonBuilder().setCustomId('double').setLabel('Double Down').setStyle(ButtonStyle.Primary).setEmoji('💸').setDisabled(disabled || playerHand.length > 2 || mockBalance < bet * 2),
          new ButtonBuilder().setCustomId('rules').setLabel('Rules').setStyle(ButtonStyle.Secondary).setEmoji('📜')
        );
      };

      const getGameOverRow = () => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('play_again').setLabel('Play Again').setStyle(ButtonStyle.Primary).setEmoji('🔄'),
          new ButtonBuilder().setCustomId('bet_plus').setLabel('+10 Bet').setStyle(ButtonStyle.Success).setEmoji('📈'),
          new ButtonBuilder().setCustomId('bet_minus').setLabel('-10 Bet').setStyle(ButtonStyle.Danger).setEmoji('📉').setDisabled(bet <= 10),
          new ButtonBuilder().setCustomId('rules').setLabel('Rules').setStyle(ButtonStyle.Secondary).setEmoji('📜')
        );
      };

      let embed = buildEmbed(currentInteraction.client, playerHand, dealerHand, bet, status, status === 'PLAYING');
      
      if (status !== 'PLAYING') {
        let resultMsg = '';
        if (status === 'BLACKJACK') resultMsg = `🎉 **BLACKJACK!** You won \`${bet * 1.5}\` Points!`;
        if (status === 'LOSE') resultMsg = `💀 **Dealer has Blackjack.** You lost \`${bet}\` Points.`;
        if (status === 'TIE') resultMsg = `🤝 **Push!** Bet refunded.`;
        embed.setDescription(embed.data.description + `\n\n> ${resultMsg}`);
      }

      const messagePayload = { 
        embeds: [embed], 
        components: [status === 'PLAYING' ? getPlayingRow() : getGameOverRow()] 
      };

      let response;
      try {
        if (isEdit) {
          await currentInteraction.editReply(messagePayload);
          response = currentInteraction;
        } else {
          messagePayload.withResponse = true;
          response = await currentInteraction.reply(messagePayload);
        }
      } catch (err) {
        console.error("Reply/Edit Error:", err);
        return; // Hata durumunda devam etme
      }

      const targetMessage = isEdit ? currentInteraction.message : response.resource.message;
      
      const collector = targetMessage.createMessageComponentCollector({ 
        componentType: ComponentType.Button, 
        time: 120000 
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'Only the command initiator can use these buttons.', ephemeral: true });
        }

        if (i.customId === 'rules') {
          const rulesEmbed = new EmbedBuilder()
            .setTitle('📜 Blackjack Rules')
            .setColor('#3498DB')
            .addFields(
              { name: '🎯 Objective', value: 'Beat the dealer by getting a hand value as close to 21 as possible without going over.' },
              { name: '🃏 Card Values', value: '• **2-10**: Face value\n• **J, Q, K**: 10 points\n• **Ace**: 1 or 11 points (whichever is better)' },
              { name: '🕹️ Actions', value: '• **Hit**: Take another card.\n• **Stand**: End your turn.\n• **Double Down**: Double your bet, take exactly ONE more card, and stand.' },
              { name: '🕴️ Dealer Rules', value: 'The dealer must hit until their cards total 17 or higher.' },
              { name: '💰 Payouts', value: '• **Win**: 1x your bet\n• **Blackjack**: 1.5x your bet\n• **Tie (Push)**: Bet refunded' }
            );
          return i.reply({ embeds: [rulesEmbed], ephemeral: true });
        }

        if (i.customId === 'play_again') {
          try {
            await i.deferUpdate();
            collector.stop('restarting');
            return await playBlackjack(i, bet, true);
          } catch (e) {
            console.error("Play Again Error:", e);
            return i.followUp({ content: `Hata oluştu: ${e.message}`, ephemeral: true }).catch(()=>{});
          }
        }

        if (i.customId === 'bet_plus') {
          try {
            await i.deferUpdate();
            collector.stop('restarting');
            return await playBlackjack(i, bet + 10, true);
          } catch (e) {
            console.error("Bet Plus Error:", e);
            return i.followUp({ content: `Hata oluştu: ${e.message}`, ephemeral: true }).catch(()=>{});
          }
        }

        if (i.customId === 'bet_minus') {
          try {
            await i.deferUpdate();
            collector.stop('restarting');
            return await playBlackjack(i, Math.max(10, bet - 10), true);
          } catch (e) {
            console.error("Bet Minus Error:", e);
            return i.followUp({ content: `Hata oluştu: ${e.message}`, ephemeral: true }).catch(()=>{});
          }
        }

        try {
          await i.deferUpdate();
        } catch (e) {
          console.error("Defer Update Error:", e);
        }

        if (i.customId === 'hit') {
          playerHand.push(deck.pop());
          let val = calculateHand(playerHand);
          
          if (val > 21) {
            status = 'BUST';
            mockBalance -= bet;
            embed = buildEmbed(currentInteraction.client, playerHand, dealerHand, bet, status, false);
            embed.setDescription(embed.data.description + `\n\n> 💥 **BUST!** You went over 21. Lost \`${bet}\` Points.`);
            collector.stop('ended');
            return i.editReply({ embeds: [embed], components: [getGameOverRow()] });
          } else if (val === 21) {
            i.customId = 'stand'; // Auto stand on 21
          } else {
            embed = buildEmbed(currentInteraction.client, playerHand, dealerHand, bet, status, true);
            return i.editReply({ embeds: [embed], components: [getPlayingRow()] });
          }
        }

        if (i.customId === 'double') {
          bet *= 2;
          playerHand.push(deck.pop());
          let val = calculateHand(playerHand);
          
          if (val > 21) {
            status = 'BUST';
            mockBalance -= bet;
            embed = buildEmbed(currentInteraction.client, playerHand, dealerHand, bet, status, false);
            embed.setDescription(embed.data.description + `\n\n> 💥 **BUST!** You went over 21. Lost \`${bet}\` Points.`);
            collector.stop('ended');
            return i.editReply({ embeds: [embed], components: [getGameOverRow()] });
          }
          i.customId = 'stand';
        }

        if (i.customId === 'stand') {
          let dVal = calculateHand(dealerHand);
          
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

          embed = buildEmbed(currentInteraction.client, playerHand, dealerHand, bet, status, false);
          embed.setDescription(embed.data.description + `\n\n> ${resultMsg}`);
          collector.stop('ended');
          return i.editReply({ embeds: [embed], components: [getGameOverRow()] });
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason !== 'restarting' && reason !== 'ended') {
          embed.setDescription(embed.data.description + '\n\n⏳ **Game expired.**');
          targetMessage.edit({ embeds: [embed], components: [] }).catch(() => {});
        }
      });
    };

    await playBlackjack(interaction, initialBet, false);
  },
};
