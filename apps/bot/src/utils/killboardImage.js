const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');

// GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/fonts/Inter-Bold.ttf'), 'Inter');

const QUALITY_COLORS = {
  1: '#52525b',
  2: '#22c55e',
  3: '#3b82f6',
  4: '#a855f7',
  5: '#eab308'
};

const ENCHANT_COLORS = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#f97316'
};

/**
 * Renders the Albion Online Killboard image (v3.1 Enhanced)
 * @param {Object} event The kill event object from Albion API
 * @returns {Promise<Buffer>} The generated PNG image buffer
 */
async function generateKillboardImage(event) {
  const width = 1200;
  const height = 1050;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Arka Plan
  ctx.fillStyle = '#08080c';
  ctx.fillRect(0, 0, width, height);

  // Sol Glow (Katil - Yeşil)
  const leftGlow = ctx.createRadialGradient(250, 350, 20, 250, 350, 550);
  leftGlow.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
  leftGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, width, height);

  // Sağ Glow (Kurban - Kırmızı)
  const rightGlow = ctx.createRadialGradient(950, 350, 20, 950, 350, 550);
  rightGlow.addColorStop(0, 'rgba(239, 68, 68, 0.12)');
  rightGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, width, height);

  // Dış Çerçeve
  ctx.strokeStyle = '#1e1e24';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Yardımcı Kart Çizim Fonksiyonu
  function drawCard(x, y, w, h, bg, border, radius = 12) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fill();
    }
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // 2. Oyuncu Panelleri Ölçüleri
  const panelW = 470;
  const panelH = 760;
  const panelY = 35;

  drawCard(40, panelY, panelW, panelH, 'rgba(15, 20, 25, 0.85)', '#1e293b');
  drawCard(width - 40 - panelW, panelY, panelW, panelH, 'rgba(25, 15, 20, 0.85)', '#3b0764');

  const iconSize = 115;
  const spacing = 16;

  // İkon / Slot Çizim Fonksiyonu
  const drawSlot = async (item, x, y, customSize = iconSize) => {
    const qualityColor = item && item.Quality ? (QUALITY_COLORS[item.Quality] || '#3f3f46') : '#27272a';
    
    drawCard(x, y, customSize, customSize, '#0c0c0e', qualityColor, 8);

    if (!item) return;

    const isTrash = item.Type && item.Type.includes('_TRASH');
    const parts = item.Type ? item.Type.split('@') : [''];
    const baseType = parts[0];
    const enchantLevel = parts[1] ? parseInt(parts[1]) : 0;

    const quality = item.Quality > 1 ? `?quality=${item.Quality}` : '';
    const imgUrl = `https://render.albiononline.com/v1/item/${baseType}.png${quality}`;
    
    try {
      const img = await loadImage(imgUrl);
      if (img) {
        // Görselin kutu dışına taşmasını önleyen maskeleme (clip)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, customSize, customSize, 8);
        ctx.clip();

        // Kenarlardaki şeffaf boşlukları ortadan kaldıran zoom (%18 offset)
        const zoomOffset = customSize * 0.18;
        ctx.drawImage(
          img,
          x - zoomOffset,
          y - zoomOffset,
          customSize + (zoomOffset * 2),
          customSize + (zoomOffset * 2)
        );

        ctx.restore();
      }
    } catch (err) {
      console.error(`Failed to load item image: ${imgUrl}`, err);
    }

    // Trash Katmanı
    if (isTrash) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(x, y, customSize, customSize);
    }

    // Enchant Noktaları
    if (enchantLevel > 0) {
      const dotColor = ENCHANT_COLORS[enchantLevel] || '#22c55e';
      const dotRadius = customSize > 100 ? 6 : 5;
      ctx.beginPath();
      ctx.arc(x + 14, y + 14, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Adet Rozeti (Count)
    if (item.Count > 1) {
      const badgeW = customSize > 100 ? 38 : 32;
      const badgeH = customSize > 100 ? 20 : 18;
      
      drawCard(x + customSize - badgeW - 2, y + customSize - badgeH - 2, badgeW, badgeH, 'rgba(0,0,0,0.85)', '#52525b', 4);
      ctx.fillStyle = '#f4f4f5';
      ctx.font = `bold ${customSize > 100 ? '12px' : '10px'} sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(item.Count.toString(), x + customSize - (badgeW / 2) - 2, y + customSize - (badgeH / 2) + 3);
    }
  };

  // Oyuncu Detayları Çizimi
  const drawPlayerDetails = async (player, isKiller, panelX) => {
    if (!player) return;
    const centerX = panelX + (panelW / 2);

    // Rol Rozeti
    const badgeText = isKiller ? 'VICTOR' : 'DEFEATED';
    const badgeBg = isKiller ? '#064e3b' : '#7f1d1d';
    const badgeColor = isKiller ? '#34d399' : '#f87171';
    
    ctx.font = 'bold 13px sans-serif';
    const bWidth = ctx.measureText(badgeText).width + 24;
    drawCard(centerX - (bWidth / 2), panelY + 18, bWidth, 24, badgeBg, isKiller ? '#059669' : '#dc2626', 6);
    ctx.fillStyle = badgeColor;
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, centerX, panelY + 34);

    // İsim & Lonca
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(player.Name || 'Unknown', centerX, panelY + 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(player.GuildName ? `< ${player.GuildName} >` : 'Loncasız', centerX, panelY + 106);

    // IP Bilgisi
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${Math.round(player.AverageItemPower || 0)} IP`, centerX, panelY + 135);

    // Ekipman Tablosu (Grid)
    const gridStartY = panelY + 160;
    const gridStartX = centerX - (iconSize / 2);
    const eq = player.Equipment || {};

    // Satır 1: Çanta, Miğfer, Pelerin
    await drawSlot(eq.Bag, gridStartX - iconSize - spacing, gridStartY);
    await drawSlot(eq.Head, gridStartX, gridStartY);
    await drawSlot(eq.Cape, gridStartX + iconSize + spacing, gridStartY);

    // Satır 2: Ana Silah, Zırh, İkinci El
    await drawSlot(eq.MainHand, gridStartX - iconSize - spacing, gridStartY + iconSize + spacing);
    await drawSlot(eq.Armor, gridStartX, gridStartY + iconSize + spacing);
    await drawSlot(eq.OffHand, gridStartX + iconSize + spacing, gridStartY + iconSize + spacing);

    // Satır 3: İksir, Ayakkabı, Yemek
    await drawSlot(eq.Potion, gridStartX - iconSize - spacing, gridStartY + (iconSize + spacing) * 2);
    await drawSlot(eq.Shoes, gridStartX, gridStartY + (iconSize + spacing) * 2);
    await drawSlot(eq.Food, gridStartX + iconSize + spacing, gridStartY + (iconSize + spacing) * 2);

    // Satır 4: Binek
    await drawSlot(eq.Mount, gridStartX, gridStartY + (iconSize + spacing) * 3);
  };

  // Katil & Kurban Panelleri
  await drawPlayerDetails(event.Killer, true, 40);
  await drawPlayerDetails(event.Victim, false, width - 40 - panelW);

  // 3. Orta Alan (VS & Fame)
  const centerCenterX = width / 2;

  // VS Rozeti
  ctx.beginPath();
  ctx.arc(centerCenterX, panelY + 180, 42, 0, Math.PI * 2);
  ctx.fillStyle = '#111827';
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', centerCenterX, panelY + 191);

  // Fame Rozeti
  const fame = event.TotalVictimKillFame || event.KillFame || 0;
  const fameStr = fame >= 1000000 ? (fame / 1000000).toFixed(2) + 'M' : (fame >= 1000 ? (fame / 1000).toFixed(1) + 'k' : fame.toString());
  
  drawCard(centerCenterX - 85, panelY + 280, 170, 70, '#1c1917', '#d97706', 10);
  ctx.fillStyle = '#a8a29e';
  ctx.font = '11px sans-serif';
  ctx.fillText('KILL FAME', centerCenterX, panelY + 300);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`+${fameStr}`, centerCenterX, panelY + 332);

  // Parti Boyutu & Tarih Bilgisi
  ctx.fillStyle = '#64748b';
  ctx.font = '14px sans-serif';
  ctx.fillText(`Party: ${event.Participants ? event.Participants.length : 1} Players`, centerCenterX, panelY + 385);

  const dateObj = event.TimeStamp ? new Date(event.TimeStamp) : new Date();
  const dateStr = dateObj.toISOString().split('T')[0];
  ctx.fillText(dateStr, centerCenterX, panelY + 410);

  // 4. Alt Alan (Kurban Envanteri / Loot Grid - Ortalı)
  const invContainerX = 40;
  const invContainerW = width - 80;
  const invY = height - 210;
  
  drawCard(invContainerX, invY, invContainerW, 160, 'rgba(10, 10, 14, 0.95)', '#27273a', 12);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("VICTIM'S LOOT & INVENTORY", centerCenterX, invY + 28);

  if (event.Victim && event.Victim.Inventory) {
    const rawInventory = Array.isArray(event.Victim.Inventory) ? event.Victim.Inventory : [];
    const inventory = rawInventory.filter(i => i !== null);

    if (inventory.length > 0) {
      const invItems = inventory.slice(0, 10);
      const invIconSize = 88;
      const invSpacing = 12;

      const totalGridWidth = (invItems.length * invIconSize) + ((invItems.length - 1) * invSpacing);
      let currentX = centerCenterX - (totalGridWidth / 2);
      const itemY = invY + 45;

      for (const item of invItems) {
        await drawSlot(item, currentX, itemY, invIconSize);
        currentX += invIconSize + invSpacing;
      }
    }
  }

  return canvas.toBuffer('image/png');
}

module.exports = { generateKillboardImage };
