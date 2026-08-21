const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || process.env.PORT || 3000;
const HTML_PATH = path.join(__dirname, '../apps/web/public/maintenance.html');

let supportUrl = 'https://discord.gg/veyronix';

try {
  const { LINKS } = require('../packages/config/src/index.js');
  if (LINKS?.SUPPORT_SERVER) supportUrl = LINKS.SUPPORT_SERVER;
} catch (e) {}

// Supabase üzerinden güncel linki almayı dene
try {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    supabase.from('system_settings').select('value').eq('key', 'discord_invite_url').single().then(({ data }) => {
      if (data?.value) supportUrl = data.value;
    }).catch(() => {});
  }
} catch (e) {}

const server = http.createServer((req, res) => {
  fs.readFile(HTML_PATH, 'utf8', (err, html) => {
    if (err) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('System under maintenance. Please check back in a few moments.');
      return;
    }

    // Şablon değişkenlerini gerçek link ile değiştir
    const renderedHtml = html
      .replace(/\$\{LINKS\.SUPPORT_SERVER\}/g, supportUrl)
      .replace(/https:\/\/discord\.gg\/veyronix/g, supportUrl);

    res.writeHead(503, {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '5',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(renderedHtml);
  });
});

server.listen(PORT, () => {
  console.log(`🟡 [Maintenance Server] Running on port ${PORT}... Serving maintenance.html (Discord: ${supportUrl})`);
});

