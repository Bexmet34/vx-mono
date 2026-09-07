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
      
      switch (item.category) {
        case 'weapon':
          const u = item.unique_name;
          if (u.includes('HOLYSTAFF')) displayName += ' (Healer - Holy Staff)';
          else if (u.includes('NATURESTAFF')) displayName += ' (Healer - Nature Staff)';
          else if (u.includes('MACE')) displayName += ' (Tank - Mace)';
          else if (u.includes('HAMMER')) displayName += ' (Tank - Hammer)';
          else if (u.includes('AXE')) displayName += ' (Axe)';
          else if (u.includes('SWORD')) displayName += ' (Sword)';
          else if (u.includes('DAGGER')) displayName += ' (Dagger)';
          else if (u.includes('SPEAR')) displayName += ' (Spear)';
          else if (u.includes('CROSSBOW')) displayName += ' (Crossbow)';
          else if (u.includes('BOW')) displayName += ' (Bow)';
          else if (u.includes('FIRESTAFF')) displayName += ' (Fire Staff)';
          else if (u.includes('FROSTSTAFF')) displayName += ' (Frost Staff)';
          else if (u.includes('CURSESTAFF')) displayName += ' (Curse Staff)';
          else if (u.includes('ARCANESTAFF')) displayName += ' (Support - Arcane Staff)';
          else if (u.includes('QUARTERSTAFF')) displayName += ' (Quarterstaff)';
          else if (u.includes('KNUCKLES')) displayName += ' (War Gloves)';
          else if (u.includes('SHAPESHIFTER')) displayName += ' (Shapeshifter)';
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
