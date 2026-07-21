import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('CSS cross-file uniqueness', () => {
  const stylesDir = path.resolve(__dirname, '../../src/renderer/styles');
  const files = ['base.css', 'layout.css', 'cards.css', 'forms.css', 'tables.css', 'utilities.css', 'main.css'];

  function extractClasses(content) {
    const classes = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^(\.[a-zA-Z0-9_-]+)\s*\{/);
      if (m) classes.push(m[1]);
    }
    return classes;
  }

  it('should have no cross-file duplicate class definitions', () => {
    const all = {};
    for (const f of files) {
      const content = fs.readFileSync(path.join(stylesDir, f), 'utf-8');
      const extracted = extractClasses(content);
      for (const cls of extracted) {
        if (!all[cls]) all[cls] = [];
        all[cls].push(f);
      }
    }

    const duplicates = {};
    for (const [cls, locs] of Object.entries(all)) {
      const uniqueFiles = new Set(locs);
      if (uniqueFiles.size > 1) {
        duplicates[cls] = [...uniqueFiles];
      }
    }

    expect(Object.keys(duplicates)).toEqual([]);
  });
});
