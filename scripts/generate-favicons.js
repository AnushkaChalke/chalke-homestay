const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '..', 'public', 'logo.png');
const fallback = path.join(__dirname, '..', 'public', 'misc', 'logo.png');
const outDir = path.join(__dirname, '..', 'public', 'favicons');

let src = input;
if (!fs.existsSync(src)) {
  if (fs.existsSync(fallback)) {
    console.log('Input not found at', input, '- using', fallback);
    src = fallback;
  } else {
    console.error('Input file not found:', input);
    process.exit(2);
  }
}

// also ensure there's a copy at public/logo.png for layout references
const canonical = path.join(__dirname, '..', 'public', 'logo.png');
try {
  if (src !== canonical) fs.copyFileSync(src, canonical);
} catch (err) {
  console.warn('Could not copy to canonical public/logo.png:', err.message || err);
}

fs.mkdirSync(outDir, { recursive: true });

const tasks = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

(async () => {
  try {
    for (const t of tasks) {
      const out = path.join(outDir, t.name);
      await sharp(src).resize(t.size, t.size).png().toFile(out);
      console.log('Wrote', out);
    }
    console.log('All favicons generated.');
  } catch (err) {
    console.error('Error generating favicons:', err);
    process.exit(1);
  }
})();
