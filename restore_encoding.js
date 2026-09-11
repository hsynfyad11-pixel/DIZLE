const fs = require('fs');

// A function to decode win1252 double-encoding to original utf8 Buffer.
// Since iconv-lite might not be installed, let's just make a lookup table!
const win1252ToBytes = new Map();
// 0x00-0x7F and 0xA0-0xFF match unicode natively
for (let i = 0; i < 256; i++) {
  if (i >= 0x80 && i <= 0x9F) {
      // populate exceptions below
  } else {
      win1252ToBytes.set(String.fromCharCode(i), i);
  }
}
// Win1252 specifics in 0x80-0x9F:
const win1252Specials = {
  '\u20AC': 0x80, // €
  '\u0081': 0x81, // Unused
  '\u201A': 0x82, // ‚
  '\u0192': 0x83, // ƒ
  '\u201E': 0x84, // „
  '\u2026': 0x85, // …
  '\u2020': 0x86, // †
  '\u2021': 0x87, // ‡
  '\u02C6': 0x88, // ˆ
  '\u2030': 0x89, // ‰
  '\u0160': 0x8A, // Š
  '\u2039': 0x8B, // ‹
  '\u0152': 0x8C, // Œ
  '\u008D': 0x8D, // Unused
  '\u017D': 0x8E, // Ž
  '\u008F': 0x8F, // Unused
  '\u0090': 0x90, // Unused
  '\u2018': 0x91, // ‘
  '\u2019': 0x92, // ’
  '\u201C': 0x93, // “
  '\u201D': 0x94, // ”
  '\u2022': 0x95, // •
  '\u2013': 0x96, // –
  '\u2014': 0x97, // —
  '\u02DC': 0x98, // ˜
  '\u2122': 0x99, // ™
  '\u0161': 0x9A, // š
  '\u203A': 0x9B, // ›
  '\u0153': 0x9C, // œ
  '\u009D': 0x9D, // Unused
  '\u017E': 0x9E, // ž
  '\u0178': 0x9F  // Ÿ
};
for (const [char, byte] of Object.entries(win1252Specials)) {
  win1252ToBytes.set(char, byte);
}

function restoreFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('Øª') && !content.includes('Ø§') && !content.includes('Ù')) {
      console.log('Skipping (does not seem corrupted):', filePath);
      return;
  }
  
  const byteArr = [];
  let isCorrupted = false;
  for (let i = 0; i < content.length; i++) {
      const c = content[i];
      if (win1252ToBytes.has(c)) {
          byteArr.push(win1252ToBytes.get(c));
          if (c === 'Ø' || c === 'Ù') isCorrupted = true;
      } else {
          // It's possible some characters were just native utf8 that survived?
          // No, if it was read as ANSI, ALL bytes were mapped to 1 character each.
          // Fallback just grab the lowest byte
          byteArr.push(c.charCodeAt(0) & 0xFF);
      }
  }
  
  if (isCorrupted) {
      const recoveredBuffer = Buffer.from(byteArr);
      const recoveredString = recoveredBuffer.toString('utf8');
      fs.writeFileSync(filePath, recoveredString);
      console.log('Restored:', filePath);
  }
}

// walk and restore
const pathModule = require('path');
function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = pathModule.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      restoreFile(full);
    }
  }
}
walk('c:/Users/Mas/Desktop/DIZLE/src');
