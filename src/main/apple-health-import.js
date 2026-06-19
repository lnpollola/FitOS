const { execFile, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getDb } = require('../db/database');

const HEALTHSYNC_DIR = path.join(os.homedir(), '.healthsync');
const HEALTHSYNC_DB = path.join(HEALTHSYNC_DIR, 'healthsync.db');

function getHealthsyncPath() {
  const name = os.platform() === 'win32' ? 'healthsync.exe' : 'healthsync';
  const inPath = path.join(HEALTHSYNC_DIR, name);
  if (fs.existsSync(inPath)) return inPath;
  try {
    require('child_process').execSync('which healthsync', { stdio: 'ignore' });
    return 'healthsync';
  } catch {
    return null;
  }
}

function installHealthsync() {
  return new Promise((resolve, reject) => {
    const url = os.platform() === 'darwin'
      ? 'https://github.com/ANPULSE/healthsync/releases/latest/download/healthsync-macos'
      : os.platform() === 'win32'
        ? 'https://github.com/ANPULSE/healthsync/releases/latest/download/healthsync-windows.exe'
        : 'https://github.com/ANPULSE/healthsync/releases/latest/download/healthsync-linux';

    const dest = path.join(HEALTHSYNC_DIR, os.platform() === 'win32' ? 'healthsync.exe' : 'healthsync');

    if (!fs.existsSync(HEALTHSYNC_DIR)) {
      fs.mkdirSync(HEALTHSYNC_DIR, { recursive: true });
    }

    const curl = exec(`curl -L "${url}" -o "${dest}" && chmod +x "${dest}"`, (error) => {
      if (error) reject(new Error('Failed to download healthsync'));
      else resolve(dest);
    });
  });
}

function parseHealthsyncXML(xmlPath) {
  return new Promise((resolve, reject) => {
    const binary = getHealthsyncPath();
    if (!binary) {
      return reject(new Error('HealthSync not installed'));
    }

    const proc = execFile(binary, ['parse', xmlPath], {
      cwd: HEALTHSYNC_DIR,
      maxBuffer: 1024 * 1024 * 100,
    }, (error, stdout, stderr) => {
      if (error && !fs.existsSync(HEALTHSYNC_DB)) {
        return reject(new Error(`HealthSync parse failed: ${stderr || error.message}`));
      }
      resolve(true);
    });
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

function migrateHealthData(mainWindow) {
  const db = getDb();

  if (!fs.existsSync(HEALTHSYNC_DB)) {
    return { created: 0, skipped: 0, errors: ['No healthsync.db found'] };
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

    sendProgress('Importando sueño...');
    const hasSleep = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='sleep'").get();
    if (hasSleep) {
      const sleep = healthDb.prepare("SELECT date(start_date, '-6 hours') as noche, ROUND(SUM((julianday(end_date)-julianday(start_date))*24), 2) as horas FROM sleep WHERE value LIKE '%Asleep%' GROUP BY noche").all();
      const upsert = db.prepare("INSERT INTO activity_days (date, sleep_hours) VALUES (@noche, @horas) ON CONFLICT(date) DO UPDATE SET sleep_hours = excluded.sleep_hours");
      const txn = db.transaction(() => { for (const s of sleep) { if (s.horas > 0) { upsert.run(s); results.created++; } } });
      txn();
    }

    sendProgress('Importando peso corporal...');
    const hasWeight = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='body_mass'").get();
    if (hasWeight) {
      const masses = healthDb.prepare("SELECT date(start_date) as dia, value, unit FROM body_mass ORDER BY start_date DESC").all();
      const insertWeight = db.prepare("INSERT OR IGNORE INTO weight_entries (date, weight_kg) VALUES (@dia, @value)");
      const txn = db.transaction(() => { for (const m of masses) { if (m.unit === 'kg') { insertWeight.run(m); results.created++; } } });
      txn();
    }

    sendProgress('Importando entrenamientos...');
    const hasWorkouts = healthDb.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='workouts'").get();
    if (hasWorkouts) {
      const workouts = healthDb.prepare("SELECT date(start_date) as dia, activity_type, total_energy_burned as kcal, duration FROM workouts ORDER BY start_date DESC").all();
      const insertSport = db.prepare("INSERT INTO sport_activities (date, sport_type, calories, duration_minutes) VALUES (@dia, @sport_type, @kcal, @duration)");
      const txn = db.transaction(() => {
        for (const w of workouts) {
          const sportType = ACTIVITY_TYPE_MAP[w.activity_type] || 'other';
          insertSport.run({ dia: w.dia, sport_type: sportType, kcal: Math.round(w.kcal || 0), duration: Math.round(w.duration || 0) });
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

module.exports = { getHealthsyncPath, installHealthsync, parseHealthsyncXML, migrateHealthData };
