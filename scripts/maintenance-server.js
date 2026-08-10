const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || process.env.PORT || 3000;
const HTML_PATH = path.join(__dirname, '../apps/web/public/maintenance.html');

const server = http.createServer((req, res) => {
  fs.readFile(HTML_PATH, 'utf8', (err, html) => {
    if (err) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('System under maintenance. Please check back in a few moments.');
      return;
    }

    res.writeHead(503, {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '10',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(html);
  });
});

server.listen(PORT, () => {
  console.log(`🟡 [Maintenance Server] Running on port ${PORT}... Serving maintenance.html`);
});
