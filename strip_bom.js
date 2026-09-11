const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.charCodeAt(0) === 0xFEFF || c.charCodeAt(0) === 0xFFFD || c.charCodeAt(0) > 255) {
        // Find first valid JS character ('i' for import, or '\'' for 'use client', or '/')
        const match = c.match(/['"a-zA-Z\/]/);
        if (match && match.index > 0 && match.index < 10) {
          fs.writeFileSync(full, c.substring(match.index), 'utf8');
          console.log('Stripped leading artifacts from:', full);
        }
      }
    }
  }
}
walk('c:/Users/Mas/Desktop/DIZLE/src');
