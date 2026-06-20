const fs = require('fs');
const { getDb, getHealthsyncDb } = require('./database');

const TABLES = [
  'user_profile', 'activity_days', 'sport_activities', 'food_items',
  'meal_templates', 'meal_components', 'meal_options', 'daily_plans',
  'daily_plan_entries', 'measurement_sets', 'weight_entries',
  'training_routines', 'exercise_library',
  'training_sessions', 'training_sets', 'settings',
  'elaborated_dishes', 'dish_ingredients', 'meal_dish_options',
  'workout_plans', 'workout_plan_days',
];

function exportAllData(filePath) {
  const db = getDb();
  const data = { _metadata: { version: '0.1.0', exported_at: new Date().toISOString() } };
  for (const table of TABLES) {
    data[table] = db.prepare(`SELECT * FROM ${table}`).all();
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function importAllData(filePath) {
  const db = getDb();
  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid import data format');
  }

  const transaction = db.transaction(() => {
    for (const table of TABLES) {
      db.prepare(`DELETE FROM ${table}`).run();
    }
    for (const table of TABLES) {
      const rows = data[table];
      if (!rows || rows.length === 0) continue;
      try {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const insert = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
        for (const row of rows) {
          insert.run(columns.map(c => row[c]));
        }
      } catch (err) {
        throw new Error(`Error importing ${table}: ${err.message}`);
      }
    }
  });

  transaction();
}

// ─── HealthSync queries ───

function getBodyMass(limit = 90) {
  const db = getHealthsyncDb();
  return db.prepare(
    'SELECT date(start_date) as date, value, unit FROM body_mass ORDER BY start_date DESC LIMIT ?'
  ).all(limit);
}

function getDailySteps(from = '2026-01-01') {
  const db = getHealthsyncDb();
  return db.prepare(
    "SELECT date(start_date) as date, SUM(value) as steps FROM steps WHERE start_date >= ? GROUP BY date(start_date) ORDER BY date DESC"
  ).all(from);
}

function getDailyHeartRate(limit = 30) {
  const db = getHealthsyncDb();
  return db.prepare(
    "SELECT date(start_date) as date, ROUND(AVG(value), 1) as avg_bpm FROM heart_rate GROUP BY date(start_date) ORDER BY date DESC LIMIT ?"
  ).all(limit);
}

function getWorkouts(limit = 20) {
  const db = getHealthsyncDb();
  return db.prepare(
    "SELECT date(start_date) as date, activity_type, ROUND(duration, 1) as minutes, ROUND(total_energy_burned, 0) as kcal, ROUND(total_distance, 2) as km FROM workouts ORDER BY start_date DESC LIMIT ?"
  ).all(limit);
}

function getSleep(limit = 30) {
  const db = getHealthsyncDb();
  return db.prepare(
    "SELECT date(start_date, '-6 hours') as night, ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as hours FROM sleep WHERE value LIKE '%Asleep%' GROUP BY night ORDER BY night DESC LIMIT ?"
  ).all(limit);
}

function getWeeklyHRV(limit = 12) {
  const db = getHealthsyncDb();
  return db.prepare(
    "SELECT strftime('%Y-W%W', start_date) as week, ROUND(AVG(value), 1) as hrv_ms FROM hrv GROUP BY week ORDER BY week DESC LIMIT ?"
  ).all(limit);
}

module.exports = { exportAllData, importAllData, getBodyMass, getDailySteps, getDailyHeartRate, getWorkouts, getSleep, getWeeklyHRV };
