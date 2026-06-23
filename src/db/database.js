const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const { seedIfEmpty } = require('./seed-data');
const EXERCISES_MIGRATION = require('./seed-data').EXERCISES || [];

let db;
let healthsyncDb;

function getDbPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'health-data.db');
}

function initDatabase() {
  db = new Database(getDbPath());
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  createTables();
  seedIfEmpty(db);
  return db;
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      age INTEGER,
      sex TEXT CHECK (sex IN ('male', 'female')),
      height_cm REAL,
      weight_kg REAL,
      activity_baseline TEXT CHECK (activity_baseline IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      steps INTEGER,
      active_calories REAL,
      resting_calories REAL,
      heart_rate_avg REAL,
      sleep_hours REAL,
      weight_kg REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sport_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      sport_type TEXT NOT NULL CHECK (sport_type IN ('cycling', 'boxing', 'HIIT', 'walking', 'football', 'paddle')),
      calories REAL,
      duration_minutes REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      kcal_per_100g REAL NOT NULL,
      protein_per_100g REAL NOT NULL,
      carbs_per_100g REAL NOT NULL,
      fat_per_100g REAL NOT NULL,
      is_hidden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meal_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slot_order INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meal_components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_template_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      default_grams REAL NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (meal_template_id) REFERENCES meal_templates(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    );

    CREATE TABLE IF NOT EXISTS meal_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_component_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (meal_component_id) REFERENCES meal_components(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    );

    CREATE TABLE IF NOT EXISTS daily_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_plan_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_plan_id INTEGER NOT NULL,
      meal_component_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      grams REAL NOT NULL,
      FOREIGN KEY (daily_plan_id) REFERENCES daily_plans(id),
      FOREIGN KEY (meal_component_id) REFERENCES meal_components(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    );

    CREATE TABLE IF NOT EXISTS measurement_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      chest_cm REAL,
      neck_cm REAL,
      shoulders_cm REAL,
      biceps_left_cm REAL,
      biceps_right_cm REAL,
      forearms_left_cm REAL,
      forearms_right_cm REAL,
      waist_cm REAL,
      hips_cm REAL,
      thighs_left_cm REAL,
      thighs_right_cm REAL,
      calves_left_cm REAL,
      calves_right_cm REAL,
      weight_kg REAL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weight_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      weight_kg REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS training_routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS training_routine_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (routine_id) REFERENCES training_routines(id)
    );

    CREATE TABLE IF NOT EXISTS exercise_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      muscle_group TEXT,
      equipment TEXT,
      movement_pattern TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS training_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      routine_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (routine_id) REFERENCES training_routines(id)
    );

    CREATE TABLE IF NOT EXISTS training_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      load_kg REAL,
      reps INTEGER,
      rpe REAL,
      FOREIGN KEY (session_id) REFERENCES training_sessions(id),
      FOREIGN KEY (exercise_id) REFERENCES exercise_library(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS elaborated_dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      total_kcal REAL,
      total_protein REAL,
      total_carbs REAL,
      total_fat REAL,
      servings REAL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dish_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      grams REAL NOT NULL,
      FOREIGN KEY (dish_id) REFERENCES elaborated_dishes(id) ON DELETE CASCADE,
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    );

    CREATE TABLE IF NOT EXISTS meal_dish_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_template_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (meal_template_id) REFERENCES meal_templates(id),
      FOREIGN KEY (dish_id) REFERENCES elaborated_dishes(id)
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      min_sessions INTEGER NOT NULL,
      max_sessions INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_plan_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      day_number INTEGER NOT NULL,
      focus_area TEXT,
      exercise_ids TEXT,
      FOREIGN KEY (plan_id) REFERENCES workout_plans(id)
    );

    CREATE TABLE IF NOT EXISTS activity_summary_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_days INTEGER NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER DEFAULT 0,
      active_kcal REAL DEFAULT 0,
      resting_kcal REAL DEFAULT 0,
      exercise_minutes REAL DEFAULT 0,
      walking_km REAL DEFAULT 0,
      cycling_km REAL DEFAULT 0,
      sleep_hours REAL DEFAULT 0,
      hrv_avg REAL,
      resting_hr_avg REAL,
      sport_sessions INTEGER DEFAULT 0,
      sport_kcal REAL DEFAULT 0,
      sport_minutes REAL DEFAULT 0,
      weight_kg REAL,
      UNIQUE(period_days, date)
    );
  `);

  // Schema migrations
  const schemaVersion = db.prepare("SELECT value FROM settings WHERE key = 'schema_version'").get()?.value;
  if (!schemaVersion || parseInt(schemaVersion) < 1) {
    // Migration 1: Add practical_examples column
    const hasExamples = db.prepare("SELECT COUNT(*) as cnt FROM pragma_table_info('exercise_library') WHERE name='practical_examples'").get();
    if (hasExamples.cnt === 0) {
      db.exec("ALTER TABLE exercise_library ADD COLUMN practical_examples TEXT");
    }

    // Migration 2: Expand sport_types
    db.exec(`
      CREATE TABLE IF NOT EXISTS sport_activities_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sport_type TEXT NOT NULL CHECK (sport_type IN ('running', 'cycling', 'walking', 'swimming', 'yoga', 'HIIT', 'strength', 'football', 'paddle', 'boxing', 'other')),
        calories REAL,
        duration_minutes REAL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
    const oldCount = db.prepare("SELECT COUNT(*) as cnt FROM sport_activities").get().cnt;
    if (oldCount > 0) {
      db.prepare("INSERT OR IGNORE INTO sport_activities_v2 (id, date, sport_type, calories, duration_minutes, created_at) SELECT id, date, sport_type, calories, duration_minutes, created_at FROM sport_activities").run();
    }
    db.exec("DROP TABLE IF EXISTS sport_activities");
    db.exec("ALTER TABLE sport_activities_v2 RENAME TO sport_activities");

    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', '1')").run();
  }

  if (!schemaVersion || parseInt(schemaVersion) < 2) {
    // Migration 3: Drop orphaned training_routine_days table (no IPC handlers or UI)
    db.exec("DROP TABLE IF EXISTS training_routine_days");

    // Migration 4: Add restday_grams for diet plan
    const hasRestday = db.prepare("SELECT COUNT(*) as cnt FROM pragma_table_info('meal_components') WHERE name='restday_grams'").get();
    if (hasRestday.cnt === 0) {
      db.exec("ALTER TABLE meal_components ADD COLUMN restday_grams REAL DEFAULT NULL");
    }

    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', '2')").run();
  }

  if (!schemaVersion || parseInt(schemaVersion) < 3) {
    // Migration 5: Relax daily_plan_entries.meal_component_id to allow NULL (for dish ingredients)
    const dpEntriesSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_plan_entries'").get();
    if (dpEntriesSql && dpEntriesSql.sql.includes('meal_component_id INTEGER NOT NULL')) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS daily_plan_entries_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          daily_plan_id INTEGER NOT NULL,
          meal_component_id INTEGER,
          food_item_id INTEGER NOT NULL,
          grams REAL NOT NULL,
          FOREIGN KEY (daily_plan_id) REFERENCES daily_plans(id),
          FOREIGN KEY (meal_component_id) REFERENCES meal_components(id),
          FOREIGN KEY (food_item_id) REFERENCES food_items(id)
        );
        INSERT INTO daily_plan_entries_v2 (id, daily_plan_id, meal_component_id, food_item_id, grams)
          SELECT id, daily_plan_id, meal_component_id, food_item_id, grams FROM daily_plan_entries;
        DROP TABLE daily_plan_entries;
        ALTER TABLE daily_plan_entries_v2 RENAME TO daily_plan_entries;
      `);
    }

    // Migration 6: Add sleep phase columns to activity_days
    const hasSleepDeep = db.prepare("SELECT COUNT(*) as cnt FROM pragma_table_info('activity_days') WHERE name='sleep_deep'").get();
    if (hasSleepDeep.cnt === 0) {
      db.exec("ALTER TABLE activity_days ADD COLUMN sleep_deep REAL DEFAULT NULL");
      db.exec("ALTER TABLE activity_days ADD COLUMN sleep_rem REAL DEFAULT NULL");
      db.exec("ALTER TABLE activity_days ADD COLUMN sleep_light REAL DEFAULT NULL");
    }

    // Migration 7: Update exercise_library to Spanish names, muscle groups, equipment, movement patterns
    if (EXERCISES_MIGRATION.length > 0) {
      const updateEx = db.prepare('UPDATE exercise_library SET name = ?, muscle_group = ?, equipment = ?, movement_pattern = ? WHERE id = ?');
      const txn = db.transaction(() => {
        for (let i = 0; i < EXERCISES_MIGRATION.length; i++) {
          const ex = EXERCISES_MIGRATION[i];
          updateEx.run(ex.name, ex.muscle_group, ex.equipment, ex.movement_pattern, i + 1);
        }
      });
      txn();
    }

    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', '3')").run();
  }
}

function getDb() {
  return db;
}

function populateCache(periodDays) {
  if (!db) return;
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - periodDays);
  const fromStr = fromDate.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const insert = db.prepare(`
    INSERT OR REPLACE INTO activity_summary_cache
      (period_days, date, steps, active_kcal, resting_kcal, sleep_hours, sleep_deep, sleep_rem, sleep_light, weight_kg, sport_sessions, sport_kcal, sport_minutes)
    VALUES
      (@period_days, @date, @steps, @active_kcal, @resting_kcal, @sleep_hours, @sleep_deep, @sleep_rem, @sleep_light, @weight_kg, @sport_sessions, @sport_kcal, @sport_minutes)
  `);

  const days = db.prepare(`
    SELECT date, steps, active_calories, resting_calories, sleep_hours, sleep_deep, sleep_rem, sleep_light, weight_kg
    FROM activity_days WHERE date >= ? AND date <= ? ORDER BY date
  `).all(fromStr, todayStr);

  const sportByDate = {};
  const sports = db.prepare(`
    SELECT date, COUNT(*) as sessions, COALESCE(SUM(calories), 0) as kcal, COALESCE(SUM(duration_minutes), 0) as minutes
    FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY date
  `).all(fromStr, todayStr);
  for (const s of sports) {
    sportByDate[s.date] = s;
  }

  const txn = db.transaction(() => {
    db.prepare('DELETE FROM activity_summary_cache WHERE period_days = ?').run(periodDays);
    for (const d of days) {
      const sp = sportByDate[d.date] || { sessions: 0, kcal: 0, minutes: 0 };
      insert.run({
        period_days: periodDays,
        date: d.date,
        steps: d.steps || 0,
        active_kcal: d.active_calories || 0,
        resting_kcal: d.resting_calories || 0,
        sleep_hours: d.sleep_hours || 0,
        sleep_deep: d.sleep_deep,
        sleep_rem: d.sleep_rem,
        sleep_light: d.sleep_light,
        weight_kg: d.weight_kg,
        sport_sessions: sp.sessions,
        sport_kcal: sp.kcal,
        sport_minutes: sp.minutes,
      });
    }
  });
  txn();
}

function initHealthsyncDb() {
  const dbPath = path.join(os.homedir(), '.healthsync', 'healthsync.db');
  healthsyncDb = new Database(dbPath, { readonly: true });
  return healthsyncDb;
}

function getHealthsyncDb() {
  return healthsyncDb;
}

function testHealthsyncConnection() {
  const row = healthsyncDb.prepare("SELECT COUNT(*) as total FROM sqlite_master WHERE type='table'").get();
  return row.total;
}

module.exports = { initDatabase, getDb, getDbPath, initHealthsyncDb, getHealthsyncDb, testHealthsyncConnection, populateCache };
