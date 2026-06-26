const path = require('path');
const fs = require('fs');
const os = require('os');

const userDataPath = path.join(os.homedir(), '.config', 'personal-pollo');
const dbPath = path.join(userDataPath, 'health-data.db');

const Module = require('module');
const fakeElectron = {
  app: {
    getPath: (name) => name === 'userData' ? userDataPath : os.homedir(),
    whenReady: () => Promise.resolve(),
    on: () => {},
    commandLine: { appendSwitch: () => {} },
  },
  BrowserWindow: class { static getAllWindows() { return []; } on(_e, _cb) {} webContents = { send: () => {} }; isDestroyed() { return false; } },
  Menu: { buildFromTemplate: () => ({}), setApplicationMenu: () => {} },
  dialog: {},
  screen: { getPrimaryDisplay: () => ({ workArea: { width: 1200, height: 800 } }) },
};
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'electron') return 'electron';
  return origResolve.call(this, request, ...args);
};
require.cache.electron = { id: 'electron', filename: 'electron', loaded: true, exports: fakeElectron };

const { initDatabase, initHealthsyncDb } = require(path.join(__dirname, '..', 'src', 'db', 'database'));
const { resetHealthsyncData, syncAppleHealth, getHealthsyncDbInfo, HEALTHSYNC_DB } = require(path.join(__dirname, '..', 'src', 'main', 'apple-health-import'));

const args = process.argv.slice(2);
const skipSync = args.includes('--no-sync');
const jsonOutput = args.includes('--json');

function log(line) {
  if (!jsonOutput) console.log(line);
}

if (!fs.existsSync(dbPath)) {
  console.error('App DB not found at', dbPath);
  process.exit(1);
}
if (!fs.existsSync(HEALTHSYNC_DB)) {
  console.error('HealthSync DB not found at', HEALTHSYNC_DB);
  console.error('Run: healthsync parse <export.xml> first.');
  process.exit(1);
}

initDatabase();
initHealthsyncDb();

const fakeWindow = { isDestroyed: () => false, webContents: { send: (channel, msg) => log(`  [progress] ${msg}`) } };

log('=== Reset: deleting all healthsync-populated tables ===');
const reset = resetHealthsyncData();
log('Before:');
for (const [t, c] of Object.entries(reset.before)) {
  log(`  ${t}: ${c.toLocaleString()}`);
}
log('Deleted:');
for (const [t, c] of Object.entries(reset.deleted)) {
  log(`  ${t}: ${c.toLocaleString()}`);
}
log('After:');
for (const [t, c] of Object.entries(reset.after)) {
  log(`  ${t}: ${c.toLocaleString()}`);
}

if (skipSync) {
  log('\n=== Skipped sync (--no-sync). Run `npm run sync:healthsync` to repopulate. ===');
  if (jsonOutput) console.log(JSON.stringify({ reset }, null, 2));
  process.exit(0);
}

log('\n=== Repopulating from healthsync.db ===');
(async () => {
  const result = await syncAppleHealth(fakeWindow, {});
  log('\n=== Sync result ===');
  log(`ok: ${result.ok}`);
  log(`action: ${result.action} (parsed: ${result.parsed})`);
  if (result.migration) {
    log(`migration: created=${result.migration.created} skipped=${result.migration.skipped} errors=${result.migration.errors?.length || 0}`);
  }
  if (result.cache?.periods) {
    log('Cache:');
    for (const [p, info] of Object.entries(result.cache.periods)) {
      log(`  ${p}: ${info.rows} rows (${info.first} → ${info.last})`);
    }
  }
  if (result.errors?.length) {
    log('Errors:');
    for (const e of result.errors) log(`  ${e}`);
  }

  if (jsonOutput) {
    console.log(JSON.stringify({ reset, sync: result }, null, 2));
  }
  process.exit(result.ok ? 0 : 1);
})();
