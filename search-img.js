const https = require('https');

https.get('https://html.duckduckgo.com/html/?q=albion+online+killboard+death+screen+ui', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const matches = data.match(/src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^&"]+)/g);
    if (matches) {
        matches.slice(0, 3).forEach(m => console.log(decodeURIComponent(m.replace('src="//external-content.duckduckgo.com/iu/?u=', ''))));
    } else {
        console.log("No images found");
    }
  });
});
