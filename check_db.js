require('dotenv').config({ path: 'apps/web/.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    const { data, error } = await supabase.from('guild_settings').select('*').limit(1);
    console.log(error);
    console.log(data);
}
check();
