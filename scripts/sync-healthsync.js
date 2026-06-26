const path = require('path');
const fs = require('fs');
const os = require('os');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
const jsonOutput = args.includes('--json');
const reparseIdx = args.findIndex((a) => a === '--reparse' || a === '-r');
const reparsePath = reparseIdx >= 0 ? args[reparseIdx + 1] : null;
const positionalXml = args.find((a) => !a.startsWith('-') && a !== reparsePath);

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

const { initDatabase, getDb, initHealthsyncDb, getHealthsyncDb } = require(path.join(__dirname, '..', 'src', 'db', 'database'));
const { fullSync, getHealthsyncDbInfo, getCacheStats, HEALTHSYNC_DB, getHealthsyncPath, parseHealthsyncXML } = require(path.join(__dirname, '..', 'src', 'main', 'apple-health-import'));

function formatBytes(b) {
  if (b == null) return 'unknown';
  const mb = b / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function log(line) {
  if (!jsonOutput) console.log(line);
}

if (!fs.existsSync(dbPath)) {
  console.error('App DB not found at', dbPath);
  process.exit(1);
}
if (!fs.existsSync(HEALTHSYNC_DB)) {
  if (reparsePath || positionalXml) {
    const xml = reparsePath || positionalXml;
    log(`HealthSync DB missing — attempting to parse ${xml} first...`);
    if (!fs.existsSync(xml)) {
      console.error(`XML not found at ${xml}`);
      process.exit(1);
    }
    if (!getHealthsyncPath()) {
      console.error('HealthSync binary not installed. Run the install script first.');
      process.exit(1);
    }
    const fakeWindow = { isDestroyed: () => false, webContents: { send: () => {} } };
    initDatabase();
    parseHealthsyncXML(xml).then(() => {
      log('Parse complete — re-running sync...');
      runSync();
    }).catch((e) => {
      console.error('Parse failed:', e.message);
      process.exit(1);
    });
  } else {
    console.error('HealthSync DB not found at', HEALTHSYNC_DB);
    console.error('Run: healthsync parse <export.zip>');
    console.error('Or: /sync-healthsync --reparse <path-to-exportar.xml>');
    process.exit(1);
  }
} else {
  runSync();
}

function runSync() {
  if (!fs.existsSync(HEALTHSYNC_DB)) {
    console.error('HealthSync DB still missing at', HEALTHSYNC_DB);
    process.exit(1);
  }

  const fakeWindow = {
    isDestroyed: () => false,
    webContents: { send: () => {} },
  };
  const mainWindow = fakeWindow;

  initDatabase();
  initHealthsyncDb();

  const captureState = () => ({
    activityDays: getDb().prepare('SELECT COUNT(*) as c FROM activity_days').get().c,
    sportActivities: getDb().prepare('SELECT COUNT(*) as c FROM sport_activities').get().c,
    weightEntries: getDb().prepare('SELECT COUNT(*) as c FROM weight_entries').get().c,
    nightsWithSleep: getDb().prepare('SELECT COUNT(*) as c FROM activity_days WHERE sleep_hours > 0').get().c,
    nightsWithDeep: getDb().prepare('SELECT COUNT(*) as c FROM activity_days WHERE sleep_deep > 0').get().c,
    nightsWithRem: getDb().prepare('SELECT COUNT(*) as c FROM activity_days WHERE sleep_rem > 0').get().c,
    nightsWithLight: getDb().prepare('SELECT COUNT(*) as c FROM activity_days WHERE sleep_light > 0').get().c,
    lastActivityDay: getDb().prepare('SELECT MAX(date) as d FROM activity_days').get().d,
    lastSport: getDb().prepare('SELECT MAX(date) as d FROM sport_activities').get().d,
    lastWeight: getDb().prepare('SELECT MAX(date) as d FROM weight_entries').get().d,
    healthLastImport: getDb().prepare("SELECT value FROM settings WHERE key = 'health_last_import'").get()?.value,
  });

  const before = captureState();

  log('=== Pre-sync state ===');
  log(`App DB: ${dbPath}`);
  log(`Healthsync DB: ${HEALTHSYNC_DB}`);
  const hsInfo = getHealthsyncDbInfo();
  log(`Healthsync DB modified: ${hsInfo.lastModified} (${formatBytes(hsInfo.sizeBytes)})`);
  log('Healthsync table counts:');
  for (const [t, c] of Object.entries(hsInfo.tables)) {
    if (c > 0) log(`  ${t}: ${c.toLocaleString()}`);
  }
  log('');
  log('App tables before:');
  log(`  activity_days: ${before.activityDays} (nights with sleep: ${before.nightsWithSleep} | deep: ${before.nightsWithDeep} | REM: ${before.nightsWithRem} | light: ${before.nightsWithLight})`);
  log(`  sport_activities: ${before.sportActivities}`);
  log(`  weight_entries: ${before.weightEntries}`);
  log(`  last_activity_day: ${before.lastActivityDay} | last_sport: ${before.lastSport} | last_weight: ${before.lastWeight}`);
  log(`  health_last_import: ${before.healthLastImport || '(never)'}`);

  if (dryRun) {
    log('');
    log('=== Dry run — no changes written ===');
    log('To run the actual sync, invoke without --dry-run.');
    if (jsonOutput) {
      console.log(JSON.stringify({ ok: true, dryRun: true, before, healthsyncInfo: hsInfo }, null, 2));
    }
    process.exit(0);
  }

  const result = fullSync(mainWindow);
  const after = captureState();

  log('');
  log('=== Sync result ===');
  log(`ok: ${result.ok}`);
  log(`Migration: created=${result.migration?.created || 0} skipped=${result.migration?.skipped || 0} errors=${result.migration?.errors?.length || 0}`);
  if (result.cache && result.cache.periods) {
    log('Cache (activity_summary_cache):');
    for (const [period, info] of Object.entries(result.cache.periods)) {
      log(`  ${period}: ${info.rows} rows (${info.first} → ${info.last})`);
    }
  }
  log(`Timestamp saved: ${result.timestampSaved}`);
  if (result.errors && result.errors.length > 0) {
    log(`Errors: ${JSON.stringify(result.errors)}`);
  }

  log('');
  log('=== Post-sync state ===');
  log(`  activity_days: ${after.activityDays} (nights with sleep: ${after.nightsWithSleep} | deep: ${after.nightsWithDeep} | REM: ${after.nightsWithRem} | light: ${after.nightsWithLight})`);
  log(`  sport_activities: ${after.sportActivities}`);
  log(`  weight_entries: ${after.weightEntries}`);
  log(`  last_activity_day: ${after.lastActivityDay} | last_sport: ${after.lastSport} | last_weight: ${after.lastWeight}`);
  log(`  health_last_import: ${after.healthLastImport || '(never)'}`);

  log('');
  log('=== Delta ===');
  log(`  activity_days: ${after.activityDays - before.activityDays >= 0 ? '+' : ''}${after.activityDays - before.activityDays}`);
  log(`  sport_activities: ${after.sportActivities - before.sportActivities >= 0 ? '+' : ''}${after.sportActivities - before.sportActivities}`);
  log(`  weight_entries: ${after.weightEntries - before.weightEntries >= 0 ? '+' : ''}${after.weightEntries - before.weightEntries}`);
  log(`  nights_with_sleep: ${after.nightsWithSleep - before.nightsWithSleep >= 0 ? '+' : ''}${after.nightsWithSleep - before.nightsWithSleep}`);
  log(`  nights_with_deep: ${after.nightsWithDeep - before.nightsWithDeep >= 0 ? '+' : ''}${after.nightsWithDeep - before.nightsWithDeep}`);
  log(`  nights_with_rem: ${after.nightsWithRem - before.nightsWithRem >= 0 ? '+' : ''}${after.nightsWithRem - before.nightsWithRem}`);
  log(`  nights_with_light: ${after.nightsWithLight - before.nightsWithLight >= 0 ? '+' : ''}${after.nightsWithLight - before.nightsWithLight}`);

  const sleepSamples = getDb().prepare(`
    SELECT date, sleep_hours, sleep_deep, sleep_rem, sleep_light
    FROM activity_days
    WHERE sleep_deep > 0 AND sleep_rem > 0 AND sleep_light > 0
    ORDER BY date DESC LIMIT 5
  `).all();
  log('');
  log('=== Recent nights with full stage data ===');
  for (const s of sleepSamples) {
    log(`  ${s.date}: total=${s.sleep_hours}h | deep=${s.sleep_deep}h | rem=${s.sleep_rem}h | light=${s.sleep_light}h`);
  }

  if (jsonOutput) {
    const summary = {
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      ok: result.ok,
      healthsyncInfo: hsInfo,
      before, after,
      migration: result.migration,
      cache: result.cache,
      timestampSaved: result.timestampSaved,
      errors: result.errors,
    };
    console.log(JSON.stringify(summary, null, 2));
  }

  process.exit(result.ok ? 0 : 1);
}
