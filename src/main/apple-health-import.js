const { execFile, exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getDb, getHealthsyncDb, refreshCaches } = require('../db/database');

const HEALTHSYNC_REPO = 'BRO3886/healthsync';
const HEALTHSYNC_RELEASE_URL = `https://api.github.com/repos/${HEALTHSYNC_REPO}/releases/latest`;
const HEALTHSYNC_INSTALL_SCRIPT = 'https://healthsync.sidv.dev/install';
const HEALTHSYNC_DIR = path.join(os.homedir(), '.healthsync');
const HEALTHSYNC_DB = path.join(HEALTHSYNC_DIR, 'healthsync.db');

function buildStagingPath() {
  return path.join(os.tmpdir(), `healthsync-staging-${process.pid}-${Date.now()}.db`);
}

function safeUnlink(p) {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch {}
}

function atomicSwap(src, dst) {
  try {
    fs.renameSync(src, dst);
    return true;
  } catch (e) {
    if (e.code === 'EXDEV') {
      try {
        fs.copyFileSync(src, dst);
        fs.unlinkSync(src);
        return true;
      } catch (copyErr) {
        return false;
      }
    }
    return false;
  }
}

function isValidHealthsyncBinary(filePath) {
  if (!fs.existsSync(filePath)) return false;
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size < 1024 * 1024) return false;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    const magic = buf.toString('hex');
    return magic === '7f454c46' || magic === '4d5a9000' || magic === 'cffaedfe' || magic === 'cefaedfe' || magic === 'feedface' || magic === 'feedfacf';
  } catch {
    return false;
  }
}

function getHealthsyncPath() {
  const name = os.platform() === 'win32' ? 'healthsync.exe' : 'healthsync';
  const inHome = path.join(HEALTHSYNC_DIR, name);
  if (isValidHealthsyncBinary(inHome)) return inHome;
  if (fs.existsSync(inHome) && !isValidHealthsyncBinary(inHome)) {
    try { fs.unlinkSync(inHome); } catch {}
  }
  try {
    require('child_process').execSync('which healthsync', { stdio: 'ignore' });
    return 'healthsync';
  } catch {
    return null;
  }
}

function resolveAppleHealthXml(customPath) {
  const candidates = [];
  if (customPath) candidates.push(path.resolve(customPath));
  candidates.push(path.join(process.cwd(), 'ImportData', 'exportar.xml'));
  candidates.push(path.join(os.homedir(), 'ImportData', 'exportar.xml'));
  candidates.push(path.join(HEALTHSYNC_DIR, 'ImportData', 'exportar.xml'));
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function installHealthsync() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(HEALTHSYNC_DIR)) {
      fs.mkdirSync(HEALTHSYNC_DIR, { recursive: true });
    }

    const installCmd = `curl -fsSL ${HEALTHSYNC_INSTALL_SCRIPT} | bash`;
    exec(installCmd, { cwd: os.homedir(), maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Failed to install healthsync via script: ${stderr || error.message}`));
      }
      if (getHealthsyncPath()) {
        resolve(getHealthsyncPath());
      } else {
        reject(new Error('Install script completed but healthsync binary not found in PATH or ~/.healthsync/'));
      }
    });
  });
}

function parseHealthsyncXML(xmlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const binary = getHealthsyncPath();
    if (!binary) {
      return reject(new Error('HealthSync no está instalado. Pulsa "Instalar HealthSync" primero.'));
    }
    if (!fs.existsSync(xmlPath)) {
      return reject(new Error(`No se encontró el XML: ${xmlPath}`));
    }

    const dbPath = options.dbPath || HEALTHSYNC_DB;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const args = ['parse', xmlPath, '--db', dbPath];

    const proc = spawn(binary, args, {
      cwd: HEALTHSYNC_DIR,
    });

    let stderrBuf = '';
    let stdoutBuf = '';
    let lastProgressAt = 0;
    const progressInterval = 1000;
    const fallbackMsg = 'Parseando XML... (puede tardar 1-2 min)';

    const emitFallback = () => {
      if (!onProgress) return;
      const now = Date.now();
      if (now - lastProgressAt >= progressInterval) {
        onProgress(fallbackMsg);
        lastProgressAt = now;
      }
    };

    const fallbackTimer = setInterval(emitFallback, progressInterval);

    const handleChunk = (chunk, isStderr) => {
      const text = chunk.toString();
      if (isStderr) stderrBuf += text;
      else stdoutBuf += text;
      if (onProgress) {
        const m = text.match(/(\d{1,3})\s*%/);
        if (m) {
          const pct = Math.min(100, parseInt(m[1], 10));
          onProgress(`Parseando XML: ${pct}%`);
          lastProgressAt = Date.now();
        }
      }
    };

    proc.stdout.on('data', (chunk) => handleChunk(chunk, false));
    proc.stderr.on('data', (chunk) => handleChunk(chunk, true));

    proc.on('error', (err) => {
      clearInterval(fallbackTimer);
      if (dbPath !== HEALTHSYNC_DB) safeUnlink(dbPath);
      reject(new Error(`HealthSync spawn falló: ${err.message}`));
    });

    proc.on('close', (code) => {
      clearInterval(fallbackTimer);
      if (code !== 0) {
        if (dbPath !== HEALTHSYNC_DB) safeUnlink(dbPath);
        const msg = (stderrBuf || stdoutBuf || `exit code ${code}`).trim();
        return reject(new Error(`HealthSync parse falló: ${msg || `exit code ${code}`}`));
      }
      if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
        if (dbPath !== HEALTHSYNC_DB) safeUnlink(dbPath);
        return reject(new Error(`HealthSync parse terminó sin errores pero no se creó ${dbPath}`));
      }
      resolve(true);
    });
  });
}

function parseHealthsyncXMLToStaging(xmlPath, onProgress) {
  const stagingPath = buildStagingPath();
  return parseHealthsyncXML(xmlPath, { dbPath: stagingPath, onProgress })
    .then(() => stagingPath)
    .catch((err) => {
      safeUnlink(stagingPath);
      throw err;
    });
}

const ACTIVITY_TYPE_MAP = {
  'HKWorkoutActivityTypeRunning': 'running',
  'HKWorkoutActivityTypeCycling': 'cycling',
  'HKWorkoutActivityTypeWalking': 'walking',
  'HKWorkoutActivityTypeSwimming': 'swimming',
  'HKWorkoutActivityTypeYoga': 'yoga',
  'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'HIIT',
  'HKWorkoutActivityTypeTraditionalStrengthTraining': 'strength',
  'HKWorkoutActivityTypeSoccer': 'football',
  'HKWorkoutActivityTypePaddleSports': 'paddle',
  'HKWorkoutActivityTypeBoxing': 'boxing',
  'HKWorkoutActivityTypeMixedCardio': 'other',
  'HKWorkoutActivityTypeFunctionalStrengthTraining': 'strength',
  'HKWorkoutActivityTypeCoreTraining': 'other',
  'HKWorkoutActivityTypeFlexibility': 'other',
};

function getHealthsyncDbInfo() {
  if (!fs.existsSync(HEALTHSYNC_DB)) {
    return { available: false, path: HEALTHSYNC_DB, lastModified: null, xmlPath: null, xmlMtime: null, tables: {} };
  }
  const stats = fs.statSync(HEALTHSYNC_DB);
  const tables = {};
  try {
    const hs = getHealthsyncDb();
    if (hs) {
      const names = ['steps', 'heart_rate', 'active_energy', 'basal_energy', 'sleep', 'workouts', 'body_mass', 'resting_heart_rate', 'hrv'];
      for (const t of names) {
        try {
          const row = hs.prepare(`SELECT COUNT(*) as count FROM ${t}`).get();
          tables[t] = row.count;
        } catch {
          tables[t] = 0;
        }
      }
    }
  } catch (e) {
    return { available: true, path: HEALTHSYNC_DB, lastModified: stats.mtime, xmlPath: null, xmlMtime: null, tables: {}, error: e.message };
  }
  const xmlPath = resolveAppleHealthXml();
  let xmlMtime = null;
  if (xmlPath) {
    try { xmlMtime = fs.statSync(xmlPath).mtime.toISOString(); } catch {}
  }
  return { available: true, path: HEALTHSYNC_DB, lastModified: stats.mtime, sizeBytes: stats.size, xmlPath, xmlMtime, tables, anomalies: getHealthsyncDataAnomalies() };
}

function getHealthsyncDataAnomalies() {
  const db = getDb();
  try {
    const sportTotal = db.prepare('SELECT COUNT(*) as c FROM sport_activities').get().c;
    const sportDistinct = db.prepare("SELECT COUNT(DISTINCT date || '|' || sport_type) as c FROM sport_activities").get().c;
    const sportDuplicates = Math.max(0, sportTotal - sportDistinct);
    const weightTotal = db.prepare('SELECT COUNT(*) as c FROM weight_entries').get().c;
    const weightDistinct = db.prepare('SELECT COUNT(DISTINCT date) as c FROM weight_entries').get().c;
    const weightDuplicates = Math.max(0, weightTotal - weightDistinct);
    return {
      sportDuplicates,
      weightDuplicates,
      hasAnomaly: sportDuplicates > 0 || weightDuplicates > 0,
    };
  } catch (e) {
    return { sportDuplicates: 0, weightDuplicates: 0, hasAnomaly: false, error: e.message };
  }
}

function migrateHealthData(mainWindow) {
  const db = getDb();

  if (!fs.existsSync(HEALTHSYNC_DB)) {
    return { created: 0, skipped: 0, errors: ['No healthsync.db found at ' + HEALTHSYNC_DB] };
  }

  const healthDb = new (require('better-sqlite3'))(HEALTHSYNC_DB, { readonly: true });
  const results = { created: 0, skipped: 0, errors: [] };

  const sendProgress = (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('health-import-progress', msg);
    }
  };

  try {
    sendProgress('Importando pasos...');
    const hasSteps = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='steps'").get();
    if (hasSteps) {
      const steps = healthDb.prepare("SELECT date(start_date) as dia, SUM(value) as total FROM steps GROUP BY dia").all();
      const upsert = db.prepare("INSERT INTO activity_days (date, steps) VALUES (@dia, @total) ON CONFLICT(date) DO UPDATE SET steps = excluded.steps");
      const txn = db.transaction(() => { for (const s of steps) { upsert.run(s); results.created++; } });
      txn();
    }

    sendProgress('Importando calorías activas...');
    const hasActive = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='active_energy'").get();
    if (hasActive) {
      const active = healthDb.prepare("SELECT date(start_date) as dia, SUM(value) as total FROM active_energy GROUP BY dia").all();
      const upsert = db.prepare("INSERT INTO activity_days (date, active_calories) VALUES (@dia, @total) ON CONFLICT(date) DO UPDATE SET active_calories = excluded.active_calories");
      const txn = db.transaction(() => { for (const a of active) { upsert.run(a); results.created++; } });
      txn();
    }

    sendProgress('Importando calorías basales...');
    const hasBasal = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='basal_energy'").get();
    if (hasBasal) {
      const basal = healthDb.prepare("SELECT date(start_date) as dia, SUM(value) as total FROM basal_energy GROUP BY dia").all();
      const upsert = db.prepare("INSERT INTO activity_days (date, resting_calories) VALUES (@dia, @total) ON CONFLICT(date) DO UPDATE SET resting_calories = excluded.resting_calories");
      const txn = db.transaction(() => { for (const b of basal) { upsert.run(b); results.created++; } });
      txn();
    }

    sendProgress('Importando frecuencia cardíaca (media diaria)...');
    const hasHR = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='heart_rate'").get();
    if (hasHR) {
      const hr = healthDb.prepare("SELECT date(start_date) as dia, ROUND(AVG(value), 1) as media FROM heart_rate GROUP BY dia").all();
      const upsert = db.prepare("INSERT INTO activity_days (date, heart_rate_avg) VALUES (@dia, @media) ON CONFLICT(date) DO UPDATE SET heart_rate_avg = excluded.heart_rate_avg");
      const txn = db.transaction(() => { for (const h of hr) { upsert.run(h); results.created++; } });
      txn();
    }

    sendProgress('Importando sueño (total + etapas)...');
    const hasSleep = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='sleep'").get();
    if (hasSleep) {
      const sleep = healthDb.prepare(`
        SELECT date(start_date, '-6 hours') as noche,
               ROUND(SUM(CASE WHEN value LIKE '%Asleep%' THEN (julianday(end_date)-julianday(start_date))*24 ELSE 0 END), 2) as horas,
               ROUND(SUM(CASE WHEN value LIKE '%AsleepDeep%' THEN (julianday(end_date)-julianday(start_date))*24 ELSE 0 END), 2) as deep,
               ROUND(SUM(CASE WHEN value LIKE '%AsleepREM%' THEN (julianday(end_date)-julianday(start_date))*24 ELSE 0 END), 2) as rem,
               ROUND(SUM(CASE WHEN value LIKE '%AsleepCore%' THEN (julianday(end_date)-julianday(start_date))*24 ELSE 0 END), 2) as light
        FROM sleep
        GROUP BY noche
        HAVING horas > 0
      `).all();
      const selectExisting = db.prepare("SELECT sleep_hours, sleep_deep, sleep_rem, sleep_light FROM activity_days WHERE date = ?");
      const upsert = db.prepare(`
        INSERT INTO activity_days (date, sleep_hours, sleep_deep, sleep_rem, sleep_light)
        VALUES (@noche, @horas, @deep, @rem, @light)
        ON CONFLICT(date) DO UPDATE SET
          sleep_hours = excluded.sleep_hours,
          sleep_deep = excluded.sleep_deep,
          sleep_rem = excluded.sleep_rem,
          sleep_light = excluded.sleep_light
      `);
      const txn = db.transaction(() => {
        for (const s of sleep) {
          const existing = selectExisting.get(s.noche);
          const tag = 'healthsync:sleep';
          if (existing) {
            const sameHours = existing.sleep_hours === s.horas;
            const sameDeep = existing.sleep_deep === s.deep;
            const sameRem = existing.sleep_rem === s.rem;
            const sameLight = existing.sleep_light === s.light;
            if (sameHours && sameDeep && sameRem && sameLight) {
              results.skipped++;
              continue;
            }
          }
          upsert.run({ noche: s.noche, horas: s.horas, deep: s.deep, rem: s.rem, light: s.light });
          results.created++;
        }
      });
      txn();
    }

    sendProgress('Importando peso corporal...');
    const hasWeight = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='body_mass'").get();
    if (hasWeight) {
      const masses = healthDb.prepare("SELECT date(start_date) as dia, value, unit FROM body_mass ORDER BY start_date DESC").all();
      const deleteHealthsyncWeight = db.prepare("DELETE FROM weight_entries WHERE date = ? AND created_at LIKE 'healthsync:%'");
      const insertWeight = db.prepare("INSERT INTO weight_entries (date, weight_kg, created_at) VALUES (@dia, @value, @created_at)");
      const txn = db.transaction(() => {
        const insertedDates = new Set();
        for (const m of masses) {
          if (m.unit !== 'kg') continue;
          if (!insertedDates.has(m.dia)) {
            deleteHealthsyncWeight.run(m.dia);
            insertWeight.run({ dia: m.dia, value: m.value, created_at: `healthsync:${m.source || 'apple'}` });
            results.created++;
            insertedDates.add(m.dia);
          }
        }
      });
      txn();
    }

    sendProgress('Importando entrenamientos...');
    const hasWorkouts = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='workouts'").get();
    if (hasWorkouts) {
      const workouts = healthDb.prepare(`
        SELECT date(start_date) as dia, activity_type,
               ROUND(SUM(COALESCE(total_energy_burned, 0))) as kcal,
               ROUND(SUM(COALESCE(duration, 0))) as duration,
               ROUND(SUM(COALESCE(total_distance, 0)), 2) as distance,
               COUNT(*) as sessions
        FROM workouts
        WHERE total_distance_unit = 'km' OR total_distance_unit IS NULL
        GROUP BY dia, activity_type
        ORDER BY dia DESC
      `).all();
      const deleteHealthsyncSport = db.prepare("DELETE FROM sport_activities WHERE date = ? AND sport_type = ? AND created_at LIKE 'healthsync:%'");
      const insertSport = db.prepare("INSERT INTO sport_activities (date, sport_type, calories, duration_minutes, distance_km, created_at) VALUES (@dia, @sport_type, @kcal, @duration, @distance, @created_at)");
      const txn = db.transaction(() => {
        for (const w of workouts) {
          const sportType = ACTIVITY_TYPE_MAP[w.activity_type] || 'other';
          const kcal = Math.round(w.kcal || 0);
          const duration = Math.round(w.duration || 0);
          const distance = w.distance > 0 ? w.distance : null;
          deleteHealthsyncSport.run(w.dia, sportType);
          insertSport.run({ dia: w.dia, sport_type: sportType, kcal, duration, distance, created_at: `healthsync:${w.activity_type}:${w.sessions}s` });
          results.created++;
        }
      });
      txn();
    }

  } catch (e) {
    results.errors.push(e.message);
  } finally {
    healthDb.close();
  }

  sendProgress('Importación completada');
  return results;
}

function syncFromHealthsyncDb(mainWindow) {
  if (!fs.existsSync(HEALTHSYNC_DB)) {
    return { ok: false, created: 0, skipped: 0, errors: ['No se encontró ' + HEALTHSYNC_DB + '. Ejecuta `healthsync parse <export.zip>` primero.'] };
  }
  try {
    const result = migrateHealthData(mainWindow);
    return { ok: true, ...result };
  } catch (e) {
    return { ok: false, created: 0, skipped: 0, errors: [e.message] };
  }
}

function fullSync(mainWindow) {
  const startedAt = new Date().toISOString();
  const result = {
    startedAt,
    finishedAt: null,
    ok: false,
    healthsyncAvailable: false,
    healthsyncInfo: null,
    migration: null,
    cache: null,
    timestampSaved: false,
    errors: [],
  };

  if (!fs.existsSync(HEALTHSYNC_DB)) {
    result.errors.push('No se encontró ' + HEALTHSYNC_DB + '. Ejecuta `healthsync parse <export.zip>` primero.');
    result.finishedAt = new Date().toISOString();
    return result;
  }
  result.healthsyncAvailable = true;
  result.healthsyncInfo = getHealthsyncDbInfo();

  try {
    const migration = migrateHealthData(mainWindow);
    result.migration = migration;
    if (migration.errors && migration.errors.length > 0) {
      result.errors.push(...migration.errors);
    }
  } catch (e) {
    result.errors.push('migrateHealthData: ' + e.message);
    result.finishedAt = new Date().toISOString();
    return result;
  }

  try {
    refreshCaches();
    result.cache = getCacheStats();
  } catch (e) {
    result.errors.push('refreshCaches: ' + e.message);
  }

  try {
    const db = getDb();
    db.prepare("INSERT INTO settings (key, value) VALUES ('health_last_import', ?) ON CONFLICT(key) DO UPDATE SET value = ?")
      .run(startedAt, startedAt);
    result.timestampSaved = true;
  } catch (e) {
    result.errors.push('setLastImportTimestamp: ' + e.message);
  }

  result.ok = result.errors.length === 0;
  result.finishedAt = new Date().toISOString();
  return result;
}

function getCacheStats() {
  const db = getDb();
  const stats = { periods: {} };
  try {
    const periods = db.prepare('SELECT period_days, COUNT(*) as rows, MIN(date) as first, MAX(date) as last FROM activity_summary_cache GROUP BY period_days').all();
    for (const p of periods) {
      stats.periods[`${p.period_days}d`] = { rows: p.rows, first: p.first, last: p.last };
    }
  } catch (e) {
    stats.error = e.message;
  }
  return stats;
}

async function syncAppleHealth(mainWindow, options = {}) {
  const startedAt = new Date().toISOString();
  const result = {
    startedAt,
    finishedAt: null,
    ok: false,
    action: null,
    xmlPath: null,
    healthsyncDbMtime: null,
    xmlMtime: null,
    parsed: false,
    migration: null,
    cache: null,
    timestampSaved: false,
    errors: [],
  };

  const sendProgress = (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('health-import-progress', msg);
    }
  };

  const xmlPath = resolveAppleHealthXml(options.xmlPath);
  result.xmlPath = xmlPath;
  if (xmlPath) {
    try {
      result.xmlMtime = fs.statSync(xmlPath).mtime.toISOString();
    } catch {}
  }
  if (fs.existsSync(HEALTHSYNC_DB)) {
    try {
      result.healthsyncDbMtime = fs.statSync(HEALTHSYNC_DB).mtime.toISOString();
    } catch {}
  }

  const forceReparse = options.forceReparse === true;
  const hasHealthsync = !!getHealthsyncPath();
  const healthsyncDbExists = fs.existsSync(HEALTHSYNC_DB);
  const xmlIsNewer = xmlPath && (
    !healthsyncDbExists ||
    fs.statSync(xmlPath).mtimeMs > fs.statSync(HEALTHSYNC_DB).mtimeMs
  );

  if (forceReparse || xmlIsNewer) {
    if (!xmlPath) {
      result.errors.push('No se encontró ImportData/exportar.xml ni un XML válido. Coloca el export de Apple Health en ImportData/.');
      result.finishedAt = new Date().toISOString();
      return result;
    }
    if (!hasHealthsync) {
      result.errors.push('HealthSync no está instalado. Pulsa "Instalar HealthSync" primero.');
      result.finishedAt = new Date().toISOString();
      return result;
    }
    result.action = 'parse-and-sync';
    sendProgress('Parseando XML de Apple Health...');
    let stagingPath = null;
    try {
      stagingPath = await parseHealthsyncXMLToStaging(xmlPath, sendProgress);
      if (!atomicSwap(stagingPath, HEALTHSYNC_DB)) {
        safeUnlink(stagingPath);
        throw new Error('No se pudo hacer el swap atómico del DB parseado');
      }
      stagingPath = null;
      result.parsed = true;
      sendProgress('Parse completo, migrando datos a la app...');
    } catch (e) {
      result.errors.push('parseHealthsyncXML: ' + e.message);
      result.finishedAt = new Date().toISOString();
      return result;
    }
  } else if (healthsyncDbExists) {
    result.action = 'sync-only';
  } else {
    result.errors.push('No se encontró ImportData/exportar.xml ni ~/.healthsync/healthsync.db. Coloca el export de Apple Health en ImportData/.');
    result.finishedAt = new Date().toISOString();
    return result;
  }

  sendProgress('Migrando datos a la app...');
  try {
    const migration = migrateHealthData(mainWindow);
    result.migration = migration;
    if (migration.errors && migration.errors.length > 0) {
      result.errors.push(...migration.errors);
    }
  } catch (e) {
    result.errors.push('migrateHealthData: ' + e.message);
    result.finishedAt = new Date().toISOString();
    return result;
  }

  try {
    refreshCaches();
    result.cache = getCacheStats();
  } catch (e) {
    result.errors.push('refreshCaches: ' + e.message);
  }

  try {
    const db = getDb();
    db.prepare("INSERT INTO settings (key, value) VALUES ('health_last_import', ?) ON CONFLICT(key) DO UPDATE SET value = ?")
      .run(startedAt, startedAt);
    result.timestampSaved = true;
  } catch (e) {
    result.errors.push('setLastImportTimestamp: ' + e.message);
  }

  result.ok = result.errors.length === 0;
  result.finishedAt = new Date().toISOString();
  return result;
}

function resetHealthsyncData() {
  const db = getDb();
  const before = {
    activity_days: db.prepare('SELECT COUNT(*) as c FROM activity_days').get().c,
    sport_activities: db.prepare('SELECT COUNT(*) as c FROM sport_activities').get().c,
    weight_entries: db.prepare('SELECT COUNT(*) as c FROM weight_entries').get().c,
    activity_summary_cache: db.prepare('SELECT COUNT(*) as c FROM activity_summary_cache').get().c,
  };
  const txn = db.transaction(() => {
    db.exec('DELETE FROM activity_days');
    db.exec('DELETE FROM sport_activities');
    db.exec('DELETE FROM weight_entries');
    db.exec('DELETE FROM activity_summary_cache');
  });
  txn();
  const after = {
    activity_days: db.prepare('SELECT COUNT(*) as c FROM activity_days').get().c,
    sport_activities: db.prepare('SELECT COUNT(*) as c FROM sport_activities').get().c,
    weight_entries: db.prepare('SELECT COUNT(*) as c FROM weight_entries').get().c,
    activity_summary_cache: db.prepare('SELECT COUNT(*) as c FROM activity_summary_cache').get().c,
  };
  return {
    before,
    after,
    deleted: {
      activity_days: before.activity_days - after.activity_days,
      sport_activities: before.sport_activities - after.sport_activities,
      weight_entries: before.weight_entries - after.weight_entries,
      activity_summary_cache: before.activity_summary_cache - after.activity_summary_cache,
    },
  };
}

async function resetAndSyncHealthsync(mainWindow) {
  const reset = resetHealthsyncData();
  const sync = await syncAppleHealth(mainWindow, {});
  return { reset, sync };
}

module.exports = {
  getHealthsyncPath,
  installHealthsync,
  isValidHealthsyncBinary,
  parseHealthsyncXML,
  parseHealthsyncXMLToStaging,
  buildStagingPath,
  atomicSwap,
  migrateHealthData,
  fullSync,
  syncAppleHealth,
  resetHealthsyncData,
  resetAndSyncHealthsync,
  resolveAppleHealthXml,
  getHealthsyncDbInfo,
  getHealthsyncDataAnomalies,
  getCacheStats,
  HEALTHSYNC_DB,
  HEALTHSYNC_REPO,
};
