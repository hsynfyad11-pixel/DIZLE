const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes(".toLocaleString('ar-IQ')")) {
        fs.writeFileSync(full, c.replace(/\.toLocaleString\('ar-IQ'\)/g, ".toLocaleString('en-US')"));
        console.log('Fixed:', full);
      }
    }
  }
}
walk('c:/Users/Mas/Desktop/DIZLE/src');
