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
  const height = 1050;
  
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
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.Name, xOffset, 80);

    // Guild Name
    if (player.GuildName) {
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '24px sans-serif';
      ctx.fillText(`[${player.GuildName}]`, xOffset, 115);
    }

    // IP
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`IP: ${Math.round(player.AverageItemPower)}`, xOffset, 155);

    // Equipment Icons & Spacing
    const iconSize = 108;
    const spacing = 14;
    const startY = 180;
    
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
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(item.Count.toString(), x + iconSize - 5, y + iconSize - 5);
        }
      } catch (err) {
        console.error(`Failed to load item image: ${item.Type}`, err);
      }
    };

    // Official Albion Online Equipment Slot Layout (4 Rows):
    // Row 1: [Bag] [Head] [Cape]
    // Row 2: [MainHand] [Armor] [OffHand]
    // Row 3: [Potion] [Shoes] [Food]
    // Row 4: [Mount] (Center)
    
    const centerX = xOffset - (iconSize / 2);
    const equipment = player.Equipment || {};
    
    // Row 1: Bag (Left), Head (Center), Cape (Right)
    await drawItem(equipment.Bag, centerX - iconSize - spacing, startY);
    await drawItem(equipment.Head, centerX, startY);
    await drawItem(equipment.Cape, centerX + iconSize + spacing, startY);
    
    // Row 2: MainHand (Left), Armor (Center), OffHand (Right)
    await drawItem(equipment.MainHand, centerX - iconSize - spacing, startY + iconSize + spacing);
    await drawItem(equipment.Armor, centerX, startY + iconSize + spacing);
    await drawItem(equipment.OffHand, centerX + iconSize + spacing, startY + iconSize + spacing);
    
    // Row 3: Potion (Left), Shoes (Center), Food (Right)
    await drawItem(equipment.Potion, centerX - iconSize - spacing, startY + (iconSize + spacing) * 2);
    await drawItem(equipment.Shoes, centerX, startY + (iconSize + spacing) * 2);
    await drawItem(equipment.Food, centerX + iconSize + spacing, startY + (iconSize + spacing) * 2);

    // Row 4: Mount (Center)
    await drawItem(equipment.Mount, centerX, startY + (iconSize + spacing) * 3);
  };

  // Draw Killer (Left)
  await drawPlayer(event.Killer, true, width / 4);

  // Draw Victim (Right)
  await drawPlayer(event.Victim, false, (width / 4) * 3);

  // Center Info (Adjusted for new height)
  const centerY = (height / 2) - 40;
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', width / 2, centerY - 60);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '28px sans-serif';
  
  // Format Fame
  const formatNumber = (num) => {
    if (num == null || isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };
  
  const fame = event.TotalVictimKillFame || event.KillFame || 0;
  ctx.fillText(`Kill Fame: ${formatNumber(fame)}`, width / 2, centerY + 20);
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Party Size: ${event.Participants ? event.Participants.length : 1}`, width / 2, centerY + 65);
  
  // Date and Time
  const dateObj = new Date(event.TimeStamp);
  const dateStr = dateObj.toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';
  ctx.fillStyle = '#64748b';
  ctx.font = '20px sans-serif';
  ctx.fillText(dateStr, width / 2, centerY + 110);

  // Draw Victim Inventory
  if (event.Victim.Inventory) {
    const inventory = event.Victim.Inventory.filter(i => i !== null);
    if (inventory.length > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Victim's Inventory", width / 2, height - 140);

      const invIconSize = 72;
      const invSpacing = 10;
      const maxItems = 12;
      const itemsToDraw = inventory.slice(0, maxItems);
      
      const totalInvWidth = itemsToDraw.length * invIconSize + (itemsToDraw.length - 1) * invSpacing;
      let startX = (width - totalInvWidth) / 2;
      
      for (const item of itemsToDraw) {
        try {
          const quality = item.Quality > 1 ? `?quality=${item.Quality}` : '';
          const imgUrl = `https://render.albiononline.com/v1/item/${item.Type}.png${quality}`;
          const img = await loadImage(imgUrl);
          
          ctx.fillStyle = '#272732';
          ctx.strokeStyle = '#3f3f4e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(startX + invIconSize/2, height - 90 + invIconSize/2, invIconSize/2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.drawImage(img, startX, height - 90, invIconSize, invIconSize);
          
          if (item.Count > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(item.Count.toString(), startX + invIconSize - 4, height - 90 + invIconSize - 4);
          }
        } catch(e) {}
        startX += invIconSize + invSpacing;
      }
    }
  }

  return canvas.toBuffer('image/png');
}

module.exports = { generateKillboardImage };
