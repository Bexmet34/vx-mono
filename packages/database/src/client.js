const { createClient } = require('@supabase/supabase-js');

/**
 * Creates and returns a Supabase client.
 * Uses NEXT_PUBLIC_ variables if available (for Next.js), otherwise uses SUPABASE_ variables (for Node.js).
 */
const getClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

  if (!url || !key) {
    console.warn('[Supabase] GEREKLİ AYARLAR EKSİK! (.env kontrol edin)');
  }

  return createClient(url, key);
};

const supabase = getClient();

module.exports = {
  supabase,
  getClient
};
