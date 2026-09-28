const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/PTSans-Bold.ttf'), 'PTSans');
GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/BebasNeue.ttf'), 'Bebas');

const QUALITY_COLORS = { 1: '#52525b', 2: '#22c55e', 3: '#3b82f6', 4: '#a855f7', 5: '#eab308' };

async function generateKillboardImage(event, isDeath = true) {
  let invItems = [];
  if (event.Victim && event.Victim.Inventory) {
    invItems = event.Victim.Inventory.filter(i => i !== null);
  }


  // Max 30 items (3 rows)
  if (invItems.length > 30) {
      invItems = invItems.slice(0, 30);
  }

  const width = 1600;
  const iconSize = 160; 
  const spacing = 16;
  const startY = 225; 
  const invIconSize = 130; 
  const invSpacing = 16;

  // Calculate dynamic height based on rows (minimum 1 row, max 3 rows)
  const rows = Math.max(1, Math.ceil(invItems.length / 10));
  // base height before inventory is about 980
  const height = 980 + (rows * (invIconSize + invSpacing)) + 60; // 60 for bottom padding

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#d5b99b';
  ctx.fillRect(0, 0, width, height);


  const drawSlot = async (item, x, y, customSize = iconSize) => {
    ctx.fillStyle = 'rgba(180, 145, 115, 0.4)';
    ctx.fillRect(x, y, customSize, customSize);
    ctx.strokeStyle = 'rgba(140, 110, 85, 0.3)';
    ctx.lineWidth = 3;

    if (!item || !item.Type) return;

    const qualityColor = item.Quality ? (QUALITY_COLORS[item.Quality] || '#52525b') : '#52525b';
    const isTrash = item.Type.includes('_TRASH');
    const baseType = item.Type.split('@')[0];
    const quality = item.Quality > 1 ? `?quality=${item.Quality}` : '';
    const imgUrl = `https://render.albiononline.com/v1/item/${baseType}.png${quality}`;

    try {
      const img = await loadImage(imgUrl);
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, customSize, customSize, 8);
        ctx.clip();
        const zoomOffset = customSize * 0.10;
        ctx.drawImage(img, x - zoomOffset, y - zoomOffset, customSize + (zoomOffset * 2), customSize + (zoomOffset * 2));
        ctx.restore();
      }
    } catch (err) {}


    if (isTrash) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(x, y, customSize, customSize);
    }

    if (item.Count > 1) {
      const badgeW = 46;
      const badgeH = 28;
      const badgeX = x + customSize - badgeW - 3;
      const badgeY = y + customSize - badgeH - 3;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px PTSans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.Count.toString(), badgeX + badgeW / 2, badgeY + badgeH / 2 + 7);
    }
  };

  const drawPlayerDetails = async (player, isVictim, xOffset) => {
    if (!player) return;

    ctx.fillStyle = isVictim ? '#991b1b' : '#166534'; 
    ctx.font = 'bold 50px PTSans, sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillText(player.Name || 'Unknown', xOffset, 90);

    ctx.fillStyle = '#374151';
    ctx.font = 'bold 28px PTSans, sans-serif';
    const guildText = player.GuildName ? `[${player.AllianceName || ''}] ${player.GuildName}`.trim() : 'Loncasız';
    ctx.fillText(guildText, xOffset, 135);

    const ip = Math.round(player.AverageItemPower || 0);
    if (ip > 0) {
      ctx.fillStyle = '#1f1611';
      ctx.font = 'bold 26px PTSans, sans-serif';
      ctx.fillText(`IP: ${ip}`, xOffset, 175);
    }

    const midX = xOffset - (iconSize / 2);
    const leftX = midX - iconSize - spacing;
    const rightX = midX + iconSize + spacing;
    const eq = player.Equipment || {};

    const row1Y = startY;
    const row2Y = startY + iconSize + spacing;
    const row3Y = startY + (iconSize + spacing) * 2;
    const row4Y = startY + (iconSize + spacing) * 3;

    await drawSlot(eq.Bag, leftX, row1Y);
    await drawSlot(eq.Head, midX, row1Y);
    await drawSlot(eq.Cape, rightX, row1Y);

    await drawSlot(eq.MainHand, leftX, row2Y);
    await drawSlot(eq.Armor, midX, row2Y);
    await drawSlot(eq.OffHand, rightX, row2Y);

    await drawSlot(eq.Food, leftX, row3Y);
    await drawSlot(eq.Shoes, midX, row3Y);
    await drawSlot(eq.Potion, rightX, row3Y);

    await drawSlot(eq.Mount, midX, row4Y);
  };

  const leftXOffset = 350;
  const rightXOffset = 1250;

  await drawPlayerDetails(event.Killer, false, leftXOffset);
  await drawPlayerDetails(event.Victim, true, rightXOffset);

  const centerX = width / 2;
  
  ctx.textAlign = 'center';
  ctx.fillStyle = '#78716c';
  ctx.font = '36px Bebas, sans-serif';
  ctx.fillText('VEYRONIX.COM.TR', centerX, 70);

  try {
    const iconName = isDeath ? 'skull2.png' : 'swords2.png';
    const iconPath = path.join(__dirname, '../../assets', iconName);
    const mainIcon = await loadImage(iconPath);
    ctx.drawImage(mainIcon, centerX - 70, 160, 140, 140);
  } catch(e) {}

  const fame = event.TotalVictimKillFame || event.KillFame || 0;
  ctx.fillStyle = '#1f1611';
  ctx.font = '100px Bebas, sans-serif';
  ctx.fillText(fame.toLocaleString(), centerX, 410);
  
  ctx.fillStyle = '#4b3f36';
  ctx.font = 'bold 30px PTSans, sans-serif';
  ctx.fillText("Kill Fame", centerX, 455);

  let totalDamage = 0;
  let participants = event.Participants || [];
  

  participants.sort((a, b) => {
    const scoreA = (a.DamageDone || 0) + (a.SupportHealingDone || 0);
    const scoreB = (b.DamageDone || 0) + (b.SupportHealingDone || 0);
    return scoreB - scoreA;
  });

  participants.forEach(p => { totalDamage += (p.DamageDone || 0); });
  if (totalDamage === 0) totalDamage = 1; 

  ctx.fillStyle = '#2c1e16';
  ctx.font = 'bold 28px PTSans, sans-serif';
  ctx.fillText('ASSISTS', centerX, 530);

  ctx.beginPath();
  ctx.moveTo(centerX - 80, 540);
  ctx.lineTo(centerX + 80, 540);
  ctx.strokeStyle = 'rgba(60, 42, 33, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const maxAssists = 4;
  const allAssistants = participants.filter(p => p.Name !== event.Killer?.Name);
  const displayedAssists = allAssistants.slice(0, maxAssists);
  const leftOvers = allAssistants.length - maxAssists;
  
  let assistY = 575;
  if (displayedAssists.length === 0) {
    ctx.fillStyle = '#5c4e44';
    ctx.font = 'italic 24px PTSans, sans-serif';
    ctx.fillText("Solo Kill", centerX, assistY + 20);
  } else {
    displayedAssists.forEach((p) => {
      const damagePercent = Math.round(((p.DamageDone || 0) / totalDamage) * 100);
      let assistText = '';
      const shortName = p.Name.length > 13 ? p.Name.substring(0, 11) + '..' : p.Name;

      if (p.SupportHealingDone > 0 && p.DamageDone === 0) {
         assistText = `${shortName} [Heal]`;
      } else {
         assistText = `${shortName} [%${damagePercent}]`;
      }
      
      ctx.fillStyle = '#1f1611';
      ctx.font = 'bold 24px PTSans, sans-serif';
      ctx.fillText(assistText, centerX, assistY);
      assistY += 34; 
    });

    if (leftOvers > 0) {
      ctx.fillStyle = '#7f1d1d'; 
      ctx.font = 'bold 24px PTSans, sans-serif';
      ctx.fillText(`+ ${leftOvers} oyuncu daha...`, centerX, assistY + 4);
    }
  }

  const mountCenterY = startY + (iconSize + spacing) * 3 + (iconSize / 2);
  const dateObj = event.TimeStamp ? new Date(event.TimeStamp) : new Date();
  ctx.fillStyle = '#4b3f36';
  ctx.font = 'bold 30px PTSans, sans-serif';
  const dateStr = dateObj.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
  ctx.fillText(dateStr, centerX, mountCenterY + 10);

  const invY = 930; 
  ctx.fillStyle = '#111827';
  ctx.font = '50px Bebas, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("VICTIM'S INVENTORY", centerX, invY - 25);

  ctx.beginPath();
  ctx.moveTo(80, invY - 40);
  ctx.lineTo(centerX - 200, invY - 40);
  ctx.moveTo(centerX + 200, invY - 40);
  ctx.lineTo(width - 80, invY - 40);
  ctx.strokeStyle = 'rgba(60, 42, 33, 0.4)';
  ctx.lineWidth = 3;
  ctx.stroke();

  const cols = 10;
  const startX = (width - (cols * invIconSize) - ((cols - 1) * invSpacing)) / 2;

  // Drawn based on required rows (total slots will be rows * cols)
  const totalSlots = rows * cols;
  
  for (let i = 0; i < totalSlots; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * (invIconSize + invSpacing);
    const y = invY + 10 + row * (invIconSize + invSpacing);
    
    if (i < invItems.length) {
      await drawSlot(invItems[i], x, y, invIconSize);
    } else {
      await drawSlot(null, x, y, invIconSize);
    }
  }

  return canvas.toBuffer('image/png');
}

module.exports = { generateKillboardImage };
