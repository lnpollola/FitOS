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
    // Steps → activity_days
    sendProgress('Importando pasos...');
    const stepsTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='steps'").get();
    if (stepsTable) {
      const steps = healthDb.prepare('SELECT date, value FROM steps').all();
      const insertDay = db.prepare(`
        INSERT INTO activity_days (date, steps) VALUES (?, ?)
        ON CONFLICT(date) DO UPDATE SET steps = excluded.steps
      `);
      for (const s of steps) {
        try {
          insertDay.run(s.date, parseInt(s.value) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
    }

    // Active energy → activity_days.active_calories
    sendProgress('Importando calorías activas...');
    const activeTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='active_energy'").get();
    if (activeTable) {
      const active = healthDb.prepare('SELECT date, value FROM active_energy').all();
      const updateActive = db.prepare(`
        INSERT INTO activity_days (date, active_calories) VALUES (?, ?)
        ON CONFLICT(date) DO UPDATE SET active_calories = excluded.active_calories
      `);
      for (const a of active) {
        try {
          updateActive.run(a.date, parseFloat(a.value) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
    }

    // Basal energy → activity_days.resting_calories
    sendProgress('Importando calorías basales...');
    const basalTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='basal_energy'").get();
    if (basalTable) {
      const basal = healthDb.prepare('SELECT date, value FROM basal_energy').all();
      const updateBasal = db.prepare(`
        INSERT INTO activity_days (date, resting_calories) VALUES (?, ?)
        ON CONFLICT(date) DO UPDATE SET resting_calories = excluded.resting_calories
      `);
      for (const b of basal) {
        try {
          updateBasal.run(b.date, parseFloat(b.value) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
    }

    // Heart rate → activity_days.heart_rate_avg
    sendProgress('Importando frecuencia cardíaca...');
    const hrTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='resting_heart_rate'").get();
    if (hrTable) {
      const hr = healthDb.prepare('SELECT date, value FROM resting_heart_rate').all();
      const updateHr = db.prepare(`
        INSERT INTO activity_days (date, heart_rate_avg) VALUES (?, ?)
        ON CONFLICT(date) DO UPDATE SET heart_rate_avg = excluded.heart_rate_avg
      `);
      for (const h of hr) {
        try {
          updateHr.run(h.date, parseFloat(h.value) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
    }

    // Sleep → activity_days.sleep_hours
    sendProgress('Importando sueño...');
    const sleepTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sleep'").get();
    if (sleepTable) {
      const sleep = healthDb.prepare('SELECT date, value FROM sleep').all();
      const updateSleep = db.prepare(`
        INSERT INTO activity_days (date, sleep_hours) VALUES (?, ?)
        ON CONFLICT(date) DO UPDATE SET sleep_hours = excluded.sleep_hours
      `);
      for (const s of sleep) {
        try {
          updateSleep.run(s.date, parseFloat(s.value) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
    }

    // Body mass → weight_entries
    sendProgress('Importando peso corporal...');
    const bodyMassTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='body_mass'").get();
    if (bodyMassTable) {
      const masses = healthDb.prepare('SELECT date, value FROM body_mass').all();
      const insertWeight = db.prepare('INSERT OR IGNORE INTO weight_entries (date, weight_kg) VALUES (?, ?)');
      for (const m of masses) {
        try {
          insertWeight.run(m.date, parseFloat(m.value) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
    }

    // Workouts → sport_activities
    sendProgress('Importando entrenamientos...');
    const workoutTable = healthDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='workouts'").get();
    if (workoutTable) {
      const workouts = healthDb.prepare('SELECT date, activity_type, calories, duration FROM workouts').all();
      const insertSport = db.prepare(`
        INSERT INTO sport_activities (date, sport_type, calories, duration_minutes)
        VALUES (?, ?, ?, ?)
      `);
      for (const w of workouts) {
        try {
          const sportType = ACTIVITY_TYPE_MAP[w.activity_type] || 'other';
          insertSport.run(w.date, sportType, parseFloat(w.calories) || 0, parseFloat(w.duration) || 0);
          results.created++;
        } catch { results.skipped++; }
      }
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
