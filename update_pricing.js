require('dotenv').config({ path: './apps/web/.env' });
require('dotenv').config({ path: './apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const updates = [
    {
      id: '7_days',
      amount: '1.00',
      features_tr: ["Gelişmiş Parti Sistemi", "Tam Web Paneli Erişimi"],
      features_en: ["Advanced Party System", "Full Web Dashboard Access"]
    },
    {
      id: '1_month',
      amount: '8.00',
      features_tr: ["Gelişmiş Parti Sistemi", "Tam Web Paneli Erişimi"],
      features_en: ["Advanced Party System", "Full Web Dashboard Access"]
    },
    {
      id: '3_months',
      amount: '17.99',
      features_tr: ["Gelişmiş Parti Sistemi", "Sınırsız Parti Kurma", "Tam Web Paneli Erişimi", "Öncelikli Discord Desteği"],
      features_en: ["Advanced Party System", "Unlimited Party Creation", "Full Web Dashboard Access", "Priority Discord Support"]
    },
    {
      id: '1_year',
      amount: '65.00',
      features_tr: ["Gelişmiş Parti Sistemi", "Sınırsız Parti Kurma", "Tam Web Paneli Erişimi", "Öncelikli Discord Desteği"],
      features_en: ["Advanced Party System", "Unlimited Party Creation", "Full Web Dashboard Access", "Priority Discord Support"]
    }
  ];

  for (const plan of updates) {
    const { error } = await supabase
      .from('pricing_plans')
      .update({
        amount: plan.amount,
        features_tr: plan.features_tr,
        features_en: plan.features_en
      })
      .eq('id', plan.id);
      
    if (error) {
      console.error(`Error updating ${plan.id}:`, error.message);
    } else {
      console.log(`Successfully updated ${plan.id}`);
    }
  }
}

main();
