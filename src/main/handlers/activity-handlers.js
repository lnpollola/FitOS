const { refreshCaches } = require('../../db/database');
const { safeHandle } = require('../utils/safe-handler');
const { getHealthsyncPath, installHealthsync, parseHealthsyncXML, migrateHealthData, getHealthsyncDbInfo, fullSync, getCacheStats, syncAppleHealth, resetAndSyncHealthsync } = require('../apple-health-import');

const HEALTHSYNC_DB_PATH = require('path').join(require('os').homedir(), '.healthsync', 'healthsync.db');

function isoWeekFromDate(date) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return null;
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return { year: target.getUTCFullYear(), week: weekNum };
}

function isoWeekKey(date) {
  const w = isoWeekFromDate(date);
  if (!w) return null;
  return `${w.year}-W${String(w.week).padStart(2, '0')}`;
}

function currentIsoWeekRange(now = new Date()) {
  const d = new Date(now);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return { start: monday };
}

function getCurrentWeekKey() {
  return isoWeekKey(currentIsoWeekRange().start);
}

function computeWeekStreak(activeWeekKeys) {
  if (!activeWeekKeys || activeWeekKeys.length === 0) return 0;
  const activeSet = new Set(
    activeWeekKeys.filter(k => typeof k === 'string' && /^\d{4}-W\d{2}$/.test(k))
  );
  const currentKey = getCurrentWeekKey();
  if (!currentKey) return 0;
  const currentMonday = currentIsoWeekRange().start;
  let cursor = new Date(currentMonday);
  let streak = 0;
  if (!activeSet.has(currentKey)) {
    cursor.setDate(cursor.getDate() - 7);
  }
  const cap = new Date(cursor);
  cap.setFullYear(cap.getFullYear() - 10);
  let iterations = 0;
  while (cursor >= cap && iterations < 520) {
    const key = isoWeekKey(cursor);
    if (activeSet.has(key)) {
      streak++;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 7);
    iterations++;
  }
  return streak;
}

function register(ipcMain, getDb, getHS, notifyDomain) {
  safeHandle(ipcMain, 'db:getActivityDays', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM activity_days ORDER BY date DESC LIMIT 365').all();
  });

  safeHandle(ipcMain, 'db:saveActivityDay', (day) => {
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

  safeHandle(ipcMain, 'db:getActivityKcalByType', (fromDate, toDate) => {
    const db = getDb();
    return db.prepare(`
      SELECT sport_type, COUNT(*) as count, COALESCE(ROUND(AVG(calories), 0), 0) as avg_kcal, COALESCE(SUM(calories), 0) as total_kcal
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type ORDER BY total_kcal DESC
    `).all(fromDate, toDate);
  });

  safeHandle(ipcMain, 'db:getSportSummaryByRange', (fromDate, toDate) => {
    const db = getDb();
    return db.prepare(`
      SELECT sport_type, COUNT(*) as count,
             COALESCE(ROUND(AVG(calories), 0), 0) as avg_kcal,
             COALESCE(SUM(calories), 0) as total_kcal,
             COALESCE(SUM(duration_minutes), 0) as total_duration,
             ROUND(COALESCE(SUM(distance_km), 0), 2) as total_distance_km
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type ORDER BY count DESC
    `).all(fromDate, toDate);
  });

  safeHandle(ipcMain, 'db:getActivityComparison', (from, to) => {
    const db = getDb();
    const current = db.prepare(`
      SELECT sport_type, COUNT(*) as count,
             COALESCE(SUM(calories), 0) as total_kcal,
             COALESCE(SUM(duration_minutes), 0) as total_duration,
             ROUND(COALESCE(SUM(distance_km), 0), 2) as total_distance_km
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type
    `).all(from, to);
    const periodMs = new Date(to) - new Date(from);
    const prevFrom = new Date(new Date(from).getTime() - periodMs).toISOString().split('T')[0];
    const prevTo = new Date(new Date(from).getTime() - 86400000).toISOString().split('T')[0];
    const previous = db.prepare(`
      SELECT sport_type, COUNT(*) as count,
             COALESCE(SUM(calories), 0) as total_kcal,
             COALESCE(SUM(duration_minutes), 0) as total_duration,
             ROUND(COALESCE(SUM(distance_km), 0), 2) as total_distance_km
      FROM sport_activities WHERE date >= ? AND date <= ? GROUP BY sport_type
    `).all(prevFrom, prevTo);
    const currentActiveDays = db.prepare(`
      SELECT COUNT(DISTINCT date) as days FROM sport_activities WHERE date >= ? AND date <= ?
    `).get(from, to);
    const previousActiveDays = db.prepare(`
      SELECT COUNT(DISTINCT date) as days FROM sport_activities WHERE date >= ? AND date <= ?
    `).get(prevFrom, prevTo);
    const currentDuration = db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as min FROM sport_activities WHERE date >= ? AND date <= ?
    `).get(from, to);
    const previousDuration = db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as min FROM sport_activities WHERE date >= ? AND date <= ?
    `).get(prevFrom, prevTo);
    const currentDistance = db.prepare(`
      SELECT ROUND(COALESCE(SUM(distance_km), 0), 2) as km FROM sport_activities WHERE date >= ? AND date <= ?
    `).get(from, to);
    const previousDistance = db.prepare(`
      SELECT ROUND(COALESCE(SUM(distance_km), 0), 2) as km FROM sport_activities WHERE date >= ? AND date <= ?
    `).get(prevFrom, prevTo);
    const currentActiveDates = db.prepare(`
      SELECT DISTINCT date FROM sport_activities WHERE date >= ? AND date <= ? ORDER BY date
    `).all(from, to).map(r => r.date);
    const previousActiveDates = db.prepare(`
      SELECT DISTINCT date FROM sport_activities WHERE date >= ? AND date <= ? ORDER BY date
    `).all(prevFrom, prevTo).map(r => r.date);
    return {
      current,
      previous,
      currentActiveDays: currentActiveDays.days,
      previousActiveDays: previousActiveDays.days,
      currentDurationMin: currentDuration.min,
      previousDurationMin: previousDuration.min,
      currentDistanceKm: currentDistance.km,
      previousDistanceKm: previousDistance.km,
      currentActiveDates,
      previousActiveDates,
      periodLengthDays: Math.max(1, Math.round(periodMs / 86400000)),
    };
  });

  safeHandle(ipcMain, 'db:getSportLifetimeStats', () => {
    const db = getDb();
    const totalSessionsRow = db.prepare('SELECT COUNT(*) as c FROM sport_activities').get();
    const totalSessions = totalSessionsRow.c;
    const rows = db.prepare(`
      SELECT date FROM sport_activities
      ORDER BY date ASC
    `).all();
    const weekCounts = new Map();
    for (const r of rows) {
      const key = isoWeekKey(r.date);
      if (key) weekCounts.set(key, (weekCounts.get(key) || 0) + 1);
    }
    const weeks = [];
    for (const [key, count] of weekCounts) {
      if (count >= 2) weeks.push(key);
    }
    weeks.sort().reverse();
    const totalWeeks = weeks.length;
    const currentStreak = computeWeekStreak(weeks);
    return { totalWeeks, currentStreak, totalSessions };
  });

  safeHandle(ipcMain, 'db:checkHealthsync', () => !!getHealthsyncPath());
  safeHandle(ipcMain, 'db:installHealthsync', () => installHealthsync().then(() => true).catch(() => false));
  safeHandle(ipcMain, 'db:getHealthsyncDbInfo', () => getHealthsyncDbInfo());

  safeHandle(ipcMain, 'db:syncAppleHealth', async (options) => {
    const result = await syncAppleHealth(global._mainWindow, options || {});
    if (result.ok && notifyDomain) notifyDomain("activity");
    return result;
  });

  safeHandle(ipcMain, 'db:resetAndSyncHealthsync', async () => {
    const result = await resetAndSyncHealthsync(global._mainWindow);
    if (result.sync && result.sync.ok && notifyDomain) notifyDomain("activity");
    return result;
  });
}

module.exports = { register };
