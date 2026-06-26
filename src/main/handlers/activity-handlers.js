const { dialog } = require('electron');
const { refreshCaches } = require('../../db/database');
const { getHealthsyncPath, installHealthsync, parseHealthsyncXML, migrateHealthData, getHealthsyncDbInfo, fullSync, getCacheStats, syncAppleHealth, resetAndSyncHealthsync } = require('../apple-health-import');

const HEALTHSYNC_DB_PATH = require('path').join(require('os').homedir(), '.healthsync', 'healthsync.db');

function register(ipcMain, getDb, getHS, notifyDomain) {
  ipcMain.handle('db:getActivityDays', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM activity_days ORDER BY date DESC').all();
  });

  ipcMain.handle('db:saveActivityDay', (_event, day) => {
    const db = getDb();
    db.prepare(`
      INSERT INTO activity_days (date, steps, active_calories, resting_calories, heart_rate_avg, sleep_hours, sleep_deep, sleep_rem, sleep_light, weight_kg)
      VALUES (@date, @steps, @active_calories, @resting_calories, @heart_rate_avg, @sleep_hours, @sleep_deep, @sleep_rem, @sleep_light, @weight_kg)
      ON CONFLICT(date) DO UPDATE SET
        steps = @steps, active_calories = @active_calories, resting_calories = @resting_calories,
        heart_rate_avg = @heart_rate_avg, sleep_hours = @sleep_hours, sleep_deep = @sleep_deep,
        sleep_rem = @sleep_rem, sleep_light = @sleep_light, weight_kg = @weight_kg
    `).run(day);
    refreshCaches(); if (notifyDomain) notifyDomain("activity");
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
    refreshCaches(); if (notifyDomain) notifyDomain("activity");
    return true;
  });

  ipcMain.handle('db:getWeeklySportSummary', () => {
    const db = getDb();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const startDate = weekAgo.toISOString().split('T')[0];
    return db.prepare(`
      SELECT sport_type, COALESCE(SUM(calories), 0) as total_calories, COALESCE(SUM(duration_minutes), 0) as total_duration
      FROM sport_activities WHERE date >= ? GROUP BY sport_type ORDER BY total_calories DESC
    `).all(startDate);
  });

  ipcMain.handle('db:getActivityKcalByType', (_event, fromDate, toDate) => {
    const db = getDb();
    return db.prepare(`
      SELECT sport_type, COUNT(*) as count, COALESCE(ROUND(AVG(calories), 0), 0) as avg_kcal, COALESCE(SUM(calories), 0) as total_kcal
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type ORDER BY total_kcal DESC
    `).all(fromDate, toDate);
  });

  ipcMain.handle('db:getSportSummaryByRange', (_event, fromDate, toDate) => {
    const db = getDb();
    return db.prepare(`
      SELECT sport_type, COUNT(*) as count, COALESCE(ROUND(AVG(calories), 0), 0) as avg_kcal, COALESCE(SUM(calories), 0) as total_kcal, COALESCE(SUM(duration_minutes), 0) as total_duration
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type ORDER BY count DESC
    `).all(fromDate, toDate);
  });

  ipcMain.handle('db:getActivityComparison', (_event, from, to) => {
    const db = getDb();
    const current = db.prepare(`
      SELECT sport_type, COUNT(*) as count, COALESCE(SUM(calories), 0) as total_kcal, COALESCE(SUM(duration_minutes), 0) as total_duration
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type
    `).all(from, to);
    const periodMs = new Date(to) - new Date(from);
    const prevFrom = new Date(new Date(from).getTime() - periodMs).toISOString().split('T')[0];
    const prevTo = new Date(new Date(from).getTime() - 86400000).toISOString().split('T')[0];
    const previous = db.prepare(`
      SELECT sport_type, COUNT(*) as count, COALESCE(SUM(calories), 0) as total_kcal, COALESCE(SUM(duration_minutes), 0) as total_duration
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type
    `).all(prevFrom, prevTo);
    return { current, previous };
  });

  ipcMain.handle('db:importActivityCSV', async () => {
    const result = await dialog.showOpenDialog(null, {
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
    refreshCaches(); if (notifyDomain) notifyDomain("activity");
    return true;
  });

  ipcMain.handle('db:checkHealthsync', () => !!getHealthsyncPath());
  ipcMain.handle('db:installHealthsync', () => installHealthsync().then(() => true).catch(() => false));
  ipcMain.handle('db:getHealthsyncDbInfo', () => getHealthsyncDbInfo());

  ipcMain.handle('db:syncAppleHealth', async (_event, options) => {
    const result = await syncAppleHealth(global._mainWindow, options || {});
    if (result.ok && notifyDomain) notifyDomain("activity");
    return result;
  });

  ipcMain.handle('db:resetAndSyncHealthsync', async () => {
    const result = await resetAndSyncHealthsync(global._mainWindow);
    if (result.sync && result.sync.ok && notifyDomain) notifyDomain("activity");
    return result;
  });
}

module.exports = { register };
