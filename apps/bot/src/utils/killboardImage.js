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
 * Renders the Albion Online Killboard image (Preview Style Matched)
 * @param {Object} event The kill event object from Albion API
 * @returns {Promise<Buffer>} The generated PNG image buffer
 */
async function generateKillboardImage(event) {
  const width = 1200;
  const height = 1050;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Arka Plan (HTML ile Birebir Gelişmiş Radial Gradient)
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 800);
  bgGrad.addColorStop(0, '#252530');
  bgGrad.addColorStop(1, '#0d0d11');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Dış Çerçeve (Altın / Metalik Çift Çerçeve)
  ctx.strokeStyle = '#3d3d4d';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Yardımcı Fonksiyon: Yuvarlak Köşeli Dikdörtgen
  function roundRect(x, y, w, h, radius, fillStyle, strokeStyle, lineWidth = 2) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  const iconSize = 130;
  const spacing = 20;
  const startY = 190;

  // İkon / Slot Çizim Fonksiyonu (HTML Stili + Node.js Görsel Yakalama)
  const drawSlot = async (item, x, y, customSize = iconSize) => {
    const qualityColor = item && item.Quality ? (QUALITY_COLORS[item.Quality] || '#2a2a36') : '#2a2a36';

    // Arka plan kutusu
    roundRect(x, y, customSize, customSize, 12, '#181820', qualityColor, 2);

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
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, customSize, customSize, 12);
        ctx.clip();

        // Görseli slot içine sığdırma (Taşmayı önlemek için %16 zoom offset)
        const zoomOffset = customSize * 0.16;
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

    // Miktar Rozeti (HTML Tasarımı)
    if (item.Count > 1) {
      const isLarge = customSize > 100;
      const badgeW = isLarge ? 40 : 32;
      const badgeH = isLarge ? 24 : 18;
      const badgeX = x + customSize - badgeW - 5;
      const badgeY = y + customSize - badgeH - 5;

      roundRect(badgeX, badgeY, badgeW, badgeH, 6, 'rgba(0, 0, 0, 0.75)');

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${isLarge ? '16px' : '12px'} sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(item.Count.toString(), badgeX + badgeW / 2, badgeY + badgeH / 2 + (isLarge ? 5 : 4));
    }
  };

  // Oyuncu Paneli Çizim Fonksiyonu (HTML Tasarımı)
  const drawPlayerDetails = async (player, isKiller, xOffset) => {
    if (!player) return;

    // İsim ve Lonca
    ctx.fillStyle = isKiller ? '#4ade80' : '#f87171';
    ctx.font = '900 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.Name || 'Unknown', xOffset, 85);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 22px sans-serif';
    ctx.fillText(player.GuildName ? `[${player.GuildName}]` : 'Loncasız', xOffset, 120);

    // IP Rozeti (Pill Tasarımı)
    const ipText = `IP ${Math.round(player.AverageItemPower || 0)}`;
    ctx.font = 'bold 20px sans-serif';
    const ipWidth = ctx.measureText(ipText).width + 30;
    roundRect(xOffset - ipWidth / 2, 137, ipWidth, 32, 16, '#1e1e26', '#3f3f50');

    ctx.fillStyle = '#facc15';
    ctx.fillText(ipText, xOffset, 160);

    // Grid İkon Konumları
    const centerX = xOffset - (iconSize / 2);
    const eq = player.Equipment || {};

    // Satır 1: Çanta, Miğfer, Pelerin
    await drawSlot(eq.Bag, centerX - iconSize - spacing, startY);
    await drawSlot(eq.Head, centerX, startY);
    await drawSlot(eq.Cape, centerX + iconSize + spacing, startY);

    // Satır 2: Ana Silah, Zırh, İkinci El
    await drawSlot(eq.MainHand, centerX - iconSize - spacing, startY + iconSize + spacing);
    await drawSlot(eq.Armor, centerX, startY + iconSize + spacing);
    await drawSlot(eq.OffHand, centerX + iconSize + spacing, startY + iconSize + spacing);

    // Satır 3: İksir, Ayakkabı, Yemek
    await drawSlot(eq.Potion, centerX - iconSize - spacing, startY + (iconSize + spacing) * 2);
    await drawSlot(eq.Shoes, centerX, startY + (iconSize + spacing) * 2);
    await drawSlot(eq.Food, centerX + iconSize + spacing, startY + (iconSize + spacing) * 2);

    // Satır 4: Binek
    await drawSlot(eq.Mount, centerX, startY + (iconSize + spacing) * 3);
  };

  // 2. Katil ve Kurban Panelleri
  await drawPlayerDetails(event.Killer, true, width / 4);
  await drawPlayerDetails(event.Victim, false, (width / 4) * 3);

  // 3. Orta Alan (VS & Maç Detayları)
  const centerX = width / 2;
  const vsY = 450;
  
  // VS Metni (Mevcut konumunda kalıyor)
  ctx.fillStyle = '#ef4444';
  ctx.font = '900 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', centerX, vsY - 40);

  // Ortadaki Alt Bilgiler (Fame, Party, Tarih) - Binek hizasına (Y: ~650) indirildi
  const infoY = 650;

  // Fame Kartı
  const fame = event.TotalVictimKillFame || event.KillFame || 0;
  const fameStr = fame >= 1000000 ? (fame / 1000000).toFixed(2) + 'M' : (fame >= 1000 ? (fame / 1000).toFixed(1) + 'k' : fame.toString());

  // Fame kutusunu 64px yazıya göre büyüttük
  roundRect(centerX - 160, infoY - 60, 320, 85, 12, '#261a0c', '#c5a059');
  
  ctx.fillStyle = '#f59e0b';
  // Fame yazısı 54px'e düşürüldü
  ctx.font = '900 54px sans-serif';
  ctx.fillText(`+${fameStr}`, centerX, infoY + 5);

  // Parti Boyutu & Tarih Bilgisi (Öncekinden büyük, Fame'den küçük)
  ctx.fillStyle = '#64748b';
  ctx.font = '500 28px sans-serif';
  ctx.fillText(`Party Size: ${event.Participants ? event.Participants.length : 1}`, centerX, infoY + 65);

  const dateObj = event.TimeStamp ? new Date(event.TimeStamp) : new Date();
  const dateStr = dateObj.toISOString().split('T')[0] + ' UTC';
  ctx.fillText(dateStr, centerX, infoY + 100);

  // 4. Alt Alan (Kurban Envanteri / Loot Grid)
  if (event.Victim && event.Victim.Inventory) {
    const rawInventory = Array.isArray(event.Victim.Inventory) ? event.Victim.Inventory : [];
    const inventory = rawInventory.filter(i => i !== null);

    if (inventory.length > 0) {
      const invY = height - 160;
      const invIconSize = 95; // Envanter kutuları büyütüldü
      const invSpacing = 16;  // Aralarındaki boşluk artırıldı

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("LOOT / INVENTORY", centerX, invY - 25);

      const invItems = inventory.slice(0, 10);
      const totalGridWidth = (invItems.length * invIconSize) + ((invItems.length - 1) * invSpacing);
      let startInvX = (width - totalGridWidth) / 2;

      for (const item of invItems) {
        await drawSlot(item, startInvX, invY, invIconSize);
        startInvX += invIconSize + invSpacing;
      }
    }
  }

  return canvas.toBuffer('image/png');
}

module.exports = { generateKillboardImage };
