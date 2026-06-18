const fs = require('fs');
const { getDb } = require('./database');

const TABLES = [
  'user_profile', 'activity_days', 'sport_activities', 'food_items',
  'meal_templates', 'meal_components', 'meal_options', 'daily_plans',
  'daily_plan_entries', 'measurement_sets', 'weight_entries',
  'training_routines', 'training_routine_days', 'exercise_library',
  'training_sessions', 'training_sets', 'settings',
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

module.exports = { exportAllData, importAllData };
