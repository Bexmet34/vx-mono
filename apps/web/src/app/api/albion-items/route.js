import { NextResponse } from 'next/server';
import { supabase } from 'database';

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

    data.forEach(item => {
      // Format the display name: e.g. "T8 Mage Cowl"
      const displayName = `T${item.tier} ${item.name_tr}`;
      
      switch (item.category) {
        case 'weapon':
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

    // Swaps will just use all available items from everything
    grouped.swaps = [...grouped.weapons, ...grouped.heads, ...grouped.chests, ...grouped.shoes, ...grouped.offhands, ...grouped.potions, ...grouped.foods].sort();

    return NextResponse.json(grouped);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
