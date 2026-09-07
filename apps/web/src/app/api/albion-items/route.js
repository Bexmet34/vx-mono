import { NextResponse } from 'next/server';
import { supabase } from '@veyronix/database';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('albion_items')
      .select('unique_name, name_en, name_tr, category, tier')
      .order('tier', { ascending: false });

    if (error) {
      console.error('[API] Error fetching albion items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group items by category to make it easy for the client
    const grouped = {
      weapons: [],
      heads: [],
      chests: [],
      shoes: [],
      capes: [],
      offhands: [],
      potions: [],
      foods: []
    };

    const prefixesToRemove = [
      "Beginner's ", "Novice's ", "Journeyman's ", "Adept's ", "Expert's ", "Master's ", "Grandmaster's ", "Elder's ",
      "Acemi ", "Çaylak ", "Kalfa ", "Uzman ", "Usta ", "Üstat ", "Büyük Üstat ", "Yüce "
    ];

    data.forEach(item => {
      let displayName = item.name_tr;
      for (const prefix of prefixesToRemove) {
        if (displayName.startsWith(prefix)) {
          displayName = displayName.substring(prefix.length);
          break;
        }
      }
      
      let enName = item.name_en;
      for (const prefix of prefixesToRemove) {
        if (enName.startsWith(prefix)) {
          enName = enName.substring(prefix.length);
          break;
        }
      }

      switch (item.category) {
        case 'weapon':
          const u = item.unique_name;
          let role = '';
          if (u.includes('HOLYSTAFF')) role = 'Priest';
          else if (u.includes('NATURESTAFF')) role = 'Nature';
          else if (u.includes('MACE')) role = 'Mace';
          else if (u.includes('HAMMER')) role = 'Hammer';
          else if (u.includes('AXE')) role = 'Axe';
          else if (u.includes('SWORD')) role = 'Sword';
          else if (u.includes('DAGGER')) role = 'Dagger';
          else if (u.includes('SPEAR')) role = 'Spear';
          else if (u.includes('CROSSBOW')) role = 'Crossbow';
          else if (u.includes('BOW')) role = 'Bow';
          else if (u.includes('FIRESTAFF')) role = 'Pyromancer';
          else if (u.includes('FROSTSTAFF')) role = 'Frost mage';
          else if (u.includes('CURSESTAFF')) role = 'Warlock';
          else if (u.includes('ARCANESTAFF')) role = 'Arcanist';
          else if (u.includes('QUARTERSTAFF')) role = 'Quarterstaff';
          else if (u.includes('KNUCKLES')) role = 'War gloves';
          else if (u.includes('SHAPESHIFTER')) role = 'Shapesshifter';
          
          if (role) {
            grouped.weapons.push(`${displayName} (${role})`);
            // Avoid duplicate pushing if tr and en are identical
            if (displayName !== enName) {
              grouped.weapons.push(`${enName} (${role})`);
            }
          } else {
            grouped.weapons.push(displayName);
            if (displayName !== enName) grouped.weapons.push(enName);
          }
          break;
        case 'offhand':
          const offU = item.unique_name;
          let offRole = '';
          if (offU.includes('SHIELD') || offU.includes('TOWERSHIELD') || offU.includes('SPIKEDSHIELD')) offRole = 'Shield';
          else if (offU.includes('TOME') || offU.includes('BOOK') || offU.includes('ORB') || offU.includes('CENSER') || offU.includes('TALISMAN') || offU.includes('DEMONSKULL')) offRole = 'Tome';
          else if (offU.includes('TORCH') || offU.includes('HORN') || offU.includes('TOTEM') || offU.includes('LAMP') || offU.includes('JESTERCANE')) offRole = 'Torch';
          
          if (offRole) {
            grouped.offhands.push(`${displayName} (${offRole})`);
            if (displayName !== enName) {
              grouped.offhands.push(`${enName} (${offRole})`);
            }
          } else {
            grouped.offhands.push(displayName);
            if (displayName !== enName) grouped.offhands.push(enName);
          }
          break;
        case 'head':
          grouped.heads.push(displayName);
          if (displayName !== enName) grouped.heads.push(enName);
          break;
        case 'chest':
          grouped.chests.push(displayName);
          if (displayName !== enName) grouped.chests.push(enName);
          break;
        case 'shoes':
          grouped.shoes.push(displayName);
          if (displayName !== enName) grouped.shoes.push(enName);
          break;
        case 'cape':
          grouped.capes.push(displayName);
          if (displayName !== enName) grouped.capes.push(enName);
          break;
        case 'potion':
          grouped.potions.push(displayName);
          if (displayName !== enName) grouped.potions.push(enName);
          break;
        case 'food':
          grouped.foods.push(displayName);
          if (displayName !== enName) grouped.foods.push(enName);
          break;
      }
    });

    // Make unique and sort alphabetically
    Object.keys(grouped).forEach(key => {
      grouped[key] = [...new Set(grouped[key])].sort();
    });

    // Swaps will just use weapons
    grouped.swaps = [...grouped.weapons].sort();

    return NextResponse.json(grouped);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
