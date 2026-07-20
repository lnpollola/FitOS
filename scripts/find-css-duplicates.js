const fs = require('fs');
const path = require('path');

const stylesDir = path.resolve(__dirname, '../src/renderer/styles');
const files = ['base.css', 'layout.css', 'cards.css', 'forms.css', 'tables.css', 'utilities.css', 'main.css'];

function extractClasses(content, file) {
  const classes = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\.[a-zA-Z0-9_-]+)\s*\{/);
    if (m) {
      classes.push({ className: m[1], file, line: i + 1 });
    }
  }
  return classes;
}

const all = {};
for (const f of files) {
  const content = fs.readFileSync(path.join(stylesDir, f), 'utf-8');
  const extracted = extractClasses(content, f);
  for (const c of extracted) {
    if (!all[c.className]) all[c.className] = [];
    all[c.className].push({ file: c.file, line: c.line });
  }
}

let found = false;
for (const [cls, locs] of Object.entries(all)) {
  if (locs.length > 1) {
    const filesSet = new Set(locs.map(l => l.file));
    if (filesSet.size > 1) {
      found = true;
      console.log(`\n${cls} — ${locs.length} occurrences:`);
      for (const l of locs) {
        console.log(`  ${l.file}:${l.line}`);
      }
    }
  }
}
if (!found) console.log('No cross-file duplicates found.');
