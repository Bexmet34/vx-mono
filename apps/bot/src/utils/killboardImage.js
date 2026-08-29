const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// Ensure fonts are loaded if you have custom fonts, e.g.
// GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/fonts/Inter-Bold.ttf'), 'Inter');

/**
 * Renders the Albion Online Killboard image
 * @param {Object} event The kill event object from Albion API
 * @returns {Buffer} The generated PNG image buffer
 */
async function generateKillboardImage(event) {
  // Dimensions for the canvas
  const width = 1200;
  const height = 600;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1e1e24';
  ctx.fillRect(0, 0, width, height);
  
  // Background Pattern / Gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#2b2b36');
  gradient.addColorStop(1, '#15151a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#3a3a48';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  // Helper function to draw player info
  const drawPlayer = async (player, isKiller, xOffset) => {
    // Player Name
    ctx.fillStyle = isKiller ? '#4ade80' : '#f87171'; // Green for killer, Red for victim
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.Name, xOffset, 80);

    // Guild Name
    if (player.GuildName) {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '20px sans-serif';
      ctx.fillText(`[${player.GuildName}]`, xOffset, 110);
    }

    // IP
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`IP: ${Math.round(player.AverageItemPower)}`, xOffset, 145);

    // Equipment Icons
    const equipment = player.Equipment;
    const iconSize = 80;
    const spacing = 10;
    
    const drawItem = async (item, x, y) => {
      if (!item) {
        // Draw empty slot
        ctx.fillStyle = '#272732';
        ctx.strokeStyle = '#3f3f4e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + iconSize/2, y + iconSize/2, iconSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        return;
      }
      
      try {
        const quality = item.Quality > 1 ? `?quality=${item.Quality}` : '';
        const imgUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
        const img = await loadImage(imgUrl);
        ctx.drawImage(img, x, y, iconSize, iconSize);
        
        // Draw count if > 1
        if (item.Count > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(item.Count.toString(), x + iconSize - 5, y + iconSize - 5);
        }
      } catch (err) {
        console.error(`Failed to load item image: ${item.Type}`, err);
      }
    };

    // Standard layout for equipment
    // [Head]
    // [MainHand] [Armor] [OffHand]
    // [Shoes]
    // [Bag] [Cape] [Mount]
    // [Potion] [Food]
    
    const centerX = xOffset - (iconSize / 2);
    
    // Head
    await drawItem(equipment.Head, centerX, 180);
    
    // Row 2: MainHand, Armor, OffHand
    await drawItem(equipment.MainHand, centerX - iconSize - spacing, 180 + iconSize + spacing);
    await drawItem(equipment.Armor, centerX, 180 + iconSize + spacing);
    await drawItem(equipment.OffHand, centerX + iconSize + spacing, 180 + iconSize + spacing);
    
    // Row 3: Shoes
    await drawItem(equipment.Shoes, centerX, 180 + (iconSize + spacing) * 2);

    // Row 4: Cape, Bag, Mount
    await drawItem(equipment.Cape, centerX - iconSize - spacing, 180 + (iconSize + spacing) * 3);
    await drawItem(equipment.Bag, centerX, 180 + (iconSize + spacing) * 3);
    await drawItem(equipment.Mount, centerX + iconSize + spacing, 180 + (iconSize + spacing) * 3);

    // Row 5: Potion, Food
    await drawItem(equipment.Potion, centerX - (iconSize/2) - spacing/2, 180 + (iconSize + spacing) * 4);
    await drawItem(equipment.Food, centerX + (iconSize/2) + spacing/2, 180 + (iconSize + spacing) * 4);
  };

  // Draw Killer (Left)
  await drawPlayer(event.Killer, true, width / 4);

  // Draw Victim (Right)
  await drawPlayer(event.Victim, false, (width / 4) * 3);

  // Center Info
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', width / 2, height / 2 - 50);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '24px sans-serif';
  
  // Format Fame
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };
  
  ctx.fillText(`Kill Fame: ${formatNumber(event.KillFame)}`, width / 2, height / 2 + 20);
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Party Size: ${event.Participants ? event.Participants.length : 1}`, width / 2, height / 2 + 60);
  
  // Date and Time
  const dateObj = new Date(event.TimeStamp);
  const dateStr = dateObj.toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';
  ctx.fillStyle = '#64748b';
  ctx.font = '18px sans-serif';
  ctx.fillText(dateStr, width / 2, height - 30);

  return canvas.toBuffer('image/png');
}

module.exports = { generateKillboardImage };
