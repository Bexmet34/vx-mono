const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('No Supabase credentials, skipping prebuild sync.');
    process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
    try {
        const { data, error } = await supabase.from('system_settings').select('*');
        if (data) {
            const inviteSetting = data.find(s => s.key === 'discord_invite_url');
            if (inviteSetting && inviteSetting.value) {
                const configPath = path.resolve(__dirname, '../../../packages/config/src/index.js');
                let configContent = fs.readFileSync(configPath, 'utf8');
                configContent = configContent.replace(
                    /SUPPORT_SERVER:\s*["'].*?["']/, 
                    `SUPPORT_SERVER: "${inviteSetting.value}"`
                );
                fs.writeFileSync(configPath, configContent);
                console.log('✅ Prebuild sync successful. Discord invite updated to:', inviteSetting.value);
            }
        }
    } catch (e) {
        console.warn('Prebuild sync failed:', e.message);
    }
}
sync();
