const { ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const Database = require('better-sqlite3');
const { getDb, initHealthsyncDb, getHealthsyncDb } = require('../db/database');
const { exportAllData, importAllData } = require('../db/import-export');
const { getHealthsyncPath, installHealthsync, parseHealthsyncXML, migrateHealthData } = require('./apple-health-import');

const HEALTHSYNC_DB_PATH = path.join(os.homedir(), '.healthsync', 'healthsync.db');

function getHS() {
  let hs = getHealthsyncDb();
  if (!hs) {
    initHealthsyncDb();
    hs = getHealthsyncDb();
  }
  return hs;
}

function registerIpcHandlers(mainWindow) {
  // Profile
  ipcMain.handle('db:getProfile', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM user_profile WHERE id = 1').get() || null;
  });

  ipcMain.handle('db:saveProfile', (_event, profile) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO user_profile (id, age, sex, height_cm, weight_kg, activity_baseline, updated_at)
      VALUES (1, @age, @sex, @height_cm, @weight_kg, @activity_baseline, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        age = @age, sex = @sex, height_cm = @height_cm, weight_kg = @weight_kg,
        activity_baseline = @activity_baseline, updated_at = datetime('now')
    `).run(profile);
    return true;
  });

  // Activity days
  ipcMain.handle('db:getActivityDays', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM activity_days ORDER BY date DESC').all();
  });

  ipcMain.handle('db:saveActivityDay', (_event, day) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO activity_days (date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, weight_kg)
      VALUES (@date, @steps, @active_calories, @resting_calories, @heart_rate_avg, @sleep_hours, @weight_kg)
      ON CONFLICT(date) DO UPDATE SET
        steps = @steps, active_calories = @active_calories, resting_calories = @resting_calories,
        heart_rate_avg = @heart_rate_avg, sleep_hours = @sleep_hours, weight_kg = @weight_kg
    `).run(day);
    return true;
  });

  ipcMain.handle('db:getSportActivities', (_event, date) => {
    const db = getDb();
    return db.prepare('SELECT * FROM sport_activities WHERE date = ?').all(date);
  });

  ipcMain.handle('db:saveSportActivity', (_event, activity) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO sport_activities (date, sport_type, calories, duration_minutes)
      VALUES (@date, @sport_type, @calories, @duration_minutes)
    `).run(activity);
    return true;
  });

  ipcMain.handle('db:getWeeklySportSummary', () => {
    const db = getDb();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];
    return db.prepare(`
      SELECT sport_type, COALESCE(SUM(calories), 0) as total_calories, COALESCE(SUM(duration_minutes), 0) as total_duration
      FROM sport_activities
      WHERE date >= ?
      GROUP BY sport_type
      ORDER BY total_calories DESC
    `).all(startDate);
  });

  ipcMain.handle('db:getActivityKcalByType', (_event, fromDate, toDate) => {
    const db = getDb();
    return db.prepare(`
      SELECT sport_type, COUNT(*) as count, COALESCE(ROUND(AVG(calories), 0), 0) as avg_kcal, COALESCE(SUM(calories), 0) as total_kcal
      FROM sport_activities
      WHERE date >= ? AND date <= ?
      GROUP BY sport_type
      ORDER BY total_kcal DESC
    `).all(fromDate, toDate);
  });

  // Apple Health XML import
  ipcMain.handle('db:checkHealthsync', () => {
    return !!getHealthsyncPath();
  });

  ipcMain.handle('db:installHealthsync', async () => {
    try {
      await installHealthsync();
      return true;
    } catch (e) {
      return false;
    }
  });

  ipcMain.handle('db:importAppleHealthXML', async (_event, xmlPath) => {
    const result = { created: 0, skipped: 0, errors: [] };
    try {
      await parseHealthsyncXML(xmlPath);
      const migration = migrateHealthData(mainWindow);
      Object.assign(result, migration);
    } catch (e) {
      result.errors.push(e.message);
    }
    return result;
  });

  // CSV import
  ipcMain.handle('db:importActivityCSV', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths[0]) return false;

    const fs = require('fs');
    const csv = fs.readFileSync(result.filePaths[0], 'utf-8');
    const db = getDb();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return false;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateIdx = headers.indexOf('date');
    const stepsIdx = headers.indexOf('steps');
    const activeCalIdx = headers.indexOf('active_calories') >= 0 ? headers.indexOf('active_calories') : headers.indexOf('active calories');
    const restingCalIdx = headers.indexOf('resting_calories') >= 0 ? headers.indexOf('resting_calories') : headers.indexOf('resting calories');
    const hrIdx = headers.indexOf('heart_rate_avg') >= 0 ? headers.indexOf('heart_rate_avg') : headers.indexOf('heart rate avg');
    const sleepIdx = headers.indexOf('sleep_hours') >= 0 ? headers.indexOf('sleep_hours') : headers.indexOf('sleep hours');
    const weightIdx = headers.indexOf('weight_kg') >= 0 ? headers.indexOf('weight_kg') : headers.indexOf('weight kg');
    const sportTypeIdx = headers.indexOf('sport_type') >= 0 ? headers.indexOf('sport_type') : headers.indexOf('sport type');
    const sportCalIdx = headers.indexOf('sport_calories') >= 0 ? headers.indexOf('sport_calories') : headers.indexOf('sport calories');
    const sportDurationIdx = headers.indexOf('duration_minutes') >= 0 ? headers.indexOf('duration_minutes') : headers.indexOf('duration minutes');

    const insertDay = db.prepare(`
      INSERT INTO activity_days (date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, weight_kg)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        steps = excluded.steps, active_calories = excluded.active_calories,
        resting_calories = excluded.resting_calories, heart_rate_avg = excluded.heart_rate_avg,
        sleep_hours = excluded.sleep_hours, weight_kg = excluded.weight_kg
    `);
    const insertSport = db.prepare(`
      INSERT INTO sport_activities (date, sport_type, calories, duration_minutes)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const date = dateIdx >= 0 ? cols[dateIdx] : null;
        if (!date) continue;

        const steps = stepsIdx >= 0 ? parseInt(cols[stepsIdx]) || null : null;
        const activeCal = activeCalIdx >= 0 ? parseFloat(cols[activeCalIdx]) || null : null;
        const restingCal = restingCalIdx >= 0 ? parseFloat(cols[restingCalIdx]) || null : null;
        const hr = hrIdx >= 0 ? parseFloat(cols[hrIdx]) || null : null;
        const sleep = sleepIdx >= 0 ? parseFloat(cols[sleepIdx]) || null : null;
        const weight = weightIdx >= 0 ? parseFloat(cols[weightIdx]) || null : null;

        insertDay.run(date, steps, activeCal, restingCal, hr, sleep, weight);

        if (sportTypeIdx >= 0 && cols[sportTypeIdx]) {
          const sportCal = sportCalIdx >= 0 ? parseFloat(cols[sportCalIdx]) || null : null;
          const sportDuration = sportDurationIdx >= 0 ? parseFloat(cols[sportDurationIdx]) || null : null;
          insertSport.run(date, cols[sportTypeIdx], sportCal, sportDuration);
        }
      }
    });

    transaction();
    return true;
  });

  // Food items
  ipcMain.handle('db:getFoodItems', (_event, includeHidden) => {
    const db = getDb();
    if (includeHidden) {
      return db.prepare('SELECT * FROM food_items ORDER BY name').all();
    }
    return db.prepare('SELECT * FROM food_items WHERE is_hidden = 0 ORDER BY name').all();
  });

  ipcMain.handle('db:saveFoodItem', (_event, item) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO food_items (name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
      VALUES (@name, @kcal_per_100g, @protein_per_100g, @carbs_per_100g, @fat_per_100g)
    `).run(item);
    return true;
  });

  ipcMain.handle('db:hideFoodItem', (_event, id) => {
    const db = getDb();
    db.prepare('UPDATE food_items SET is_hidden = 1 WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:unhideFoodItem', (_event, id) => {
    const db = getDb();
    db.prepare('UPDATE food_items SET is_hidden = 0 WHERE id = ?').run(id);
    return true;
  });

  // Meal templates
  ipcMain.handle('db:getMealTemplates', () => {
    const db = getDb();
    const templates = db.prepare('SELECT * FROM meal_templates ORDER BY slot_order').all();
    for (const t of templates) {
      t.components = db.prepare(`
        SELECT mc.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
        FROM meal_components mc
        JOIN food_items fi ON mc.food_item_id = fi.id
        WHERE mc.meal_template_id = ?
        ORDER BY mc.sort_order
      `).all(t.id);
      for (const c of t.components) {
        c.options = db.prepare(`
          SELECT mo.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
          FROM meal_options mo
          JOIN food_items fi ON mo.food_item_id = fi.id
          WHERE mo.meal_component_id = ? AND mo.is_active = 1
        `).all(c.id);
      }
    }
    return templates;
  });

  // Daily plans
  ipcMain.handle('db:getDailyPlan', (_event, date) => {
    const db = getDb();
    return db.prepare(`
      SELECT dpe.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
      FROM daily_plan_entries dpe
      JOIN daily_plans dp ON dpe.daily_plan_id = dp.id
      JOIN food_items fi ON dpe.food_item_id = fi.id
      WHERE dp.date = ?
    `).all(date);
  });

  ipcMain.handle('db:saveDailyPlanEntry', (_event, entry) => {
    const db = getDb();
    let plan = db.prepare('SELECT id FROM daily_plans WHERE date = ?').get(entry.date);
    if (!plan) {
      const result = db.prepare('INSERT INTO daily_plans (date) VALUES (?)').run(entry.date);
      plan = { id: result.lastInsertRowid };
    }
    db.prepare(`
      INSERT INTO daily_plan_entries (daily_plan_id, meal_component_id, food_item_id, grams)
      VALUES (?, ?, ?, ?)
    `).run(plan.id, entry.meal_component_id, entry.food_item_id, entry.grams);
    return true;
  });

  // Body measurements
  ipcMain.handle('db:getMeasurementSets', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM measurement_sets ORDER BY date DESC').all();
  });

  ipcMain.handle('db:getLatestMeasurementSet', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM measurement_sets ORDER BY date DESC LIMIT 1').get() || null;
  });

  ipcMain.handle('db:saveMeasurementSet', (_event, set) => {
    const db = getDb();
    const columns = Object.keys(set).filter(k => k !== 'date');
    const placeholders = columns.map(c => `@${c}`).join(', ');
    const colNames = columns.join(', ');
    db.prepare(`INSERT INTO measurement_sets (date, ${colNames}) VALUES (@date, ${placeholders})`).run(set);
    return true;
  });

  ipcMain.handle('db:deleteMeasurementSet', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM measurement_sets WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getWeightEntries', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM weight_entries ORDER BY date DESC').all();
  });

  ipcMain.handle('db:saveWeightEntry', (_event, entry) => {
    const db = getDb();
    db.prepare('INSERT INTO weight_entries (date, weight_kg) VALUES (@date, @weight_kg)').run(entry);
    return true;
  });

  ipcMain.handle('db:deleteWeightEntry', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM weight_entries WHERE id = ?').run(id);
    return true;
  });

  // Exercise library
  ipcMain.handle('db:getExerciseLibrary', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM exercise_library ORDER BY name').all();
  });

  ipcMain.handle('db:saveExercise', (_event, exercise) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO exercise_library (name, muscle_group, equipment, movement_pattern)
      VALUES (@name, @muscle_group, @equipment, @movement_pattern)
    `).run(exercise);
    return true;
  });

  ipcMain.handle('db:deleteExercise', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM exercise_library WHERE id = ?').run(id);
    return true;
  });

  // Training sessions
  ipcMain.handle('db:getTrainingSessions', () => {
    const db = getDb();
    return db.prepare(`
      SELECT ts.*, tr.name as routine_name
      FROM training_sessions ts
      LEFT JOIN training_routines tr ON ts.routine_id = tr.id
      ORDER BY ts.date DESC
    `).all();
  });

  ipcMain.handle('db:saveTrainingSession', (_event, session) => {
    const db = getDb();
    db.prepare('INSERT INTO training_sessions (date, routine_id, notes) VALUES (@date, @routine_id, @notes)').run(session);
    return true;
  });

  ipcMain.handle('db:deleteTrainingSession', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM training_sets WHERE session_id = ?').run(id);
    db.prepare('DELETE FROM training_sessions WHERE id = ?').run(id);
    return true;
  });

  ipcMain.handle('db:getTrainingSets', (_event, sessionId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM training_sets WHERE session_id = ? ORDER BY set_number').all(sessionId);
  });

  ipcMain.handle('db:saveTrainingSet', (_event, set) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO training_sets (session_id, exercise_id, set_number, load_kg, reps, rpe)
      VALUES (@session_id, @exercise_id, @set_number, @load_kg, @reps, @rpe)
    `).run(set);
    return true;
  });

  ipcMain.handle('db:deleteTrainingSet', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM training_sets WHERE id = ?').run(id);
    return true;
  });

  // Training routines
  ipcMain.handle('db:getTrainingRoutines', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM training_routines ORDER BY name').all();
  });

  ipcMain.handle('db:saveTrainingRoutine', (_event, routine) => {
    const db = getDb();
    db.prepare('INSERT INTO training_routines (name) VALUES (@name)').run(routine);
    return true;
  });

  // Energy balance
  ipcMain.handle('db:getEnergyBalance', (_event, date) => {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    if (!profile) return null;

    // BMR (Mifflin-St Jeor)
    let bmr;
    if (profile.sex === 'male') {
      bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
    }

    // Sport calories on this date
    const sportCal = db.prepare(
      'SELECT COALESCE(SUM(calories), 0) as total FROM sport_activities WHERE date = ?'
    ).get(date);
    const sportCalories = sportCal?.total || 0;

    // NEAT from steps
    const day = db.prepare('SELECT steps FROM activity_days WHERE date = ?').get(date);
    const steps = day?.steps || 0;
    const neat = steps * 0.04; // ~0.04 kcal per step

    // Planned intake from daily plan
    const planEntries = db.prepare(`
      SELECT dpe.grams, fi.kcal_per_100g
      FROM daily_plan_entries dpe
      JOIN daily_plans dp ON dpe.daily_plan_id = dp.id
      JOIN food_items fi ON dpe.food_item_id = fi.id
      WHERE dp.date = ?
    `).all(date);
    const plannedIntake = planEntries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);

    return {
      bmr,
      sport_calories: sportCalories,
      neat,
      tdee: bmr + sportCalories + neat,
      planned_intake: plannedIntake,
    };
  });

  ipcMain.handle('db:getWeeklyBalance', () => {
    const db = getDb();
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    if (!profile) return null;

    let bmr;
    if (profile.sex === 'male') {
      bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];

    const days = db.prepare(`
      SELECT a.date, a.steps, COALESCE(SUM(s.calories), 0) as sport_cal
      FROM activity_days a
      LEFT JOIN sport_activities s ON a.date = s.date
      WHERE a.date >= ?
      GROUP BY a.date
    `).all(startDate);

    const daysLogged = days.length;
    let netBalance = 0;
    for (const d of days) {
      const neat = (d.steps || 0) * 0.04;
      const tdee = bmr + (d.sport_cal || 0) + neat;

      const planEntries = db.prepare(`
        SELECT dpe.grams, fi.kcal_per_100g
        FROM daily_plan_entries dpe
        JOIN daily_plans dp ON dpe.daily_plan_id = dp.id
        JOIN food_items fi ON dpe.food_item_id = fi.id
        WHERE dp.date = ?
      `).all(d.date);
      const intake = planEntries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);
      netBalance += tdee - intake;
    }

    return { net_balance: netBalance, days_logged: daysLogged };
  });

  // Settings
  ipcMain.handle('db:getSetting', (_event, key) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row?.value || null;
  });

  ipcMain.handle('db:setSetting', (_event, key, value) => {
    const db = getDb();
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
    return true;
  });

  ipcMain.handle('db:getLastImportTimestamp', () => {
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'health_last_import'").get();
    return row?.value || null;
  });

  ipcMain.handle('db:setLastImportTimestamp', (_event, timestamp) => {
    const db = getDb();
    db.prepare("INSERT INTO settings (key, value) VALUES ('health_last_import', ?) ON CONFLICT(key) DO UPDATE SET value = ?").run(timestamp, timestamp);
    return true;
  });

  ipcMain.handle('db:getTrendWeight', () => {
    const db = getDb();
    const weights = db.prepare('SELECT date, weight_kg FROM weight_entries ORDER BY date DESC LIMIT 14').all();
    if (weights.length === 0) return null;
    const avg = weights.reduce((sum, w) => sum + w.weight_kg, 0) / weights.length;
    return {
      trendWeight: avg,
      daysLogged: weights.length,
      firstDate: weights[0].date,
      lastDate: weights[weights.length - 1].date,
    };
  });

  // Dashboard
  ipcMain.handle('db:getDashboardData', () => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Today's planned calories
    const planEntries = db.prepare(`
      SELECT dpe.grams, fi.kcal_per_100g
      FROM daily_plan_entries dpe
      JOIN daily_plans dp ON dpe.daily_plan_id = dp.id
      JOIN food_items fi ON dpe.food_item_id = fi.id
      WHERE dp.date = ?
    `).all(today);
    const todayCalories = planEntries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);

    // Latest weight
    const latestWeight = db.prepare('SELECT weight_kg FROM weight_entries ORDER BY date DESC LIMIT 1').get() ||
      db.prepare('SELECT weight_kg FROM measurement_sets ORDER BY date DESC LIMIT 1').get();

    // Latest measurement delta (waist)
    const measurements = db.prepare('SELECT date, waist_cm FROM measurement_sets ORDER BY date DESC LIMIT 2').all();
    let measurementDelta = null;
    if (measurements.length >= 2 && measurements[0].waist_cm && measurements[1].waist_cm) {
      measurementDelta = measurements[0].waist_cm - measurements[1].waist_cm;
    }

    // Next planned workout
    const nextWorkout = db.prepare("SELECT date FROM training_sessions WHERE date >= ? ORDER BY date ASC LIMIT 1").get(today);

    // Week balance
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get();
    let weekBalance = null;
    if (profile) {
      let bmr;
      if (profile.sex === 'male') {
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
      } else {
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
      }

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const startDate = weekAgo.toISOString().split('T')[0];

      const days = db.prepare(`
        SELECT a.date, a.steps, COALESCE(SUM(s.calories), 0) as sport_cal
        FROM activity_days a
        LEFT JOIN sport_activities s ON a.date = s.date
        WHERE a.date >= ?
        GROUP BY a.date
      `).all(startDate);

      let netBalance = 0;
      for (const d of days) {
        const neat = (d.steps || 0) * 0.04;
        const tdee = bmr + (d.sport_cal || 0) + neat;
        const entries = db.prepare(`
          SELECT dpe.grams, fi.kcal_per_100g
          FROM daily_plan_entries dpe
          JOIN daily_plans dp ON dpe.daily_plan_id = dp.id
          JOIN food_items fi ON dpe.food_item_id = fi.id
          WHERE dp.date = ?
        `).all(d.date);
        const intake = entries.reduce((sum, e) => sum + (e.grams / 100) * e.kcal_per_100g, 0);
        netBalance += tdee - intake;
      }
      weekBalance = netBalance;
    }

    return {
      todayCalories: todayCalories > 0 ? todayCalories : null,
      weekBalance,
      latestWeight: latestWeight?.weight_kg || null,
      measurementDelta,
      nextWorkout: nextWorkout?.date || null,
    };
  });

  // Elaborated dishes
  ipcMain.handle('db:saveDish', (_event, dish) => {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO elaborated_dishes (name, description, total_kcal, total_protein, total_carbs, total_fat, servings)
      VALUES (@name, @description, @total_kcal, @total_protein, @total_carbs, @total_fat, @servings)
    `).run(dish);
    return result.lastInsertRowid;
  });

  ipcMain.handle('db:getDishes', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM elaborated_dishes ORDER BY name').all();
  });

  ipcMain.handle('db:getDishIngredients', (_event, dishId) => {
    const db = getDb();
    return db.prepare(`
      SELECT di.*, fi.name as food_name, fi.kcal_per_100g, fi.protein_per_100g, fi.carbs_per_100g, fi.fat_per_100g
      FROM dish_ingredients di
      JOIN food_items fi ON di.food_item_id = fi.id
      WHERE di.dish_id = ?
    `).all(dishId);
  });

  ipcMain.handle('db:deleteDish', (_event, dishId) => {
    const db = getDb();
    db.prepare('DELETE FROM elaborated_dishes WHERE id = ?').run(dishId);
    return true;
  });

  ipcMain.handle('db:saveDishIngredient', (_event, ingredient) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO dish_ingredients (dish_id, food_item_id, grams)
      VALUES (@dish_id, @food_item_id, @grams)
    `).run(ingredient);
    return true;
  });

  // Meal dish options
  ipcMain.handle('db:linkDishToMeal', (_event, link) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO meal_dish_options (meal_template_id, dish_id, sort_order)
      VALUES (@meal_template_id, @dish_id, @sort_order)
    `).run(link);
    return true;
  });

  ipcMain.handle('db:getDishesForMeal', (_event, mealTemplateId) => {
    const db = getDb();
    return db.prepare(`
      SELECT mdo.*, ed.name as dish_name, ed.total_kcal, ed.total_protein, ed.total_carbs, ed.total_fat
      FROM meal_dish_options mdo
      JOIN elaborated_dishes ed ON mdo.dish_id = ed.id
      WHERE mdo.meal_template_id = ?
      ORDER BY mdo.sort_order
    `).all(mealTemplateId);
  });

  ipcMain.handle('db:unlinkDish', (_event, id) => {
    const db = getDb();
    db.prepare('DELETE FROM meal_dish_options WHERE id = ?').run(id);
    return true;
  });

  // Workout plans
  ipcMain.handle('db:getWorkoutPlans', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM workout_plans ORDER BY min_sessions, name').all();
  });

  ipcMain.handle('db:getPlanDays', (_event, planId) => {
    const db = getDb();
    return db.prepare('SELECT * FROM workout_plan_days WHERE plan_id = ? ORDER BY day_number').all(planId);
  });

  ipcMain.handle('db:getExercisesByIds', (_event, ids) => {
    const db = getDb();
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    return db.prepare(`SELECT * FROM exercise_library WHERE id IN (${placeholders})`).all(...ids);
  });

  // Export / Import
  ipcMain.handle('export:data', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `health-data-${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (!result.canceled && result.filePath) {
      try {
        exportAllData(result.filePath);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  ipcMain.handle('import:data', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (!result.canceled && result.filePaths[0]) {
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        buttons: ['Cancel', 'Import'],
        defaultId: 0,
        message: 'This will replace all existing data. Are you sure?',
      });
      if (response === 1) {
        try {
          importAllData(result.filePaths[0]);
          return true;
        } catch (e) {
          return false;
        }
      }
    }
    return false;
  });
  // ─── HealthSync queries (read-only) ───

  ipcMain.handle('health:getDailySummary', (_event, from, to) => {
    try {
      const hs = getHS();
      const rows = hs.prepare(`
        SELECT dates.dia,
               COALESCE(s.steps, 0) as steps,
               h.hr_media,
               COALESCE(a.kcal, 0) as kcal_activas,
               COALESCE(b.kcal, 0) as kcal_basales
        FROM (
          SELECT DISTINCT date(start_date) as dia FROM steps WHERE date(start_date) BETWEEN ? AND ?
          UNION
          SELECT DISTINCT date(start_date) FROM heart_rate WHERE date(start_date) BETWEEN ? AND ?
          UNION
          SELECT DISTINCT date(start_date) FROM active_energy WHERE date(start_date) BETWEEN ? AND ?
        ) dates
        LEFT JOIN (SELECT date(start_date) as d, SUM(value) as steps FROM steps GROUP BY d) s ON dates.dia = s.d
        LEFT JOIN (SELECT date(start_date) as d, ROUND(AVG(value),1) as hr_media FROM heart_rate GROUP BY d) h ON dates.dia = h.d
        LEFT JOIN (SELECT date(start_date) as d, SUM(value) as kcal FROM active_energy GROUP BY d) a ON dates.dia = a.d
        LEFT JOIN (SELECT date(start_date) as d, SUM(value) as kcal FROM basal_energy GROUP BY d) b ON dates.dia = b.d
        ORDER BY dates.dia DESC
      `).all(from, to, from, to, from, to);
      return { ok: true, data: rows };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  const resolveSportType = (type) => ({
    'HKWorkoutActivityTypeRunning': 'running',
    'HKWorkoutActivityTypeCycling': 'cycling',
    'HKWorkoutActivityTypeWalking': 'walking',
    'HKWorkoutActivityTypeSwimming': 'swimming',
    'HKWorkoutActivityTypeYoga': 'yoga',
    'HKWorkoutActivityTypeHighIntensityIntervalTraining': 'HIIT',
    'HKWorkoutActivityTypeTraditionalStrengthTraining': 'strength',
    'HKWorkoutActivityTypeFunctionalStrengthTraining': 'strength',
    'HKWorkoutActivityTypeSoccer': 'football',
    'HKWorkoutActivityTypePaddleSports': 'paddle',
    'HKWorkoutActivityTypeBoxing': 'boxing',
    'HKWorkoutActivityTypeMixedCardio': 'other',
    'HKWorkoutActivityTypeCoreTraining': 'other',
    'HKWorkoutActivityTypeFlexibility': 'other',
  })[type] || 'other';

  ipcMain.handle('health:getWorkouts', (_event, limit = 20) => {
    try {
      const hs = getHS();
      const rows = hs.prepare(`
        SELECT date(start_date) as date, activity_type,
               ROUND(duration, 1) as minutes,
               ROUND(total_energy_burned, 0) as kcal,
               ROUND(total_distance, 2) as km
        FROM workouts ORDER BY start_date DESC LIMIT ?
      `).all(limit);
      return { ok: true, data: rows.map(r => ({ ...r, activity_type: resolveSportType(r.activity_type) })) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getSleep', (_event, limit = 30) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date, '-6 hours') as night,
               ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as hours
        FROM sleep WHERE value LIKE '%Asleep%'
        GROUP BY night ORDER BY night DESC LIMIT ?
      `).all(limit) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getHRV', (_event, limit = 30) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(AVG(value), 1) as hrv_ms
        FROM hrv GROUP BY date ORDER BY date DESC LIMIT ?
      `).all(limit) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getBodyMass', (_event, limit = 30) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, value, unit
        FROM body_mass ORDER BY start_date DESC LIMIT ?
      `).all(limit) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getHRVWeekly', (_event, limit = 12) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT strftime('%Y-W%W', start_date) as week,
               ROUND(AVG(value), 1) as hrv_ms
        FROM hrv GROUP BY week ORDER BY week DESC LIMIT ?
      `).all(limit) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getHeartRateDaily', (_event, limit = 30) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date,
               ROUND(AVG(value), 1) as avg_bpm,
               ROUND(MIN(value), 0) as min_bpm,
               ROUND(MAX(value), 0) as max_bpm
        FROM heart_rate GROUP BY date ORDER BY date DESC LIMIT ?
      `).all(limit) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getStats', () => {
    try {
      const hs = getHS();
      const stats = {};
      const tables = ['steps', 'heart_rate', 'sleep', 'workouts', 'hrv', 'body_mass', 'active_energy'];
      for (const t of tables) {
        try {
          const row = hs.prepare(`SELECT COUNT(*) as count FROM ${t.replace('-', '_')}`).get();
          stats[t] = row.count;
        } catch { stats[t] = 0; }
      }
      const lastRecord = hs.prepare("SELECT date(start_date) as last FROM heart_rate ORDER BY start_date DESC LIMIT 1").get();
      return { ok: true, data: { tables: stats, lastUpdate: lastRecord?.last || null } };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:syncToApp', () => {
    return migrateHealthData(mainWindow);
  });

  // ─── HealthSync analytics queries (date-range, read-only) ───

  ipcMain.handle('health:getHeartRateRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date,
               ROUND(AVG(value), 1) as avg_bpm,
               ROUND(MIN(value), 0) as min_bpm,
               ROUND(MAX(value), 0) as max_bpm
        FROM heart_rate
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getHRVRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(AVG(value), 1) as hrv_ms
        FROM hrv
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getSleepRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date, '-6 hours') as night,
               ROUND(SUM((julianday(end_date) - julianday(start_date)) * 24), 2) as hours
        FROM sleep WHERE value LIKE '%Asleep%'
          AND date(start_date, '-6 hours') BETWEEN ? AND ?
        GROUP BY night ORDER BY night ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getWorkoutRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, activity_type,
               ROUND(duration, 1) as minutes,
               ROUND(total_energy_burned, 0) as kcal,
               ROUND(total_distance, 2) as km
        FROM workouts
        WHERE date(start_date) BETWEEN ? AND ?
        ORDER BY start_date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getWorkoutRanking', (_event, from, to) => {
    try {
      const hs = getHS();
      const rows = hs.prepare(`
        SELECT activity_type,
               COUNT(*) as count,
               ROUND(SUM(duration), 1) as total_hours,
               ROUND(SUM(total_energy_burned), 0) as total_kcal,
               ROUND(SUM(total_distance), 2) as total_km
        FROM workouts
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY activity_type
        ORDER BY total_kcal DESC
      `).all(from, to);
      return { ok: true, data: rows.map(r => ({ ...r, activity_type: resolveSportType(r.activity_type) })) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getRestingHeartRateRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(AVG(value), 1) as rhr_bpm
        FROM resting_heart_rate
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getVO2MaxRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(AVG(value), 1) as vo2_max
        FROM vo2_max
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getExerciseTimeRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(SUM(value), 1) as minutes
        FROM exercise_time
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getDistanceSummary', (_event, from, to) => {
    try {
      const hs = getHS();
      const walking = hs.prepare(`
        SELECT date(start_date) as date, ROUND(SUM(value), 3) as km
        FROM distance_walking_running
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to);
      const cycling = hs.prepare(`
        SELECT date(start_date) as date, ROUND(SUM(value), 3) as km
        FROM distance_cycling
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to);
      return { ok: true, data: { walking, cycling } };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getWalkingSpeedRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(AVG(value), 2) as speed_kmh
        FROM walking_speed
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle('health:getFlightsClimbedRange', (_event, from, to) => {
    try {
      const hs = getHS();
      return { ok: true, data: hs.prepare(`
        SELECT date(start_date) as date, ROUND(SUM(value), 0) as count
        FROM flights_climbed
        WHERE date(start_date) BETWEEN ? AND ?
        GROUP BY date ORDER BY date ASC
      `).all(from, to) };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
}

module.exports = { registerIpcHandlers };
