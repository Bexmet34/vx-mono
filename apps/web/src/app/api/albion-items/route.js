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
          // Healer silahlarını aramada kolay bulabilmeleri için "Healer" kelimesi ekleniyor
          if (item.unique_name.includes('HOLYSTAFF') || item.unique_name.includes('NATURESTAFF')) {
            displayName += ' (Healer)';
          }
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
