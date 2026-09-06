import { 
  albionWeapons, 
  albionHeads, 
  albionChests, 
  albionShoes, 
  albionPotions, 
  albionFoods 
} from '@/data/albionItems';

/**
 * Heuristic parser to convert unstructured LFG text into structured party blocks.
 */
export function parseTextToBlocks(rawText) {
  const blocks = [];
  if (!rawText || typeof rawText !== 'string') return blocks;

  // Split text by newlines
  const lines = rawText.split('\n');

  // Regex to clean up emojis, Discord mentions, and extra punctuations
  const cleanLine = (line) => {
    return line
      // Remove Discord user/role mentions <@12345> or <@&12345>
      .replace(/<@&?\d+>/g, '')
      // Remove generic @mentions
      .replace(/@\S+/g, '')
      // Remove Emojis (basic emoji regex)
      .replace(/[\u1000-\uFFFF]+/g, '')
      .replace(/🔹|⚔️|‼️|🛡️|🌱|🗡️|👑/g, '')
      // Remove trailing/leading punctuations or bullet points
      .replace(/^[-\*:\s]+|[-\*:\s]+$/g, '')
      .trim();
  };

  const findBestMatch = (words, dictionary) => {
    const lowerWords = words.toLowerCase();
    for (const item of dictionary) {
      if (lowerWords.includes(item.toLowerCase())) {
        return item;
      }
    }
    return "";
  };

  const findGenericMatch = (words, type) => {
    const lowerWords = words.toLowerCase();
    if (type === 'head') {
      if (lowerWords.includes('hood')) return 'Hood';
      if (lowerWords.includes('cowl')) return 'Cowl';
      if (lowerWords.includes('helmet')) return 'Helmet';
    } else if (type === 'chest') {
      if (lowerWords.includes('jacket')) return 'Jacket';
      if (lowerWords.includes('robe')) return 'Robe';
      if (lowerWords.includes('armor')) return 'Armor';
    } else if (type === 'shoes') {
      if (lowerWords.includes('shoes')) return 'Shoes';
      if (lowerWords.includes('sandals')) return 'Sandals';
      if (lowerWords.includes('boots')) return 'Boots';
    }
    return "";
  };

  lines.forEach((originalLine) => {
    const line = cleanLine(originalLine);
    if (!line) return;

    // Check if it's a short header-like text
    const lowerLine = line.toLowerCase();
    const isHeader = lowerLine.includes('min t8') || lowerLine.includes('ava skip') || lowerLine.includes('tracking') || (line.length > 3 && line.length < 25 && !line.includes('(') && !line.includes('>'));
    
    // Attempt to extract role name (before a colon or parentheses)
    let roleOrWeapon = "";
    let gearsText = line;
    
    // E.g. "TANK : Iron Root (blueflame torch...)"
    if (line.includes(':')) {
      const parts = line.split(':');
      roleOrWeapon = parts[0].trim();
      gearsText = parts.slice(1).join(' ').trim();
    } else if (line.includes('(')) {
      const parts = line.split('(');
      roleOrWeapon = parts[0].trim();
      gearsText = line;
    }

    if (!roleOrWeapon) {
      roleOrWeapon = line;
    }

    // Identify gears
    const head = findBestMatch(gearsText, albionHeads) || findGenericMatch(gearsText, 'head');
    const chest = findBestMatch(gearsText, albionChests) || findGenericMatch(gearsText, 'chest');
    const shoes = findBestMatch(gearsText, albionShoes) || findGenericMatch(gearsText, 'shoes');
    const potion = findBestMatch(gearsText, albionPotions);
    const food = findBestMatch(gearsText, albionFoods);
    let weapon = findBestMatch(gearsText, albionWeapons) || findBestMatch(roleOrWeapon, albionWeapons);

    // If it's a pure header and no items found
    if (!head && !chest && !shoes && !weapon && isHeader) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random()}`,
        type: "header",
        text: line.length > 40 ? line.substring(0, 40) : line
      });
      return;
    }

    // Determine role name if not found in weapons
    if (!weapon) {
      if (lowerLine.includes('tank')) weapon = 'Tank';
      else if (lowerLine.includes('heal') || lowerLine.includes('hallowfall')) weapon = 'Healer';
      else if (lowerLine.includes('dps') || lowerLine.includes('xdps') || lowerLine.includes('sc') || lowerLine.includes('mp')) weapon = roleOrWeapon;
      else weapon = roleOrWeapon.substring(0, 30);
    }

    // Clean up empty parentheses or artifacts in role name
    weapon = weapon.replace(/\(\s*\)/g, '').trim();
    if (!weapon) weapon = 'Role';

    let visibleFields = 1;
    if (food) visibleFields = 6;
    else if (potion) visibleFields = 5;
    else if (shoes) visibleFields = 4;
    else if (chest) visibleFields = 3;
    else if (head) visibleFields = 2;

    blocks.push({
      id: `blk_${Date.now()}_${Math.random()}`,
      type: "role",
      weapon,
      head,
      chest,
      shoes,
      potion,
      food,
      visibleFields
    });
  });

  return blocks;
}
