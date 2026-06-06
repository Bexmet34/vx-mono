const fs = require('fs');
const dir = 'src/content/blog';
fs.readdirSync(dir).forEach(f => {
  if (f.endsWith('.md')) {
    let content = fs.readFileSync(`${dir}/${f}`, 'utf8');
    if (!content.includes('lang:')) {
      content = content.replace(/^tags: (.*)$/m, 'tags: $1\nlang: "tr"');
      fs.writeFileSync(`${dir}/${f}`, content);
    }
  }
});
