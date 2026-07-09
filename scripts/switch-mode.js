#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MODE_FILE = path.join(__dirname, '..', '.current-mode');

function getCurrentMode() {
  try {
    return fs.readFileSync(MODE_FILE, 'utf-8').trim();
  } catch {
    return null;
  }
}

function setCurrentMode(mode) {
  fs.writeFileSync(MODE_FILE, mode);
}

function rebuildFor(mode) {
  const currentMode = getCurrentMode();
  if (currentMode === mode) {
    console.log(`✓ Already configured for ${mode} mode`);
    return;
  }

  console.log(`Switching to ${mode} mode...`);
  if (mode === 'web') {
    execSync('npm run rebuild:web', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } else if (mode === 'electron') {
    execSync('npm run rebuild:electron', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }
  setCurrentMode(mode);
  console.log(`✓ Switched to ${mode} mode`);
}

const mode = process.argv[2];
if (!mode || !['web', 'electron'].includes(mode)) {
  console.log('Usage: node scripts/switch-mode.js [web|electron]');
  console.log('');
  console.log('This script automatically rebuilds better-sqlite3 for the target mode.');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-mode.js web       # Switch to web mode');
  console.log('  node scripts/switch-mode.js electron  # Switch to Electron mode');
  process.exit(1);
}

rebuildFor(mode);
