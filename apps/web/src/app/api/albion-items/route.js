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
          if (u.includes('HOLYSTAFF')) role = 'Healer - Holy Staff';
          else if (u.includes('NATURESTAFF')) role = 'Healer - Nature Staff';
          else if (u.includes('MACE')) role = 'Tank - Mace';
          else if (u.includes('HAMMER')) role = 'Tank - Hammer';
          else if (u.includes('AXE')) role = 'Axe';
          else if (u.includes('SWORD')) role = 'Sword';
          else if (u.includes('DAGGER')) role = 'Dagger';
          else if (u.includes('SPEAR')) role = 'Spear';
          else if (u.includes('CROSSBOW')) role = 'Crossbow';
          else if (u.includes('BOW')) role = 'Bow';
          else if (u.includes('FIRESTAFF')) role = 'Fire Staff';
          else if (u.includes('FROSTSTAFF')) role = 'Frost Staff';
          else if (u.includes('CURSESTAFF')) role = 'Curse Staff';
          else if (u.includes('ARCANESTAFF')) role = 'Support - Arcane Staff';
          else if (u.includes('QUARTERSTAFF')) role = 'Quarterstaff';
          else if (u.includes('KNUCKLES')) role = 'War Gloves';
          else if (u.includes('SHAPESHIFTER')) role = 'Shapeshifter';
          
          if (role) displayName += ` (${role} | ${enName})`;
          else displayName += ` (${enName})`;
          
          grouped.weapons.push(displayName);
          break;
        case 'head':
          grouped.heads.push(displayName);
          break;
        case 'chest':
          grouped.chests.push(displayName);
          break;
        case 'shoes':
          grouped.shoes.push(displayName);
          break;
        case 'cape':
          grouped.capes.push(displayName);
          break;
        case 'offhand':
          grouped.offhands.push(displayName);
          break;
        case 'potion':
          grouped.potions.push(displayName);
          break;
        case 'food':
          grouped.foods.push(displayName);
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
