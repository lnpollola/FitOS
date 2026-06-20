const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const { seedIfEmpty } = require('./seed-data');

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
}

function getDb() {
  return db;
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

module.exports = { initDatabase, getDb, getDbPath, initHealthsyncDb, getHealthsyncDb, testHealthsyncConnection };
