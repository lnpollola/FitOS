const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const { seedIfEmpty } = require('./seed-data');

let db;

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
  `);
}

function getDb() {
  return db;
}

module.exports = { initDatabase, getDb, getDbPath };
